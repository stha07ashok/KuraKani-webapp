import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, Send, Loader2, Check, X, CornerUpLeft, MoreVertical, Pencil, Trash2 } from "lucide-react";
import UserAvatar from "./UserAvatar";

interface MessageData {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isMessageRequest: boolean;
  readAt: string | null;
  createdAt: string;
  sender?: { id: number; name: string; email: string; profilePicture?: string };
  receiver?: { id: number; name: string; email: string; profilePicture?: string };
  replyTo?: {
    id: number;
    content: string;
    sender?: { id: number; name: string; profilePicture?: string };
  };
}

interface ChatAreaProps {
  friend: { id: number; name: string; email: string; profilePicture?: string };
  messages: MessageData[];
  loading: boolean;
  currentUserId: number;
  onSend: (content: string, replyToMessageId?: number | null) => void;
  onBack: () => void;
}

export default function ChatArea({ friend, messages, loading, currentUserId, onSend, onBack }: ChatAreaProps) {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<MessageData | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [localMessages, setLocalMessages] = useState<MessageData[]>(messages);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim(), replyTo?.id ?? null);
    setText("");
    setReplyTo(null);
  };

  const startEditing = (msg: MessageData) => {
    setEditingId(msg.id);
    setEditValue(msg.content);
    setOpenMenuId(null);
  };

  const saveEdit = (msgId: number) => {
    if (!editValue.trim()) return;
    setLocalMessages((prev) => prev.map((msg) => msg.id === msgId ? { ...msg, content: editValue.trim() } : msg));
    setEditingId(null);
    setEditValue("");
  };

  const removeMessage = (msgId: number, mode: "me" | "everyone") => {
    setLocalMessages((prev) => prev.map((msg) => {
      if (msg.id !== msgId) return msg;
      return mode === "me"
        ? { ...msg, content: "You unsent this message" }
        : { ...msg, content: "This message was unsent" };
    }));
    setOpenMenuId(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button onClick={onBack} className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <UserAvatar name={friend.name} profilePicture={friend.profilePicture} size={36} className="ring-2 ring-indigo-500/20" />
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{friend.name}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.06),_transparent_55%)]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Send a message to start chatting</p>
          </div>
        ) : (
          localMessages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-in-up`}>
                <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`max-w-[78%] sm:max-w-[64%] px-3.5 py-2.5 rounded-[20px] shadow-sm ${
                    isMine
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-[6px]"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-[6px]"
                  }`}>
                    {msg.replyTo && (
                      <div className={`mb-2 rounded-xl border px-2.5 py-2 text-[11px] ${
                        isMine
                          ? "border-white/20 bg-white/10 text-indigo-50"
                          : "border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300"
                      }`}>
                        <p className="font-semibold truncate">{msg.replyTo.sender?.name ?? 'Replied message'}</p>
                        <p className="truncate opacity-80">{msg.replyTo.content}</p>
                      </div>
                    )}
                    {editingId === msg.id ? (
                      <div className="space-y-2">
                        <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none" />
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => saveEdit(msg.id)} className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white">Save</button>
                          <button type="button" onClick={() => { setEditingId(null); setEditValue(""); }} className="text-xs text-slate-500">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    )}
                    <div className="flex items-center justify-end gap-1.5 mt-1.5">
                      <p className={`text-[11px] ${isMine ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {isMine && (
                        <div className={`flex items-center gap-0.5 text-[11px] ${msg.readAt ? 'text-emerald-200' : 'text-indigo-100'}`}>
                          <Check className="w-3.5 h-3.5" />
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <button type="button" onClick={() => setReplyTo(msg)} className={`rounded-full p-1.5 transition ${isMine ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"}`} title="Reply">
                      <CornerUpLeft className="w-3.5 h-3.5" />
                    </button>
                    {isMine && (
                      <div className="relative">
                        <button type="button" onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)} className="rounded-full p-1.5 bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600" title="Actions">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {openMenuId === msg.id && (
                          <div className="absolute right-0 top-8 z-10 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <button type="button" onClick={() => startEditing(msg)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button type="button" onClick={() => removeMessage(msg.id, "me")} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                              <Trash2 className="w-3.5 h-3.5" /> Unsend for me
                            </button>
                            <button type="button" onClick={() => removeMessage(msg.id, "everyone")} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                              <Trash2 className="w-3.5 h-3.5" /> Unsend for everyone
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/80 backdrop-blur dark:bg-slate-900/80">
        {replyTo ? (
          <div className="mb-2 rounded-2xl border border-indigo-500/30 bg-indigo-50/70 px-3 py-2 text-sm text-slate-900 dark:bg-indigo-900/30 dark:text-white flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold truncate">Replying to {replyTo.sender?.name ?? 'message'}</p>
              <p className="truncate text-xs text-slate-600 dark:text-slate-300">{replyTo.content}</p>
            </div>
            <button type="button" onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-2 shadow-sm">
          <input type="text" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-transparent border-0 outline-none text-slate-900 dark:text-white placeholder-slate-400" />
          <button type="submit" disabled={!text.trim()}
            className="p-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
