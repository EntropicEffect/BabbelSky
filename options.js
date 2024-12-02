// options.js

/**
 * Default OpenAI translation prompt.
 * @type {string}
 */
const defaultOpenAIPrompt = "Translate the following text to natural {TARGET}:\n\n{TEXT}";

/**
 * An array of objects representing supported languages for translation.
 * Each object contains the language's name and its corresponding language code.
 * 
 * @constant {Array<{name: string, code: string}>}
 * @property {string} name - The full name of the language (e.g., "English").
 * @property {string} code - The language code (e.g., "en").
 */
const languages = [
    { name: "Abkhaz", code: "ab" },
    { name: "Acehnese", code: "ace" },
    { name: "Acholi", code: "ach" },
    { name: "Afrikaans", code: "af" },
    { name: "Albanian", code: "sq" },
    { name: "Alur", code: "alz" },
    { name: "Amharic", code: "am" },
    { name: "Arabic", code: "ar" },
    { name: "Armenian", code: "hy" },
    { name: "Assamese", code: "as" },
    { name: "Awadhi", code: "awa" },
    { name: "Aymara", code: "ay" },
    { name: "Azerbaijani", code: "az" },
    { name: "Balinese", code: "ban" },
    { name: "Bambara", code: "bm" },
    { name: "Bashkir", code: "ba" },
    { name: "Basque", code: "eu" },
    { name: "Batak Karo", code: "btx" },
    { name: "Batak Simalungun", code: "bts" },
    { name: "Batak Toba", code: "bbc" },
    { name: "Belarusian", code: "be" },
    { name: "Bemba", code: "bem" },
    { name: "Bengali", code: "bn" },
    { name: "Betawi", code: "bew" },
    { name: "Bhojpuri", code: "bho" },
    { name: "Bikol", code: "bik" },
    { name: "Bosnian", code: "bs" },
    { name: "Breton", code: "br" },
    { name: "Bulgarian", code: "bg" },
    { name: "Buryat", code: "bua" },
    { name: "Cantonese", code: "yue" },
    { name: "Catalan", code: "ca" },
    { name: "Cebuano", code: "ceb" },
    { name: "Chichewa (Nyanja)", code: "ny" },
    { name: "Chinese (Simplified)", code: "zh-CN" },
    { name: "Chinese (Traditional)", code: "zh-TW" },
    { name: "Chuvash", code: "cv" },
    { name: "Corsican", code: "co" },
    { name: "Crimean Tatar", code: "crh" },
    { name: "Croatian", code: "hr" },
    { name: "Czech", code: "cs" },
    { name: "Danish", code: "da" },
    { name: "Dinka", code: "din" },
    { name: "Divehi", code: "dv" },
    { name: "Dogri", code: "doi" },
    { name: "Dombe", code: "dov" },
    { name: "Dutch", code: "nl" },
    { name: "Dzongkha", code: "dz" },
    { name: "English", code: "en"},
    { name: "Esperanto", code: "eo" },
    { name: "Estonian", code: "et" },
    { name: "Ewe", code: "ee" },
    { name: "Fijian", code: "fj" },
    { name: "Filipino (Tagalog)", code: "fil" },
    { name: "Finnish", code: "fi" },
    { name: "French", code: "fr" },
    { name: "Frisian", code: "fy" },
    { name: "Galician", code: "gl" },
    { name: "Georgian", code: "ka" },
    { name: "German", code: "de" },
    { name: "Greek", code: "el" },
    { name: "Gujarati", code: "gu" },
    { name: "Haitian Creole", code: "ht" },
    { name: "Hausa", code: "ha" },
    { name: "Hawaiian", code: "haw" },
    { name: "Hebrew", code: "he" },
    { name: "Hindi", code: "hi" },
    { name: "Hmong", code: "hmn" },
    { name: "Hungarian", code: "hu" },
    { name: "Icelandic", code: "is" },
    { name: "Igbo", code: "ig" },
    { name: "Indonesian", code: "id" },
    { name: "Irish", code: "ga" },
    { name: "Italian", code: "it" },
    { name: "Japanese", code: "ja" },
    { name: "Javanese", code: "jw" },
    { name: "Kannada", code: "kn" },
    { name: "Kazakh", code: "kk" },
    { name: "Khmer", code: "km" },
    { name: "Korean", code: "ko" },
    { name: "Kurdish (Kurmanji)", code: "ku" },
    { name: "Kurdish (Sorani)", code: "ckb" },
    { name: "Kyrgyz", code: "ky" },
    { name: "Lao", code: "lo" },
    { name: "Latvian", code: "lv" },
    { name: "Lithuanian", code: "lt" },
    { name: "Luxembourgish", code: "lb" },
    { name: "Macedonian", code: "mk" },
    { name: "Malay", code: "ms" },
    { name: "Malayalam", code: "ml" },
    { name: "Maltese", code: "mt" },
    { name: "Maori", code: "mi" },
    { name: "Marathi", code: "mr" },
    { name: "Mongolian", code: "mn" },
    { name: "Nepali", code: "ne" },
    { name: "Norwegian", code: "no" },
    { name: "Pashto", code: "ps" },
    { name: "Persian", code: "fa" },
    { name: "Polish", code: "pl" },
    { name: "Portuguese", code: "pt" },
    { name: "Punjabi", code: "pa" },
    { name: "Romanian", code: "ro" },
    { name: "russian", code: "ru" },
    { name: "Serbian", code: "sr" },
    { name: "Sinhala", code: "si" },
    { name: "Slovak", code: "sk" },
    { name: "Slovenian", code: "sl" },
    { name: "Somali", code: "so" },
    { name: "Spanish", code: "es" },
    { name: "Swahili", code: "sw" },
    { name: "Swedish", code: "sv" },
    { name: "Tajik", code: "tg" },
    { name: "Tamil", code: "ta" },
    { name: "Telugu", code: "te" },
    { name: "Thai", code: "th" },
    { name: "Turkish", code: "tr" },
    { name: "Ukrainian", code: "uk" },
    { name: "Urdu", code: "ur" },
    { name: "Uzbek", code: "uz" },
    { name: "Vietnamese", code: "vi" },
    { name: "Welsh", code: "cy" },
    { name: "Zulu", code: "zu" }
  ];


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
 * Promisified version of chrome.storage.sync.set.
 * @param {Object} items - Items to store.
 * @returns {Promise<void>}
 */
