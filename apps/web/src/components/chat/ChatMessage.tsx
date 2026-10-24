import React, { useState } from 'react';
import type { MessageDto } from '@peerlume/shared';
import { Check, CheckCheck, Code2, Copy, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: MessageDto;
  isOwn: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
          isOwn
            ? 'bg-[#111113] text-white dark:bg-white dark:text-[#09090B] rounded-br-xs'
            : 'bg-card border border-border text-foreground rounded-bl-xs'
        }`}
      >
        {/* SENDER NAME (for incoming messages) */}
        {!isOwn && (
          <p className="text-[11px] font-semibold text-foreground-muted mb-1">
            {message.senderName}
          </p>
        )}

        {/* CODE SNIPPET MESSAGE */}
        {message.type === 'CODE' ? (
          <div className="rounded-md overflow-hidden border border-border bg-background text-foreground my-1 font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-surface-hover border-b border-border text-[11px] text-foreground-muted">
              <span className="flex items-center gap-1.5 uppercase font-semibold tracking-wider text-foreground">
                <Code2 className="w-3.5 h-3.5" />
                {message.metadata?.language || 'code'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 hover:text-foreground transition-colors px-1.5 py-0.5 rounded bg-card border border-border cursor-pointer"
                title="Copy snippet"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto whitespace-pre leading-relaxed text-[11px] sm:text-[12px]">
              <code>{message.content}</code>
            </pre>
          </div>
        ) : message.type === 'LINK' ? (
          /* LINK MESSAGE */
          <div className="space-y-1">
            <p className="break-words">{message.content}</p>
            {message.metadata?.url && (
              <a
                href={message.metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 text-xs underline font-medium ${
                  isOwn ? 'text-white/80 dark:text-black/80 hover:text-white dark:hover:text-black' : 'text-foreground hover:underline'
                }`}
              >
                <span>Visit resource</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : (
          /* STANDARD TEXT MESSAGE */
          <p className="break-words whitespace-pre-wrap leading-relaxed">{message.content}</p>
        )}

        {/* TIMESTAMP & STATUS */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
            isOwn ? 'text-white/70 dark:text-black/70' : 'text-foreground-muted'
          }`}
        >
          <span>{formattedTime}</span>
          {isOwn && (
            <span title={message.isRead ? 'Read' : 'Sent'}>
              {message.isRead ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
