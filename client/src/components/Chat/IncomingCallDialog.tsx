"use client";

import { Phone, PhoneOff } from "lucide-react";
import type { CallType } from "@/hooks/useCall";

interface IncomingCallDialogProps {
  callerName: string;
  callType: CallType;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallDialog({ callerName, callType, onAccept, onReject }: IncomingCallDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl text-center space-y-4">
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {callerName} is calling...
        </p>
        <p className="text-sm text-slate-500 capitalize">{callType} call</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onReject}
            className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/50 transition"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          <button
            onClick={onAccept}
            className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-800/50 transition"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
