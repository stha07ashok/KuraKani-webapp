"use client";

import { useState, useEffect, useRef, MutableRefObject } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { MessageData, ToastNotification } from "@/types/chat";

interface UseChatSocketOptions {
  userId: number;
  getToken: () => Promise<string | null>;
  selectedFriendRef: MutableRefObject<{ id: number } | null>;
  friendsRef: MutableRefObject<{ id: number; name: string; profilePicture?: string }[]>;
}

export function useChatSocket({ userId, getToken, selectedFriendRef, friendsRef }: UseChatSocketOptions) {
  const socketRef = useRef<any>(null);
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [toast, setToast] = useState<ToastNotification | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const token = await getToken();
      if (!token) return;
      const s = getSocket(token);
      socketRef.current = s;
      setSocket(s);

      s.on("new_message", (msg: MessageData) => {
        const curFriend = selectedFriendRef.current;
        if (curFriend && msg.senderId === curFriend.id) {
          setMessages((prev) => [...prev, msg]);
          s.emit("mark_as_read", { friendId: curFriend.id });
        } else {
          setUnreadCounts((prev) => ({ ...prev, [msg.senderId]: (prev[msg.senderId] || 0) + 1 }));
          const friend = friendsRef.current.find((f) => f.id === msg.senderId);
          if (friend) {
            setToast({ id: msg.id, senderId: msg.senderId, senderName: friend.name, senderPicture: friend.profilePicture, content: msg.content });
          }
        }
      });

      s.on("message_sent", (msg: MessageData) => {
        setMessages((prev) => {
          for (let i = prev.length - 1; i >= 0; i--) {
            const m = prev[i];
            if (m.senderId === msg.senderId && m.content === msg.content && m.id !== msg.id) {
              const next = [...prev];
              next[i] = msg;
              return next;
            }
          }
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      s.on("messages_read", (data: { readerId: number }) => {
        setMessages((prev) => prev.map((msg) => (
          msg.senderId === userId && msg.receiverId === data.readerId && !msg.readAt
            ? { ...msg, readAt: new Date().toISOString() }
            : msg
        )));
      });

      s.on("message_unsent", (data: { messageId: number; mode: 'me' | 'everyone' }) => {
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

      s.on('message_unsent_hidden', (data: { messageId: number }) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      });

      s.on('message_edited', (data: { messageId: number; content: string; editedAt: string }) => {
        setMessages((prev) => prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, content: data.content, editedAt: data.editedAt } : msg
        ));
      });

      s.on('message_deleted', (data: { messageId: number }) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      });
    })();
    return () => disconnectSocket();
  }, [userId, getToken, selectedFriendRef, friendsRef]);

  return {
    socketRef, socket, messages, setMessages,
    unreadCounts, setUnreadCounts, toast, setToast,
  };
}
