// contentScript.js

/**
 * @fileoverview
 * Content script for BabbelSky extension.
 * Overrides the default behavior of the translation button on Bluesky posts.
 * Extracts the text from the active main post and sends it for translation.
 */
(function () {

    /**
     * Labels used to identify the translation button in different languages.
     * Extend this array if Bluesky supports more languages.
     * @type {string[]}
     */
    const translationButtonLabels = [
        'Translate',
        'Traducir', 
        'Tradueix',
        'Übersetzen',
        'Käännä', 
        'Traduire',
        'Aistrigh',
        'अनुवाद करें',
        'Lefordítás',
        'Terjemahkan',
        'Traduci',
        '翻訳',
        '번역',
        'Vertalen',
        'Przetłumacz',
        'Traduzir',
        'Перевести',
        'Çevir',
        'Перекласти',
        'Dịch',
        '翻译',
        '翻譯',
        '翻譯',
        ]; // Add more as needed

    /**
     * Selects the "Translate" button based on predefined labels.
     * @returns {HTMLElement|null} - The "Translate" button element or null if not found.
     */
    function getTranslateButton() {
        for (const label of translationButtonLabels) {
            const button = document.querySelector(`a[aria-label="${label}"]`);
            if (button) {
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
        const existingTranslation = postElement.querySelector(`.babbelsky-translated-text[data-original="${translateButton.dataset.original}"]`);
        if (existingTranslation) {
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
   
   }
    /**
     * Initializes the content script by attaching the click event listener to the "Translate" button.
     */
    function initialize() {
        const translateButton = getTranslateButton();

        if (translateButton) {
            // Attach event listener to the "Translate" button
            translateButton.addEventListener('click', handleTranslateButtonClick, true);

            // Mark the button to prevent duplicate listeners
            translateButton.setAttribute('data-babbelsky-listener', 'true');

        } else {
            console.warn('BabbelSky: "Translate" button not found on initialization.');
        }
    }

    /**
    * Observes the DOM for changes to dynamically attach event listeners to the "Translate" button.
    */

    function observeTranslationButton() {
        // Create a MutationObserver to watch for changes in the DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        let translateButton = null;
    
                        // Check if the node or its descendants match any of the translation button labels
                        for (const label of translationButtonLabels) {
                            translateButton = node.querySelector(`a[aria-label="${label}"]`) || 
                                              (node.matches(`a[aria-label="${label}"]`) ? node : null);
                            if (translateButton) break; // Exit loop if a matching button is found
                        }
    
                        if (translateButton && !translateButton.hasAttribute('data-babbelsky-listener')) {
                            // Mark the button to prevent duplicate listeners
                            translateButton.setAttribute('data-babbelsky-listener', 'true');
                            // Attach the event listener
                            translateButton.addEventListener('click', handleTranslateButtonClick, true);
                        }
                    }
                });
            });
        });
    
        // Start observing the document body for added nodes and subtree modifications
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
    observeTranslationButton();
})();
