(function () {
    console.log('BabbelSky: contentScript.js loaded and executing.');

    const translationButtonLabels = ['Translate', 'Traducir', 'Traduire']; // Add more as needed

    function getTranslateButton() {
        for (const label of translationButtonLabels) {
            const buttons = document.querySelectorAll(`a[aria-label="${label}"]`);
            for (const button of buttons) {
                return button;
            }
        }
        return null;
    }

    function extractPostText(translateButton) {
        if (!translateButton) {
            console.warn('BabbelSky: "Translate" button not found.');
            return null;
        }

        const postElement = translateButton.closest('[data-testid^="postThreadItem-by-"]');
        if (!postElement) {
            console.warn('BabbelSky: Could not locate the parent post element.');
            return null;
        }

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

    function handleTranslateButtonClick(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        const translateButton = event.currentTarget;
        const postText = extractPostText(translateButton);

        if (!postText) {
            console.warn('BabbelSky: No post text found to translate.');
            return;
        }

        chrome.runtime.sendMessage({ action: 'translatePost', post: postText }, (response) => {
            if (response && response.translatedPost) {
                console.log('BabbelSky: Translated Post:', response.translatedPost);
                addTranslatedText(translateButton, response.translatedPost);
            } else if (response && response.error) {
                console.error('BabbelSky: Translation Error:', response.error);
                alert(`BabbelSky Translation Error: ${response.error}`);
            } else {
                console.warn('BabbelSky: Unexpected response from background script.');
            }
        });
    }

    function addTranslatedText(translateButton, translatedText) {
        if (!translateButton) {
            console.warn('BabbelSky: "Translate" button not provided.');
            return;
        }

        const postElement = translateButton.closest('[data-testid^="postThreadItem-by-"]');
        if (!postElement) {
            console.warn('BabbelSky: Could not locate the parent post element.');
            return;
        }

        const textElement = postElement.querySelector('[data-word-wrap="1"]');
        if (!textElement) {
            console.warn('BabbelSky: No text element found within the post.');
            return;
        }

        if (postElement.querySelector('.babbelsky-translated-text')) {
            console.log('BabbelSky: Translated text already exists for this post.');
            return;
        }

        const translatedTextElement = document.createElement('p');
        translatedTextElement.className = 'babbelsky-translated-text';
        translatedTextElement.textContent = translatedText;
        textElement.parentNode.insertBefore(translatedTextElement, textElement.nextSibling);

        console.log('BabbelSky: Translated text added successfully.');
    }

    function initialize() {
        const translateButton = getTranslateButton();

        if (translateButton) {
            translateButton.addEventListener('click', handleTranslateButtonClick, true);
            console.log('BabbelSky: "Translate" button event listener attached.');
        } else {
            console.warn('BabbelSky: "Translate" button not found on initialization.');
        }
    }

    function observeTranslateButton() {
        const observer = new MutationObserver((mutations) => {
            console.log('BabbelSky: MutationObserver detected changes.');
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        console.log('BabbelSky: New element added:', node);
                        const translateButton = getTranslateButton();
                        if (translateButton && !translateButton.hasAttribute('data-babbelsky-listener')) {
                            translateButton.setAttribute('data-babbelsky-listener', 'true');
                            translateButton.addEventListener('click', handleTranslateButtonClick, true);
                            console.log('BabbelSky: "Translate" button event listener attached via MutationObserver.');
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initialize();
    } else {
        document.addEventListener('DOMContentLoaded', initialize);
    }

    observeTranslateButton();
})();