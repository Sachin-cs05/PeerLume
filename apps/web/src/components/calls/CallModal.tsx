import React, { useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Share2,
  AlertCircle,
  Wifi,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useWebRTC } from '../../hooks/useWebRTC.js';

export const CallModal: React.FC = () => {
  const { user } = useAuth();
  const { activeCall, endCall } = useSocket();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  if (!activeCall) return null;

  const isCaller = activeCall.callerId === user?.id;
  const partnerName = isCaller ? activeCall.receiverName : activeCall.callerName;

  const {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoDisabled,
    isScreenSharing,
    connectionState,
    permissionError,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTC({
    callSession: activeCall,
    isCaller,
    onCallEnded: () => endCall(activeCall.id),
  });

  // Attach local media stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote media stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[720px] bg-[#09090B] rounded-xl overflow-hidden shadow-2xl flex flex-col border border-border">
        {/* Header Bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-xs">
              {partnerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs sm:text-sm leading-tight">
                {partnerName}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="capitalize">{connectionState}</span>
                <span>•</span>
                <span>{activeCall.type} Call</span>
              </div>
            </div>
          </div>

          {/* Screen Share Badge */}
          {isScreenSharing && (
            <span className="bg-white text-black text-[11px] px-2.5 py-1 rounded-full font-semibold">
              Sharing Screen
            </span>
          )}
        </div>

        {/* Permission Error Banner */}
        {permissionError && (
          <div className="absolute top-16 inset-x-4 z-20 bg-neutral-900 border border-rose-500/40 text-rose-300 px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Video Stage Container */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* Remote Video Tile */}
          {remoteStream && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Remote Avatar Placeholder (if audio call or video pending) */}
          {(!remoteStream || activeCall.type === 'AUDIO') && (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                {partnerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{partnerName}</p>
                <p className="text-neutral-400 text-xs">
                  {connectionState === 'connected' ? 'Connected' : 'Establishing peer connection...'}
                </p>
              </div>
            </div>
          )}

          {/* Local Video Tile (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 z-10 w-28 sm:w-40 aspect-video bg-neutral-900 rounded-lg overflow-hidden shadow-xl border border-neutral-700">
            {localStream && !isVideoDisabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-400 text-xs">
                <VideoOff className="w-4 h-4 mb-1" />
                <span>Camera off</span>
              </div>
            )}
          </div>
        </div>

        {/* Call Controls Bar */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-black/95 to-black/60 flex items-center justify-center gap-3 sm:gap-4 border-t border-neutral-800">
          {/* Mute/Unmute Mic */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              isAudioMuted
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
            }`}
            title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              isVideoDisabled
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
            }`}
            title={isVideoDisabled ? 'Turn camera on' : 'Turn camera off'}
          >
            {isVideoDisabled ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
          </button>

          {/* Screen Share Toggle */}
          <button
            type="button"
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              isScreenSharing
                ? 'bg-white text-black'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
            }`}
            title={isScreenSharing ? 'Stop screen sharing' : 'Share your screen'}
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={() => endCall(activeCall.id)}
            className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md cursor-pointer"
            title="End call"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
