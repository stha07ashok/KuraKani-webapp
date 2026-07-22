"use client";

import { useEffect, useState, useRef } from "react";
import { X, MessageCircle } from "lucide-react";
import type { NotificationToastProps } from "@/types/chat";

export default function NotificationToast({ notification, onClose, onClick }: NotificationToastProps) {
  const [visible, setVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  const onClickRef = useRef(onClick);
  onCloseRef.current = onClose;
  onClickRef.current = onClick;

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onCloseRef.current(), 300);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification]);

  if (!notification) return null;

  const handleClick = () => {
    setVisible(false);
    setTimeout(() => onClickRef.current(notification.senderId), 300);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(() => onCloseRef.current(), 300);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full cursor-pointer transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      onClick={handleClick}
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
            onClick={handleClose}
            className="rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
