import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext.js';
import { SOCKET_EVENTS } from '@peerlume/shared';
import type { CallSessionDto, WebRtcSignalPayload, IceServerConfig } from '@peerlume/shared';
import { apiService } from '../services/api.js';

interface UseWebRTCOptions {
  callSession: CallSessionDto;
  isCaller: boolean;
  onCallEnded?: () => void;
}

export function useWebRTC({ callSession, isCaller, onCallEnded }: UseWebRTCOptions) {
  const { socket } = useSocket();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(callSession.type === 'AUDIO');
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<string>('connecting');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

  const targetUserId = isCaller ? callSession.receiverId : callSession.callerId;

  // Cleanup media tracks and peer connection
  const cleanup = useCallback(() => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsScreenSharing(false);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function initializeConnection() {
      try {
        setPermissionError(null);

        // 1. Get ICE servers from backend
        let iceServers: IceServerConfig[] = [{ urls: 'stun:stun.l.google.com:19302' }];
        try {
          const configRes = await apiService.calls.getIceConfig();
          if (configRes.data?.iceServers && configRes.data.iceServers.length > 0) {
            iceServers = configRes.data.iceServers;
          }
        } catch {
          // Use default STUN fallback
        }

        if (isCancelled) return;

        // 2. Request user media (audio/video)
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callSession.type === 'VIDEO',
          });
        } catch {
          if (callSession.type === 'VIDEO') {
            // Fallback to audio only if video device is unavailable
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              setIsVideoDisabled(true);
            } catch {
              setPermissionError('Microphone permission denied or device unavailable.');
              return;
            }
          } else {
            setPermissionError('Microphone permission denied or device unavailable.');
            return;
          }
        }


        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // 3. Create RTCPeerConnection
        const pc = new RTCPeerConnection({
          iceServers: iceServers as RTCIceServer[],
        });
        peerConnectionRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          } else {
            const inboundStream = new MediaStream();
            inboundStream.addTrack(event.track);
            setRemoteStream(inboundStream);
          }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          setConnectionState(pc.connectionState);
          if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
            onCallEnded?.();
          }
        };

        // Send local ICE candidates to remote peer via Socket.IO
        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit(SOCKET_EVENTS.CALL_ICE_CANDIDATE, {
              callId: callSession.id,
              senderId: isCaller ? callSession.callerId : callSession.receiverId,
              receiverId: targetUserId,
              candidate: event.candidate.toJSON(),
            });
          }
        };

        // If caller, create and send SDP offer
        if (isCaller) {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: callSession.type === 'VIDEO',
          });
          await pc.setLocalDescription(offer);

          if (socket) {
            socket.emit(SOCKET_EVENTS.CALL_OFFER, {
              callId: callSession.id,
              senderId: callSession.callerId,
              receiverId: targetUserId,
              sdp: offer,
            });
          }
        }
      } catch (err: any) {
        setPermissionError(err.message || 'Failed to initialize WebRTC call connection.');
      }
    }

    initializeConnection();

    return () => {
      isCancelled = true;
      cleanup();
    };
  }, [callSession.id, callSession.type, isCaller, targetUserId, socket, cleanup, onCallEnded]);

  // Handle Socket Signaling Events (Answer, Offer, ICE Candidates)
  useEffect(() => {
    if (!socket) return;

    // Handle SDP Offer (for receiver)
    const handleRemoteOffer = async (payload: WebRtcSignalPayload) => {
      if (payload.callId !== callSession.id || !peerConnectionRef.current || !payload.sdp) return;

      const pc = peerConnectionRef.current;
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

      // Process any queued ICE candidates
      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        if (candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }

      // Create and send SDP Answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit(SOCKET_EVENTS.CALL_ANSWER, {
        callId: callSession.id,
        senderId: isCaller ? callSession.callerId : callSession.receiverId,
        receiverId: targetUserId,
        sdp: answer,
      });
    };

    // Handle SDP Answer (for caller)
    const handleRemoteAnswer = async (payload: WebRtcSignalPayload) => {
      if (payload.callId !== callSession.id || !peerConnectionRef.current || !payload.sdp) return;

      const pc = peerConnectionRef.current;
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));

      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        if (candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    };

    // Handle Remote ICE Candidate
    const handleRemoteIceCandidate = async (payload: WebRtcSignalPayload) => {
      if (payload.callId !== callSession.id || !payload.candidate) return;

      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {
          // Ignore candidate errors
        }
      } else {
        iceCandidatesQueue.current.push(payload.candidate);
      }
    };

    socket.on(SOCKET_EVENTS.CALL_OFFER, handleRemoteOffer);
    socket.on(SOCKET_EVENTS.CALL_ANSWER, handleRemoteAnswer);
    socket.on(SOCKET_EVENTS.CALL_ICE_CANDIDATE, handleRemoteIceCandidate);

    return () => {
      socket.off(SOCKET_EVENTS.CALL_OFFER, handleRemoteOffer);
      socket.off(SOCKET_EVENTS.CALL_ANSWER, handleRemoteAnswer);
      socket.off(SOCKET_EVENTS.CALL_ICE_CANDIDATE, handleRemoteIceCandidate);
    };
  }, [socket, callSession.id, isCaller, targetUserId]);

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Video Toggle
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoDisabled(!videoTrack.enabled);
      }
    }
  }, []);

  // Screen Share Toggle
  const toggleScreenShare = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    if (isScreenSharing) {
      // Stop screen share and revert to camera track
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }

      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      }
      setIsScreenSharing(false);
    } else {
      // Start screen share
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          // Revert when user clicks native "Stop sharing" bar
          if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (sender && videoTrack) {
              sender.replaceTrack(videoTrack);
            }
          }
          setIsScreenSharing(false);
          screenTrackRef.current = null;
        };

        setIsScreenSharing(true);
      } catch {
        // User cancelled display media prompt
      }
    }
  }, [isScreenSharing]);

  return {
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
    cleanup,
  };
}
