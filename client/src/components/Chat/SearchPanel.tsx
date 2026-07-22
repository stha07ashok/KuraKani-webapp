import { Search, UserPlus, UserCheck, Clock, UserX, Loader2 } from "lucide-react";
import UserAvatar from "./UserAvatar";
import type { SearchedUser, SearchPanelProps } from "@/types/chat";

export default function SearchPanel({
  searchQuery, searchResults, searchLoading, searchDone,
  onSearch, onSelect, onSendRequest, onBack,
}: SearchPanelProps) {
  const handleClick = (u: SearchedUser) => {
    if (u.friendshipStatus === 'friends') {
      onSelect(u);
    } else if (u.friendshipStatus === 'none') {
      onSendRequest(u.id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" /> Search Users
          </h2>
          <button onClick={onBack} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Back to Chats">
            <span className="text-sm">&larr; Back</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name or email..." value={searchQuery}
            onChange={(e) => onSearch(e.target.value)} autoFocus
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {searchLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : searchDone && searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <UserX className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">User not found</p>
          </div>
        ) : !searchQuery ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Search users by name or email</p>
          </div>
        ) : (
          searchResults.map((u) => (
            <button key={u.id} onClick={() => handleClick(u)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-all">
              <UserAvatar name={u.name} profilePicture={u.profilePicture} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
              </div>
              {u.friendshipStatus === 'none' && (
                <span className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                  <UserPlus className="w-3.5 h-3.5" /> Add Friend
                </span>
              )}
              {u.friendshipStatus === 'pending_sent' && (
                <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 shrink-0">
                  <Clock className="w-3.5 h-3.5" /> Pending
                </span>
              )}
              {u.friendshipStatus === 'pending_received' && (
                <span className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Clock className="w-3.5 h-3.5" /> Request
                </span>
              )}
              {u.friendshipStatus === 'friends' && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                  <UserCheck className="w-3.5 h-3.5" /> Chat
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
