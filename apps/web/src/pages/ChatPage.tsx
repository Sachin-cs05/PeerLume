import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Phone,
  Video,
  Search,
  MessageSquare,
  ArrowLeft,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { apiService } from '../services/api.js';
import { ConversationItem } from '../components/chat/ConversationItem.js';
import { ChatMessage } from '../components/chat/ChatMessage.js';
import { MessageComposer } from '../components/chat/MessageComposer.js';
import { TypingIndicator } from '../components/chat/TypingIndicator.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { SOCKET_EVENTS } from '@peerlume/shared';
import type {
  ConversationDto,
  MessageDto,
  MessageType,
  MessageMetadata,
} from '@peerlume/shared';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, onlineUsers, initiateCall } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Load Conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiService.conversations.list();
      if (res.data) {
        setConversations(res.data);

        // Check if conversationId was passed in URL query param
        const targetId = searchParams.get('conversationId');
        const targetUserId = searchParams.get('userId');

        if (targetId && res.data.some((c) => c.id === targetId)) {
          setActiveConversationId(targetId);
        } else if (targetUserId) {
          // Open or create direct conversation with this target user
          const directRes = await apiService.conversations.getOrCreateDirect(targetUserId);
          if (directRes.data) {
            setConversations((prev) => [directRes.data, ...prev.filter((c) => c.id !== directRes.data.id)]);
            setActiveConversationId(directRes.data.id);
          }
        } else if (res.data.length > 0 && !activeConversationId) {
          setActiveConversationId(res.data[0].id);
        }
      }
    } finally {
      setLoadingConversations(false);
    }
  }, [searchParams, activeConversationId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Load Messages for Active Conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    if (!activeConversationId) return;

    let isSubscribed = true;
    setLoadingMessages(true);
    setErrorBanner(null);

    // Join Socket conversation room
    if (socket) {
      socket.emit(SOCKET_EVENTS.ROOM_JOIN, activeConversationId);
    }

    // Mark as read in backend
    apiService.conversations.markAsRead(activeConversationId);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
    );

    apiService.conversations
      .getMessages(activeConversationId, 50)
      .then((res) => {
        if (isSubscribed && res.data) {
          setMessages(res.data);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setErrorBanner(err.message || 'Failed to load conversation history');
        }
      })
      .finally(() => {
        if (isSubscribed) setLoadingMessages(false);
      });

    return () => {
      isSubscribed = false;
      if (socket) {
        socket.emit(SOCKET_EVENTS.ROOM_LEAVE, activeConversationId);
      }
    };
  }, [activeConversationId, socket]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  // Socket listeners for incoming messages & typing
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg: MessageDto) => {
      if (newMsg.conversationId === activeConversationId) {
        setMessages((prev) => [...prev, newMsg]);
        setPartnerTyping(false);

        // Mark read
        apiService.conversations.markAsRead(newMsg.conversationId);
      }

      // Update snippet in conversation list
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === newMsg.conversationId) {
            return {
              ...c,
              lastMessage: newMsg,
              unreadCount:
                newMsg.conversationId === activeConversationId
                  ? 0
                  : c.unreadCount + 1,
            };
          }
          return c;
        })
      );
    };

    const handleTypingStart = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConversationId && data.userId !== user?.id) {
        setPartnerTyping(true);

        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          setPartnerTyping(false);
        }, 3000);
      }
    };

    const handleTypingStop = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConversationId && data.userId !== user?.id) {
        setPartnerTyping(false);
      }
    };

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
    socket.on(SOCKET_EVENTS.TYPING_START, handleTypingStart);
    socket.on(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
      socket.off(SOCKET_EVENTS.TYPING_START, handleTypingStart);
      socket.off(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);
    };
  }, [socket, activeConversationId, user?.id]);

  // Send message
  const handleSendMessage = async (
    content: string,
    type: MessageType,
    metadata?: MessageMetadata
  ) => {
    if (!activeConversationId) return;

    try {
      const res = await apiService.conversations.sendMessage(activeConversationId, {
        content,
        type,
        metadata,
      });

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);

        // Optimistically update conversation list preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId ? { ...c, lastMessage: res.data } : c
          )
        );
      }
    } catch (err: unknown) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participant.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
      {/* LEFT SIDEBAR: CONVERSATION LIST */}
      <div
        className={`w-full md:w-80 lg:w-88 border-r border-border flex flex-col bg-card ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Search header */}
        <div className="p-3.5 border-b border-border bg-card">
          <h2 className="text-sm font-bold text-foreground mb-2">Direct Messages</h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-foreground-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-foreground-muted focus:border-foreground dark:focus:border-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <div className="flex items-center justify-center p-8 text-foreground-muted text-xs">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<MessageSquare className="w-6 h-6" />}
                title="No conversations yet"
                description="Connect with learning partners in Discover to start collaborating."
                action={{
                  label: 'Find Partners',
                  href: '/discover',
                  variant: 'outline',
                }}
                className="p-4! border-0 shadow-none bg-transparent"
              />
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === activeConversationId}
                isOnline={onlineUsers.has(conv.participant.id)}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setSearchParams({ conversationId: conv.id });
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT MAIN CHAT AREA */}
      <div
        className={`flex-1 flex flex-col bg-background ${
          !activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card shadow-xs">
              <div className="flex items-center gap-3">
                {/* Back button on mobile */}
                <button
                  type="button"
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1 text-foreground-muted hover:text-foreground cursor-pointer"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {/* Participant details */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-surface-hover border border-border flex items-center justify-center text-foreground font-bold text-xs shadow-xs">
                    {activeConversation.participant.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${
                      onlineUsers.has(activeConversation.participant.id)
                        ? 'bg-emerald-500'
                        : 'bg-foreground-muted'
                    }`}
                  />
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                    {activeConversation.participant.fullName}
                  </h3>
                  <p className="text-[11px] text-foreground-muted">
                    {onlineUsers.has(activeConversation.participant.id) ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
                    ) : (
                      'Offline'
                    )}{' '}
                    • {activeConversation.participant.college || 'PeerLearn Student'}
                  </p>
                </div>
              </div>

              {/* Call Initiation Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => initiateCall(activeConversation.participant.id, 'AUDIO')}
                  className="p-2 text-foreground-secondary hover:text-foreground bg-card hover:bg-surface-hover rounded-lg transition-colors border border-border cursor-pointer shadow-xs"
                  title="Start Voice Call"
                  aria-label="Start Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => initiateCall(activeConversation.participant.id, 'VIDEO')}
                  className="p-2 text-foreground hover:opacity-90 bg-foreground text-background rounded-lg transition-all cursor-pointer shadow-xs"
                  title="Start Video Call"
                  aria-label="Start Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error banner if present */}
            {errorBanner && (
              <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 text-xs text-rose-500 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-background">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-xs text-foreground-muted">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading message history...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-foreground-muted space-y-2 p-6">
                  <div className="w-10 h-10 rounded-full bg-surface-hover border border-border text-foreground flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Conversation with {activeConversation.participant.fullName}
                  </p>
                  <p className="text-xs text-foreground-muted max-w-sm">
                    Exchange questions, share code snippets, schedule study sessions, and study together.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === user?.id}
                  />
                ))
              )}

              {/* Typing indicator */}
              {partnerTyping && (
                <TypingIndicator userName={activeConversation.participant.fullName} />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              onTypingStart={() => {
                if (socket && activeConversationId) {
                  socket.emit(SOCKET_EVENTS.TYPING_START, activeConversationId);
                }
              }}
              onTypingStop={() => {
                if (socket && activeConversationId) {
                  socket.emit(SOCKET_EVENTS.TYPING_STOP, activeConversationId);
                }
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              icon={<MessageSquare className="w-6 h-6" />}
              title="No conversation selected"
              description="Choose a student from the sidebar or find a study partner in Discover to begin chatting."
              action={{
                label: 'Find Study Partners',
                href: '/discover',
              }}
              className="border-0 shadow-none bg-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
};
