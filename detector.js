/**
 * @fileoverview Detector script for BabbelSky extension.
 * Checks for the presence of the translation button on Bluesky posts.
 */

(function () {
    console.log('BabbelSky: detector.js loaded');
  
    /**
     * Checks for the translation button and sends a message to the background script if found.
     */
    function checkForTranslationButton() {
        console.log('BabbelSky: Checking for translation button');
  
        // Use the selector based on aria-label
        const translationButton = document.querySelector('a[aria-label="Translate"]');
  
        if (translationButton) {
            console.log('BabbelSky: Translation button found:', translationButton);
  
            // Disconnect the observer to stop observing changes
            observer.disconnect();
            console.log('BabbelSky: MutationObserver disconnected');
  
            // Send a message to the background script to inject the content script
            chrome.runtime.sendMessage({ action: 'injectContentScript' }, () => {
                if (chrome.runtime.lastError) {
                    console.error('BabbelSky: Error sending message to background.js:', chrome.runtime.lastError);
                } else {
                    console.log('BabbelSky: Message sent to background.js to inject contentScript.js');
                }
            });
        } else {
            console.log('BabbelSky: Translation button not found');
        }
    }
  
    // Create a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver((mutations) => {
        console.log('BabbelSky: MutationObserver detected mutations:', mutations);
        mutations.forEach(mutation => {
            console.log('BabbelSky: Mutation type:', mutation.type);
            console.log('BabbelSky: Added nodes:', mutation.addedNodes);
            console.log('BabbelSky: Removed nodes:', mutation.removedNodes);
        });
        checkForTranslationButton();
    });
  
    // Start observing the document body for added nodes and subtree modifications
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('BabbelSky: MutationObserver started observing document body');
  
    // Perform an initial check in case the translation button is already present
    checkForTranslationButton();
})();
  