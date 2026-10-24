import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useSocket } from '../../context/SocketContext.js';

export const IncomingCallDialog: React.FC = () => {
  const { incomingCall, acceptCall, rejectCall } = useSocket();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-card text-foreground rounded-xl shadow-2xl max-w-sm w-full p-6 text-center border border-border flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-surface-hover border border-border flex items-center justify-center text-foreground text-xl font-bold overflow-hidden shadow-xs">
            {incomingCall.callerAvatar ? (
              <img
                src={incomingCall.callerAvatar}
                alt={incomingCall.callerName}
                className="w-full h-full object-cover"
              />
            ) : (
              incomingCall.callerName.slice(0, 2).toUpperCase()
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 bg-foreground text-background p-1 rounded-full shadow-xs">
            {incomingCall.type === 'VIDEO' ? (
              <Video className="w-3.5 h-3.5" />
            ) : (
              <Phone className="w-3.5 h-3.5" />
            )}
          </span>
        </div>

        <h3 className="text-base font-bold text-foreground mb-0.5">
          {incomingCall.callerName}
        </h3>
        <p className="text-xs text-foreground-muted mb-6">
          Incoming {incomingCall.type.toLowerCase()} call...
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 w-full">
          {/* Decline Button */}
          <button
            type="button"
            onClick={() => rejectCall(incomingCall.id)}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-surface-hover group-hover:bg-rose-500/10 text-foreground-secondary group-hover:text-rose-500 border border-border flex items-center justify-center transition-all shadow-xs">
              <PhoneOff className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-foreground-muted">Decline</span>
          </button>

          {/* Accept Button */}
          <button
            type="button"
            onClick={() => acceptCall(incomingCall.id)}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-foreground text-background hover:opacity-90 flex items-center justify-center transition-all shadow-xs">
              {incomingCall.type === 'VIDEO' ? (
                <Video className="w-5 h-5" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
            </div>
            <span className="text-xs font-semibold text-foreground">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
