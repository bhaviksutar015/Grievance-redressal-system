import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Light mode" },
  { value: "dark", icon: Moon, label: "Dark mode" },
  { value: "system", icon: Monitor, label: "System preference" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-slate-200/50 bg-white/50 p-1 backdrop-blur-md shadow-sm dark:border-slate-800/50 dark:bg-slate-900/50"
      role="group"
      aria-label="Theme"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            className={`relative rounded-lg p-2 text-sm transition-colors ${isActive
                ? "text-civic-700 dark:text-civic-300"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
          >
            {isActive && (
              <motion.div
                layoutId="theme-toggle-indicator"
                className="absolute inset-0 z-0 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

