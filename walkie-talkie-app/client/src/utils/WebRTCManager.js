/**
 * WebRTCManager - Handles WebRTC peer connections and audio streaming
 * This class manages the creation, configuration, and lifecycle of WebRTC connections
 */
class WebRTCManager {
  constructor(socket, onStreamReceived, onConnectionStateChange) {
    this.socket = socket;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onStreamReceived = onStreamReceived;
    this.onConnectionStateChange = onConnectionStateChange;
    this.isInitiator = false;
    this.peerId = null;
    
    // ICE servers configuration - using public STUN servers
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  /**
   * Initialize local audio stream with echo cancellation and noise suppression
   */
  async initializeLocalStream() {
    try {
      console.log('Initializing local audio stream...');
      
      // Audio constraints with echo cancellation and noise suppression
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: false
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Local audio stream initialized');
      
      // Initially mute the audio track (push-to-talk)
      this.muteLocalAudio();
      
      return this.localStream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  /**
   * Create a new peer connection
   */
  createPeerConnection(peerId) {
    console.log(`Creating peer connection for peer: ${peerId}`);
    this.peerId = peerId;
    
    // Create new RTCPeerConnection with ICE servers
    this.peerConnection = new RTCPeerConnection(this.iceServers);
    
    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
        console.log('Added local track to peer connection:', track.kind);
      });
    }
    
    // Handle incoming remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      this.remoteStream = event.streams[0];
      if (this.onStreamReceived) {
        this.onStreamReceived(this.remoteStream);
      }
    };
    
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        this.socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: peerId
        });
      }
    };
    
    // Monitor connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log('Connection state changed:', state);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(state);
      }
    };
    
    // Monitor ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
    };
    
    return this.peerConnection;
  }

  /**
   * Create and send an offer (for initiator)
   */
  async createOffer(peerId) {
    try {
      console.log('Creating offer...');
      this.isInitiator = true;
      
      if (!this.peerConnection) {
        this.createPeerConnection(peerId);
      }
      
      // Create offer with audio-only options
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      // Set local description
      await this.peerConnection.setLocalDescription(offer);
      console.log('Local description set (offer)');
      
      // Send offer to remote peer via signaling server
      this.socket.emit('offer', {
        offer: offer,
        to: peerId
      });
      
      console.log('Offer sent to peer:', peerId);
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming offer and create answer
   */
  async handleOffer(offer, fromPeerId) {
    try {
      console.log('Handling offer from:', fromPeerId);
      this.isInitiator = false;
      
      if (!this.peerConnection) {
        this.createPeerConnection(fromPeerId);
      }
      
      // Set remote description from offer
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('Remote description set (offer)');
      
      // Create answer
      const answer = await this.peerConnection.createAnswer();
      
      // Set local description
      await this.peerConnection.setLocalDescription(answer);
      console.log('Local description set (answer)');
      
      // Send answer back to offerer
      this.socket.emit('answer', {
        answer: answer,
        to: fromPeerId
      });
      
      console.log('Answer sent to peer:', fromPeerId);
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(answer) {
    try {
      console.log('Handling answer');
      
      if (!this.peerConnection) {
        console.error('No peer connection exists');
        return;
      }
      
      // Set remote description from answer
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('Remote description set (answer)');
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  async handleIceCandidate(candidate) {
    try {
      console.log('Adding ICE candidate');
      
      if (!this.peerConnection) {
        console.error('No peer connection exists');
        return;
      }
      
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('ICE candidate added');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  /**
   * Enable audio transmission (unmute)
   */
  unmuteLocalAudio() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
      console.log('Local audio unmuted');
    }
  }

  /**
   * Disable audio transmission (mute)
   */
  muteLocalAudio() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      console.log('Local audio muted');
    }
  }

  /**
   * Check if local audio is muted
   */
  isLocalAudioMuted() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      return audioTrack ? !audioTrack.enabled : true;
    }
    return true;
  }

  /**
   * Clean up and close the connection
   */
  close() {
    console.log('Closing WebRTC connection');
    
    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    this.remoteStream = null;
    this.peerId = null;
    console.log('WebRTC connection closed');
  }
}

export default WebRTCManager;