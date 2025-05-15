# PokerFusion

A real-time, cross-platform Texas Hold ’em poker game built with React (Web), React Native (Mobile), and a Python backend. Players can create a game in their browser, share a game code, and join from mobile devices.

---

## Table of Contents

1. [Features](#-features)
2. [Prerequisites](#-prerequisites)
3. [Project Structure](#-project-structure)
4. [Configuration](#-configuration)
5. [Installation & Running](#-installation--running)
   * [Environment Variables](#-environment-variables)
   * [Backend](#backend)
   * [Web Client](#web-client)
   * [Mobile Client](#mobile-client)
6. [How to Play](#-how-to-play)
7. [Troubleshooting](#-troubleshooting)
8. [Contributing](#-contributing)
9. [License](#-license)

---

## Features

* **Real-time gameplay** via WebSockets
* **Cross-platform** support: Web browser & mobile app
* **Room management**: host creates games, others join via code
* **Easy configuration** using ngrok for local development

---

## Prerequisites

* **Node.js** ≥ 18 & **npm** (for Web & Mobile clients)
* **Python** ≥ 3.12 (for Backend)
* **Expo CLI** (for Mobile)
* **ngrok** (to expose your local backend server)

---

## Project Structure

```
/
├── backend/         # Python API & WebSocket server
├── web/             # React web client
├── mobile/          # React Native (Expo) mobile client
└── README.md        # Project documentation
```

---

## Configuration

1. **Expose your backend**
   Run ngrok to make your local server accessible:

   ```bash
   ngrok http --url=https://NGROK_URL_HERE 4000
   ```

   Copy the generated HTTPS URL (e.g., `https://abcd1234.ngrok.io`).

2. **Mobile client `config.json`**
   In `mobile/PokerFusion/`, create or update `config.json`:

   ```jsonc
   {
     "server": {
       "endpoint": "https://YOUR_NGROK_URL"
     }
   }
   ```

   Replace `YOUR_NGROK_URL` with the URL from ngrok.

---

## Installation & Running
---
## Environment Variables

Before running the backend server, create a `.env` in `backend/`:

```env
DB_USER=your_database_username
DB_PASS=your_database_password
DB_NAME=your_database_name
DB_DATABASE=your_database_schema_or_database
DB_HOST=your_database_host
```

---
### Backend

```bash
cd backend
# (Optional) Create & activate a Python virtual environment
pip install -r requirements.txt
python app.py
```

* The server will start on `http://localhost:4000`.

### Web Client

```bash
cd web
npm install
npm run dev
```

* Open your browser to: `http://localhost:5173`

### Mobile Client

```bash
cd mobile/PokerFusion
npm install
npx expo start
```

1. Install **Expo Go** from the App Store or Play Store.
2. Scan the QR code in your terminal (press **c** if it’s not visible).
3. Open the link in Expo Go to launch the app.

---

## How to Play

1. **Host (Web)**

   * Open the Web client and click **Create Game**.
   * Copy or share the 6‑digit game code displayed.

2. **Join (Mobile)**

   * Open the Mobile app in Expo Go.
   * Enter the game code and tap **Join Game**.

3. **Gameplay**

   * Host controls blinds, deals cards; all players see community cards in real time.
   * Use the on‑screen buttons to **Check**, **Bet**, **Call**, **Raise**, or **Fold**.
   * Chat and game state updates are synchronized across devices.

> **Tip:** Ensure ngrok is running and the `config.json` endpoint matches your ngrok URL.

---

## Troubleshooting

* **Mobile can’t connect?**

  * Verify `config.json` endpoint is correct (including `https://`).
  * Confirm ngrok is running on port **4000**.

* **QR code missing?**

  * In the Expo terminal, press **c** to toggle the QR display.

* **Python errors on startup?**

  * Ensure your virtual environment is active and dependencies are installed.

---

## License
Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## Sources
Card images from: http://code.google.com/p/vector-playing-cards/