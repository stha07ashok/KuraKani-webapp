import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
      <div className="px-5 sm:px-8 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-400 text-white">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">KuraKani</span>
          </Link>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} KuraKani. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
