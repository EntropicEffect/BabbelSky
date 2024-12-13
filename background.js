// background.js

import { decryptData, getEncryptionKey, getStorage } from "./utils.js";

const apiCallTracker = {};

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
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            files: ["contentScript.js"],
          },
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
  const lastApiCallTime = apiCallTracker[url] || 0;
  const timeSinceLastCall = now - lastApiCallTime;

  // Ensure at least 2 seconds between API calls
  if (timeSinceLastCall < 2000) {
    const delay = 2000 - timeSinceLastCall;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  apiCallTracker[url] = Date.now(); // Update the last API call time

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
