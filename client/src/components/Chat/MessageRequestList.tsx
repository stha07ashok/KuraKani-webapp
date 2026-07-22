import { Mail } from "lucide-react";
import UserAvatar from "./UserAvatar";

import type { MessageRequestListProps } from "@/types/chat";

export default function MessageRequestList({ messageRequests, onBack }: MessageRequestListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" /> Message Request
          </h3>
          <button onClick={onBack} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Back">
            <span className="text-sm">&larr; Back</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {messageRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Mail className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No message requests</p>
          </div>
        ) : (
          messageRequests.map((group) => (
            <div key={group.sender.id} className="flex items-center gap-3 p-3 rounded-xl">
              <UserAvatar name={group.sender.name} profilePicture={group.sender.profilePicture} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{group.sender.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{group.messages[0]?.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
