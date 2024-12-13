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
 * Retrieves or generates the encryption key used for API keys.
 * @returns {Promise<CryptoKey>} - The encryption key.
 */
async function getEncryptionKey() {
  const localItems = await getLocalStorage(["encryptionKey"]);
  let key = null;

  if (localItems.encryptionKey) {
    // Key exists, import it
    const rawKey = base64ToArrayBuffer(localItems.encryptionKey);
    key = await globalThis.crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"],
    );
  } else {
    // Generate a new key
    key = await globalThis.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"],
    );

    // Export and store the key
    const exportedKey = await globalThis.crypto.subtle.exportKey("raw", key);
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
    const decrypted = await globalThis.crypto.subtle.decrypt(
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
  return btoa(binary);
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 * @param {string} base64 - The Base64 string to convert.
 * @returns {ArrayBuffer} - The resulting ArrayBuffer.
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
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

export {
  getStorage,
  setStorage,
  setLocalStorage,
  getEncryptionKey,
  decryptData,
  arrayBufferToBase64,
};
