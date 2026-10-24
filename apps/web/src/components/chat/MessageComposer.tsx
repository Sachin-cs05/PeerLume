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
    <div className="border-t border-border bg-card p-3 space-y-2">
      {/* Code mode banner */}
      {isCodeMode && (
        <div className="flex items-center justify-between bg-surface-hover border border-border rounded-md px-3 py-1.5 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-foreground" />
            <span className="font-medium text-xs">Code Mode:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-background border border-border rounded px-2 py-0.5 text-xs text-foreground focus:outline-none"
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
            className="text-foreground-muted hover:text-foreground cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Link mode banner */}
      {isLinkMode && (
        <div className="flex items-center gap-2 bg-surface-hover border border-border rounded-md px-3 py-1.5 text-xs text-foreground">
          <LinkIcon className="w-3.5 h-3.5 text-foreground shrink-0" />
          <input
            type="url"
            placeholder="Paste URL link here (https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 bg-background border border-border rounded px-2 py-0.5 text-xs text-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setIsLinkMode(false);
              setLinkUrl('');
            }}
            className="text-foreground-muted hover:text-foreground cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main text area & action bar */}
      <div className="flex items-end gap-2">
        <div className="flex-1 border border-border rounded-lg bg-background focus-within:border-foreground dark:focus-within:border-white transition-colors">
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
            className={`w-full bg-transparent p-2.5 text-xs sm:text-sm text-foreground placeholder:text-foreground-muted focus:outline-none resize-none ${
              isCodeMode ? 'font-mono text-xs' : ''
            }`}
          />

          {/* Bottom toolbar inside input box */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-border bg-card/40 rounded-b-lg">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsCodeMode(!isCodeMode);
                  setIsLinkMode(false);
                }}
                className={`p-1 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  isCodeMode
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                }`}
                title="Share Code Snippet"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLinkMode(!isLinkMode);
                  setIsCodeMode(false);
                }}
                className={`p-1 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  isLinkMode
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                }`}
                title="Share Resource Link"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Link</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-foreground-muted">
              {content.length}/5000
            </span>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || disabled || isSubmitting}
          className="p-2.5 bg-foreground hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-background rounded-lg shadow-xs transition-all focus:outline-none flex items-center justify-center shrink-0 cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
