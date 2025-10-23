import React, { useState } from 'react';
import { FaSignInAlt, FaSignOutAlt, FaCopy, FaMicrophone, FaMicrophoneSlash, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Room Component
 * Handles room ID input and join/leave functionality
 */
const Room = ({ 
  currentRoomId, 
  isConnected, 
  onJoinRoom, 
  onLeaveRoom,
  connectionStatus,
  microphoneGranted,
  onRetryMicrophone,
  error,
  disabled = false
}) => {
  const [roomInput, setRoomInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleJoin = () => {
    if (roomInput.trim()) {
      onJoinRoom(roomInput.trim());
    }
  };

  const handleLeave = () => {
    onLeaveRoom();
    setRoomInput('');
  };

  const handleCopyRoomId = () => {
    if (currentRoomId) {
      navigator.clipboard.writeText(currentRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isConnected) {
      handleJoin();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Room Management
      </h2>
      
      {/* Browser Not Supported Message */}
      {disabled && (
        <div className="mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FaExclamationTriangle className="text-gray-500" />
              <span className="text-sm text-gray-700">Browser not supported - please check the warning above</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Microphone Status */}
      {connectionStatus === 'ready' && !disabled && (
        <div className="mb-4">
          {microphoneGranted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <FaMicrophone className="text-green-500" />
                <span className="text-sm text-green-700 font-medium">Microphone access granted</span>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaMicrophoneSlash className="text-yellow-500" />
                  <span className="text-sm text-yellow-700 font-medium">Microphone access required</span>
                </div>
                <button
                  onClick={onRetryMicrophone}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                >
                  Grant Access
                </button>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                Click "Grant Access" and allow microphone permission when prompted.
                {navigator.userAgent.includes('Safari') && navigator.userAgent.includes('Mobile') && 
                  ' On iPhone, make sure you\'re using Safari or Chrome.'
                }
                {/iPad|iPhone|iPod/.test(navigator.userAgent) &&
                  ' On iOS devices, you may need to tap the button first before granting permission.'
                }
              </p>
            </div>
          )}
        </div>
      )}
      
      {!isConnected ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="room-id" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Room ID
            </label>
            <div className="flex space-x-2">
              <input
                id="room-id"
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., room-123"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={connectionStatus === 'disconnected' || disabled}
              />
              <button
                onClick={handleJoin}
                disabled={!roomInput.trim() || connectionStatus === 'disconnected' || disabled}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-all
                  ${!roomInput.trim() || connectionStatus === 'disconnected' || disabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-300
                `}
              >
                <div className="flex items-center space-x-2">
                  <FaSignInAlt />
                  <span>Join</span>
                </div>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Share the same room ID with your partner to connect
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected to room:</p>
                <p className="text-lg font-mono font-bold text-green-700">
                  {currentRoomId}
                </p>
              </div>
              <button
                onClick={handleCopyRoomId}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
                title="Copy Room ID"
              >
                <div className="flex items-center space-x-2">
                  <FaCopy />
                  <span className="text-sm">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </div>
              </button>
            </div>
          </div>
          
          <button
            onClick={handleLeave}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <FaSignOutAlt />
              <span>Leave Room</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Room;