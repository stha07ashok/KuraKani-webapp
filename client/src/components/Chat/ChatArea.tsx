import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, MessageCircle, Send, Loader2, Check, X, CornerUpLeft, MoreVertical, Pencil, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import UserAvatar from "./UserAvatar";

interface MessageData {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isMessageRequest: boolean;
  readAt: string | null;
  createdAt: string;
  deletedAt?: string | null;
  deletedForSenderAt?: string | null;
  deletedForReceiverAt?: string | null;
  editedAt?: string | null;
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
  onUnsend: (messageId: number, mode: 'me' | 'everyone') => void;
  onHideUnsent: (messageId: number) => void;
  onEdit: (messageId: number, content: string) => void;
  onBack: () => void;
}

export default function ChatArea({ friend, messages, loading, currentUserId, onSend, onUnsend, onHideUnsent, onEdit, onBack }: ChatAreaProps) {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<MessageData | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [menuView, setMenuView] = useState<{ id: number; view: 'main' | 'unsend' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (editingId) {
      onEdit(editingId, text.trim());
      setEditingId(null);
    } else {
      onSend(text.trim(), replyTo?.id ?? null);
    }
    setText("");
    setReplyTo(null);
  };

  const startEditing = (msg: MessageData) => {
    setText(msg.content);
    setEditingId(msg.id);
    setReplyTo(null);
    setOpenMenuId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setText("");
  };

  const removeMessage = (msg: MessageData, mode: "me" | "everyone") => {
    onUnsend(msg.id, mode);
    setOpenMenuId(null);
    setMenuView(null);
  };

  const isUnsent = (msg: MessageData) => {
    return !!msg.deletedAt;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <button onClick={onBack} className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <UserAvatar name={friend.name} profilePicture={friend.profilePicture} size={36} className="ring-2 ring-indigo-500/20" />
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{friend.name}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.06),_transparent_55%)]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Send a message to start chatting</p>
          </div>
        ) : (
          <>
            {displayMessages.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              const unsent = isUnsent(msg);
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-in-up group`}>
                  <div className={`flex items-end gap-1.5 ${isMine ? "flex-row-reverse" : "flex-row"} max-w-[75%]`}>
                    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                      {msg.replyTo && !unsent && (
                        <div className={`mb-2 rounded-xl border px-2.5 py-2 text-[11px] ${
                          isMine
                            ? "border-indigo-200 bg-indigo-50 text-indigo-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-200"
                            : "border-indigo-200 bg-indigo-50 text-indigo-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          <p className={`font-semibold truncate ${isMine ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>{msg.replyTo.sender?.name ?? 'Replied message'}</p>
                          <p className={`truncate opacity-80 ${isMine ? 'text-indigo-800 dark:text-indigo-100' : 'text-slate-600 dark:text-slate-300'}`}>{msg.replyTo.content}</p>
                        </div>
                      )}
                      <div className="flex items-end gap-1">
                        {unsent ? (
                          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-[20px] shadow-sm ${
                            isMine
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-br-[6px]"
                              : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-bl-[6px]"
                          }`}>
                            <span className="text-xs italic">This message was unsent</span>
                            <button
                              type="button"
                              onClick={() => onHideUnsent(msg.id)}
                              className="rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              title="Remove for me"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            {(msg.editedAt || editingId === msg.id) && (
                              <span className={`text-[10px] text-slate-400 italic absolute -top-3.5 ${isMine ? "right-0" : "left-0"}`}>edited</span>
                            )}
                            <div className={`px-3.5 py-2.5 rounded-[20px] shadow-sm w-fit ${
                              isMine
                                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-[6px]"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-[6px]"
                            }`}>
                              <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                            </div>
                          </div>
                        )}

                        <div className={`relative flex flex-col items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isMine ? "order-first" : "order-last"}`}>
                          {openMenuId === msg.id && (
                            <div className="absolute z-10 right-full top-1/2 -translate-y-1/2 mr-2 flex gap-1">
                              <div className="w-36 rounded-xl border border-slate-200 bg-white p-0.5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                <button type="button" onClick={() => { startEditing(msg); setMenuView(null); }} className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
                                  <Pencil className="w-3 h-3" /> Edit
                                </button>
                                <button type="button" onClick={() => setMenuView({ id: msg.id, view: 'unsend' })} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                  <span className="flex items-center gap-1.5"><Trash2 className="w-3 h-3" /> Unsend</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                              {menuView?.id === msg.id && menuView.view === 'unsend' && (
                                <div className="w-36 rounded-xl border border-slate-200 bg-white p-0.5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                  <button type="button" onClick={() => removeMessage(msg, "me")} className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                    <Trash2 className="w-3 h-3" /> Unsend for me
                                  </button>
                                  <button type="button" onClick={() => removeMessage(msg, "everyone")} className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                    <Trash2 className="w-3 h-3" /> Unsend for everyone
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {isMine && (
                            <button type="button" onClick={() => { setOpenMenuId(openMenuId === msg.id ? null : msg.id); setMenuView(null); }} className="rounded-full p-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600" title="Actions">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button type="button" onClick={() => setReplyTo(msg)} className="rounded-full p-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-slate-700 dark:text-indigo-200 dark:hover:bg-slate-600" title="Reply">
                            <CornerUpLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className={`mt-1 flex items-center gap-1 text-[11px] ${isMine ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"}`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {isMine && (
                          <div className={`flex items-center ${msg.readAt ? "text-emerald-500" : "text-slate-400"}`}>
                            <Check className="w-3.5 h-3.5" />
                            <Check className="w-3.5 h-3.5 -ml-1.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/80 backdrop-blur dark:bg-slate-900/80 flex-shrink-0">
        {replyTo ? (
          <div className="mb-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-900/30 dark:text-white flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold truncate">Replying to {replyTo.sender?.name ?? 'message'}</p>
              <p className="truncate text-xs text-slate-600 dark:text-slate-300">{replyTo.content}</p>
            </div>
            <button type="button" onClick={() => setReplyTo(null)} className="text-indigo-600 hover:text-indigo-800 dark:text-slate-300 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        {editingId && (
          <div className="mb-2 flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-900 shadow-sm dark:border-violet-500/30 dark:bg-violet-900/30 dark:text-white">
            <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 truncate">Editing message</span>
            <button type="button" onClick={cancelEdit} className="text-violet-600 hover:text-violet-800 dark:text-slate-300 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-2 shadow-sm">
          <input type="text" placeholder={editingId ? "Edit message..." : "Type a message..."} value={text} onChange={(e) => setText(e.target.value)}
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
