import React, { useState, useRef, useEffect } from 'react';
import { Send, Code2, Link as LinkIcon, X } from 'lucide-react';
import type { MessageType, MessageMetadata } from '@peerlume/shared';

interface MessageComposerProps {
  onSendMessage: (content: string, type: MessageType, metadata?: MessageMetadata) => Promise<void>;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
}

const PROGRAMMING_LANGUAGES = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'HTML/CSS', value: 'html' },
  { label: 'SQL', value: 'sql' },
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('typescript');
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Typing debounce
    if (onTypingStart) {
      onTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) {
        onTypingStop();
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onTypingStop) {
        onTypingStop();
      }

      if (isCodeMode) {
        await onSendMessage(trimmed, 'CODE', { language: selectedLanguage });
        setIsCodeMode(false);
      } else if (isLinkMode) {
        await onSendMessage(trimmed, 'LINK', { url: linkUrl.trim() });
        setIsLinkMode(false);
        setLinkUrl('');
      } else {
        await onSendMessage(trimmed, 'TEXT');
      }

      setContent('');
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3 space-y-2">
      {/* Code mode banner */}
      {isCodeMode && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Code Snippet Mode:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-white border border-blue-300 rounded px-2 py-0.5 text-xs text-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              {PROGRAMMING_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setIsCodeMode(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Link mode banner */}
      {isLinkMode && (
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 text-xs text-purple-900">
          <LinkIcon className="w-4 h-4 text-purple-600 shrink-0" />
          <input
            type="url"
            placeholder="Paste URL link here (https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 bg-white border border-purple-300 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => {
              setIsLinkMode(false);
              setLinkUrl('');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main text area & action bar */}
      <div className="flex items-end gap-2">
        <div className="flex-1 border border-gray-300 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-500 transition-colors">
          <textarea
            ref={textareaRef}
            rows={isCodeMode ? 4 : 2}
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSubmitting}
            placeholder={
              isCodeMode
                ? 'Paste or type code snippet here...'
                : isLinkMode
                  ? 'Add an optional note about this link...'
                  : 'Type a message... (Press Enter to send, Shift+Enter for new line)'
            }
            className={`w-full bg-transparent p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none resize-none ${isCodeMode ? 'font-mono text-xs' : ''
              }`}
          />

          {/* Bottom toolbar inside input box */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-gray-100 bg-white/50 rounded-b-xl">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsCodeMode(!isCodeMode);
                  setIsLinkMode(false);
                }}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${isCodeMode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                title="Share Code Snippet"
              >
                <Code2 className="w-4 h-4" />
                <span className="hidden sm:inline">Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLinkMode(!isLinkMode);
                  setIsCodeMode(false);
                }}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${isLinkMode
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                title="Share Resource Link"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Link</span>
              </button>
            </div>

            <span className="text-[11px] text-gray-400">
              {content.length}/5000
            </span>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || disabled || isSubmitting}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 flex items-center justify-center shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
