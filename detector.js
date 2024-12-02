/**
 * @fileoverview Detector script for BabbelSky extension.
 * Checks for the presence of the translation button on Bluesky posts.
 */

(function () {
  
    /**
     * Checks for the translation button and sends a message to the background script if found.
     */
    function checkForTranslationButton() {

  
      // Use the selector based on aria-label
      const translationButton = document.querySelector('a[aria-label="Translate"]');
  
      if (translationButton) {

  
        // Disconnect the observer to stop observing changes
        observer.disconnect();
  
        // Send a message to the background script to inject the content script
        chrome.runtime.sendMessage({ action: 'injectContentScript' }, () => {
          if (chrome.runtime.lastError) {
            console.error('BabbelSky: Error sending message to background.js:', chrome.runtime.lastError);
          }
        });
      } 
    }
  
    // Create a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(checkForTranslationButton);
  
    // Start observing the document body for added nodes and subtree modifications
    observer.observe(document.body, { childList: true, subtree: true });
  
    // Perform an initial check in case the translation button is already present
    checkForTranslationButton();
  })();
  