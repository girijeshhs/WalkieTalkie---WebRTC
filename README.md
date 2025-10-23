# Walkie-Talkie Web App 📡

A real-time, browser-based walkie-talkie application for local Wi-Fi networks using WebRTC and Socket.io.

## Project Structure

```
.
├── client/                 # React frontend application
├── server/                 # Node.js backend server
├── docs/                   # Documentation
│   ├── README.md          # Full application guide
│   ├── WARP.md           # Architecture and development reference
│   └── PROJECT_DOCS.md   # Project overview
└── README.md             # This file
```

## Quick Start

### Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### Run the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm start
```

**Terminal 2 - Start Client:**
```bash
cd client
npm start
```

Then open `http://localhost:3000` on two devices to test.

## Features

- 🎙️ Real-time voice communication via WebRTC
- 📱 Push-to-talk interface (button or spacebar)
- 🌐 Local Wi-Fi network support
- ✨ Modern UI with Tailwind CSS
- 🔗 Room-based connection system

## Documentation

For detailed information, see:
- [Full README](./docs/README.md) - Complete feature documentation
- [WARP Guide](./docs/WARP.md) - Architecture and development reference
- [Project Documentation](./docs/PROJECT_DOCS.md) - Project overview

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Communication**: WebRTC, Web Audio API

## Browser Support

✅ Chrome 70+, Firefox 65+, Safari 12+, Edge 79+

## License

MIT License
