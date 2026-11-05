# 🚀 Netlify Deployment Guide - Chrome Extension Downloader

Yeh tool ready-to-deploy banaya gaya hai. Isme frontend (Glassmorphism Dark UI) aur backend (Netlify Serverless Function) dono integrated hain.

---

## 📁 Project Structure

```text
e:\SortLens\
├── public\
│   ├── index.html        # Modern frontend UI
│   ├── style.css         # Responsive Dark theme & animations
│   └── app.js            # URL parsing & download handling
├── netlify\
│   └── functions\
│       └── download.mjs  # Serverless function (CRX3 to ZIP converter)
├── netlify.toml          # Netlify routing & build config
├── package.json          # Node ES Module configuration
└── NETLIFY_DEPLOY_GUIDE.md
```

---

## 🛠️ Netlify par Host Karne ke 3 Asaan Tarike

### 🌟 Tarika 1: GitHub se Connect Karke (Sabse Best & Recommended)
1. Apne code ko GitHub par push karein:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Chrome Extension Downloader"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. [Netlify.com](https://app.netlify.com/) par login karein.
3. **"Add new site"** > **"Import an existing project"** > **"GitHub"** select karein.
4. Apni repository select karein.
5. Netlify automatic settings detect kar lega:
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
6. Click karein **"Deploy Site"**. 
   - 30 seconds me aapki live link mil jayegi (e.g. `https://your-app.netlify.app`)!

---

### ⚡ Tarika 2: Netlify CLI se (Terminal se Direct Deploy)
Agar aap bina GitHub ke direct local folder se deploy karna chahte hain:

```bash
# Terminal me e:\SortLens folder me jayein
npx netlify deploy --prod
```
- First time login karne bolega, browser me login verify karein.
- Prompt aane par "Create & configure a new site" choose karein.
- Publish directory: `public` enter karein.
- Done! Terminal me live URL mil jayega.

---

### 💻 Tarika 3: Local PC par Test Karna (Development Mode)
Agar aap Netlify par deploy karne se pehle apne laptop par test karna chahte hain:

```bash
# Terminal me run karein:
npx netlify dev
```
- Yeh automatically `http://localhost:8888` par serverless function ke saath live server start kar dega.

---

## 🔍 Kaise Kaam Karta Hai?

1. User koi bhi **Chrome Web Store link** (e.g., SortLens, uBlock, etc.) ya **32-character ID** input karta hai.
2. Frontend regex se 32-character extension ID (`[a-p]{32}`) nikalta hai.
3. `/api/download?id=...&format=zip` call hoti hai.
4. Netlify Serverless Function Google ke official update server se `.crx` fetch karta hai.
5. CRX3 ka binary header strip karke pure standard `.zip` format me convert karta hai.
6. User ke browser me direct `.zip` file download start ho jati hai.

