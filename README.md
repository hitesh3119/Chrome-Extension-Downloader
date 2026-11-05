# 🚀 Chrome Extension Downloader

A modern web application and serverless tool to download and unpack any Google Chrome extension directly as an unpacked **`.ZIP`** or original **`.CRX`** archive from the Chrome Web Store.

Ready to deploy on **Netlify** with zero backend server maintenance.

---

## ✨ Features

- **Direct ZIP Extraction:** Strips the CRX3/CRX2 binary protocol buffer header on the fly and streams a standard `.zip` archive ready for `chrome://extensions` (Developer Mode > Load unpacked).
- **CRX Package Download:** Option to download the raw `.crx` binary package.
- **Auto-Detection:** Automatically extracts 32-character extension IDs from modern Chrome Web Store URLs (`https://chromewebstore.google.com/detail/...`) or legacy URLs.
- **Serverless & Fast:** Powered by Netlify Functions v2 (Node 18+) with standard streaming response.
- **Safe Browser Downloads:** Fixed 0-byte download bug caused by premature `URL.revokeObjectURL` timing in Chromium browsers.
- **Modern Dark UI:** Glassmorphism design with responsive controls and step-by-step Chrome installation guide.

---

## 🛠️ Project Structure

```text
├── public/
│   ├── index.html        # Modern frontend UI
│   ├── style.css         # Responsive Dark theme & animations
│   └── app.js            # URL parsing & download handling
├── netlify/
│   └── functions/
│       └── download.mjs  # Serverless CRX3 to ZIP converter
├── netlify.toml          # Netlify build & redirect routing
├── package.json          # Node ES Module configuration
├── .gitignore            # Git ignore rules
└── README.md
```

---

## 🚀 Deployment to Netlify

### Option 1: Via GitHub (Recommended)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/hitesh3119/Chrome-Extension-Downloader.git
   git push -u origin main
   ```
2. Go to [Netlify](https://app.netlify.com/) and click **Add new site > Import an existing project > GitHub**.
3. Select this repository (`Chrome-Extension-Downloader`).
4. Netlify will automatically detect:
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
5. Click **Deploy**. Your site will be live within seconds!

### Option 2: Local Development
To test locally before deploying:
```bash
npm install -g netlify-cli
netlify dev
```
Open [http://localhost:8888](http://localhost:8888) in your browser.

---

## 💻 How to Load Unpacked Extensions in Chrome

1. Download the extension using the **Download as ZIP (Unpacked)** button.
2. Extract the downloaded `.zip` file into a dedicated folder on your computer.
3. Open Google Chrome and navigate to:
   ```text
   chrome://extensions/
   ```
4. Enable **Developer mode** using the toggle switch in the top right corner.
5. Click **Load unpacked** in the top left and select your extracted folder.

---

## 📄 License

MIT License. Free for personal and commercial use.
