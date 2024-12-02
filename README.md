# BabbelSky

BabbelSky is a Firefox extension that enhances your experience on [Bluesky Social](https://bsky.app/) by providing seamless translation of posts using your choice of translation services.

**Note:** BabbelSky is currently in **Beta**. We're actively working on improvements and welcome any feedback or contributions.

---

## Table of Contents

- [Features](#features)
- [Beta Status](#beta-status)
- [Installation](#installation)
  - [Loading the Extension in Firefox](#loading-the-extension-in-firefox)
- [Setup](#setup)
  - [Obtaining API Keys](#obtaining-api-keys)
  - [Configuring BabbelSky](#configuring-babbelsky)
- [Known Bugs](#known-bugs)
- [Future Plans](#future-plans)
- [Contributing](#contributing)


---

## Features

- **Inline Translation:** Translate Bluesky posts directly within your feed without leaving the page.
- **Multiple Translation Services:** Choose between OpenAI's GPT or Google Translate APIs based on your preference.
- **Customizable Settings:** Set your target language and customize prompts for translation services.
- **Secure Storage:** API keys are encrypted and stored securely using AES-GCM encryption.
- **User-Friendly Interface:** Simple and intuitive options page for easy configuration.

---

## Beta Status

BabbelSky is in the **Beta** phase of development. This means:

- Features are still being tested and may change.
- There may be bugs or unexpected behavior.
- Your feedback is valuable in improving BabbelSky.

We appreciate your understanding and encourage you to report any issues or suggestions.

---

## Installation

### Loading the Extension in Firefox

Since BabbelSky is still in Beta, it is not yet available in the Firefox Add-ons Marketplace. You can load it manually using the following steps:

1. **Download the BabbelSky Repository:**
   - Clone this repository or download it as a ZIP file and extract it to a convenient location on your computer.

2. **Open Firefox and Navigate to the Debugging Page:**
   - Enter `about:debugging` in the Firefox address bar and press **Enter**.

3. **Load the Temporary Add-on:**
   - Click on **"This Firefox"** in the left sidebar.
   - Click on **"Load Temporary Add-on..."**.
   - In the file dialog, navigate to the directory where you saved BabbelSky.
   - Select the `manifest.json` file and click **Open**.

4. **Verify Extension Installation:**
   - BabbelSky should now appear in the list of installed extensions.
   - You can access BabbelSky's options page by clicking on the extension icon in the toolbar and selecting **"Options"**, or by navigating to `about:addons` and finding BabbelSky in the list.

**Note:** Loading the extension this way is temporary. The extension will be removed when you close Firefox. You'll need to reload it each time you restart the browser until BabbelSky is officially published.

---

## Setup

To use BabbelSky, you'll need to provide API keys for the translation services you wish to use.

### Obtaining API Keys

#### OpenAI API Key

This is a PAID service. Each translation will use some tokens depending on the size of the translation.
The quality of the translation (I find) is of a better quality than Google Translate

1. **Sign Up or Log In to OpenAI:**
   - Visit the [OpenAI website](https://platform.openai.com/) and sign up for an account or log in.

2. **Navigate to API Keys:**
   - Once logged in, click on your profile icon in the top-right corner and select **"View API Keys"**.

3. **Create a New API Key:**
   - Click on **"Create new secret key"**.
   - Copy the generated API key. **You won't be able to view it again**, so make sure to copy it now.

#### Google Translate API Key

This is a free service for the first 500,000 characters every month.

1. **Set Up a Google Cloud Project:**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/) and sign in.
   - Create a new project or select an existing one.

2. **Enable the Cloud Translation API:**
   - In the dashboard, click on **"APIs & Services"** > **"Library"**.
   - Search for **"Cloud Translation API"** and click on it.
   - Click **"Enable"** to activate the API for your project.

3. **Create Credentials:**
   - Navigate to **"APIs & Services"** > **"Credentials"**.
   - Click on **"Create credentials"** and select **"API key"**. (Recommend you restrict this key to the Translation API)
   - Copy the generated API key.

### Configuring BabbelSky

1. **Open BabbelSky Options:**
   - Click on the BabbelSky extension icon in the Firefox toolbar and select **"Options"**.
   - Alternatively, navigate to `about:addons`, find BabbelSky, and click on **"Preferences"**.

2. **Enter Your API Keys:**
   - In the options page, you'll see fields for **OpenAI API Key** and **Google Translate API Key**.
   - Paste your API keys into the respective fields.

3. **Select Your Translation Service:**
   - Choose your preferred translation service by checking the box for **OpenAI** or **Google Translate**.
   - Note that you must provide the corresponding API key for the service you select.

4. **Set Your Target Language:**
   - Select your desired target language from the dropdown menu. This is the language into which posts will be translated.

5. **Customize OpenAI Prompt (Optional):**
   - If using OpenAI, you can customize the translation prompt or leave it as the default.

6. **Save Your Settings:**
   - Click on the **"Save"** button to securely save your settings.
   - A message will confirm that your settings have been saved.

**Security Note:** Your API keys are encrypted using AES-GCM encryption and stored securely in the browser's storage.

---

## Known Bugs
  - No way to hide translations

---

## Future Plans

- **Official Release:** Once BabbelSky is stable, it will be published on the Firefox Add-ons Marketplace for easier installation.
- **Cross-Browser Support:** Plans to make BabbelSky available on other browsers like Chrome and Edge.

---

## Contributing

Contributions are welcome! If you'd like to help improve BabbelSky:

- **Report Bugs:** Use the [Issues](https://github.com/yourusername/BabbelSky/issues) tab to report any bugs or suggest enhancements.
- **Submit Pull Requests:** If you have code improvements, feel free to submit a pull request.
- **Feedback:** Share your thoughts and experiences to help us make BabbelSky better here [Issues](https://github.com/yourusername/BabbelSky/issues) .

---

## Acknowledgments

- **OpenAI:** For providing powerful language models that make advanced translations possible.
- **Google Cloud:** For offering robust translation APIs.
- **Mozilla Firefox:** For supporting developer-friendly extension development.

---

**Disclaimer:** BabbelSky is an independent project and is not affiliated with or endorsed by Bluesky Social, OpenAI, or Google.

---

*Thank you for using BabbelSky! We hope it enhances your Bluesky experience by bridging language gaps and fostering global connections.*
