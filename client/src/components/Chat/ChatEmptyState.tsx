"use client";

import { MessageCircle } from "lucide-react";
import type { ChatEmptyStateProps } from "@/types/chat";

const messages: Record<string, { title: string; description: string }> = {
  chats: {
    title: "Select a Conversation",
    description: "Choose a friend from the sidebar to start chatting",
  },
  search: {
    title: "Search Users",
    description: "Find users by name or email to connect with them",
  },
  friendRequests: {
    title: "Friend Requests",
    description: "Manage your friend requests",
  },
  messageRequests: {
    title: "Message Requests",
    description: "View messages from people you are not connected with",
  },
};

export default function ChatEmptyState({ view }: ChatEmptyStateProps) {
  const content = messages[view] ?? messages.chats;

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 mb-5 animate-scale-in">
        <MessageCircle className="w-14 h-14 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 animate-fade-in-up">
        {content.title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm animate-fade-in-up">
        {content.description}
      </p>
    </div>
  );
}
