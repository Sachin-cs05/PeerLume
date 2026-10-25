import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useSocket } from '../../context/SocketContext.js';

export const IncomingCallDialog: React.FC = () => {
  const { incomingCall, acceptCall, rejectCall } = useSocket();
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Synthesize gentle soft ringtone using Web Audio API
  useEffect(() => {
    if (!incomingCall) {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const playChime = () => {
        if (!ctx || ctx.state === 'closed') return;
        const now = ctx.currentTime;

        // Tone 1: 440 Hz (A4)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        gain1.gain.setValueAtTime(0.08, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // Tone 2: 587.33 Hz (D5)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(587.33, now + 0.18);
        gain2.gain.setValueAtTime(0.09, now + 0.18);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.18);
        osc2.stop(now + 0.65);
      };

      // Play immediate first chime, then loop every 2.4s
      playChime();
      ringIntervalRef.current = setInterval(playChime, 2400);
    } catch {
      // Audio autoplay policy fallback
    }

    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [incomingCall]);

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
