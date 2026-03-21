# 🥗 VegCheck

A self-contained web app that uses Anthropic Claude Vision to instantly determine if a dish is vegetarian. Point your phone camera at any food, tap capture, and get a verdict in seconds.

---

## How it works

1. Open the app on your iPhone via the GitHub Pages URL
2. Tap **Scan food** — camera opens
3. Point at a dish and tap the shutter button
4. Claude Vision analyses the image
5. You get one of three verdicts:
   - ✅ **Vegetarian**
   - ❌ **Not vegetarian**
   - ⚠️ **Uncertain** — tap the pulsing logo for guidance

---

## Folder structure

```
vegcheck/
├── index.html          ← structure only
├── css/
│   └── styles.css      ← all styling
├── js/
│   ├── config.js       ← API key + constants
│   ├── camera.js       ← camera logic
│   ├── api.js          ← Anthropic API call
│   ├── ui.js           ← screens + results
│   └── app.js          ← orchestrator
├── assets/
│   └── logo.svg        ← V lettermark logo
├── README.md
└── .gitignore
```

---

## Setup

### 1. Add your Anthropic API key

Open `js/config.js` and replace the placeholder:

```javascript
API_KEY: 'YOUR_ANTHROPIC_API_KEY_HERE',
```

With your real key:

```javascript
API_KEY: 'sk-ant-xxxxxxxxxxxxxxxxxx',
```


### 2. Open on iPhone

Open the URL in Safari on iPhone. Allow camera access when prompted.

---

## Run locally (for development)

```bash
cd vegcheck
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser. Note: camera will not work on localhost over http 
---

## ⚠️ Security

This is a demo prototype. The API key is hardcoded in `js/config.js`.

- Will try to keep this repo **private** if possible
- **Will Revoke the API key** in Anthropic console immediately after the demo at [console.anthropic.com](https://console.anthropic.com)

---

## Tech stack

- Pure HTML / CSS / JavaScript — no frameworks
- Anthropic Claude Vision API (`claude-opus-4-6`)
- GitHub Pages for hosting (HTTPS required for camera on iPhone)

---

_built with ♥ · VM_
