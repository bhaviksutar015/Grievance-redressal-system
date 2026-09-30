import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const load = async () => {
      try {
        const { data } = await api.get("/notifications");
        if (alive) setUnread(data.data.unread);
      } catch {
        /* ignore */
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [user]);

  return (
    <Link
      to="/notifications"
      className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
