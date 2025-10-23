# Walkie-Talkie Web App 📡

A real-time, browser-based walkie-talkie application for local Wi-Fi networks using WebRTC and Socket.io. Connect two users on the same Wi-Fi network for instant peer-to-peer voice communication with a push-to-talk interface.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Network Configuration](#network-configuration)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

---

## 📁 Project Structure

```
.
├── client/                 # React frontend application
│   ├── src/               # React components and hooks
│   ├── public/            # Static assets
│   └── package.json
├── server/                 # Node.js backend signaling server
│   ├── index.js           # Socket.io server
│   └── package.json
├── docs/                   # Detailed documentation
│   ├── README.md          # Full application guide
│   ├── WARP.md           # Architecture and development reference
│   └── PROJECT_DOCS.md   # Project overview
└── README.md             # This file
```

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for version control)
- **Modern Web Browser** with WebRTC support:
  - ✅ Chrome 70+
  - ✅ Firefox 65+
  - ✅ Safari 12+
  - ✅ Edge 79+
- **Microphone** - Permission required for audio transmission
- **Two devices on the same Wi-Fi network** (for testing)

### Verify Installation

```bash
node --version    # Should be v14+
npm --version     # Should be v6+
```

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/girijeshhs/WalkieTalkie---WebRTC.git
cd WalkieTalkie---WebRTC
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

## 🚀 Running the Application

The application requires **two terminal windows** - one for the server and one for the client.

### Step 1: Start the Server (Terminal 1)

```bash
cd server
npm start
```

**Expected output:**
```
Server running on port 3001
Listening for WebRTC signaling...
```

The server will start on `http://localhost:3001`

### Step 2: Start the Client (Terminal 2)

```bash
cd client
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view walkie-talkie-app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

The React app will automatically open at `http://localhost:3000`

### Step 3: Connect Two Devices

**Option A: Same Computer (Desktop Testing)**
1. Open `http://localhost:3000` in two different browser windows/tabs
2. Enter the same room ID in both windows (e.g., "room-123")
3. Click "Join Room" in both
4. Press and hold the **Push-to-Talk button** or **Spacebar** to transmit

**Option B: Different Devices (Network Testing)**
1. Find your server's IP address:
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows:
   ipconfig
   ```
   Look for something like `192.168.x.x` (not the 127.0.0.1)

2. On the first device, open: `http://localhost:3000`

3. On the second device, open: `http://192.168.x.x:3000` (replace with your actual IP)

4. Enter the same room ID on both devices and join

---

## 🎮 Using Push-to-Talk

### Controls

| Device | Action | Transmit |
|--------|--------|----------|
| **Desktop** | Hold button | Click & hold the blue button |
| **Desktop** | Keyboard | Press & hold **Spacebar** |
| **Mobile** | Touch | Tap & hold the button |

### Connection Status Indicators

- 🔴 **Disconnected** - Not connected to server
- 🟡 **Connecting** - Establishing connection
- 🔵 **Waiting** - In room, waiting for peer
- 🟢 **Connected** - Ready to communicate! 🎉

---

## 📱 Features

- 🎙️ **Real-time Voice Communication** - Low-latency peer-to-peer audio
- 📡 **Push-to-Talk Interface** - Hold button or press spacebar to transmit
- 🌐 **Local Wi-Fi Network Support** - Works on same network without external servers
- ✨ **Modern UI** - Clean, responsive design with Tailwind CSS
- 📊 **Connection Status** - Visual indicators for connection state
- 🔊 **Audio Optimization** - Echo cancellation and noise suppression
- 📍 **Room-Based System** - Maximum 2 users per room

---

## 🌐 Network Configuration

### Desktop Access (Same Computer)

Works out of the box! Simply open the client in two browser windows.

### Mobile/Network Access (HTTP Mode)

For testing on mobile devices or different machines on your network, you may need to enable HTTP access:

#### Option 1: Use HTTPS (Recommended for Production)

Deploy the application with HTTPS certificates for secure WebRTC.

#### Option 2: Chrome Flag for HTTP Testing (Desktop & Mobile Chrome)

Since your app uses HTTP on local network, you need to enable insecure origins:

