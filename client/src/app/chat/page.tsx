"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import SearchPanel from "@/components/Chat/SearchPanel";
import RequestList from "@/components/Chat/RequestList";
import MessageRequestList from "@/components/Chat/MessageRequestList";
import ChatArea from "@/components/Chat/ChatArea";
import ChatSidebar from "@/components/Chat/ChatSidebar";
import ChatEmptyState from "@/components/Chat/ChatEmptyState";
import NotificationToast from "@/components/Chat/NotificationToast";
import CallOverlay from "@/components/Chat/CallOverlay";
import IncomingCallDialog from "@/components/Chat/IncomingCallDialog";
import { useCall, type CallType } from "@/hooks/useCall";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useChatActions } from "@/hooks/useChatActions";
import type { Friend, MessageData, BaseUser } from "@/types/chat";

export default function ChatPage() {
  const router = useRouter();
  const { user, loading, signOut, getToken } = useAuth();

  const friendsRef = useRef<Friend[]>([]);
  const selectedFriendRef = useRef<Friend | null>(null);

  const {
    socketRef, socket, messages, setMessages,
    unreadCounts, setUnreadCounts, toast, setToast,
  } = useChatSocket({ userId: user?.id ?? 0, getToken, selectedFriendRef, friendsRef });

  const {
    sidebarView, setSidebarView,
    friends, setFriends,
    selectedFriend, setSelectedFriend,
    friendsLoading, setFriendsLoading,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    searchLoading, searchDone, setSearchDone,
    pendingRequests, setPendingRequests,
    messageRequests,
    callLogs, setCallLogs, messagesLoading,
    fetchFriends, fetchPendingRequests, fetchMessageRequests, fetchUnreadCounts: fetchUnreadCountsAction,
    doSearch, handleSearch, handleSidebarSearch,
    handleSendRequest, handleAccept, handleReject,
    selectFriend,
    handleUnsendMessage, handleHideUnsent, handleSendMessage, handleEditMessage,
    handleToastClick: handleToastClickAction, backToChats, searchTimerRef,
  } = useChatActions({ getToken, friendsRef, selectedFriendRef });

  friendsRef.current = friends;
  selectedFriendRef.current = selectedFriend;

  const [incomingCall, setIncomingCall] = useState<{ callerId: number; callerName: string; type: CallType } | null>(null);

  const {
    callState, localStream, remoteStream,
    startCall, acceptCall, rejectCall, endCall,
    toggleMute, toggleVideo, toggleScreenShare,
  } = useCall({
    userId: user?.id ?? 0,
    socket,
    onIncomingCall: (data) => setIncomingCall(data),
    onMediaError: (error) => {
      setToast({
        id: Date.now(),
        senderId: 0,
        senderName: '',
        senderPicture: undefined,
        content: error === 'no-device'
          ? 'No microphone found. Connect a microphone to make calls.'
          : 'Microphone access denied. Allow microphone permission to make calls.',
      });
    },
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingRequests();
      fetchMessageRequests();
      fetchUnreadCountsAction((data) => setUnreadCounts(data));
    }
  }, [user, fetchFriends, fetchPendingRequests, fetchMessageRequests, fetchUnreadCountsAction]);

  useEffect(() => {
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, []);

  const onSelectFriend = async (friend: BaseUser) => {
    if (toast?.senderId === friend.id) setToast(null);
    const messagesData = await selectFriend(friend, socketRef, (friendId) => {
      setUnreadCounts((prev) => ({ ...prev, [friendId]: 0 }));
    });
    if (messagesData.length > 0) {
      setMessages(messagesData);
    }
  };

  const onToastClick = (senderId: number) => {
    setToast(null);
    handleToastClickAction(senderId, onSelectFriend);
  };

  const onSendMessage = (content: string, replyToMessageId?: number | null) => {
    if (!selectedFriend || !socketRef.current || !user) return;
    const tempMessage: MessageData = {
      id: Date.now(),
      senderId: user.id,
      receiverId: selectedFriend.id,
      content,
      isMessageRequest: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      receiver: selectedFriend,
    };
    setMessages((prev) => [...prev, tempMessage]);
    handleSendMessage(socketRef, selectedFriend, content, replyToMessageId);
  };

  const onUnsendMessage = (messageId: number, mode: 'me' | 'everyone') => {
    if (!socketRef.current) return;
    setMessages((prev) =>
      mode === 'everyone'
        ? prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, deletedAt: new Date().toISOString(), content: 'This message was unsent' }
              : msg
          )
        : prev.filter((msg) => msg.id !== messageId)
    );
    handleUnsendMessage(socketRef, messageId, mode);
  };

  const onHideUnsent = (messageId: number) => {
    if (!socketRef.current) return;
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    handleHideUnsent(socketRef, messageId);
  };

  const onEditMessage = (messageId: number, content: string) => {
    setMessages((prev) => prev.map((msg) =>
      msg.id === messageId ? { ...msg, content, editedAt: new Date().toISOString() } : msg
    ));
    handleEditMessage(socketRef, messageId, content);
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="flex-1 flex min-h-0 bg-slate-50 dark:bg-slate-950 overflow-hidden animate-fade-in">
      <aside className={`${selectedFriend && sidebarView === 'chats' ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0`}>
        {sidebarView === 'search' ? (
          <SearchPanel
            searchQuery={searchQuery}
            searchResults={searchResults}
            searchLoading={searchLoading}
            searchDone={searchDone}
            onSearch={handleSidebarSearch}
            onSelect={onSelectFriend}
            onSendRequest={handleSendRequest}
            onBack={backToChats}
          />
        ) : sidebarView === 'friendRequests' ? (
          <RequestList
            pendingRequests={pendingRequests}
            onAccept={handleAccept}
            onReject={handleReject}
            onBack={backToChats}
          />
        ) : sidebarView === 'messageRequests' ? (
          <MessageRequestList
            messageRequests={messageRequests}
            onBack={backToChats}
          />
        ) : (
          <ChatSidebar
            user={user}
            searchQuery={searchQuery}
            searchResults={searchResults}
            friends={friends}
            friendsLoading={friendsLoading}
            selectedFriendId={selectedFriend?.id}
            unreadCounts={unreadCounts}
            pendingRequests={pendingRequests}
            messageRequests={messageRequests}
            onSearch={handleSearch}
            onSelectFriend={onSelectFriend}
            onSelectUser={onSelectFriend}
            onSendRequest={handleSendRequest}
            onViewFriendRequests={() => { setSidebarView('friendRequests'); fetchPendingRequests(); }}
            onViewMessageRequests={() => { setSidebarView('messageRequests'); fetchMessageRequests(); }}
            onSignOut={signOut}
          />
        )}
      </aside>

      <section className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
        {selectedFriend && sidebarView === 'chats' ? (
          <ChatArea
            friend={selectedFriend}
            messages={messages}
            callLogs={callLogs}
            loading={messagesLoading}
            currentUserId={user.id}
            onSend={onSendMessage}
            onUnsend={onUnsendMessage}
            onHideUnsent={onHideUnsent}
            onEdit={onEditMessage}
            onBack={() => setSelectedFriend(null)}
            onAudioCall={() => startCall(selectedFriend.id, selectedFriend.name, 'audio')}
            onVideoCall={() => startCall(selectedFriend.id, selectedFriend.name, 'video')}
          />
        ) : (
          <ChatEmptyState view={sidebarView} />
        )}
      </section>
      <NotificationToast notification={toast} onClose={() => setToast(null)} onClick={onToastClick} />

      {callState.status !== 'idle' && (
        <CallOverlay
          status={callState.status}
          type={callState.type}
          peerName={callState.peerName}
          localStream={localStream}
          remoteStream={remoteStream}
          isMuted={callState.isMuted}
          isVideoOff={callState.isVideoOff}
          isScreenSharing={callState.isScreenSharing}
          onEndCall={endCall}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
        />
      )}

      {incomingCall && (
        <IncomingCallDialog
          callerName={incomingCall.callerName}
          callType={incomingCall.type}
          onAccept={() => { acceptCall(incomingCall.callerId, incomingCall.type); setIncomingCall(null); }}
          onReject={() => { rejectCall(incomingCall.callerId); setIncomingCall(null); }}
        />
      )}
    </main>
  );
}
