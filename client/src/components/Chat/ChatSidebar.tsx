"use client";

import { Search, MessageCircle, LogOut, UserPlus, Mail } from "lucide-react";
import UserAvatar from "./UserAvatar";
import FriendList from "./FriendList";
import SearchSuggestions from "./SearchSuggestions";
import type { ChatSidebarProps } from "@/types/chat";

export default function ChatSidebar({
  user,
  searchQuery,
  searchResults,
  friends,
  friendsLoading,
  selectedFriendId,
  unreadCounts,
  pendingRequests,
  messageRequests,
  onSearch,
  onSelectFriend,
  onSelectUser,
  onSendRequest,
  onViewFriendRequests,
  onViewMessageRequests,
  onSignOut,
}: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-600" /> Chats
          </h2>
          <button onClick={onSignOut} className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search users..." value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={onViewFriendRequests} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all relative">
            <UserPlus className="w-3.5 h-3.5" /> Friend Request
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button onClick={onViewMessageRequests} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all relative">
            <Mail className="w-3.5 h-3.5" /> Message Request
            {messageRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {messageRequests.length}
              </span>
            )}
          </button>
        </div>
        <SearchSuggestions results={searchResults} onSelect={onSelectUser} onSendRequest={onSendRequest} />
      </div>
      <FriendList friends={friends} loading={friendsLoading} selectedFriendId={selectedFriendId} unreadCounts={unreadCounts} onSelect={onSelectFriend} />
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
  );
}
