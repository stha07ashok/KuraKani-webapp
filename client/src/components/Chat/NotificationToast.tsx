import { useEffect, useState } from "react";
import { X, MessageCircle } from "lucide-react";

export interface ToastNotification {
  id: number;
  senderId: number;
  senderName: string;
  senderPicture?: string;
  content: string;
}

interface NotificationToastProps {
  notification: ToastNotification | null;
  onClose: () => void;
  onClick: (senderId: number) => void;
}

export default function NotificationToast({ notification, onClose, onClick }: NotificationToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full cursor-pointer transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      onClick={() => { setVisible(false); setTimeout(() => onClick(notification.senderId), 300); }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.senderName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notification.content}</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setVisible(false); setTimeout(onClose, 300); }}
            className="rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
