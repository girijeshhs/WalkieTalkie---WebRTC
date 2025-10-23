import { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import WebRTCManager from '../utils/WebRTCManager';

/**
 * Custom hook for managing walkie-talkie functionality
 * Handles Socket.io connection, WebRTC setup, and push-to-talk
 */
const useWalkieTalkie = () => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [peerTransmitting, setPeerTransmitting] = useState(false);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [microphoneGranted, setMicrophoneGranted] = useState(false);
  
  const webRTCManagerRef = useRef(null);
  const audioElementRef = useRef(null);
  const currentRoomRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    // Use window.location.hostname to connect to the same host serving the client
    // This allows both localhost and IP address connections
    const serverUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001'
      : `http://${window.location.hostname}:3001`;
    
    const socketInstance = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', async () => {
      console.log('Socket connected');
      
      // Don't try to initialize WebRTC on connect for mobile devices
      // Mobile browsers require explicit user interaction before accessing mediaDevices
      const isMobile = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        console.log('Mobile device detected - skipping auto WebRTC initialization');
        console.log('User must tap "Grant Access" button to enable microphone');
        setMicrophoneGranted(false);
        setConnectionStatus('ready');
        setError('Tap "Grant Access" to enable microphone access.');
        return;
      }
      
      // For desktop, try to initialize WebRTC immediately
      try {
        if (!webRTCManagerRef.current) {
          await initializeWebRTC(socketInstance);
        }
        setMicrophoneGranted(true);
        setConnectionStatus('ready');
      } catch (error) {
        console.error('Failed to initialize WebRTC on connect:', error);
        setMicrophoneGranted(false);
        
        // Check if it's a browser compatibility issue
        if (error.message.includes('Media devices API not available')) {
          setError('Your browser doesn\'t support WebRTC. Please update to iOS 11+ and use Safari or Chrome.');
        } else if (error.message.includes('user interaction first')) {
          setError('Tap "Grant Access" to enable microphone. iOS requires user interaction first.');
        } else {
          setError('Microphone access required. Please grant permission when prompted.');
        }
        setConnectionStatus('ready'); // Still allow room joining, but show error
      }
    });    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionStatus('disconnected');
      setIsConnected(false);
    });

    // Handle peer joining the room
    socketInstance.on('peer-joined', async (peerId) => {
      console.log('Peer joined:', peerId);
      setParticipantCount(2);
      
      // If we don't have a WebRTC connection yet, we're the first one
      // and should initiate the connection
      if (!webRTCManagerRef.current) {
        await initializeWebRTC(socketInstance);
      }
      
      // Create offer for the new peer
      if (webRTCManagerRef.current) {
        await webRTCManagerRef.current.createOffer(peerId);
      }
    });

    // Handle peer leaving the room
    socketInstance.on('peer-left', (peerId) => {
      console.log('Peer left:', peerId);
      setParticipantCount(1);
      setPeerTransmitting(false);
      
      // Clean up WebRTC connection
      if (webRTCManagerRef.current) {
        webRTCManagerRef.current.close();
        webRTCManagerRef.current = null;
      }
      
      setConnectionStatus('waiting');
    });

    // Handle WebRTC signaling
    socketInstance.on('offer', async ({ offer, from }) => {
      console.log('Received offer from:', from);
      
      if (!webRTCManagerRef.current) {
        await initializeWebRTC(socketInstance);
      }
      
      if (webRTCManagerRef.current) {
        await webRTCManagerRef.current.handleOffer(offer, from);
      }
    });

    socketInstance.on('answer', async ({ answer, from }) => {
      console.log('Received answer from:', from);
      
      if (webRTCManagerRef.current) {
        await webRTCManagerRef.current.handleAnswer(answer);
      }
    });

    socketInstance.on('ice-candidate', async ({ candidate, from }) => {
      console.log('Received ICE candidate from:', from);
      
      if (webRTCManagerRef.current) {
        await webRTCManagerRef.current.handleIceCandidate(candidate);
      }
    });

    // Handle peer PTT status
    socketInstance.on('peer-ptt-status', ({ peerId, isTransmitting }) => {
      console.log(`Peer ${peerId} PTT status:`, isTransmitting);
      setPeerTransmitting(isTransmitting);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Initialize WebRTC manager
  const initializeWebRTC = async (socketInstance) => {
    try {
      const manager = new WebRTCManager(
        socketInstance,
        // On stream received callback
        (stream) => {
          console.log('Remote stream received');
          if (audioElementRef.current) {
            audioElementRef.current.srcObject = stream;
            audioElementRef.current.play().catch(e => {
              console.error('Error playing remote audio:', e);
            });
          }
        },
        // On connection state change callback
        (state) => {
          console.log('WebRTC connection state:', state);
          if (state === 'connected') {
            setConnectionStatus('connected');
          } else if (state === 'failed' || state === 'disconnected') {
            setConnectionStatus('disconnected');
          } else if (state === 'connecting') {
            setConnectionStatus('connecting');
          }
        }
      );

      await manager.initializeLocalStream();
      webRTCManagerRef.current = manager;
      
      return manager;
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      setError('Failed to access microphone. Please check your permissions.');
      throw error;
    }
  };

  // Join a room
  const joinRoom = useCallback(async (roomIdToJoin) => {
    if (!socket) {
      setError('Socket not connected');
      return false;
    }

    if (!roomIdToJoin || roomIdToJoin.trim() === '') {
      setError('Please enter a room ID');
      return false;
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      // Join the room via socket
      socket.emit('join-room', roomIdToJoin, async (response) => {
        if (response.success) {
          console.log('Joined room successfully:', response);
          setRoomId(roomIdToJoin);
          currentRoomRef.current = roomIdToJoin;
          setIsConnected(true);
          setParticipantCount(response.totalParticipants);
          
          if (response.participants.length === 0) {
            setConnectionStatus('waiting');
          } else {
            setConnectionStatus('connecting');
            // We're the second person, so we wait for an offer
          }
        } else {
          setError(response.message || 'Failed to join room');
          setConnectionStatus('ready');
        }
      });

      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Failed to join room');
      setConnectionStatus('ready');
      return false;
    }
  }, [socket]);

  // Leave the current room
  const leaveRoom = useCallback(() => {
    if (socket && currentRoomRef.current) {
      socket.emit('leave-room', currentRoomRef.current);
    }

    if (webRTCManagerRef.current) {
      webRTCManagerRef.current.close();
      webRTCManagerRef.current = null;
    }

    setRoomId('');
    currentRoomRef.current = null;
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setParticipantCount(0);
    setPeerTransmitting(false);
    setError(null);
  }, [socket]);

  // Start transmitting (push-to-talk pressed)
  const startTransmitting = useCallback(() => {
    if (webRTCManagerRef.current && isConnected) {
      webRTCManagerRef.current.unmuteLocalAudio();
      setIsTransmitting(true);
      
      // Notify peer of PTT status
      if (socket && currentRoomRef.current) {
        socket.emit('ptt-status', {
          isTransmitting: true,
          roomId: currentRoomRef.current
        });
      }
    }
  }, [socket, isConnected]);

  // Stop transmitting (push-to-talk released)
  const stopTransmitting = useCallback(() => {
    if (webRTCManagerRef.current) {
      webRTCManagerRef.current.muteLocalAudio();
      setIsTransmitting(false);
      
      // Notify peer of PTT status
      if (socket && currentRoomRef.current) {
        socket.emit('ptt-status', {
          isTransmitting: false,
          roomId: currentRoomRef.current
        });
      }
    }
  }, [socket]);

  // Retry microphone access
  const retryMicrophoneAccess = useCallback(async () => {
    if (!socket) return;
    
    setError(null);
    try {
      if (!webRTCManagerRef.current) {
        await initializeWebRTC(socket);
      }
      setMicrophoneGranted(true);
      console.log('Microphone access granted');
    } catch (error) {
      console.error('Failed to initialize WebRTC on retry:', error);
      setMicrophoneGranted(false);
      
      // Provide specific error messages
      if (error.message.includes('Media devices API not supported')) {
        setError('Browser not supported. Please use Chrome, Firefox, or Safari on iOS 11+.');
      } else if (error.message.includes('user interaction first')) {
        setError('Tap "Grant Access" to enable microphone. iOS requires user interaction first.');
      } else if (error.message.includes('NotAllowedError') || error.message.includes('denied')) {
        setError('Microphone access denied. Please check your browser permissions.');
      } else {
        setError('Microphone access failed. Please try a different browser.');
      }
    }
  }, [socket]);

  // Set audio element reference
  const setAudioElement = useCallback((element) => {
    audioElementRef.current = element;
  }, []);

  return {
    // State
    roomId,
    isConnected,
    connectionStatus,
    isTransmitting,
    peerTransmitting,
    error,
    participantCount,
    microphoneGranted,
    
    // Actions
    joinRoom,
    leaveRoom,
    startTransmitting,
    stopTransmitting,
    setAudioElement,
    retryMicrophoneAccess,
  };
};

export default useWalkieTalkie;