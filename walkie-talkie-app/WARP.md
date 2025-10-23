# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Real-time browser-based walkie-talkie application for local Wi-Fi networks. Uses WebRTC for peer-to-peer audio streaming and Socket.io for signaling. Monorepo with separate client (React) and server (Node.js) applications.

## Commands

### Server Commands
```bash
cd server
npm install          # Install dependencies
npm start            # Start production server (port 3001)
npm run dev          # Start with nodemon hot-reload
```

### Client Commands
```bash
cd client
npm install          # Install dependencies
npm start            # Start dev server (port 3000)
npm run build        # Build for production
npm test             # Run tests
```

### Full Application Setup
Terminal 1:
```bash
cd server && npm start
```

Terminal 2:
```bash
cd client && npm start
```

Access at `http://localhost:3000` or `http://[LOCAL-IP]:3000` for network devices.

## Architecture

### Core Communication Flow
1. **Socket.io Signaling Layer** (`server/index.js`): Manages room state, peer discovery, and WebRTC signaling (SDP offer/answer, ICE candidates)
2. **WebRTC P2P Layer** (`client/src/utils/WebRTCManager.js`): Handles direct audio streaming between peers after connection established
3. **State Management** (`client/src/hooks/useWalkieTalkie.js`): Custom React hook orchestrating Socket.io + WebRTC lifecycle

### Key Architectural Patterns

**Room-Based Connection Model**
- Max 2 participants per room
- Server tracks rooms in a Map with Set of socket IDs
- First user to join waits; second user triggers WebRTC offer/answer exchange
- Automatic cleanup on disconnect

**Push-to-Talk Audio Control**
- Local audio track starts muted (`track.enabled = false`)
- Transmission toggles `enabled` property (not `muted`, which affects playback)
- PTT state broadcast to peer via Socket.io for UI indicators
- Audio flows continuously through WebRTC connection; PTT only controls track enabling

**WebRTC Connection Lifecycle**
1. Both users join room via Socket.io
2. Second user triggers first user to create RTCPeerConnection and send offer
3. Second user receives offer, creates answer
4. ICE candidates exchanged for NAT traversal
5. Direct P2P audio stream established

**Mobile/iOS Considerations**
- `navigator.mediaDevices` unavailable until user gesture on iOS
- Microphone permission requires explicit button tap (not automatic on socket connect)
- `useWalkieTalkie` hook checks for mobile and defers WebRTC init
- `retryMicrophoneAccess()` function for manual permission grant

## File Structure

```
client/src/
  ├── App.js                    # Root component, browser compatibility checks
  ├── hooks/
  │   └── useWalkieTalkie.js   # Central hook: Socket.io + WebRTC orchestration
  ├── utils/
  │   └── WebRTCManager.js     # WebRTC abstraction (peer connection, streams, ICE)
  └── components/
      ├── Room.js              # Room join/leave UI, error display
      ├── PushToTalkButton.js  # PTT button with mouse/keyboard/touch support
      └── ConnectionStatus.js  # Visual connection state indicator

server/
  └── index.js                 # Express + Socket.io signaling server
```

## Working with WebRTC Code

**When modifying `WebRTCManager.js`:**
- Always close peer connections properly in `close()` method to avoid memory leaks
- ICE candidates must be buffered if received before `setRemoteDescription()`
- Audio constraints in `initializeLocalStream()` affect echo cancellation (critical for walkie-talkie use)

**When modifying `useWalkieTalkie.js`:**
- Socket event handlers set up in single `useEffect` (no cleanup on individual handlers)
- `webRTCManagerRef` persists across renders; don't reinitialize on every state change
- `currentRoomRef` tracks room ID for cleanup on unmount

**When adding Socket.io events:**
- Add handler in both `server/index.js` and `useWalkieTalkie.js` hook
- Server must relay events to specific socket IDs (use `socket.to(peerId).emit()`)
- Client must handle events in the Socket.io connection `useEffect`

## Network Configuration

- Server binds to `0.0.0.0` for network access (not just localhost)
- Client uses `window.location.hostname` to determine server URL (supports both localhost and IP addresses)
- CORS enabled with `origin: "*"` for local network flexibility
- STUN servers: `stun.l.google.com:19302` for NAT traversal

## Browser Compatibility

**Desktop:** Chrome 70+, Firefox 65+, Safari 12+, Edge 79+

**Mobile:** 
- iOS: Safari 11+ (requires HTTPS or `chrome://flags` insecure origin exception)
- Android: Chrome/Edge (more permissive with WebRTC over HTTP)

**Testing on network devices:**
1. Find server IP with `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
2. Access `http://[SERVER-IP]:3000` on second device
3. For iOS over HTTP, enable Chrome flag: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`

## Common Issues and Solutions

**"Microphone access denied" errors:**
- Check browser permissions (not OS-level)
- iOS requires user gesture before accessing `mediaDevices`
- Try with headphones to rule out audio feedback issues

**Connection stuck on "Connecting":**
- Check WebRTC ICE connection state in browser console
- Ensure both devices on same subnet (some guest networks block P2P)
- Firewall may block WebRTC ports (open browser console for ICE candidate errors)

**"Room is full" error:**
- By design (max 2 users); user must leave before joining new room
- Check `server/index.js` room cleanup logic if users can't rejoin

**Audio echo/feedback:**
- Use headphones on both devices
- Verify `echoCancellation: true` in `WebRTCManager.js` constraints
- Mobile browsers may have varying echo cancellation quality
