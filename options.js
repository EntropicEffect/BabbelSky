// options.js

/**
 * Default OpenAI translation prompt.
 * @type {string}
 */
const defaultOpenAIPrompt = "Translate the following text to natural {TARGET}:\n\n{TEXT}";

/**
 * Promisified version of chrome.storage.sync.get.
 * @param {string[]|Object} keys - Keys to retrieve.
 * @returns {Promise<Object>} - Promise resolving to retrieved items.
 */
function getStorage(keys) {
  return new Promise((resolve, reject) => {
    console.log('getStorage: Retrieving keys:', keys);
    chrome.storage.sync.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        console.error('getStorage: Error retrieving keys:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log('getStorage: Retrieved items:', items);
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
    console.log('setStorage: Storing items:', items);
    chrome.storage.sync.set(items, () => {
      if (chrome.runtime.lastError) {
        console.error('setStorage: Error storing items:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log('setStorage: Items stored successfully');
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
    console.log('removeStorage: Removing keys:', keys);
    chrome.storage.sync.remove(keys, () => {
      if (chrome.runtime.lastError) {
        console.error('removeStorage: Error removing keys:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log('removeStorage: Keys removed successfully');
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
    console.log('getLocalStorage: Retrieving keys:', keys);
    chrome.storage.local.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        console.error('getLocalStorage: Error retrieving keys:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log('getLocalStorage: Retrieved items:', items);
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
    console.log('setLocalStorage: Storing items:', items);
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        console.error('setLocalStorage: Error storing items:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log('setLocalStorage: Items stored successfully');
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
  console.log('arrayBufferToBase64: Converting ArrayBuffer to Base64');
  let binary = '';
  const bytes = new Uint8Array(buffer);
  bytes.forEach((b) => binary += String.fromCharCode(b));
  const base64 = window.btoa(binary);
  console.log('arrayBufferToBase64: Conversion result:', base64);
  return base64;
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 * @param {string} base64 - The Base64 string to convert.
 * @returns {ArrayBuffer} - The resulting ArrayBuffer.
 */
function base64ToArrayBuffer(base64) {
  console.log('base64ToArrayBuffer: Converting Base64 to ArrayBuffer');
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const arrayBuffer = bytes.buffer;
  console.log('base64ToArrayBuffer: Conversion result:', arrayBuffer);
  return arrayBuffer;
}

/**
 * Generates a random Initialization Vector (IV) for encryption.
 * @returns {Uint8Array} - The generated IV.
 */
function generateIV() {
  console.log('generateIV: Generating random IV');
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  console.log('generateIV: Generated IV:', iv);
  return iv;
}

/**
 * Retrieves or generates the encryption key used for API keys.
 * @returns {Promise<CryptoKey>} - The encryption key.
 */
async function getEncryptionKey() {
  console.log('getEncryptionKey: Retrieving encryption key');
  const localItems = await getLocalStorage(['encryptionKey']);
  let key = null;

  if (localItems.encryptionKey) {
    console.log('getEncryptionKey: Existing encryption key found');
    const rawKey = base64ToArrayBuffer(localItems.encryptionKey);
    key = await window.crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
    console.log('getEncryptionKey: Imported existing encryption key');
  } else {
    console.log('getEncryptionKey: No existing key found, generating new key');
    key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    const exportedKeyBase64 = arrayBufferToBase64(exportedKey);
    await setLocalStorage({ encryptionKey: exportedKeyBase64 });
    console.log('getEncryptionKey: Generated and stored new encryption key');
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
  console.log('encryptData: Encrypting data');
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

  const result = {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(ciphertext)
  };
  console.log('encryptData: Encryption result:', result);
  return result;
}

/**
 * Decrypts data using the provided encryption key.
 * @param {CryptoKey} key - The encryption key.
 * @param {string} ivBase64 - The Base64 encoded IV.
 * @param {string} ciphertextBase64 - The Base64 encoded ciphertext.
 * @returns {Promise<string>} - The decrypted plaintext data.
 */
async function decryptData(key, ivBase64, ciphertextBase64) {
  console.log('decryptData: Decrypting data');
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
    const decryptedText = decoder.decode(decrypted);
    console.log('decryptData: Decryption successful:', decryptedText);
    return decryptedText;
  } catch (e) {
    console.error('decryptData: Decryption failed:', e);
    throw new Error('Failed to decrypt data. Possible data corruption.');
  }
}

/**
 * Displays a message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The type of message ('success' or 'error').
 */
function displayMessage(message, type) {
  console.log('displayMessage: Displaying message:', message, 'Type:', type);
  const existingMessages = document.querySelectorAll('.inline-message');
  existingMessages.forEach(msg => msg.remove());

  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.className = `inline-message ${type}-message`;
  messageDiv.style.marginTop = '10px';
  messageDiv.style.color = type === 'success' ? 'green' : 'red';

  document.getElementById('optionsForm').appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
    console.log('displayMessage: Message removed after timeout');
  }, 5000);
}

/**
 * Saves options to chrome.storage.sync with encryption.
 * @returns {Promise<void>}
 */
async function saveOptions() {
  console.log('saveOptions: Saving options');
  const googleApiKey = document.getElementById('googleApiKey').value.trim();
  const openaiApiKey = document.getElementById('openaiApiKey').value.trim();
  const targetLanguage = document.getElementById('targetLanguage').value;
  let openaiPrompt = document.getElementById('openaiPrompt').value.trim();

  if (!openaiPrompt) {
    openaiPrompt = defaultOpenAIPrompt;
    document.getElementById('openaiPrompt').value = openaiPrompt;
    console.log('saveOptions: OpenAI prompt was empty, set to default');
  }

  let translationService = null;
  const serviceOpenAI = document.getElementById('serviceOpenAI');
  const serviceGoogle = document.getElementById('serviceGoogle');

  if (serviceOpenAI.checked && openaiApiKey) {
    translationService = 'OpenAI';
    console.log('saveOptions: OpenAI selected as translation service');
  } else if (serviceGoogle.checked && googleApiKey) {
    translationService = 'Google';
    console.log('saveOptions: Google selected as translation service');
  }

  try {
    const key = await getEncryptionKey();

    const itemsToSet = {
      targetLanguage,
      openaiPrompt,
      translationService
    };

    if (googleApiKey) {
      const encryptedGoogleData = await encryptData(key, googleApiKey);
      itemsToSet.encryptedGoogleApiKey = JSON.stringify(encryptedGoogleData);
      console.log('saveOptions: Google API Key encrypted and set');
    }

    if (openaiApiKey) {
      const encryptedOpenAIData = await encryptData(key, openaiApiKey);
      itemsToSet.encryptedOpenaiApiKey = JSON.stringify(encryptedOpenAIData);
      console.log('saveOptions: OpenAI API Key encrypted and set');
    }

    await setStorage(itemsToSet);

    if (!googleApiKey) {
      await removeStorage(['encryptedGoogleApiKey']);
      console.log('saveOptions: Google API Key removed from storage');
    }

    if (!openaiApiKey) {
      await removeStorage(['encryptedOpenaiApiKey']);
      console.log('saveOptions: OpenAI API Key removed from storage');
    }

    if (!translationService) {
      await setStorage({ translationService: null });
      console.log('saveOptions: Translation service set to null');
    }

    displayMessage('Settings saved securely.', 'success');
  } catch (error) {
    console.error('saveOptions: Error saving settings:', error);
    displayMessage('Failed to save settings. Please try again.', 'error');
  }
}

/**
 * Restores options using the preferences stored in chrome.storage.sync with decryption.
 * @returns {Promise<void>}
 */
async function loadOptions() {
  console.log('loadOptions: Loading options');
  try {
    const items = await getStorage([
      'encryptedGoogleApiKey',
      'encryptedOpenaiApiKey',
      'targetLanguage',
      'openaiPrompt',
      'translationService'
    ]);

    const key = await getEncryptionKey();

    let googleApiKey = '';
    let openaiApiKey = '';

    if (items.encryptedGoogleApiKey) {
      try {
        const encryptedGoogleData = JSON.parse(items.encryptedGoogleApiKey);
        googleApiKey = await decryptData(key, encryptedGoogleData.iv, encryptedGoogleData.ciphertext);
        console.log('loadOptions: Google API Key decrypted');
      } catch (e) {
        console.error('loadOptions: Error decrypting Google API Key:', e);
        displayMessage('Failed to decrypt Google API Key. It may have been corrupted.', 'error');
      }
    }

    if (items.encryptedOpenaiApiKey) {
      try {
        const encryptedOpenAIData = JSON.parse(items.encryptedOpenaiApiKey);
        openaiApiKey = await decryptData(key, encryptedOpenAIData.iv, encryptedOpenAIData.ciphertext);
        console.log('loadOptions: OpenAI API Key decrypted');
      } catch (e) {
        console.error('loadOptions: Error decrypting OpenAI API Key:', e);
        displayMessage('Failed to decrypt OpenAI API Key. It may have been corrupted.', 'error');
      }
    }

    const targetLanguage = items.targetLanguage || 'en';
    let openaiPrompt = items.openaiPrompt;

    if (!openaiPrompt || !openaiPrompt.trim()) {
      openaiPrompt = defaultOpenAIPrompt;
      console.log('loadOptions: OpenAI prompt was empty, set to default');
    }

    document.getElementById('googleApiKey').value = googleApiKey;
    document.getElementById('openaiApiKey').value = openaiApiKey;
    document.getElementById('targetLanguage').value = targetLanguage;
    document.getElementById('openaiPrompt').value = openaiPrompt;

    updateTranslationServiceOptions();

    const translationService = items.translationService || null;
    const serviceOpenAI = document.getElementById('serviceOpenAI');
    const serviceGoogle = document.getElementById('serviceGoogle');

    serviceOpenAI.checked = translationService === 'OpenAI' && !serviceOpenAI.disabled;
    serviceGoogle.checked = translationService === 'Google' && !serviceGoogle.disabled;

    toggleOpenAIPromptContainer(serviceOpenAI.checked);

    displayMessage('Settings loaded successfully.', 'success');
  } catch (error) {
    console.error('loadOptions: Error loading options:', error);
    displayMessage('Failed to load settings. Please ensure that your data is intact.', 'error');
  }
}

/**
 * Resets the OpenAI prompt to the default value.
 */
function resetPrompt() {
  console.log('resetPrompt: Resetting OpenAI prompt to default');
  document.getElementById('openaiPrompt').value = defaultOpenAIPrompt;
  displayMessage('OpenAI prompt reset to default.', 'success');
}

/**
 * Toggles the visibility of the OpenAI prompt container.
 * @param {boolean} show - Whether to show or hide the container.
 */
function toggleOpenAIPromptContainer(show) {
  console.log('toggleOpenAIPromptContainer: Toggling OpenAI prompt container visibility:', show);
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
  console.log('handleCheckboxChange: Handling checkbox change:', event.target.id, 'Checked:', event.target.checked);
  const serviceOpenAI = document.getElementById('serviceOpenAI');
  const serviceGoogle = document.getElementById('serviceGoogle');

  if (event.target.checked) {
    if (event.target.id === 'serviceOpenAI') {
      serviceGoogle.checked = false;
      toggleOpenAIPromptContainer(true);
    } else if (event.target.id === 'serviceGoogle') {
      serviceOpenAI.checked = false;
      toggleOpenAIPromptContainer(false);
    }
  } else {
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
  console.log('updateTranslationServiceOptions: Updating translation service options');
  const googleApiKey = document.getElementById('googleApiKey').value.trim();
  const openaiApiKey = document.getElementById('openaiApiKey').value.trim();

  const serviceOpenAI = document.getElementById('serviceOpenAI');
  const labelOpenAI = document.querySelector('label[for="serviceOpenAI"]');
  const tooltipOpenAI = labelOpenAI.querySelector('.tooltiptext');

  const serviceGoogle = document.getElementById('serviceGoogle');
  const labelGoogle = document.querySelector('label[for="serviceGoogle"]');
  const tooltipGoogle = labelGoogle.querySelector('.tooltiptext');

  if (!openaiApiKey) {
    serviceOpenAI.disabled = true;
    labelOpenAI.style.color = '#999';
    tooltipOpenAI.textContent = 'Requires OpenAI API Key';
    serviceOpenAI.checked = false;
    toggleOpenAIPromptContainer(false);
  } else {
    serviceOpenAI.disabled = false;
    labelOpenAI.style.color = '';
    tooltipOpenAI.textContent = '';
  }

  if (!googleApiKey) {
    serviceGoogle.disabled = true;
    labelGoogle.style.color = '#999';
    tooltipGoogle.textContent = 'Requires Google Translate API Key';
    serviceGoogle.checked = false;
  } else {
    serviceGoogle.disabled = false;
    labelGoogle.style.color = '';
    tooltipGoogle.textContent = '';
  }

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
  
  document.addEventListener('DOMContentLoaded', () => {
    loadOptions();
  
    document.getElementById('saveButton').addEventListener('click', saveOptions);
    document.getElementById('resetPromptButton').addEventListener('click', resetPrompt);
    document.getElementById('googleApiKey').addEventListener('input', updateTranslationServiceOptions);
    document.getElementById('openaiApiKey').addEventListener('input', updateTranslationServiceOptions);
  });