import { UserPlus, UserCheck, Clock } from "lucide-react";
import UserAvatar from "./UserAvatar";

import type { SearchedUser, SearchSuggestionsProps } from "@/types/chat";

export default function SearchSuggestions({ results, onSelect, onSendRequest }: SearchSuggestionsProps) {
  if (results.length === 0) return null;

  const handleClick = (u: SearchedUser) => {
    if (u.friendshipStatus === 'friends') {
      onSelect(u);
    } else if (u.friendshipStatus === 'none') {
      onSendRequest(u.id);
    }
  };

  return (
    <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
      {results.slice(0, 5).map((u) => (
        <button key={u.id} onClick={() => handleClick(u)}
          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 last:border-0 text-left transition-all">
          <UserAvatar name={u.name} profilePicture={u.profilePicture} size={32} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
          </div>
          {u.friendshipStatus === 'none' && <UserPlus className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
          {u.friendshipStatus === 'pending_sent' && <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
          {u.friendshipStatus === 'friends' && <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
        </button>
      ))}
    </div>
  );
}
