const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow all origins for local network access
    methods: ["GET", "POST"]
  }
});

// Store rooms and their participants
const rooms = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', rooms: rooms.size });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  // Join a room
  socket.on('join-room', (roomId, callback) => {
    console.log(`Socket ${socket.id} joining room ${roomId}`);
    
    // Check if room exists, if not create it
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    const room = rooms.get(roomId);
    
    // Check if room is full (max 2 participants for walkie-talkie)
    if (room.size >= 2) {
      callback({ success: false, message: 'Room is full' });
      return;
    }
    
    // Add user to room
    room.add(socket.id);
    socket.join(roomId);
    socket.roomId = roomId; // Store room ID on socket for cleanup
    
    // Notify other participants that someone joined
    socket.to(roomId).emit('peer-joined', socket.id);
    
    // Send back the list of other participants in the room
    const otherParticipants = Array.from(room).filter(id => id !== socket.id);
    callback({ 
      success: true, 
      participants: otherParticipants,
      totalParticipants: room.size 
    });
    
    console.log(`Room ${roomId} now has ${room.size} participant(s)`);
  });
  
  // Handle WebRTC signaling - offer
  socket.on('offer', ({ offer, to }) => {
    console.log(`Relaying offer from ${socket.id} to ${to}`);
    socket.to(to).emit('offer', { 
      offer, 
      from: socket.id 
    });
  });
  
  // Handle WebRTC signaling - answer
  socket.on('answer', ({ answer, to }) => {
    console.log(`Relaying answer from ${socket.id} to ${to}`);
    socket.to(to).emit('answer', { 
      answer, 
      from: socket.id 
    });
  });
  
  // Handle WebRTC signaling - ICE candidates
  socket.on('ice-candidate', ({ candidate, to }) => {
    console.log(`Relaying ICE candidate from ${socket.id} to ${to}`);
    socket.to(to).emit('ice-candidate', { 
      candidate, 
      from: socket.id 
    });
  });
  
  // Handle push-to-talk status updates
  socket.on('ptt-status', ({ isTransmitting, roomId }) => {
    console.log(`Socket ${socket.id} PTT status: ${isTransmitting ? 'transmitting' : 'idle'}`);
    // Broadcast PTT status to other participants in the room
    socket.to(roomId).emit('peer-ptt-status', { 
      peerId: socket.id, 
      isTransmitting 
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Remove from room if they were in one
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      room.delete(socket.id);
      
      // Notify others in the room
      socket.to(socket.roomId).emit('peer-left', socket.id);
      
      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(socket.roomId);
        console.log(`Room ${socket.roomId} deleted (empty)`);
      } else {
        console.log(`Room ${socket.roomId} now has ${room.size} participant(s)`);
      }
    }
  });
  
  // Handle explicit leave room
  socket.on('leave-room', (roomId) => {
    console.log(`Socket ${socket.id} leaving room ${roomId}`);
    
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.delete(socket.id);
      
      socket.leave(roomId);
      socket.to(roomId).emit('peer-left', socket.id);
      
      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }
    }
    
    socket.roomId = null;
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Signaling server running on port ${PORT}`);
  console.log(`WebSocket connections available at ws://localhost:${PORT}`);
  console.log(`Server accessible on network at ws://0.0.0.0:${PORT}`);
});