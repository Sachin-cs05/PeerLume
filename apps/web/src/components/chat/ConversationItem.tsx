import React from 'react';
import type { ConversationDto } from '@peerlume/shared';
import { Code2, Link as LinkIcon } from 'lucide-react';

interface ConversationItemProps {
  conversation: ConversationDto;
  isSelected: boolean;
  isOnline: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  isOnline,
  onClick,
}) => {
  const { participant, lastMessage, unreadCount } = conversation;

  // Format last message preview
  let messagePreview = 'No messages yet';
  if (lastMessage) {
    if (lastMessage.type === 'CODE') {
      messagePreview = `Code: ${lastMessage.metadata?.language || 'snippet'}`;
    } else if (lastMessage.type === 'LINK') {
      messagePreview = `Link: ${lastMessage.content}`;
    } else {
      messagePreview = lastMessage.content;
    }
  }

  const lastTime = lastMessage
    ? new Date(lastMessage.createdAt).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })
    : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3 flex items-center gap-3 rounded-lg transition-all border cursor-pointer ${
        isSelected
          ? 'bg-surface-hover border-border-strong shadow-2xs'
          : 'bg-card border-transparent hover:bg-surface-hover/50'
      }`}
    >
      {/* Avatar with Presence Indicator */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center text-foreground font-semibold text-xs overflow-hidden">
          {participant.avatarUrl ? (
            <img
              src={participant.avatarUrl}
              alt={participant.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            participant.fullName.slice(0, 2).toUpperCase()
          )}
        </div>
        {/* Presence Dot */}
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${
            isOnline ? 'bg-emerald-500' : 'bg-foreground-muted'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      </div>

      {/* Info & Snippet */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">
            {participant.fullName}
          </h4>
          {lastTime && (
            <span className="text-[11px] text-foreground-muted shrink-0 ml-1">
              {lastTime}
            </span>
          )}
        </div>

        <p className="text-[11px] text-foreground-muted truncate">
          {participant.college || 'PeerLearn Partner'}
        </p>

        <div className="flex items-center justify-between mt-1">
          <p
            className={`text-xs truncate flex items-center gap-1 ${
              unreadCount > 0 ? 'font-semibold text-foreground' : 'text-foreground-secondary'
            }`}
          >
            {lastMessage?.type === 'CODE' && <Code2 className="w-3 h-3 text-foreground shrink-0" />}
            {lastMessage?.type === 'LINK' && <LinkIcon className="w-3 h-3 text-foreground shrink-0" />}
            <span className="truncate">{messagePreview}</span>
          </p>

          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold leading-none text-background bg-foreground rounded-full shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
