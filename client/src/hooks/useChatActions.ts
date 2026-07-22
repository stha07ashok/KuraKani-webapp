"use client";

import { useState, useCallback, useRef, type MutableRefObject } from "react";
import type { SearchedUser, Friend, PendingRequest, MessageRequestGroup, MessageData, CallLogEntry, BaseUser } from "@/types/chat";

interface UseChatActionsOptions {
  getToken: () => Promise<string | null>;
  friendsRef?: MutableRefObject<Friend[]>;
  selectedFriendRef?: MutableRefObject<Friend | null>;
}

export function useChatActions({ getToken }: UseChatActionsOptions) {
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [sidebarView, setSidebarView] = useState<'chats' | 'search' | 'friendRequests' | 'messageRequests'>('chats');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [messageRequests, setMessageRequests] = useState<MessageRequestGroup[]>([]);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

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

  const fetchUnreadCounts = useCallback(async (setUnreadCounts: (counts: Record<number, number>) => void) => {
    const data = await apiFetch("/api/messages/unread/counts");
    if (data) setUnreadCounts(data);
  }, [apiFetch]);

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

  const handleSidebarSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setSearchResults([]); setSearchDone(false); return; }
    searchTimerRef.current = setTimeout(() => doSearch(q), 300);
  }, [doSearch]);

  const handleSendRequest = useCallback(async (receiverId: number) => {
    const data = await apiFetch("/api/friend-requests", {
      method: "POST",
      body: JSON.stringify({ receiverId }),
    });
    if (data) {
      setSearchResults((prev) =>
        prev.map((u) => u.id === receiverId ? { ...u, friendshipStatus: 'pending_sent' as const } : u)
      );
    }
  }, [apiFetch]);

  const handleAccept = useCallback(async (requestId: number) => {
    await apiFetch(`/api/friend-requests/${requestId}/accept`, { method: "PUT" });
    fetchPendingRequests();
    fetchFriends();
  }, [apiFetch, fetchPendingRequests, fetchFriends]);

  const handleReject = useCallback(async (requestId: number) => {
    await apiFetch(`/api/friend-requests/${requestId}/reject`, { method: "PUT" });
    fetchPendingRequests();
  }, [apiFetch, fetchPendingRequests]);

  const selectFriend = useCallback(async (friend: BaseUser, socketRef: { current: any }, clearUnread?: (friendId: number) => void) => {
    setSelectedFriend(friend as Friend);
    setSidebarView('chats');
    setSearchQuery('');
    setSearchResults([]);
    setSearchDone(false);
    setCallLogs([]);
    setMessagesLoading(true);
    const [messagesData, callLogsData] = await Promise.all([
      apiFetch(`/api/messages/${friend.id}`),
      apiFetch(`/api/calls/${friend.id}`),
    ]);
    const friendMessages: MessageData[] = messagesData ?? [];
    if (callLogsData) setCallLogs(callLogsData);
    clearUnread?.(friend.id);
    if (socketRef.current) {
      socketRef.current.emit('mark_as_read', { friendId: friend.id });
    }
    setMessagesLoading(false);
    return friendMessages;
  }, [apiFetch]);

  const handleUnsendMessage = useCallback((socketRef: { current: any }, messageId: number, mode: 'me' | 'everyone') => {
    if (!socketRef.current) return;
    socketRef.current.emit('unsend_message', { messageId, mode });
  }, []);

  const handleHideUnsent = useCallback((socketRef: { current: any }, messageId: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit('hide_unsent_message', { messageId });
  }, []);

  const handleSendMessage = useCallback((socketRef: { current: any }, selectedFriend: Friend | null, content: string, replyToMessageId?: number | null) => {
    if (!selectedFriend || !socketRef.current) return;
    socketRef.current.emit("send_message", { receiverId: selectedFriend.id, content, replyToMessageId });
  }, []);

  const handleEditMessage = useCallback((socketRef: { current: any }, messageId: number, content: string) => {
    socketRef.current?.emit('edit_message', { messageId, content });
  }, []);

  const handleToastClick = useCallback((senderId: number, onSelect: (friend: Friend) => void) => {
    const friend = friends.find((f) => f.id === senderId);
    if (friend) onSelect(friend);
  }, [friends]);

  const backToChats = useCallback(() => {
    setSidebarView('chats');
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    searchTimerRef,
    sidebarView, setSidebarView,
    friends, setFriends,
    selectedFriend, setSelectedFriend,
    friendsLoading, setFriendsLoading,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    searchLoading, searchDone, setSearchDone,
    pendingRequests, setPendingRequests,
    messageRequests,
    callLogs, setCallLogs,
    messagesLoading,
    apiFetch,
    fetchFriends, fetchPendingRequests, fetchMessageRequests, fetchUnreadCounts,
    doSearch, handleSearch, handleSidebarSearch,
    handleSendRequest, handleAccept, handleReject,
    selectFriend,
    handleUnsendMessage, handleHideUnsent, handleSendMessage, handleEditMessage,
    handleToastClick, backToChats,
  };
}