**On Desktop Chrome:**
1. Open a new Chrome tab
2. Go to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Find the flag: **"Insecure origins treated as secure"**
4. Add your server: `http://192.168.1.5:3000` (replace with your actual IP)
   ```
   http://192.168.x.x:3000
   ```
5. Set it to **"Enabled"**
6. Click **"Relaunch"** to restart Chrome

**On Mobile Chrome:**
1. Open Chrome on your mobile device
2. Navigate to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Add the same IP: `http://192.168.x.x:3000`
4. Set to **"Enabled"** and restart

**On iOS Safari:**
- iOS doesn't have a flag option for this
- Use alternative: Install progressive web app or use HTTPS
- Chrome on iOS may have restrictions

#### Option 3: Use Firefox (More Permissive)

Firefox is generally more lenient with WebRTC over HTTP on local networks:
1. Open Firefox
2. Navigate to `http://192.168.x.x:3000`
3. Grant microphone permission
4. Should work without additional configuration

---

## 🔧 Troubleshooting

### ❌ Connection Issues

**"Cannot connect to server"**
- ✅ Ensure server is running: `cd server && npm start`
- ✅ Check if both devices are on the same Wi-Fi network
- ✅ Verify firewall isn't blocking ports 3000/3001
- ✅ Use IP address instead of localhost from other devices

**"Device not accessible"**
- ✅ Find correct IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
- ✅ Verify you're using `http://` not `https://` for local IP
- ✅ Check if IP is in correct subnet (192.168.x.x, 10.x.x.x, etc.)

### 🎙️ Microphone Issues

**"Microphone access denied"**
- ✅ Check browser permissions (Settings → Privacy → Microphone)
- ✅ Grant microphone access when prompted
- ✅ On iOS: Requires user gesture before accessing mediaDevices
- ✅ Try with headphones to rule out audio feedback

**"No audio detected"**
- ✅ Test microphone in system settings first
- ✅ Ensure microphone is not already in use by another app
- ✅ Check browser console for WebRTC errors
- ✅ Try reloading the page and granting permissions again

### 📡 WebRTC Connection Issues

**"Stuck on Connecting"**
- ✅ Check browser console (F12) for ICE candidate errors
- ✅ Some guest Wi-Fi networks block P2P connections
- ✅ Firewall may block WebRTC ports
- ✅ Try different browser to isolate issue

**"Room is full" error**
- ✅ By design: Maximum 2 users per room
- ✅ User must leave room before joining another
- ✅ Refresh page if stuck

### 🔊 Audio Issues

**Echo or feedback**
- ✅ Use headphones on both devices
- ✅ Verify echo cancellation is enabled
- ✅ Move devices away from speakers
- ✅ Check for audio input/output routing issues

**Very quiet audio**
- ✅ Check microphone input level in system settings
- ✅ Verify speaker/headphone volume levels
- ✅ Try different browser or device

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Tailwind CSS, Socket.io-client |
| **Backend** | Node.js, Express, Socket.io |
| **Communication** | WebRTC, Web Audio API |
| **Styling** | Tailwind CSS, PostCSS |

---

## 📚 Documentation

For in-depth information, see:

- **[Full README](./docs/README.md)** - Complete feature documentation with browser compatibility
- **[WARP Guide](./docs/WARP.md)** - Architecture reference, WebRTC patterns, and development guide
- **[Project Documentation](./docs/PROJECT_DOCS.md)** - Project overview and team information

---

## 🚀 Development

### Run with Hot Reload

**Server (with nodemon):**
```bash
cd server
npm run dev
```

**Client (with React hot reload):**
```bash
cd client
npm start
```

### Build for Production

```bash
cd client
npm run build
```

Output will be in `client/build/` directory.

---

## 🔒 Security Notes

- ✅ **Local Network Only** - Designed for private Wi-Fi networks
- ⚠️ **No Authentication** - Add for production use
- ⚠️ **Room IDs** - Should be unique and hard to guess
- 🔐 **HTTPS Recommended** - For production deployment

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🎙️ Getting Help

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Review [WARP Guide](./docs/WARP.md) for architecture details
3. Check browser console (F12) for detailed error messages
4. Ensure all prerequisites are installed
5. Test with different browsers to isolate issues

---

**Happy talking! 📡✨**
