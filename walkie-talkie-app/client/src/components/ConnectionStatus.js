import React from 'react';
import { FaCircle, FaWifi, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Connection Status Component
 * Displays the current connection state with visual indicators
 */
const ConnectionStatus = ({ 
  status, 
  participantCount = 0, 
  peerTransmitting = false 
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          icon: FaCircle,
          text: 'Connected',
          description: `${participantCount} user${participantCount !== 1 ? 's' : ''} in room`,
        };
      case 'connecting':
        return {
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          icon: FaWifi,
          text: 'Connecting...',
          description: 'Establishing connection',
          animate: true,
        };
      case 'waiting':
        return {
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
          icon: FaCircle,
          text: 'Waiting for peer',
          description: 'Room created, waiting for another user',
          animate: true,
        };
      case 'ready':
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          icon: FaCircle,
          text: 'Ready',
          description: 'Enter a room ID to connect',
        };
      case 'disconnected':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          icon: FaExclamationTriangle,
          text: 'Disconnected',
          description: 'Not connected to server',
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          icon: FaCircle,
          text: 'Unknown',
          description: '',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <div className={`
      px-4 py-3 rounded-lg border-2 ${statusInfo.borderColor} ${statusInfo.bgColor}
      transition-all duration-300
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`${statusInfo.color} ${statusInfo.animate ? 'animate-pulse' : ''}`}>
            <Icon className="text-sm" />
          </div>
          <div>
            <p className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.text}
            </p>
            {statusInfo.description && (
              <p className="text-xs text-gray-600 mt-1">
                {statusInfo.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Peer transmitting indicator */}
        {peerTransmitting && status === 'connected' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-orange-600 font-medium">Peer talking</span>
            <div className="flex space-x-1">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse animation-delay-100"></span>
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse animation-delay-200"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;