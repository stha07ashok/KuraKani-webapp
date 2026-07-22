import { UserPlus, Check, X } from "lucide-react";
import UserAvatar from "./UserAvatar";
import type { RequestListProps } from "@/types/chat";

export default function RequestList({ pendingRequests, onAccept, onReject, onBack }: RequestListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" /> Friend Request
          </h3>
          <button onClick={onBack} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Back">
            <span className="text-sm">&larr; Back</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {pendingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <UserPlus className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No pending friend requests</p>
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl">
              <UserAvatar name={req.sender.name} profilePicture={req.sender.profilePicture} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{req.sender.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Wants to be friends</p>
              </div>
              <button onClick={() => onAccept(req.id)} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors" title="Accept">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => onReject(req.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Reject">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
