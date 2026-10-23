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
      className={`w-full text-left p-3 flex items-center gap-3 rounded-xl transition-all border ${isSelected
          ? 'bg-blue-50 border-blue-200 shadow-sm'
          : 'bg-white border-transparent hover:bg-gray-50'
        }`}
    >
      {/* Avatar with Presence Indicator */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden">
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
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      </div>

      {/* Info & Snippet */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {participant.fullName}
          </h4>
          {lastTime && (
            <span className="text-[11px] text-gray-400 shrink-0 ml-1">
              {lastTime}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 truncate">
          {participant.college || 'PeerLume Partner'}
        </p>

        <div className="flex items-center justify-between mt-1">
          <p
            className={`text-xs truncate flex items-center gap-1 ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'
              }`}
          >
            {lastMessage?.type === 'CODE' && <Code2 className="w-3 h-3 text-blue-500 shrink-0" />}
            {lastMessage?.type === 'LINK' && <LinkIcon className="w-3 h-3 text-purple-500 shrink-0" />}
            <span className="truncate">{messagePreview}</span>
          </p>

          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-blue-600 rounded-full shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
