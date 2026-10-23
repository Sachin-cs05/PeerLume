import React from 'react';

interface TypingIndicatorProps {
  userName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName = 'Student' }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 animate-pulse">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
      </div>
      <span>{userName} is typing...</span>
    </div>
  );
};
