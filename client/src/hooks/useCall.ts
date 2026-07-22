"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

interface CallState {
  status: CallStatus;
  type: CallType | null;
  peerId: number | null;
  peerName: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

type MediaErrorType = 'no-device' | 'permission-denied' | 'unknown';

interface UseCallOptions {
  userId: number;
  socket: any;
  onIncomingCall?: (data: { callerId: number; callerName: string; type: CallType }) => void;
  onMediaError?: (error: MediaErrorType) => void;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useCall({ userId, socket, onIncomingCall, onMediaError }: UseCallOptions) {
  const [callState, setCallState] = useState<CallState>({
    status: 'idle', type: null, peerId: null, peerName: '',
    isMuted: false, isVideoOff: false, isScreenSharing: false,
  });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingOfferRef = useRef<any>(null);
  const peerIdRef = useRef<number | null>(null);

  const endCallCleanup = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    remoteStreamRef.current?.getTracks().forEach((t) => t.stop());
    remoteStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
    screenStreamRef.current = null;
    pendingOfferRef.current = null;
    peerIdRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setCallState({ status: 'idle', type: null, peerId: null, peerName: '', isMuted: false, isVideoOff: false, isScreenSharing: false });
  }, []);

  const checkMediaDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return true;
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(d => d.kind === 'audioinput');
  }, []);

  const getMedia = useCallback(async (type: CallType) => {
    const hasDevices = await checkMediaDevices();
    if (!hasDevices) {
      onMediaError?.('no-device');
      return null;
    }
    try {
      const constraints: MediaStreamConstraints = { audio: true };
      if (type === 'video') {
        constraints.video = { width: { ideal: 1280 }, height: { ideal: 720 } };
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch {
      if (type === 'video') {
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = audioOnly;
          setLocalStream(audioOnly);
          return audioOnly;
        } catch { return null; }
      }
      return null;
    }
  }, [checkMediaDevices, onMediaError]);

  const createPC = useCallback((stream: MediaStream, peerId: number, peerVideoTrack?: MediaStreamTrack | null) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;
    peerIdRef.current = peerId;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    if (!peerVideoTrack) {
      pc.addTransceiver('video', { direction: 'inactive' });
    }

    pc.ontrack = (event) => {
      if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream();
      remoteStreamRef.current.addTrack(event.track);
      setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice_candidate', { receiverId: peerId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCallCleanup();
      }
    };

    return pc;
  }, [socket, endCallCleanup]);

  const startCall = useCallback(async (peerId: number, peerName: string, type: CallType) => {
    const stream = await getMedia(type);
    if (!stream) return;

    setCallState({ status: 'calling', type, peerId, peerName, isMuted: false, isVideoOff: false, isScreenSharing: false });
    const pc = createPC(stream, peerId, stream.getVideoTracks()[0]);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.emit('offer', { receiverId: peerId, offer });
    } catch {
      endCallCleanup();
    }

    socket?.emit('call_user', { receiverId: peerId, type });
  }, [getMedia, createPC, socket, endCallCleanup]);

  const acceptCall = useCallback(async (callerId: number, type: CallType) => {
    const stream = await getMedia(type);
    if (!stream) return;

    const pc = createPC(stream, callerId, stream.getVideoTracks()[0]);

    if (pendingOfferRef.current) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket?.emit('answer', { receiverId: callerId, answer });
      } catch {
        endCallCleanup();
        return;
      }
      pendingOfferRef.current = null;
    }

    setCallState({ status: 'connected', type, peerId: callerId, peerName: callState.peerName, isMuted: false, isVideoOff: false, isScreenSharing: false });
    socket?.emit('accept_call', { callerId });
  }, [getMedia, createPC, socket, endCallCleanup, callState.peerName]);

  const rejectCall = useCallback((callerId: number) => {
    socket?.emit('reject_call', { callerId });
    endCallCleanup();
  }, [socket, endCallCleanup]);

  const endCall = useCallback(() => {
    if (peerIdRef.current) {
      socket?.emit('end_call', { receiverId: peerIdRef.current });
    }
    endCallCleanup();
  }, [socket, endCallCleanup]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState((prev) => ({ ...prev, isMuted: !audioTrack.enabled }));
        if (peerIdRef.current) {
          socket?.emit('toggle_mute', { receiverId: peerIdRef.current, kind: 'audio', muted: !audioTrack.enabled });
        }
      }
    }
  }, [socket]);

  const toggleVideo = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCallState((prev) => ({ ...prev, isVideoOff: !videoTrack.enabled }));
      if (peerIdRef.current) {
        socket?.emit('toggle_mute', { receiverId: peerIdRef.current, kind: 'video', muted: !videoTrack.enabled });
      }
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
        const newTrack = newStream.getVideoTracks()[0];
        if (newTrack) {
          stream.addTrack(newTrack);
          const pc = pcRef.current;
          if (pc) {
            pc.addTrack(newTrack, stream);
          }
          setCallState((prev) => ({ ...prev, isVideoOff: false, type: 'video' }));
          if (peerIdRef.current) {
            socket?.emit('toggle_mute', { receiverId: peerIdRef.current, kind: 'video', muted: false });
          }
        }
      } catch { /* user denied camera */ }
    }
  }, [socket]);

  const toggleScreenShare = useCallback(async () => {
    const peerId = peerIdRef.current;
    if (!peerId) return;

    if (callState.isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      const stream = localStreamRef.current;
      if (stream) {
        const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === 'video');
        const videoTrack = stream.getVideoTracks()[0];
        if (sender && videoTrack) await sender.replaceTrack(videoTrack);
      }
      setCallState((prev) => ({ ...prev, isScreenSharing: false }));
      socket?.emit('toggle_screen_share', { receiverId: peerId, active: false });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStreamRef.current = screenStream;
        const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === 'video');
        const [videoTrack] = screenStream.getVideoTracks();
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
          videoTrack.onended = () => { if (callState.isScreenSharing) toggleScreenShare(); };
        }
        setCallState((prev) => ({ ...prev, isScreenSharing: true }));
        socket?.emit('toggle_screen_share', { receiverId: peerId, active: true });
      } catch { /* user cancelled */ }
    }
  }, [callState.isScreenSharing, socket]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (peerIdRef.current) {
        socket?.emit('end_call', { receiverId: peerIdRef.current });
      }
      endCallCleanup();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [socket, endCallCleanup]);

  useEffect(() => {
    if (!socket) return;

    const onOffer = async (data: { offer: any; senderId: number }) => {
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socket.emit('answer', { receiverId: data.senderId, answer });
          setCallState((prev) => ({ ...prev, status: 'connected' }));
        } catch { /* ignore */ }
      } else {
        pendingOfferRef.current = data.offer;
        setCallState((prev) => ({ ...prev, peerName: prev.peerName || `User ${data.senderId}` }));
      }
    };

    const onAnswer = async (data: { answer: any }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        setCallState((prev) => ({ ...prev, status: 'connected' }));
      } catch { /* ignore */ }
    };

    const onIceCandidate = async (data: { candidate: any }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch { /* ignore */ }
    };

    const onCallAccepted = () => {
      setCallState((prev) => ({ ...prev, status: 'connected' }));
    };

    const onCallRejected = () => {
      endCallCleanup();
    };

    const onCallEnded = () => {
      endCallCleanup();
    };

    const onIncomingCallEvent = (data: { callerId: number; callerName: string; type: CallType }) => {
      setCallState((prev) => ({ ...prev, status: 'idle', peerId: data.callerId, peerName: data.callerName }));
      onIncomingCall?.(data);
    };

    socket.on('offer', onOffer);
    socket.on('answer', onAnswer);
    socket.on('ice_candidate', onIceCandidate);
    socket.on('call_accepted', onCallAccepted);
    socket.on('call_rejected', onCallRejected);
    socket.on('call_ended', onCallEnded);
    socket.on('incoming_call', onIncomingCallEvent);

    return () => {
      socket.off('offer', onOffer);
      socket.off('answer', onAnswer);
      socket.off('ice_candidate', onIceCandidate);
      socket.off('call_accepted', onCallAccepted);
      socket.off('call_rejected', onCallRejected);
      socket.off('call_ended', onCallEnded);
      socket.off('incoming_call', onIncomingCallEvent);
    };
  }, [socket, endCallCleanup]);

  return {
    callState,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  };
}
