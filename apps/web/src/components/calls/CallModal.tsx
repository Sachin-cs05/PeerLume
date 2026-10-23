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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[750px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-800">
        {/* Header Bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {partnerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm leading-tight">
                {partnerName}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-gray-300">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="capitalize">{connectionState}</span>
                <span>•</span>
                <span>{activeCall.type} Call</span>
              </div>
            </div>
          </div>

          {/* Screen Share Badge */}
          {isScreenSharing && (
            <span className="bg-blue-500/80 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
              Sharing Screen
            </span>
          )}
        </div>

        {/* Permission Error Banner */}
        {permissionError && (
          <div className="absolute top-16 inset-x-4 z-20 bg-amber-500/90 text-white px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg backdrop-blur-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
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
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-blue-500/30 animate-pulse shadow-xl">
                {partnerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-base font-medium">{partnerName}</p>
                <p className="text-gray-400 text-xs">
                  {connectionState === 'connected' ? 'Connected' : 'Establishing peer connection...'}
                </p>
              </div>
            </div>
          )}

          {/* Local Video Tile (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 z-10 w-28 sm:w-44 aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
            {localStream && !isVideoDisabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400 text-xs">
                <VideoOff className="w-4 h-4 mb-1" />
                <span>Camera off</span>
              </div>
            )}
          </div>
        </div>

        {/* Call Controls Bar */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex items-center justify-center gap-4 sm:gap-6">
          {/* Mute/Unmute Mic */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`p-3.5 rounded-full transition-all shadow-lg ${
              isAudioMuted
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleVideo}
            className={`p-3.5 rounded-full transition-all shadow-lg ${
              isVideoDisabled
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isVideoDisabled ? 'Turn camera on' : 'Turn camera off'}
          >
            {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
          </button>

          {/* Screen Share Toggle */}
          <button
            type="button"
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-full transition-all shadow-lg ${
              isScreenSharing
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isScreenSharing ? 'Stop screen sharing' : 'Share your screen'}
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={() => endCall(activeCall.id)}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg hover:scale-105 ring-4 ring-red-500/20"
            title="End call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
