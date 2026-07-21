import { Users, Loader2 } from "lucide-react";
import UserAvatar from "./UserAvatar";

interface Friend {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  friendRequestId: number;
}

interface FriendListProps {
  friends: Friend[];
  loading: boolean;
  selectedFriendId?: number;
  onSelect: (friend: Friend) => void;
}

export default function FriendList({ friends, loading, selectedFriendId, onSelect }: FriendListProps) {
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
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
            selectedFriendId === friend.id
              ? "bg-indigo-50 dark:bg-indigo-900/30 shadow-sm"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}>
          <UserAvatar name={friend.name} profilePicture={friend.profilePicture} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{friend.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{friend.email}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
