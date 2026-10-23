import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext.js';
import { SOCKET_EVENTS } from '@peerlume/shared';
import type { CallSessionDto, CallType } from '@peerlume/shared';
import { apiService } from '../services/api.js';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
  incomingCall: CallSessionDto | null;
  activeCall: CallSessionDto | null;
  initiateCall: (receiverId: string, type: CallType) => Promise<CallSessionDto | null>;
  acceptCall: (callId: string) => Promise<void>;
  rejectCall: (callId: string) => Promise<void>;
  endCall: (callId: string) => Promise<void>;
  clearActiveCall: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [incomingCall, setIncomingCall] = useState<CallSessionDto | null>(null);
  const [activeCall, setActiveCall] = useState<CallSessionDto | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Fetch initial unread notifications count
  useEffect(() => {
    if (user) {
      apiService.notifications.getUnreadCount().then((res) => {
        if (res.data) {
          setUnreadNotificationsCount(res.data.unreadCount);
        }
      });
    }
  }, [user]);

  // Manage Socket.IO connection
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Determine backend origin
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const serverOrigin = apiUrl.replace(/\/api\/?$/, '');

    const newSocket = io(serverOrigin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle presence updates
    newSocket.on(SOCKET_EVENTS.PRESENCE_UPDATE, (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.isOnline) {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    });

    // Handle real-time persistent notifications
    newSocket.on(SOCKET_EVENTS.NOTIFICATION_NEW, () => {
      setUnreadNotificationsCount((prev) => prev + 1);
    });

    // Handle incoming call invitation
    newSocket.on(SOCKET_EVENTS.CALL_INVITE, (session: CallSessionDto) => {
      setIncomingCall(session);
    });

    // Handle call ended by remote peer
    newSocket.on(SOCKET_EVENTS.CALL_END, () => {
      setIncomingCall(null);
      setActiveCall(null);
    });

    newSocket.on(SOCKET_EVENTS.CALL_REJECT, () => {
      setIncomingCall(null);
      setActiveCall(null);
    });

    newSocket.on(SOCKET_EVENTS.CALL_ACCEPT, (session: CallSessionDto) => {
      setActiveCall(session);
      setIncomingCall(null);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  const initiateCall = useCallback(
    async (receiverId: string, type: CallType): Promise<CallSessionDto | null> => {
      const res = await apiService.calls.initiate(receiverId, type);
      if (res.data) {
        setActiveCall(res.data);
        return res.data;
      }
      return null;
    },
    []
  );

  const acceptCall = useCallback(async (callId: string): Promise<void> => {
    const res = await apiService.calls.updateStatus(callId, 'ACCEPTED');
    if (res.data) {
      setActiveCall(res.data);
      setIncomingCall(null);
      if (socketRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.CALL_ACCEPT, { callId });
      }
    }
  }, []);

  const rejectCall = useCallback(async (callId: string): Promise<void> => {
    await apiService.calls.updateStatus(callId, 'REJECTED');
    setIncomingCall(null);
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.CALL_REJECT, { callId });
    }
  }, []);

  const endCall = useCallback(async (callId: string): Promise<void> => {
    await apiService.calls.end(callId);
    setActiveCall(null);
    setIncomingCall(null);
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.CALL_END, { callId });
    }
  }, []);

  const clearActiveCall = useCallback(() => {
    setActiveCall(null);
    setIncomingCall(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
        incomingCall,
        activeCall,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        clearActiveCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
