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
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${isOwn
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
          }`}
      >
        {/* SENDER NAME (for incoming messages) */}
        {!isOwn && (
          <p className="text-[11px] font-semibold text-blue-600 mb-1">
            {message.senderName}
          </p>
        )}

        {/* CODE SNIPPET MESSAGE */}
        {message.type === 'CODE' ? (
          <div className="rounded-lg overflow-hidden border border-gray-800 bg-gray-950 text-gray-100 my-1 font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-gray-800 text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5 uppercase font-semibold tracking-wider text-blue-400">
                <Code2 className="w-3.5 h-3.5" />
                {message.metadata?.language || 'code'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 hover:text-white transition-colors px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700"
                title="Copy snippet"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto whitespace-pre leading-relaxed text-[12px]">
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
                className={`inline-flex items-center gap-1 text-xs underline font-medium ${isOwn ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'
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
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${isOwn ? 'text-blue-100' : 'text-gray-400'
            }`}
        >
          <span>{formattedTime}</span>
          {isOwn && (
            <span title={message.isRead ? 'Read' : 'Sent'}>
              {message.isRead ? (
                <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
              ) : (
                <Check className="w-3.5 h-3.5 text-blue-200" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

