"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSocket, disconnectSocket } from "@/lib/socket";
import {
  Search, MessageCircle, LogOut, UserPlus, Mail, Loader2,
} from "lucide-react";
import UserAvatar from "@/components/Chat/UserAvatar";
import SearchPanel from "@/components/Chat/SearchPanel";
import FriendList from "@/components/Chat/FriendList";
import RequestList from "@/components/Chat/RequestList";
import MessageRequestList from "@/components/Chat/MessageRequestList";
import ChatArea from "@/components/Chat/ChatArea";
import SearchSuggestions from "@/components/Chat/SearchSuggestions";

interface SearchedUser {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends';
}

interface Friend {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  friendRequestId: number;
}

interface PendingRequest {
  id: number;
  senderId: number;
  status: string;
  sender: { id: number; name: string; email: string; profilePicture?: string };
  createdAt: string;
}

interface MessageData {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isMessageRequest: boolean;
  readAt: string | null;
  createdAt: string;
  sender?: { id: number; name: string; email: string; profilePicture?: string };
  receiver?: { id: number; name: string; email: string; profilePicture?: string };
}

interface MessageRequestGroup {
  sender: { id: number; name: string; email: string; profilePicture?: string };
  messages: MessageData[];
}

type SidebarView = 'chats' | 'search' | 'friendRequests' | 'messageRequests';

export default function ChatPage() {
  const router = useRouter();
  const { user, loading, signOut, getToken } = useAuth();
  const socketRef = useRef<any>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [sidebarView, setSidebarView] = useState<SidebarView>('chats');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendsLoading, setFriendsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [messageRequests, setMessageRequests] = useState<MessageRequestGroup[]>([]);

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

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
        if (selectedFriend && msg.senderId === selectedFriend.id) {
          setMessages((prev) => [...prev, msg]);
          socket.emit("mark_as_read", { friendId: selectedFriend.id });
        }
      });

      socket.on("message_sent", (msg: MessageData) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      socket.on("messages_read", (data: { readerId: number }) => {
        if (!selectedFriend || data.readerId !== selectedFriend.id) return;
        setMessages((prev) => prev.map((msg) => (
          msg.senderId === user.id && msg.receiverId === data.readerId && !msg.readAt
            ? { ...msg, readAt: new Date().toISOString() }
            : msg
        )));
      });
    })();
    return () => disconnectSocket();
  }, [user, getToken, selectedFriend]);

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

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingRequests();
      fetchMessageRequests();
    }
  }, [user, fetchFriends, fetchPendingRequests, fetchMessageRequests]);

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
    const data = await apiFetch(`/api/messages/${friend.id}`);
    if (data) setMessages(data);
    setMessagesLoading(false);
    if (socketRef.current) {
      socketRef.current.emit('mark_as_read', { friendId: friend.id });
    }
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
    <main className="flex-1 flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 overflow-hidden animate-fade-in">
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
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-indigo-600" /> Chats
                </h2>
                <button onClick={signOut} className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search users..." value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setSidebarView('friendRequests'); fetchPendingRequests(); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all relative">
                  <UserPlus className="w-3.5 h-3.5" /> Friend Request
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
                <button onClick={() => { setSidebarView('messageRequests'); fetchMessageRequests(); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all relative">
                  <Mail className="w-3.5 h-3.5" /> Message Request
                  {messageRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {messageRequests.length}
                    </span>
                  )}
                </button>
              </div>
              <SearchSuggestions results={searchResults} onSelect={selectFriend} onSendRequest={handleSendRequest} />
            </div>
            <FriendList friends={friends} loading={friendsLoading} selectedFriendId={selectedFriend?.id} onSelect={selectFriend} />
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <UserAvatar name={user.name} profilePicture={user.profilePicture} size={36} className="ring-2 ring-indigo-500/20" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <section className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {selectedFriend && sidebarView === 'chats' ? (
          <ChatArea
            friend={selectedFriend}
            messages={messages}
            loading={messagesLoading}
            currentUserId={user.id}
            onSend={handleSendMessage}
            onBack={() => setSelectedFriend(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 mb-5 animate-scale-in">
              <MessageCircle className="w-14 h-14 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 animate-fade-in-up">
              {sidebarView === 'chats' ? 'Select a Conversation' :
               sidebarView === 'search' ? 'Search Users' :
               sidebarView === 'friendRequests' ? 'Friend Requests' : 'Message Requests'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm animate-fade-in-up">
              {sidebarView === 'chats' ? 'Choose a friend from the sidebar to start chatting' :
               sidebarView === 'search' ? 'Find users by name or email to connect with them' :
               sidebarView === 'friendRequests' ? 'Manage your friend requests' :
               'View messages from people you are not connected with'}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
