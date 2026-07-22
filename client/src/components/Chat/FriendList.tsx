import { Users, Loader2 } from "lucide-react";
import UserAvatar from "./UserAvatar";

import type { FriendListProps } from "@/types/chat";

export default function FriendList({ friends, loading, selectedFriendId, unreadCounts, onSelect }: FriendListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">No friends yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Search for users to add friends</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {friends.map((friend) => (
        <button key={friend.id} onClick={() => onSelect(friend)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left relative ${
            selectedFriendId === friend.id
              ? "bg-indigo-50 dark:bg-indigo-900/30 shadow-sm"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}>
          <div className="relative">
            <UserAvatar name={friend.name} profilePicture={friend.profilePicture} />
            {unreadCounts[friend.id] > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-lg shadow-red-500/30">
                {unreadCounts[friend.id] > 99 ? '99+' : unreadCounts[friend.id]}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm truncate ${
              unreadCounts[friend.id] > 0
                ? "font-bold text-slate-900 dark:text-white"
                : "font-semibold text-slate-900 dark:text-white"
            }`}>{friend.name}</p>
            <p className={`text-xs truncate ${
              unreadCounts[friend.id] > 0
                ? "text-slate-600 dark:text-slate-300 font-medium"
                : "text-slate-500 dark:text-slate-400"
            }`}>{friend.email}</p>
          </div>
          {unreadCounts[friend.id] > 0 && (
            <div className="w-2 h-2 rounded-full bg-indigo-500 absolute right-3 top-1/2 -translate-y-1/2" />
          )}
        </button>
      ))}
    </div>
  );
}
