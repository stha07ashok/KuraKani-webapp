"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { Loader2 } from "lucide-react";
import SearchPanel from "@/components/Chat/SearchPanel";
import RequestList from "@/components/Chat/RequestList";
import MessageRequestList from "@/components/Chat/MessageRequestList";
import ChatArea from "@/components/Chat/ChatArea";
import ChatSidebar from "@/components/Chat/ChatSidebar";
import ChatEmptyState from "@/components/Chat/ChatEmptyState";
import NotificationToast from "@/components/Chat/NotificationToast";
import type { SearchedUser, Friend, PendingRequest, MessageData, MessageRequestGroup, ToastNotification } from "@/types/chat";

type SidebarView = 'chats' | 'search' | 'friendRequests' | 'messageRequests';

export default function ChatPage() {
  const router = useRouter();
  const { user, loading, signOut, getToken } = useAuth();
  const socketRef = useRef<any>(null);
  const friendsRef = useRef<Friend[]>([]);
  const selectedFriendRef = useRef<Friend | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [sidebarView, setSidebarView] = useState<SidebarView>('chats');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  friendsRef.current = friends;
  selectedFriendRef.current = selectedFriend;
  const [friendsLoading, setFriendsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [messageRequests, setMessageRequests] = useState<MessageRequestGroup[]>([]);

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [toast, setToast] = useState<ToastNotification | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await getToken();
      if (!token) return;
      const socket = getSocket(token);
      socketRef.current = socket;

      socket.on("new_message", (msg: MessageData) => {
        const curFriend = selectedFriendRef.current;
        if (curFriend && msg.senderId === curFriend.id) {
          setMessages((prev) => [...prev, msg]);
          socket.emit("mark_as_read", { friendId: curFriend.id });
        } else {
          setUnreadCounts((prev) => ({ ...prev, [msg.senderId]: (prev[msg.senderId] || 0) + 1 }));
          const friend = friendsRef.current.find((f) => f.id === msg.senderId);
          if (friend) {
            setToast({ id: msg.id, senderId: msg.senderId, senderName: friend.name, senderPicture: friend.profilePicture, content: msg.content });
          }
        }
      });

      socket.on("message_sent", (msg: MessageData) => {
        setMessages((prev) => {
          const hasTempMessage = prev.some((m) => m.senderId === msg.senderId && m.content === msg.content && m.id !== msg.id);
          if (hasTempMessage) {
            return prev.map((m) => (m.senderId === msg.senderId && m.content === msg.content && m.id !== msg.id) ? msg : m);
          }
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      socket.on("messages_read", (data: { readerId: number }) => {
        const curFriend = selectedFriendRef.current;
        if (!curFriend || data.readerId !== curFriend.id) return;
        setMessages((prev) => prev.map((msg) => (
          msg.senderId === user.id && msg.receiverId === data.readerId && !msg.readAt
            ? { ...msg, readAt: new Date().toISOString() }
            : msg
        )));
      });

      socket.on("message_unsent", (data: { messageId: number; mode: 'me' | 'everyone' }) => {
        setMessages((prev) =>
          data.mode === 'everyone'
            ? prev.map((msg) =>
                msg.id === data.messageId
                  ? { ...msg, deletedAt: new Date().toISOString(), content: 'This message was unsent' }
                  : msg
              )
            : prev.filter((msg) => msg.id !== data.messageId)
        );
      });

      socket.on('message_unsent_hidden', (data: { messageId: number }) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      });

      socket.on('message_edited', (data: { messageId: number; content: string; editedAt: string }) => {
        setMessages((prev) => prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, content: data.content, editedAt: data.editedAt } : msg
        ));
      });

      socket.on('message_deleted', (data: { messageId: number }) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      });
    })();
    return () => disconnectSocket();
  }, [user, getToken]);

  const apiFetch = useCallback(async (url: string, options?: RequestInit) => {
    const token = await getToken();
    if (!token) return null;
    const res = await fetch(url, {
      ...options,
      headers: { ...options?.headers, "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return res.json();
  }, [getToken]);

  const fetchFriends = useCallback(async () => {
    setFriendsLoading(true);
    const data = await apiFetch("/api/friend-requests/friends");
    if (data) setFriends(data);
    setFriendsLoading(false);
  }, [apiFetch]);

  const fetchPendingRequests = useCallback(async () => {
    const data = await apiFetch("/api/friend-requests/pending");
    if (data) setPendingRequests(data);
  }, [apiFetch]);

  const fetchMessageRequests = useCallback(async () => {
    const data = await apiFetch("/api/messages/requests");
    if (data) setMessageRequests(data);
  }, [apiFetch]);

  const fetchUnreadCounts = useCallback(async () => {
    const data = await apiFetch("/api/messages/unread/counts");
    if (data) setUnreadCounts(data);
  }, [apiFetch]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingRequests();
      fetchMessageRequests();
      fetchUnreadCounts();
    }
  }, [user, fetchFriends, fetchPendingRequests, fetchMessageRequests, fetchUnreadCounts]);

  const doSearch = useCallback(async (q: string) => {
    setSearchLoading(true);
    setSearchDone(false);
    const data = await apiFetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const uniqueResults = (data ?? []).filter((item: SearchedUser, index: number, self: SearchedUser[]) => self.findIndex((u) => u.id === item.id) === index);
    setSearchResults(uniqueResults);
    setSearchDone(true);
    setSearchLoading(false);
  }, [apiFetch]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setSearchResults([]); setSearchDone(false); return; }
    setSidebarView('search');
    searchTimerRef.current = setTimeout(() => doSearch(q), 300);
  }, [doSearch]);

  useEffect(() => {
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, []);

  const handleSendRequest = async (receiverId: number) => {
    const data = await apiFetch("/api/friend-requests", {
      method: "POST",
      body: JSON.stringify({ receiverId }),
    });
    if (data) {
      setSearchResults((prev) =>
        prev.map((u) => u.id === receiverId ? { ...u, friendshipStatus: 'pending_sent' as const } : u)
      );
    }
  };

  const handleAccept = async (requestId: number) => {
    await apiFetch(`/api/friend-requests/${requestId}/accept`, { method: "PUT" });
    fetchPendingRequests();
    fetchFriends();
  };

  const handleReject = async (requestId: number) => {
    await apiFetch(`/api/friend-requests/${requestId}/reject`, { method: "PUT" });
    fetchPendingRequests();
  };

  const selectFriend = async (friend: { id: number; name: string; email: string; profilePicture?: string }) => {
    setSelectedFriend(friend as Friend);
    setSidebarView('chats');
    setSearchQuery('');
    setSearchResults([]);
    setSearchDone(false);
    setMessagesLoading(true);
    setUnreadCounts((prev) => ({ ...prev, [friend.id]: 0 }));
    const data = await apiFetch(`/api/messages/${friend.id}`);
    if (data) setMessages(data);
    setMessagesLoading(false);
    if (socketRef.current) {
      socketRef.current.emit('mark_as_read', { friendId: friend.id });
    }
  };

  const handleUnsendMessage = (messageId: number, mode: 'me' | 'everyone') => {
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
    socketRef.current.emit('unsend_message', { messageId, mode });
  };

  const handleHideUnsent = (messageId: number) => {
    if (!socketRef.current) return;
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    socketRef.current.emit('hide_unsent_message', { messageId });
  };

  const handleSendMessage = (content: string, replyToMessageId?: number | null) => {
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
    socketRef.current.emit("send_message", { receiverId: selectedFriend.id, content, replyToMessageId });
  };

  const handleEditMessage = (messageId: number, content: string) => {
    setMessages((prev) => prev.map((msg) =>
      msg.id === messageId ? { ...msg, content, editedAt: new Date().toISOString() } : msg
    ));
    socketRef.current?.emit('edit_message', { messageId, content });
  };

  const handleToastClick = (senderId: number) => {
    setToast(null);
    const friend = friends.find((f) => f.id === senderId);
    if (friend) selectFriend(friend);
  };

  const handleSidebarSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setSearchResults([]); setSearchDone(false); return; }
    searchTimerRef.current = setTimeout(() => doSearch(q), 300);
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  const backToChats = () => { setSidebarView('chats'); setSearchQuery(''); setSearchResults([]); };

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
            onSelect={selectFriend}
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
            onSelectFriend={selectFriend}
            onSelectUser={selectFriend}
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
            loading={messagesLoading}
            currentUserId={user.id}
            onSend={handleSendMessage}
            onUnsend={handleUnsendMessage}
            onHideUnsent={handleHideUnsent}
            onEdit={handleEditMessage}
            onBack={() => setSelectedFriend(null)}
          />
        ) : (
          <ChatEmptyState view={sidebarView} />
        )}
      </section>
      <NotificationToast notification={toast} onClose={() => setToast(null)} onClick={handleToastClick} />
    </main>
  );
}
