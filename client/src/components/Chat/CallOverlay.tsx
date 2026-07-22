"use client";

import { useRef, useCallback } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize, Minimize, Monitor, MonitorOff } from "lucide-react";

interface CallOverlayProps {
  status: 'calling' | 'ringing' | 'connected' | 'ended';
  type: 'audio' | 'video' | null;
  peerName: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onReject?: () => void;
  onAccept?: () => void;
}

export default function CallOverlay({
  status, type, peerName, localStream, remoteStream,
  isMuted, isVideoOff, isScreenSharing,
  onEndCall, onToggleMute, onToggleVideo, onToggleScreenShare,
  onReject, onAccept,
}: CallOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const setLocalVideo = useCallback((node: HTMLVideoElement | null) => {
    if (node) node.srcObject = localStream;
  }, [localStream]);

  const setRemoteVideo = useCallback((node: HTMLVideoElement | null) => {
    if (node) node.srcObject = remoteStream;
  }, [remoteStream]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      overlayRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const isConnected = status === 'connected';
  const isCalling = status === 'calling';
  const isRinging = status === 'ringing';
  const showLocalVideo = isCalling && type === 'video' && localStream;
  const showPiP = isConnected && localStream && !isVideoOff && localStream.getVideoTracks().length > 0;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fade-in">
      <div className="flex-1 relative flex items-center justify-center bg-slate-900 overflow-hidden">
        {isConnected && remoteStream ? (
          <video ref={setRemoteVideo} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        ) : null}

        {showLocalVideo ? (
          <video ref={setLocalVideo} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        ) : null}

        <div className="relative z-10 flex flex-col items-center gap-4 text-white">
          {!showLocalVideo && (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-3xl font-bold">
              {peerName.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-xl font-semibold">{peerName}</p>
          <p className="text-sm text-slate-400">
            {isCalling ? 'Calling...' : isRinging ? 'Incoming call...' : status === 'ended' ? 'Call ended' : 'Connected'}
          </p>
        </div>

        {showPiP ? (
          <div className="absolute top-4 right-4 w-40 h-36 rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl shadow-black/30">
            <video ref={setLocalVideo} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        ) : null}
      </div>

      <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-6 py-5 flex items-center justify-center gap-4">
        {isCalling || isRinging ? (
          <>
            <button onClick={onToggleMute} className={`p-3.5 rounded-full transition-all active:scale-95 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={onToggleVideo} className={`p-3.5 rounded-full transition-all active:scale-95 ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
            {isCalling ? (
              <button onClick={onEndCall} className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30">
                <PhoneOff className="w-6 h-6" />
              </button>
            ) : (
              <>
                {onReject && (
                  <button onClick={onReject} className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30">
                    <PhoneOff className="w-6 h-6" />
                  </button>
                )}
                {onAccept && (
                  <button onClick={onAccept} className="p-4 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/30">
                    <PhoneOff className="w-6 h-6 rotate-[135deg]" />
                  </button>
                )}
              </>
            )}
          </>
        ) : isConnected ? (
          <>
            <button onClick={onToggleMute} className={`p-3.5 rounded-full transition-all active:scale-95 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={onToggleVideo} className={`p-3.5 rounded-full transition-all active:scale-95 ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
            <button onClick={onToggleScreenShare} className={`p-3.5 rounded-full transition-all active:scale-95 ${isScreenSharing ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </button>
            <button onClick={toggleFullscreen} className="p-3.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all active:scale-95">
              {document.fullscreenElement ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button onClick={onEndCall} className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/30">
              <PhoneOff className="w-6 h-6" />
            </button>
          </>
        ) : status === 'ended' ? (
          <button onClick={onEndCall} className="px-6 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
