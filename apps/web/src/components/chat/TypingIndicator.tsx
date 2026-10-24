import React from 'react';

interface TypingIndicatorProps {
  userName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName = 'Student' }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-foreground-muted animate-pulse">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" />
      </div>
      <span>{userName} is typing...</span>
    </div>
  );
};
