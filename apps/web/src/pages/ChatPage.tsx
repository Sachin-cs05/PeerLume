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

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  // 3. Listen to Real-Time Socket Events
  useEffect(() => {
    if (!socket) return;

    // Handle new message
    const handleNewMessage = (newMsg: MessageDto) => {
      if (newMsg.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id || (m.clientTempId && m.clientTempId === newMsg.clientTempId))) {
            return prev.map((m) =>
              m.id === newMsg.id || (m.clientTempId && m.clientTempId === newMsg.clientTempId) ? newMsg : m
            );
          }
          return [...prev, newMsg];
        });

        // Mark as read immediately if actively viewing
        if (newMsg.senderId !== user?.id && activeConversationId) {
          apiService.conversations.markAsRead(activeConversationId);
        }
      }

      // Update conversation lastMessage & unreadCount in sidebar
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === newMsg.conversationId) {
            const isCurrent = c.id === activeConversationId;
            return {
              ...c,
              lastMessage: newMsg,
              unreadCount: isCurrent || newMsg.senderId === user?.id ? 0 : c.unreadCount + 1,
            };
          }
          return c;
        })
      );
    };

    // Handle read receipts
    const handleMessageRead = (payload: { conversationId: string; readAt: string }) => {
      if (payload.conversationId === activeConversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === user?.id ? { ...m, isRead: true, readAt: payload.readAt } : m))
        );
      }
    };

    // Handle Typing indicators
    const handleTypingStart = (payload: { conversationId: string; userId: string }) => {
      if (payload.conversationId === activeConversationId && payload.userId !== user?.id) {
        setPartnerTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setPartnerTyping(false), 3000);
      }
    };

    const handleTypingStop = (payload: { conversationId: string; userId: string }) => {
      if (payload.conversationId === activeConversationId && payload.userId !== user?.id) {
        setPartnerTyping(false);
      }
    };

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
    socket.on(SOCKET_EVENTS.TYPING_START, handleTypingStart);
    socket.on(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
      socket.off(SOCKET_EVENTS.TYPING_START, handleTypingStart);
      socket.off(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);
    };
  }, [socket, activeConversationId, user?.id]);

  // 4. Send Message Handler
  const handleSendMessage = async (content: string, type: MessageType, metadata?: MessageMetadata) => {
    if (!activeConversationId || !user) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const optimisticMessage: MessageDto = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: user.id,
      senderName: user.fullName,
      senderAvatar: user.avatarUrl,
      type,
      content,
      metadata: metadata || null,
      isRead: false,
      clientTempId: tempId,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await apiService.conversations.sendMessage(activeConversationId, {
        content,
        type,
        metadata,
        clientTempId: tempId,
      });

      if (res.data) {
        setMessages((prev) => prev.map((m) => (m.clientTempId === tempId ? res.data : m)));
      }
    } catch (err: unknown) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.clientTempId !== tempId));
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* ----------------------------------------------------------------- */}
      {/* LEFT SIDEBAR: CONVERSATION LIST */}
      {/* ----------------------------------------------------------------- */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-gray-50/50 ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Search header */}
        <div className="p-3 border-b border-gray-200 bg-white">
          <h2 className="text-base font-bold text-gray-900 mb-2">Direct Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-100 border border-transparent rounded-xl text-xs text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <div className="flex items-center justify-center p-8 text-gray-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<MessageSquare className="w-6 h-6" />}
                title="No conversations yet"
                description="Connect with learning partners in Discover to start sharing knowledge!"
                action={{
                  label: 'Find Partners',
                  href: '/discover',
                  variant: 'outline',
                }}
                className="p-6! border-0 shadow-none bg-transparent"
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

      {/* ----------------------------------------------------------------- */}
      {/* RIGHT MAIN CHAT AREA */}
      {/* ----------------------------------------------------------------- */}
      <div
        className={`flex-1 flex flex-col bg-white ${
          !activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white shadow-xs">
              <div className="flex items-center gap-3">
                {/* Back button on mobile */}
                <button
                  type="button"
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1 text-gray-500 hover:text-gray-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Participant details */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {activeConversation.participant.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      onlineUsers.has(activeConversation.participant.id)
                        ? 'bg-emerald-500'
                        : 'bg-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    {activeConversation.participant.fullName}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {onlineUsers.has(activeConversation.participant.id) ? (
                      <span className="text-emerald-600 font-medium">Online</span>
                    ) : (
                      'Offline'
                    )}{' '}
                    • {activeConversation.participant.college || 'PeerLume Student'}
                  </p>
                </div>
              </div>

              {/* Call Initiation Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => initiateCall(activeConversation.participant.id, 'AUDIO')}
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200"
                  title="Start Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => initiateCall(activeConversation.participant.id, 'VIDEO')}
                  className="p-2.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
                  title="Start Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error banner if present */}
            {errorBanner && (
              <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading message history...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2 p-6">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    Say hello to {activeConversation.participant.fullName}!
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Ask questions, share code snippets, discuss goals, and study together.
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
              icon={<MessageSquare className="w-8 h-8" />}
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