function setStorage(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Promisified version of chrome.storage.sync.remove.
 * @param {string|string[]} keys - Keys to remove.
 * @returns {Promise<void>}
 */
function removeStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
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
 * Generates a random Initialization Vector (IV) for encryption.
 * @returns {Uint8Array} - The generated IV.
 */
function generateIV() {
  return window.crypto.getRandomValues(new Uint8Array(12));
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
 * Encrypts data using the provided encryption key.
 * @param {CryptoKey} key - The encryption key.
 * @param {string} data - The plaintext data to encrypt.
 * @returns {Promise<Object>} - An object containing the IV and ciphertext.
 */
async function encryptData(key, data) {
  const encoder = new TextEncoder();
  const iv = generateIV();
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encoder.encode(data)
  );

  return {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(ciphertext)
  };
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
    console.error('Decryption failed:', e);
    throw new Error('Failed to decrypt data. Possible data corruption.');
  }
}


/**
 * Displays a message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The type of message ('success' or 'error').
 */
function displayMessage(message, type) {
  // Remove existing messages
  const existingMessages = document.querySelectorAll('.inline-message');
  existingMessages.forEach(msg => msg.remove());

  // Create a new message div
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.className = `inline-message ${type}-message`;
  messageDiv.style.marginTop = '10px';
  messageDiv.style.color = type === 'success' ? 'green' : 'red';

  // Append the message to the form
  document.getElementById('optionsForm').appendChild(messageDiv);

  // Remove the message after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

/**
 * Saves options to chrome.storage.sync with encryption.
 * @returns {Promise<void>}
 */
async function saveOptions() {
  const googleApiKey = document.getElementById('googleApiKey').value.trim();
  const openaiApiKey = document.getElementById('openaiApiKey').value.trim();
  const targetLanguage = document.getElementById('targetLanguage').value;
  const targetLanguageName = languages.find(lang => lang.code === targetLanguage).name;
  let openaiPrompt = document.getElementById('openaiPrompt').value.trim();

  // If the OpenAI prompt is empty or whitespace, use the default prompt
  if (!openaiPrompt) {
    openaiPrompt = defaultOpenAIPrompt;
    document.getElementById('openaiPrompt').value = openaiPrompt; // Update the textarea
  }

  // Get selected translation service
  let translationService = null;
  const serviceOpenAI = document.getElementById('serviceOpenAI');
  const serviceGoogle = document.getElementById('serviceGoogle');

  if (serviceOpenAI.checked && openaiApiKey) {
    translationService = 'OpenAI';
  } else if (serviceGoogle.checked && googleApiKey) {
    translationService = 'Google';
  }

  try {
    const key = await getEncryptionKey();

    // Prepare an object to hold the items to set
    const itemsToSet = {
      targetLanguage,
      targetLanguageName,
      openaiPrompt,
      translationService
    };

    // Encrypt and set Google API Key if provided
    if (googleApiKey) {
      const encryptedGoogleData = await encryptData(key, googleApiKey);
      itemsToSet.encryptedGoogleApiKey = JSON.stringify(encryptedGoogleData);
    }

    // Encrypt and set OpenAI API Key if provided
    if (openaiApiKey) {
      const encryptedOpenAIData = await encryptData(key, openaiApiKey);
      itemsToSet.encryptedOpenaiApiKey = JSON.stringify(encryptedOpenAIData);
    }

    // Set the encrypted API keys and other settings
    await setStorage(itemsToSet);

    // Remove Google API Key from storage if not provided
    if (!googleApiKey) {
      await removeStorage(['encryptedGoogleApiKey']);
    }

    // Remove OpenAI API Key from storage if not provided
    if (!openaiApiKey) {
      await removeStorage(['encryptedOpenaiApiKey']);
    }

    // Update translationService based on the presence of API keys
    if (!translationService) {
      // If no translation service is selected, set translationService to null
      await setStorage({ translationService: null });
    }

    // Provide user feedback
    displayMessage('Settings saved securely.', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    displayMessage('Failed to save settings. Please try again.', 'error');
  }
}

/**
 * Restores options using the preferences stored in chrome.storage.sync with decryption.
 * @returns {Promise<void>}
 */
async function loadOptions() {
  try {
    const items = await getStorage([
      'encryptedGoogleApiKey',
      'encryptedOpenaiApiKey',
      'targetLanguage',
      'openaiPrompt',
      'translationService'
    ]);

    const key = await getEncryptionKey();

    // Decrypt API keys if they exist
    let googleApiKey = '';
    let openaiApiKey = '';

    if (items.encryptedGoogleApiKey) {
      try {
        const encryptedGoogleData = JSON.parse(items.encryptedGoogleApiKey);
        googleApiKey = await decryptData(key, encryptedGoogleData.iv, encryptedGoogleData.ciphertext);
      } catch (e) {
        console.error('Error decrypting Google API Key:', e);
        displayMessage('Failed to decrypt Google API Key. It may have been corrupted.', 'error');
      }
    }

    if (items.encryptedOpenaiApiKey) {
      try {
        const encryptedOpenAIData = JSON.parse(items.encryptedOpenaiApiKey);
        openaiApiKey = await decryptData(key, encryptedOpenAIData.iv, encryptedOpenAIData.ciphertext);
      } catch (e) {
        console.error('Error decrypting OpenAI API Key:', e);
        displayMessage('Failed to decrypt OpenAI API Key. It may have been corrupted.', 'error');
      }
    }

    const targetLanguage = items.targetLanguage || 'en';

    let openaiPrompt = items.openaiPrompt;

    // Check if openaiPrompt is undefined, null, or empty/whitespace
    if (!openaiPrompt || !openaiPrompt.trim()) {
      openaiPrompt = defaultOpenAIPrompt;
    }

    document.getElementById('googleApiKey').value = googleApiKey;
    document.getElementById('openaiApiKey').value = openaiApiKey;
    document.getElementById('targetLanguage').value = targetLanguage;
    document.getElementById('openaiPrompt').value = openaiPrompt;

    updateTranslationServiceOptions();

    // Set the translation service checkbox
    const translationService = items.translationService || null;
    const serviceOpenAI = document.getElementById('serviceOpenAI');
    const serviceGoogle = document.getElementById('serviceGoogle');

    serviceOpenAI.checked = translationService === 'OpenAI' && !serviceOpenAI.disabled;
    serviceGoogle.checked = translationService === 'Google' && !serviceGoogle.disabled;

    // Show or hide OpenAI prompt container based on the checkbox state
    toggleOpenAIPromptContainer(serviceOpenAI.checked);

    // Provide user feedback
    displayMessage('Settings loaded successfully.', 'success');
  } catch (error) {
    console.error('Error loading options:', error);
    displayMessage('Failed to load settings. Please ensure that your data is intact.', 'error');
  }
}

/**
 * Resets the OpenAI prompt to the default value.
 */
function resetPrompt() {
  document.getElementById('openaiPrompt').value = defaultOpenAIPrompt;
  displayMessage('OpenAI prompt reset to default.', 'success');
}

/**
 * Toggles the visibility of the OpenAI prompt container.
 * @param {boolean} show - Whether to show or hide the container.
 */
function toggleOpenAIPromptContainer(show) {
  const openaiPromptContainer = document.getElementById('openaiPromptContainer');
  if (show) {
    openaiPromptContainer.style.display = 'block';
  } else {
    openaiPromptContainer.style.display = 'none';
  }
}

/**
 * Handles checkbox changes to ensure only one is selected and manages the OpenAI prompt visibility.
 * @param {Event} event - The checkbox change event.
 */
function handleCheckboxChange(event) {
  const serviceOpenAI = document.getElementById('serviceOpenAI');
  const serviceGoogle = document.getElementById('serviceGoogle');

  if (event.target.checked) {
    // Uncheck the other checkbox
    if (event.target.id === 'serviceOpenAI') {
      serviceGoogle.checked = false;
      toggleOpenAIPromptContainer(true);
    } else if (event.target.id === 'serviceGoogle') {
      serviceOpenAI.checked = false;
      toggleOpenAIPromptContainer(false);
    }
  } else {
    // If unchecked, hide the OpenAI prompt container
    if (event.target.id === 'serviceOpenAI') {
      toggleOpenAIPromptContainer(false);
    }
  }
}

/**
 * Updates the translation service options based on API keys and ensures only one can be selected.
 * Also manages tooltips based on the checkbox's enabled/disabled state.
 */
function updateTranslationServiceOptions() {
  const googleApiKey = document.getElementById('googleApiKey').value.trim();
  const openaiApiKey = document.getElementById('openaiApiKey').value.trim();

  const serviceOpenAI = document.getElementById('serviceOpenAI');
  const labelOpenAI = document.querySelector('label[for="serviceOpenAI"]');
  const tooltipOpenAI = labelOpenAI.querySelector('.tooltiptext');

  const serviceGoogle = document.getElementById('serviceGoogle');
  const labelGoogle = document.querySelector('label[for="serviceGoogle"]');
  const tooltipGoogle = labelGoogle.querySelector('.tooltiptext');

  // OpenAI
  if (!openaiApiKey) {
    serviceOpenAI.disabled = true;
    labelOpenAI.style.color = '#999';
    tooltipOpenAI.textContent = 'Requires OpenAI API Key';
    serviceOpenAI.checked = false;
    toggleOpenAIPromptContainer(false);
  } else {
    serviceOpenAI.disabled = false;
    labelOpenAI.style.color = '';
    tooltipOpenAI.textContent = ''; // Remove tooltip when enabled
  }

  // Google Translate
  if (!googleApiKey) {
    serviceGoogle.disabled = true;
    labelGoogle.style.color = '#999';
    tooltipGoogle.textContent = 'Requires Google Translate API Key';
    serviceGoogle.checked = false;
  } else {
    serviceGoogle.disabled = false;
    labelGoogle.style.color = '';
    tooltipGoogle.textContent = ''; // Remove tooltip when enabled
  }

  // Attach event listeners only once
  const checkboxes = [serviceOpenAI, serviceGoogle];
  checkboxes.forEach((checkbox) => {
    checkbox.removeEventListener('change', handleCheckboxChange);
    checkbox.addEventListener('change', handleCheckboxChange);
  });
}

/**
 * Initializes the Show/Hide button functionality for password fields.
 * @param {string} inputId - The ID of the input field.
 * @param {string} buttonId - The ID of the toggle button.
 */
function togglePasswordVisibility(inputId, buttonId) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);
  if (button) { // Ensure the button exists
    button.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'Hide';
      } else {
        input.type = 'password';
        button.textContent = 'Show';
      }
    });
  }
}

// Initialize password visibility toggles
togglePasswordVisibility('googleApiKey', 'toggleGoogleApiKey');
togglePasswordVisibility('openaiApiKey', 'toggleOpenAIApiKey');

function populateTargetLanguageDropdown() {
    const dropdown = document.getElementById("targetLanguage");
    languages.forEach(language => {
        const option = document.createElement("option");
        option.value = language.code;
        option.textContent = language.name;
        dropdown.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    populateTargetLanguageDropdown();
    loadOptions();

    document.getElementById('saveButton').addEventListener('click', saveOptions);
    document.getElementById('resetPromptButton').addEventListener('click', resetPrompt);
    document.getElementById('googleApiKey').addEventListener('input', updateTranslationServiceOptions);
    document.getElementById('openaiApiKey').addEventListener('input', updateTranslationServiceOptions);
});
