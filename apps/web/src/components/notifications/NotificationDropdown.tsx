import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, MessageSquare, UserPlus, PhoneCall } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext.js';
import { apiService } from '../../services/api.js';
import type { NotificationDto } from '@peerLume/shared';

export const NotificationDropdown: React.FC = () => {
  const { unreadNotificationsCount, setUnreadNotificationsCount } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiService.notifications.list(1, 20);
      if (res.data?.items) {
        setNotifications(res.data.items);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    await apiService.notifications.markAllAsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );
    setUnreadNotificationsCount(0);
  };

  const handleNotificationClick = async (notif: NotificationDto) => {
    if (!notif.isRead) {
      await apiService.notifications.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    }

    setIsOpen(false);

    // Route based on notification type
    if (notif.type === 'NEW_MESSAGE' && notif.data?.conversationId) {
      navigate(`/chat?conversationId=${notif.data.conversationId}`);
    } else if (
      notif.type === 'FRIEND_REQUEST_RECEIVED' ||
      notif.type === 'FRIEND_REQUEST_ACCEPTED'
    ) {
      navigate('/connections');
    } else if (notif.type === 'CALL_MISSED' || notif.type === 'CALL_INCOMING') {
      navigate('/chat');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'FRIEND_REQUEST_RECEIVED':
      case 'FRIEND_REQUEST_ACCEPTED':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'CALL_MISSED':
      case 'CALL_INCOMING':
        return <PhoneCall className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {notifications.some((n) => !n.isRead) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-6 text-center text-xs text-gray-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 space-y-1">
                <Bell className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-medium text-gray-600">No notifications yet</p>
                <p className="text-[11px] text-gray-400">
                  You'll be alerted when connections request or message you.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3 transition-colors ${
                    !n.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-gray-100 shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-400 ml-1 shrink-0">
                        {new Date(n.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{n.body}</p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
