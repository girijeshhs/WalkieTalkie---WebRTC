import React, { useRef, useEffect, useState } from 'react';
import useWalkieTalkie from './hooks/useWalkieTalkie';
import Room from './components/Room';
import PushToTalkButton from './components/PushToTalkButton';
import ConnectionStatus from './components/ConnectionStatus';
import { FaBroadcastTower } from 'react-icons/fa';
import './App.css';

/**
 * Main App Component
 * Local Walkie-Talkie application using WebRTC
 */
function App() {
  const audioRef = useRef(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [browserWarning, setBrowserWarning] = useState('');
  
  const {
    roomId,
    isConnected,
    connectionStatus,
    isTransmitting,
    peerTransmitting,
    error,
    participantCount,
    microphoneGranted,
    joinRoom,
    leaveRoom,
    startTransmitting,
    stopTransmitting,
    setAudioElement,
    retryMicrophoneAccess,
  } = useWalkieTalkie();

  // Check browser compatibility on mount
  useEffect(() => {
    const checkBrowserSupport = () => {
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isChrome = /Chrome|CriOS/.test(userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      
      console.log('=== Browser Detection Debug ===');
      console.log('User Agent:', userAgent);
      console.log('Is iOS:', isIOS);
      console.log('Is Chrome:', isChrome);
      console.log('Is Safari:', isSafari);
      console.log('Is Android:', isAndroid);
      
      // Check for basic WebRTC support
      const hasWebRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection);
      const hasMediaDevices = !!navigator.mediaDevices;
      
      console.log('Has WebRTC:', hasWebRTC);
      console.log('Has MediaDevices:', hasMediaDevices);
      console.log('===========================');
      
      if (!hasWebRTC) {
        console.error('No WebRTC support detected');
        setBrowserSupported(false);
        setBrowserWarning('Your browser doesn\'t support WebRTC. Please use Chrome, Firefox, Safari, or Edge.');
        return;
      }
      
      // For mobile devices (iOS or Android), always assume supported
      // mediaDevices API may not be available until user interaction on mobile
      if (isIOS || isAndroid) {
        console.log('Mobile device detected - enabling support');
        setBrowserSupported(true);
        setBrowserWarning('');
        return;
      }
      
      // For desktop browsers, we should be lenient
      // Modern browsers all support WebRTC even if mediaDevices isn't immediately available
      console.log('Desktop device detected - enabling support');
      setBrowserSupported(true);
      setBrowserWarning('');
    };
    
    checkBrowserSupport();
  }, []);

  // Set audio element reference when component mounts
  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [setAudioElement]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FaBroadcastTower className="text-4xl text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Local Walkie-Talkie
            </h1>
          </div>
          <p className="text-gray-600">
            Real-time voice communication on your local network
          </p>
        </header>

        {/* Browser Compatibility Warning */}
        {!browserSupported && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Browser Not Supported</h3>
                  <p className="text-sm text-red-700 mt-1">{browserWarning}</p>
                  <div className="mt-2">
                    <p className="text-xs text-red-600">Recommended browsers:</p>
                    <ul className="text-xs text-red-600 list-disc list-inside mt-1">
                      <li>Chrome (Desktop & Mobile)</li>
                      <li>Firefox (Desktop & Mobile)</li>
                      <li>Safari on iOS 11+</li>
                      <li>Edge/Chrome on Android</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Left Column - Room Management */}
          <div className="space-y-6">
            <Room
              currentRoomId={roomId}
              isConnected={isConnected}
              onJoinRoom={joinRoom}
              onLeaveRoom={leaveRoom}
              connectionStatus={connectionStatus}
              microphoneGranted={microphoneGranted}
              onRetryMicrophone={retryMicrophoneAccess}
              error={error}
              disabled={!browserSupported}
            />
            
            <ConnectionStatus
              status={connectionStatus}
              participantCount={participantCount}
              peerTransmitting={peerTransmitting}
            />
            
            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-3">How to Use</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex">
                  <span className="font-bold mr-2">1.</span>
                  <span>Enter the same room ID on both devices</span>
                </li>
                <li className="flex">
                  <span className="font-bold mr-2">2.</span>
                  <span>Click "Join" to connect to the room</span>
                </li>
                <li className="flex">
                  <span className="font-bold mr-2">3.</span>
                  <span>Hold the Push-to-Talk button or press Space to transmit</span>
                </li>
                <li className="flex">
                  <span className="font-bold mr-2">4.</span>
                  <span>Release to stop transmitting and listen</span>
                </li>
              </ol>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Both devices must be on the same Wi-Fi network. 
                  Allow microphone access when prompted.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Push to Talk */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-8 w-full">
              <h3 className="font-bold text-gray-800 mb-6 text-center">
                Push to Talk
              </h3>
              
              <PushToTalkButton
                onStartTransmit={startTransmitting}
                onStopTransmit={stopTransmitting}
                disabled={connectionStatus !== 'connected'}
                isTransmitting={isTransmitting}
              />
              
              {/* Audio indicator */}
              {peerTransmitting && (
                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="flex space-x-1">
                      <span className="inline-block w-3 h-8 bg-orange-500 rounded-sm animate-pulse"></span>
                      <span className="inline-block w-3 h-12 bg-orange-500 rounded-sm animate-pulse animation-delay-100"></span>
                      <span className="inline-block w-3 h-6 bg-orange-500 rounded-sm animate-pulse animation-delay-200"></span>
                      <span className="inline-block w-3 h-10 bg-orange-500 rounded-sm animate-pulse"></span>
                    </div>
                    <span className="text-orange-700 font-medium">
                      Receiving audio...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden audio element for remote stream */}
        <audio 
          ref={audioRef} 
          autoPlay 
          playsInline
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default App;