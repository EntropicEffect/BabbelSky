// contentScript.js

/**
 * @fileoverview
 * Content script for BabbelSky extension.
 * Overrides the default behavior of the translation button on Bluesky posts.
 * Extracts the text from the active main post and sends it for translation.
 */
(function () {
    console.log('BabbelSky: contentScript.js loaded and executing.');

    /**
     * Labels used to identify the translation button in different languages.
     * Extend this array if Bluesky supports more languages.
     * @type {string[]}
     */
    const translationButtonLabels = ['Translate', 'Traducir', 'Traduire']; // Add more as needed

    /**
     * Selects the "Translate" button based on predefined labels.
     * @returns {HTMLElement|null} - The "Translate" button element or null if not found.
     */
    function getTranslateButton() {
        for (const label of translationButtonLabels) {
            const buttons = document.querySelectorAll(`a[aria-label="${label}"]`);
            for (const button of buttons) {
                // Since only main posts have the Translate button, return the first found
                return button;
            }
        }
        return null;
    }

    /**
     * Extracts text from the post containing the provided "Translate" button.
     * @param {HTMLElement} translateButton - The "Translate" button element.
     * @returns {string|null} - The extracted post text or null if not found.
     */
    function extractPostText(translateButton) {
        if (!translateButton) {
            console.warn('BabbelSky: "Translate" button not found.');
            return null;
        }

        // Traverse up the DOM to find the parent post element
        const postElement = translateButton.closest('[data-testid^="postThreadItem-by-"]');
        if (!postElement) {
            console.warn('BabbelSky: Could not locate the parent post element.');
            return null;
        }

        // Extract the text from the designated div within the post
        const textElement = postElement.querySelector('[data-word-wrap="1"]');
        if (textElement) {
            const postText = textElement.textContent.trim();
            console.log(`BabbelSky: Extracted post text: "${postText}"`);
            return postText;
        } else {
            console.warn('BabbelSky: No text element found within the post.');
            return null;
        }
    }

    /**
     * Handles the click event on the "Translate" button.
     * Prevents the default action, extracts post text, and sends it for translation.
     * @param {Event} event - The click event object.
     */
    function handleTranslateButtonClick(event) {
        // Prevent the default translation behavior
        event.preventDefault();
        event.stopImmediatePropagation();

        // Extract the "Translate" button that was clicked
        const translateButton = event.currentTarget;

        // Extract the post text from the associated post
        const postText = extractPostText(translateButton);

        if (!postText) {
            console.warn('BabbelSky: No post text found to translate.');
            return;
        }

        // Send the post text to the background script for translation
        chrome.runtime.sendMessage({ action: 'translatePost', post: postText }, (response) => {
            if (response && response.translatedPost) {
                console.log('BabbelSky: Translated Post:', response.translatedPost);
                // Inject the translated text into the DOM
                addTranslatedText(translateButton, response.translatedPost);
            } else if (response && response.error) {
                console.error('BabbelSky: Translation Error:', response.error);
                alert(`BabbelSky Translation Error: ${response.error}`);
            } else {
                console.warn('BabbelSky: Unexpected response from background script.');
            }
        });
    }

    /**
    * Adds the translated text below the original post text.
    * @param {HTMLElement} translateButton - The "Translate" button element.
    * @param {string} translatedText - The translated text to display.
    */
    function addTranslatedText(translateButton, translatedText) {
        if (!translateButton) {
            console.warn('BabbelSky: "Translate" button not provided.');
            return;
        }

        // Traverse up the DOM to find the parent post element
        const postElement = translateButton.closest('[data-testid^="postThreadItem-by-"]');
        if (!postElement) {
            console.warn('BabbelSky: Could not locate the parent post element.');
            return;
        }

        // Extract the text element within the post
        const textElement = postElement.querySelector('[data-word-wrap="1"]');
        if (!textElement) {
            console.warn('BabbelSky: No text element found within the post.');
            return;
        }

        // Check if the translated text is already added to prevent duplicates
        if (postElement.querySelector('.babbelsky-translated-text')) {
            console.log('BabbelSky: Translated text already exists for this post.');
            return;
        }
   
          // Create a new paragraph element for the translated text
        const translatedTextElement = document.createElement('p');
        translatedTextElement.className = 'babbelsky-translated-text'; 

        // Set the translated text
        translatedTextElement.textContent = translatedText;

        // Insert the translated text element after the original text element
        textElement.parentNode.insertBefore(translatedTextElement, textElement.nextSibling);
   
       console.log('BabbelSky: Translated text added successfully.');
   }
    /**
     * Initializes the content script by attaching the click event listener to the "Translate" button.
     */
    function initialize() {
        const translateButton = getTranslateButton();

        if (translateButton) {
            // Attach event listener to the "Translate" button
            translateButton.addEventListener('click', handleTranslateButtonClick, true);
            console.log('BabbelSky: "Translate" button event listener attached.');
        } else {
            console.warn('BabbelSky: "Translate" button not found on initialization.');
        }
    }

    /**
     * Observes the DOM for changes to dynamically attach event listeners to the "Translate" button.
     */
    function observeTranslateButton() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        const translateButton = getTranslateButton();
                        if (translateButton && !translateButton.hasAttribute('data-babbelsky-listener')) {
                            // Mark the button to prevent duplicate listeners
                            translateButton.setAttribute('data-babbelsky-listener', 'true');
                            // Attach the event listener
                            translateButton.addEventListener('click', handleTranslateButtonClick, true);
                            console.log('BabbelSky: "Translate" button event listener attached via MutationObserver.');
                        }
                    }
                }
            }
        });

        // Start observing the document body for added nodes
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Initialize the script immediately if the DOM is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initialize();
    } else {
        // Initialize the script when the DOM is fully loaded
        document.addEventListener('DOMContentLoaded', initialize);
    }

    // Start observing for dynamically added "Translate" buttons
    observeTranslateButton();
})();
