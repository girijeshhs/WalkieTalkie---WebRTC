# Local Walkie-Talkie Web App 📡

A real-time, browser-based walkie-talkie application that allows two users on the same Wi-Fi network to communicate via push-to-talk voice transmission. Built with React, Node.js, Socket.io, and WebRTC.

## Features ✨

- **Real-time Voice Communication**: Low-latency audio streaming using WebRTC
- **Push-to-Talk Interface**: Hold button or press spacebar to transmit
- **Room-based Connection**: Join rooms using unique IDs
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Visual Indicators**: Real-time connection status and transmission indicators
- **Audio Optimization**: Echo cancellation and noise suppression
- **Local Network**: Works on same Wi-Fi network without external servers

## Tech Stack 🛠️

- **Frontend**: React 18, Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **WebRTC**: For peer-to-peer audio streaming
- **Audio**: Web Audio API with echo cancellation

## Prerequisites 📋

- Node.js (v14 or higher)
- npm or yarn
- Two devices on the same Wi-Fi network
- Modern web browser with WebRTC support
- Microphone access permission

## Installation 🚀

### 1. Clone or Download the Project

```bash
cd walkie-talkie-app
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

## Running the Application 🏃‍♂️

### Start the Server (Terminal 1)

```bash
cd server
npm start
```

The signaling server will start on `http://localhost:3001`

### Start the Client (Terminal 2)

```bash
cd client
npm start
```

The React app will open at `http://localhost:3000`

## How to Use 📱

### Connect Two Devices

1. **Start the Server**: Run the server on one device (can be either device)
2. **Open the App**: Open `http://[SERVER-IP]:3000` on both devices
   - To find server IP: On Mac/Linux run `ifconfig`, on Windows run `ipconfig`
3. **Enter Room ID**: Both users enter the same room ID (e.g., "room-123")
4. **Join Room**: Click "Join" button on both devices
5. **Allow Microphone**: Grant microphone permission when prompted

### Push-to-Talk Usage

- **Desktop**: Hold the button or press and hold the Spacebar
- **Mobile**: Touch and hold the Push-to-Talk button
- **Release** to stop transmitting and listen to the other user

### Connection Status

- 🔴 **Disconnected**: Not connected to server
- 🟡 **Connecting**: Establishing connection
- 🔵 **Waiting**: In room, waiting for peer
- 🟢 **Connected**: Ready to communicate

## Project Structure 📁

```
walkie-talkie-app/
├── server/
│   ├── index.js           # Socket.io signaling server
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PushToTalkButton.js  # PTT button with visual states
│   │   │   ├── Room.js              # Room management UI
│   │   │   └── ConnectionStatus.js  # Connection status indicator
│   │   ├── hooks/
│   │   │   └── useWalkieTalkie.js   # Custom hook for WebRTC/Socket logic
│   │   ├── utils/
│   │   │   └── WebRTCManager.js     # WebRTC connection management
│   │   ├── App.js                   # Main app component
│   │   └── index.js
│   ├── public/
│   └── package.json
└── README.md
```

## Key Features Explained 🔑

### WebRTC Implementation
- Direct peer-to-peer audio streaming
- STUN servers for NAT traversal
- Automatic ICE candidate exchange

### Socket.io Signaling
- Room management (max 2 users)
- SDP offer/answer exchange
- Real-time connection state updates

### Audio Processing
- Echo cancellation enabled
- Noise suppression active
- Auto gain control
- 48kHz sample rate

### Push-to-Talk
- Mouse/touch event handling
- Keyboard support (Spacebar)
- Visual feedback during transmission
- Automatic release on focus loss

## Troubleshooting 🔧

### Connection Issues
- Ensure both devices are on the same Wi-Fi network
- Check firewall settings
- Verify server is running and accessible
- Try using IP address instead of localhost

### Audio Problems
- Grant microphone permissions
- Check browser compatibility (Chrome/Firefox recommended)
- Ensure no other apps are using the microphone
- Test with headphones to avoid feedback

### Room Full Error
- Maximum 2 users per room
- Leave room before joining a new one
- Use different room IDs for multiple pairs

## Development 💻

### Run in Development Mode

Server with hot reload:
```bash
cd server
npm run dev
```

Client with hot reload:
```bash
cd client
npm start
```

### Build for Production

```bash
cd client
npm run build
```

## Browser Compatibility 🌐

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+
- ⚠️ Mobile browsers may have limited support

## Security Notes 🔒

- Application designed for local network use only
- No authentication implemented (add for production)
- Room IDs should be unique and hard to guess
- HTTPS recommended for production deployment

## Future Enhancements 🚀

- [ ] Voice Activity Detection (VAD)
- [ ] Multiple participants support
- [ ] Audio recording capability
- [ ] Text messaging alongside voice
- [ ] Room persistence
- [ ] Audio quality settings
- [ ] Connection quality indicators

## License 📄

MIT License - Feel free to use and modify!

## Support 💬

For issues or questions:
1. Check the troubleshooting section
2. Ensure all dependencies are installed
3. Verify network connectivity
4. Test with different browsers

---

**Enjoy your local walkie-talkie experience! 🎙️**

# Option 2: Add Chrome Flag to Allow Insecure Origins (For Both Desktop & Mobile)
# On Desktop:
# Open a new Chrome tab and go to: chrome://flags/#unsafely-treat-insecure-origin-as-secure
# Find the flag "Insecure origins treated as secure"
# Add: http://192.168.1.5:3000
# Set it to "Enabled"
# Click "Relaunch" to restart Chrome