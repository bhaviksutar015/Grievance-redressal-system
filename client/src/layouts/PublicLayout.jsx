import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Landmark, Menu, X, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/awareness", label: "Awareness" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/track", label: "Track Grievance" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact" },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkCls = ({ isActive }) =>
    `relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
      isActive
        ? "text-civic-700 dark:text-civic-300"
        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0B1120]">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="glass-panel flex h-16 items-center justify-between gap-4 rounded-2xl px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-slate-800/60">
            <Link to="/" className="flex items-center gap-3 group" aria-label="OGRSA home">
              <span className="rounded-xl bg-gradient-to-br from-civic-500 to-civic-700 p-2 text-white shadow-lg shadow-civic-600/30 transition-transform group-hover:scale-105">
                <Landmark className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="hidden sm:block">
                <span className="block text-base font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
                  OGRSA
                </span>
                <span className="block text-[10px] font-medium tracking-wide uppercase mt-1 leading-none text-slate-500">
                  Grievance Redressal
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{n.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 z-0 rounded-full bg-civic-100/80 dark:bg-civic-900/40"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="btn bg-civic-600 text-white hover:bg-civic-700 px-4 py-2 rounded-xl shadow-lg shadow-civic-600/20 hover:shadow-civic-600/40 transition-all hover:-translate-y-0.5">
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline font-semibold">Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hidden px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors sm:block">
                    Login
                  </Link>
                  <Link to="/register" className="btn bg-slate-900 text-white hover:bg-slate-800 dark:bg-civic-600 dark:hover:bg-civic-500 px-4 py-2 rounded-xl shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5">
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline font-semibold">Register</span>
                  </Link>
                </>
              )}
              <button
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute left-4 right-4 top-[84px] z-40 rounded-2xl border border-slate-200/50 bg-white/95 px-4 py-4 backdrop-blur-xl shadow-2xl dark:border-slate-800/50 dark:bg-slate-950/95 lg:hidden"
              aria-label="Mobile"
            >
              <div className="flex flex-col gap-1">
                {NAV.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) => `rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-civic-50 text-civic-700 dark:bg-civic-900/30 dark:text-civic-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50"}`}
                    onClick={() => setOpen(false)}
                  >
                    {n.label}
                  </NavLink>
                ))}
                {!user && (
                  <NavLink to="/login" className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50 mt-2" onClick={() => setOpen(false)}>
                    Login
                  </NavLink>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="flex-1 pt-24 pb-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-civic-600 p-1.5 text-white">
                <Landmark className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-bold text-slate-900 dark:text-white">OGRSA</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Online Grievance Redressal System Awareness — an educational
              Community Engagement Project (CEP) demonstrating how digital
              grievance platforms empower citizens.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link className="hover:text-civic-600" to="/awareness">Awareness Hub</Link></li>
              <li><Link className="hover:text-civic-600" to="/how-it-works">How It Works</Link></li>
              <li><Link className="hover:text-civic-600" to="/faqs">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Citizens</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link className="hover:text-civic-600" to="/submit">Submit a Grievance</Link></li>
              <li><Link className="hover:text-civic-600" to="/track">Track a Grievance</Link></li>
              <li><Link className="hover:text-civic-600" to="/register">Create an Account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Disclaimer</h3>
            <p className="mt-3 text-sm text-slate-500">
              This is a student CEP project for educational purposes. It is{" "}
              <strong>not</strong> an official government portal and is not
              integrated with any government system.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
          OGRSA · BSc IT Community Engagement Project · Built with React, Express &
          Neon PostgreSQL
        </div>
      </footer>
    </div>
  );
}
