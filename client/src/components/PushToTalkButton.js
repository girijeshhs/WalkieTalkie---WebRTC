import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

/**
 * Push-to-Talk Button Component
 * Handles mouse/touch events for transmitting audio
 */
const PushToTalkButton = ({ 
  onStartTransmit, 
  onStopTransmit, 
  disabled = false,
  isTransmitting = false 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Handle mouse down/touch start
  const handleStart = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsPressed(true);
      onStartTransmit();
    }
  };

  // Handle mouse up/touch end
  const handleEnd = (e) => {
    e.preventDefault();
    if (isPressed) {
      setIsPressed(false);
      onStopTransmit();
    }
  };

  // Handle mouse leave (safety release)
  const handleLeave = () => {
    if (isPressed) {
      setIsPressed(false);
      onStopTransmit();
    }
  };

  // Add keyboard support (spacebar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && !disabled) {
        e.preventDefault();
        if (!isPressed) {
          setIsPressed(true);
          onStartTransmit();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space' && !disabled) {
        e.preventDefault();
        if (isPressed) {
          setIsPressed(false);
          onStopTransmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPressed, disabled, onStartTransmit, onStopTransmit]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isPressed) {
        onStopTransmit();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        className={`
          relative w-32 h-32 rounded-full transition-all duration-200 transform
          ${disabled 
            ? 'bg-gray-300 cursor-not-allowed opacity-50' 
            : isPressed || isTransmitting
              ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-2xl animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg'
          }
          focus:outline-none focus:ring-4 focus:ring-blue-300
        `}
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleLeave}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        disabled={disabled}
        aria-label="Push to Talk"
      >
        <div className="flex items-center justify-center h-full">
          {isPressed || isTransmitting ? (
            <FaMicrophone className="text-white text-5xl" />
          ) : (
            <FaMicrophoneSlash className="text-white text-5xl" />
          )}
        </div>
        
        {/* Ripple effect when transmitting */}
        {(isPressed || isTransmitting) && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping"></span>
            <span className="absolute inset-0 rounded-full bg-red-400 opacity-50 animate-ping animation-delay-200"></span>
          </>
        )}
      </button>
      
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {disabled 
            ? 'Connect to a room first' 
            : isPressed || isTransmitting
              ? 'Transmitting...'
              : 'Hold to talk (or press Space)'
          }
        </p>
      </div>
    </div>
  );
};

export default PushToTalkButton;