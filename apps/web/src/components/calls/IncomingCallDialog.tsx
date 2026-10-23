import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useSocket } from '../../context/SocketContext.js';

export const IncomingCallDialog: React.FC = () => {
  const { incomingCall, acceptCall, rejectCall } = useSocket();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100 flex flex-col items-center">
        {/* Pulsing Avatar */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-blue-100 animate-pulse overflow-hidden">
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
          <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full shadow">
            {incomingCall.type === 'VIDEO' ? (
              <Video className="w-4 h-4" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {incomingCall.callerName}
        </h3>
        <p className="text-xs text-gray-500 mb-6 animate-pulse">
          Incoming {incomingCall.type.toLowerCase()} call...
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 w-full">
          {/* Decline Button */}
          <button
            type="button"
            onClick={() => rejectCall(incomingCall.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 group-hover:bg-red-200 text-red-600 flex items-center justify-center transition-all shadow-md group-hover:scale-105">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-600">Decline</span>
          </button>

          {/* Accept Button */}
          <button
            type="button"
            onClick={() => acceptCall(incomingCall.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-lg hover:scale-105 ring-4 ring-emerald-100 animate-bounce">
              {incomingCall.type === 'VIDEO' ? (
                <Video className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </div>
            <span className="text-xs font-semibold text-emerald-600">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
