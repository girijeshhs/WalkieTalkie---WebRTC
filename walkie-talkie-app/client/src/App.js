import React, { useRef, useEffect } from 'react';
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
  
  const {
    roomId,
    isConnected,
    connectionStatus,
    isTransmitting,
    peerTransmitting,
    error,
    participantCount,
    joinRoom,
    leaveRoom,
    startTransmitting,
    stopTransmitting,
    setAudioElement,
  } = useWalkieTalkie();

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

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
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