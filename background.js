// background.js

let lastApiCallTime = 0;

//Listener for messages from content script.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "translatePost") {
    const post = message.post;
    translatePost(post)
      .then((translatedPost) => {
        sendResponse({ translatedPost });
      })
      .catch((error) => {
        console.error("BabbelSky: Translation Error:", error);
        sendResponse({ error: error.message });
      });
    return true; // Indicates that sendResponse will be called asynchronously
  }

  // Explicitly return false for all other cases
  return false;
});

// Listener for when the extension is installed
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    // Open the Options Page
    chrome.runtime.openOptionsPage(function () {
      if (chrome.runtime.lastError) {
        console.error(
          "BabbelSky: Failed to open Options Page on install.",
          chrome.runtime.lastError,
        );
      }
    });
    // Explicitly return after handling the "install" case
  }

  // Explicitly return for cases where details.reason is not "install"
});

// Listener to inject contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "injectContentScript") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length) {
        chrome.tabs.executeScript(
          tabs[0].id,
          { file: "contentScript.js" },
          () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error injecting contentScript.js:",
                chrome.runtime.lastError,
              );
              sendResponse({
                success: false,
                error: chrome.runtime.lastError.message,
              });
            } else {
              sendResponse({ success: true });
            }
          },
        );
      }
    });
    return true; // Indicates asynchronous response will be sent
  }

  // Explicitly return false for all other cases
  return false;
});
/**
 * Translates a single post using the selected translation service.
 * @param {string} post - The post text to translate.
 * @returns {Promise<string>} - The translated post text.
 */
async function translatePost(post) {
  // Retrieve settings from storage
  const settings = await getStorage([
    "encryptedGoogleApiKey",
    "encryptedOpenaiApiKey",
    "targetLanguage",
    "targetLanguageName",
    "openaiPrompt",
    "translationService",
  ]);
  const {
    encryptedGoogleApiKey,
    encryptedOpenaiApiKey,
    targetLanguage,
    targetLanguageName,
    openaiPrompt,
    translationService,
  } = settings;

  if (!translationService) {
    throw new Error("No translation service selected.");
  }

  // Decrypt API keys
  const key = await getEncryptionKey();
  let googleApiKey = "";
  let openaiApiKey = "";
  let translatedText = "";

  if (translationService === "Google" && encryptedGoogleApiKey) {
    const encryptedGoogleData = JSON.parse(encryptedGoogleApiKey);
    googleApiKey = await decryptData(
      key,
      encryptedGoogleData.iv,
      encryptedGoogleData.ciphertext,
    );
    translatedText = await translateWithGoogle(
      post,
      googleApiKey,
      targetLanguage,
    );
  } else if (translationService === "OpenAI" && encryptedOpenaiApiKey) {
    const encryptedOpenAIData = JSON.parse(encryptedOpenaiApiKey);
    openaiApiKey = await decryptData(
      key,
      encryptedOpenAIData.iv,
      encryptedOpenAIData.ciphertext,
    );
    translatedText = await translateWithOpenAI(
      post,
      openaiApiKey,
      targetLanguageName,
      openaiPrompt,
    );
  } else {
    throw new Error("Invalid translation service or missing API key.");
  }

  return translatedText;
}

async function rateLimitedApiCall(url, options) {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;

  // Ensure at least 2 seconds between API calls
  if (timeSinceLastCall < 2000) {
    const delay = 2000 - timeSinceLastCall;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  lastApiCallTime = Date.now(); // Update the last API call timestamp

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Translates text using OpenAI's API.
 * @param {string} text - Text to translate.
 * @param {string} apiKey - OpenAI API key.
 * @param {string} targetLanguageName - Target language.
 * @param {string} prompt - Custom translation prompt.
 * @returns {Promise<string>} - Translated text.
 */
async function translateWithOpenAI(text, apiKey, targetLanguageName, prompt) {
  const promptWithTarget = prompt
    .replace("{TARGET}", targetLanguageName)
    .replace("{TEXT}", text);
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant that translates text with an emphasis on clear meaning.",
    },
    {
      role: "user",
      content: promptWithTarget,
    },
  ];

  const url = "https://api.openai.com/v1/chat/completions";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Adjust model as needed
      messages,
    }),
  };

  const data = await rateLimitedApiCall(url, options);

  if (data.choices && data.choices.length) {
    return data.choices[0].message.content.trim();
  }
  throw new Error("OpenAI translation failed. Data returned:", data);
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

  const data = await rateLimitedApiCall(url, {
    method: "GET",
  });

  if (data.data && data.data.translations && data.data.translations.length) {
    return data.data.translations[0].translatedText;
  }
  throw new Error("Google Translate API translation failed.");
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
  const localItems = await getLocalStorage(["encryptionKey"]);
  let key = null;

  if (localItems.encryptionKey) {
    // Key exists, import it
    const rawKey = base64ToArrayBuffer(localItems.encryptionKey);
    key = await window.crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"],
    );
  } else {
    // Generate a new key
    key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"],
    );

    // Export and store the key
    const exportedKey = await window.crypto.subtle.exportKey("raw", key);
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
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext,
    );
    return decoder.decode(decrypted);
  } catch (e) {
    console.error("BabbelSky: Decryption failed:", e);
    throw new Error("Failed to decrypt data. Possible data corruption.");
  }
}

/**
 * Converts an ArrayBuffer to a Base64 string.
 * @param {ArrayBuffer} buffer - The buffer to convert.
 * @returns {string} - Base64 encoded string.
 */
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
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
