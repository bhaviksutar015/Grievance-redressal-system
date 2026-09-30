import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Landmark,
  LayoutDashboard,
  FilePlus2,
  FolderOpen,
  Bell,
  UserRound,
  LogOut,
  Menu,
  X,
  ListChecks,
  Tags,
  Star,
  BookOpenText,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../context/AuthContext";

const CITIZEN_NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/submit", icon: FilePlus2, label: "Submit Grievance" },
  { to: "/my-grievances", icon: FolderOpen, label: "My Grievances" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: UserRound, label: "My Profile" },
];

const ADMIN_NAV = [
  { to: "/admin", icon: LayoutDashboard, label: "Admin Dashboard", end: true },
  { to: "/admin/grievances", icon: ListChecks, label: "Grievances" },
  { to: "/admin/categories", icon: Tags, label: "Categories" },
  { to: "/admin/feedback", icon: Star, label: "Feedback" },
  { to: "/admin/awareness", icon: BookOpenText, label: "Awareness Content" },
];

export default function DashboardLayout({ admin = false }) {
  const [open, setOpen] = useState(false);
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const nav = admin ? ADMIN_NAV : CITIZEN_NAV;

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const linkCls = ({ isActive }) =>
    `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
      isActive
        ? "text-civic-700 dark:text-civic-300"
        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    }`;

  const sidebar = (
    <div className="flex h-full flex-col bg-white/40 dark:bg-slate-950/40 backdrop-blur-3xl">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <span className="rounded-xl bg-gradient-to-br from-civic-500 to-civic-700 p-2 text-white shadow-lg shadow-civic-600/30">
          <Landmark className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">OGRSA</p>
          <p className="text-[10px] text-slate-500">
            {admin ? "Admin Console" : "Citizen Portal"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-4 overflow-y-auto" aria-label={admin ? "Admin" : "Citizen"}>
        {nav.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={linkCls} onClick={() => setOpen(false)}>
            {({ isActive }) => (
              <>
                <span className="relative z-10 flex items-center gap-3">
                  <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-civic-600 dark:text-civic-400' : 'text-slate-400'}`} aria-hidden="true" />
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 z-0 rounded-xl bg-civic-50 dark:bg-civic-900/30 border border-civic-100 dark:border-civic-800/50"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
        {admin && (
          <NavLink to="/dashboard" className={linkCls} onClick={() => setOpen(false)}>
            {({ isActive }) => (
              <>
                <span className="relative z-10 flex items-center gap-3">
                  <UserRound className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-civic-600 dark:text-civic-400' : 'text-slate-400'}`} aria-hidden="true" />
                  Citizen View
                </span>
              </>
            )}
          </NavLink>
        )}
        {!admin && isAdmin && (
          <NavLink to="/admin" className={linkCls} onClick={() => setOpen(false)}>
            {({ isActive }) => (
              <>
                <span className="relative z-10 flex items-center gap-3">
                  <ListChecks className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-civic-600 dark:text-civic-400' : 'text-slate-400'}`} aria-hidden="true" />
                  Admin Console
                </span>
              </>
            )}
          </NavLink>
        )}
      </nav>

      <div className="border-t border-slate-200/50 p-4 dark:border-slate-800/50 shrink-0 space-y-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/"
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
          >
            <Home className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" /> 
            Public Site
          </Link>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-50 hover:shadow-sm dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /> 
          Sign out
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-200/50 dark:border-slate-800/50 lg:block z-20 shadow-sm relative">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute inset-y-0 left-0 w-72 bg-white/90 backdrop-blur-2xl shadow-2xl dark:bg-slate-950/90"
            >
              <button
                className="absolute right-3 top-4 rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-50"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-3 border-b border-slate-200/50 bg-white/80 px-6 backdrop-blur-xl dark:border-slate-800/50 dark:bg-[#0B1120]/80">
          <button
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              {admin ? "Admin Console" : "Welcome back"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {admin ? "Manage OGRSA" : <span className="font-semibold text-civic-700 dark:text-civic-400">{profile?.name}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
