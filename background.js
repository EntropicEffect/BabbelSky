// background.js

/**
 * Listener for messages from content scripts.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'translatePost') {
        const post = message.post;
        translatePost(post)
            .then(translatedPost => {
                sendResponse({ translatedPost: translatedPost });
            })
            .catch(error => {
                console.error('BabbelSky: Translation Error:', error);
                sendResponse({ error: error.message });
            });
        return true; // Indicates that sendResponse will be called asynchronously
    }
});

// Listener for when the extension is installed
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        // Open the Options Page
        chrome.runtime.openOptionsPage(function() {
            if (chrome.runtime.lastError) {
                console.error('BabbelSky: Failed to open Options Page on install.', chrome.runtime.lastError);
            } else {
                console.log('BabbelSky: Options Page opened on install.');
            }
        });
    }
});


// Listener to inject contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'injectContentScript') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.executeScript(tabs[0].id, { file: 'contentScript.js' }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error injecting contentScript.js:', chrome.runtime.lastError);
                        sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    } else {
                        console.log('contentScript.js successfully injected');
                        sendResponse({ success: true });
                    }
                });
            }
        });
        return true; // Keep the message channel open for async response
    }
});
/**
 * Translates a single post using the selected translation service.
 * @param {string} post - The post text to translate.
 * @returns {Promise<string>} - The translated post text.
 */
async function translatePost(post) {
    // Retrieve settings from storage
    const settings = await getStorage(['encryptedGoogleApiKey', 'encryptedOpenaiApiKey', 'targetLanguage', 'openaiPrompt', 'translationService']);
    const {
        encryptedGoogleApiKey,
        encryptedOpenaiApiKey,
        targetLanguage,
        openaiPrompt,
        translationService
    } = settings;

    if (!translationService) {
        throw new Error('No translation service selected.');
    }

    // Decrypt API keys
    const key = await getEncryptionKey();
    let googleApiKey = '';
    let openaiApiKey = '';
    let translatedText = '';

    if (translationService === 'Google' && googleApiKey) {
        const encryptedGoogleData = JSON.parse(encryptedGoogleApiKey);
        googleApiKey = await decryptData(key, encryptedGoogleData.iv, encryptedGoogleData.ciphertext);
        translatedText = await translateWithGoogle(post, googleApiKey, targetLanguage);
    }
    else if (translationService === 'OpenAI' && encryptedOpenaiApiKey) {
        const encryptedOpenAIData = JSON.parse(encryptedOpenaiApiKey);
        openaiApiKey = await decryptData(key, encryptedOpenAIData.iv, encryptedOpenAIData.ciphertext);
        translatedText = await translateWithOpenAI(post, openaiApiKey, targetLanguage, openaiPrompt);
    } else{
        throw new Error('Invalid translation service or missing API key.');
    }

    return translatedText;
}

/**
 * Translates text using OpenAI's API.
 * @param {string} text - Text to translate.
 * @param {string} apiKey - OpenAI API key.
 * @param {string} targetLanguage - Target language code.
 * @param {string} prompt - Custom translation prompt.
 * @returns {Promise<string>} - Translated text.
 */
async function translateWithOpenAI(text, apiKey, targetLanguage, prompt) {
    const promptWithTarget = prompt.replace('{TARGET}', targetLanguage).replace('{TEXT}', text);
    const messages = [
        {
            role: 'system',
            content: 'You are a helpful assistant that translates text with an emphasis on clear meaning.'
        },
        {
            role: 'user',
            content: promptWithTarget
        }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini', // Adjust model as needed
            messages: messages
        })
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API Error: ${errorData}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
    } else {
        throw new Error('OpenAI translation failed. Data returned:', data);
    }
}

/**
 * Translates text using Google Translate's API.
 * @param {string} text - Text to translate.
 * @param {string} apiKey - Google Translate API key.
 * @param {string} targetLanguage - Target language code.
 * @returns {Promise<string>} - Translated text.
 */
async function translateWithGoogle(text, apiKey, targetLanguage) {
    const encodedText = encodeURIComponent(text);
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodedText}&target=${targetLanguage}`;

    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Google Translate API Error: ${errorData}`);
    }

    const data = await response.json();

    if (data.data && data.data.translations && data.data.translations.length > 0) {
        return data.data.translations[0].translatedText;
    } else {
        throw new Error('Google Translate API translation failed.');
    }
}

/**
 * Promisified version of chrome.storage.sync.get.
 * @param {string[]|Object} keys - Keys to retrieve.
 * @returns {Promise<Object>} - Promise resolving to retrieved items.
 */
function getStorage(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, (items) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(items);
            }
        });
    });
}

/**
 * Retrieves or generates the encryption key used for API keys.
 * @returns {Promise<CryptoKey>} - The encryption key.
 */
async function getEncryptionKey() {
    const localItems = await getLocalStorage(['encryptionKey']);
    let key = null;

    if (localItems.encryptionKey) {
        // Key exists, import it
        const rawKey = base64ToArrayBuffer(localItems.encryptionKey);
        key = await window.crypto.subtle.importKey(
            'raw',
            rawKey,
            { name: 'AES-GCM' },
            true,
            ['encrypt', 'decrypt']
        );
    } else {
        // Generate a new key
        key = await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );

        // Export and store the key
        const exportedKey = await window.crypto.subtle.exportKey('raw', key);
        const exportedKeyBase64 = arrayBufferToBase64(exportedKey);
        await setLocalStorage({ encryptionKey: exportedKeyBase64 });
    }

    return key;
}

/**
 * Decrypts data using the provided encryption key.
 * @param {CryptoKey} key - The encryption key.
 * @param {string} ivBase64 - The Base64 encoded IV.
 * @param {string} ciphertextBase64 - The Base64 encoded ciphertext.
 * @returns {Promise<string>} - The decrypted plaintext data.
 */
async function decryptData(key, ivBase64, ciphertextBase64) {
    const decoder = new TextDecoder();
    const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);

    try {
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            ciphertext
        );
        return decoder.decode(decrypted);
    } catch (e) {
        console.error('BabbelSky: Decryption failed:', e);
        throw new Error('Failed to decrypt data. Possible data corruption.');
    }
}

/**
 * Converts an ArrayBuffer to a Base64 string.
 * @param {ArrayBuffer} buffer - The buffer to convert.
 * @returns {string} - Base64 encoded string.
 */
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 * @param {string} base64 - The Base64 string to convert.
 * @returns {ArrayBuffer} - The resulting ArrayBuffer.
 */
function base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

/**
 * Promisified version of chrome.storage.local.get.
 * @param {string[]|Object} keys - Keys to retrieve.
 * @returns {Promise<Object>} - Promise resolving to retrieved items.
 */
function getLocalStorage(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, (items) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(items);
            }
        });
    });
}

/**
 * Promisified version of chrome.storage.local.set.
 * @param {Object} items - Items to store.
 * @returns {Promise<void>}
 */
function setLocalStorage(items) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(items, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Displays a message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The type of message ('success' or 'error').
 */
function displayMessage(message, type) {
    // Implement user feedback mechanism, e.g., notifications or UI elements
    console.log(`BabbelSky: ${type.toUpperCase()} - ${message}`);
}
