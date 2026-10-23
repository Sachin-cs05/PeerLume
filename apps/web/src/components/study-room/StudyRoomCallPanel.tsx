import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, PhoneCall, Volume2 } from 'lucide-react';
import type { StudyRoomParticipantDto } from '@peerlume/shared';

interface StudyRoomCallPanelProps {
  roomId: string;
  participants: StudyRoomParticipantDto[];
  currentUserId: string;
}

export const StudyRoomCallPanel: React.FC<StudyRoomCallPanelProps> = ({
  roomId: _roomId,
  participants,
  currentUserId,
}) => {
  const [inCall, setInCall] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const startMedia = async (video: boolean, audio: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 320, height: 240 } : false,
        audio,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current && video) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Unable to acquire media devices:', err);
    }
  };

  const stopMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const handleJoinCall = async () => {
    setInCall(true);
    await startMedia(videoEnabled, micEnabled);
  };

  const handleLeaveCall = () => {
    stopMedia();
    setInCall(false);
  };

  const handleToggleMic = () => {
    const next = !micEnabled;
    setMicEnabled(next);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = next));
    }
  };

  const handleToggleVideo = async () => {
    const next = !videoEnabled;
    setVideoEnabled(next);
    if (inCall) {
      if (next) {
        await startMedia(true, micEnabled);
      } else {
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-slate-800 dark:text-slate-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-semibold">Study Room Audio / Video</h2>
        </div>
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${inCall ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
          {inCall ? 'Call Active' : 'Idle'}
        </span>
      </div>

      {inCall ? (
        <div className="space-y-3">
          {/* Active Participants Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Self Video / Tile */}
            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
              {videoEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                  You
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-white font-medium flex items-center gap-1">
                <span>You</span>
                {!micEnabled && <MicOff className="w-2.5 h-2.5 text-rose-400" />}
              </div>
            </div>

            {/* Other Participant Placeholders */}
            {participants
              .filter((p) => p.userId !== currentUserId)
              .slice(0, 3)
              .map((p) => (
                <div
                  key={p.userId}
                  className="relative aspect-video bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {p.user?.fullName?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div className="absolute bottom-1.5 left-2 text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-white font-medium">
                    {p.user?.fullName?.split(' ')[0] || 'Peer'}
                  </div>
                </div>
              ))}
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleToggleMic}
              className={`p-2.5 rounded-xl border transition-colors ${
                micEnabled
                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'
                  : 'bg-rose-500 text-white border-rose-600'
              }`}
              title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
              aria-label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={handleToggleVideo}
              className={`p-2.5 rounded-xl border transition-colors ${
                videoEnabled
                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
              }`}
              title={videoEnabled ? 'Turn camera off' : 'Turn camera on'}
              aria-label={videoEnabled ? 'Turn camera off' : 'Turn camera on'}
            >
              {videoEnabled ? <Video className="w-4 h-4 text-emerald-500" /> : <VideoOff className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLeaveCall}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
              title="Leave audio/video call"
              aria-label="Leave audio video call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Leave Call</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-3 text-center">
          <p className="text-xs text-slate-500 mb-3">
            Start or join an in-room voice/video discussion while working on the whiteboard.
          </p>
          <button
            onClick={handleJoinCall}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Join Room Call</span>
          </button>
        </div>
      )}
    </div>
  );
};
