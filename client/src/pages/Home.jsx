import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Megaphone,
  SearchCheck,
  ShieldCheck,
  Users,
  ClipboardList,
  CheckCircle2,
  Timer,
  ArrowRight,
  Landmark,
  BellRing,
  BookOpenCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { api } from "../lib/api";

const HIGHLIGHTS = [
  {
    icon: FileText,
    title: "What is a grievance?",
    text: "A formal complaint about a public service problem — broken roads, water supply, sanitation, and more.",
  },
  {
    icon: Megaphone,
    title: "Why online systems matter",
    text: "No queues, no paperwork lost in files. Digital submissions are recorded, time-stamped and trackable.",
  },
  {
    icon: ClipboardList,
    title: "How to submit",
    text: "Register, describe your issue, attach evidence and get a unique reference ID instantly.",
  },
  {
    icon: SearchCheck,
    title: "How to track",
    text: "Use your reference ID any time — no login needed — to see exactly where your grievance stands.",
  },
  {
    icon: ShieldCheck,
    title: "Rights & responsibilities",
    text: "You have the right to be heard and the responsibility to report honestly with accurate details.",
  },
];

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get("/stats/public")
      .then(({ data }) => setStats(data.data))
      .catch(() => {});
  }, []);

  return (
    <PageWrapper>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-civic-700 via-civic-600 to-civic-800 text-white min-h-[85vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className="absolute -right-1/4 -top-1/4 w-[150%] h-[150%] opacity-20"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)"
            }}
          />
        </div>
        
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/20"
            >
              <BookOpenCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              Educational CEP Project
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl drop-shadow-sm"
            >
              Your Voice Matters.<br />
              <span className="text-civic-200">Raise Your Grievance.</span><br />
              Track Its Resolution.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-6 max-w-xl text-civic-50 text-lg leading-relaxed font-medium"
            >
              OGRSA teaches citizens how online grievance redressal works — and
              lets you experience it hands-on. Submit a grievance, receive a
              reference ID, and follow a transparent status timeline.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link to="/submit" className="btn bg-white px-6 py-3.5 text-civic-700 hover:bg-civic-50 shadow-xl shadow-civic-900/20 hover:scale-105">
                Submit a Grievance <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/awareness"
                className="btn glass-panel border border-white/20 px-6 py-3.5 text-white hover:bg-white/10 hover:border-white/40"
              >
                Learn How It Works
              </Link>
            </motion.div>
          </motion.div>

          {/* Icon-based illustration */}
          <div className="hidden justify-center lg:flex" aria-hidden="true">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2, delayChildren: 0.4 }
                }
              }}
              className="grid w-full max-w-md gap-5 relative"
            >
              {[
                { icon: FileText, t: "1 · Submit", d: "Describe your civic issue with evidence" },
                { icon: BellRing, t: "2 · Get notified", d: "Status updates at every single step" },
                { icon: Timer, t: "3 · Track progress", d: "Transparent timeline, reference ID" },
                { icon: CheckCircle2, t: "4 · Resolution", d: "Closure with your feedback & rating" },
              ].map(({ icon: Icon, t, d }, i) => (
                <motion.div
                  key={t}
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
                  }}
                  className="flex items-center gap-5 rounded-2xl bg-white/10 p-5 backdrop-blur-xl border border-white/10 shadow-2xl"
                  style={{ marginLeft: `${i * 30}px` }}
                >
                  <span className="rounded-xl bg-gradient-to-br from-white/30 to-white/10 p-3 shadow-inner">
                    <Icon className="h-7 w-7 text-white" />
                  </span>
                  <div>
                    <p className="font-bold tracking-tight text-white">{t}</p>
                    <p className="text-sm font-medium text-civic-100">{d}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="card grid grid-cols-2 divide-slate-200/50 dark:divide-slate-800/50 sm:grid-cols-4 sm:divide-x overflow-hidden border-0 bg-white/60 dark:bg-slate-900/60"
        >
          {[
            { label: "Grievances Registered", value: stats?.registered, icon: FileText },
            { label: "Grievances Resolved", value: stats?.resolved, icon: CheckCircle2 },
            { label: "In Progress", value: stats?.inProgress, icon: Timer },
            { label: "Citizens Reached", value: stats?.citizens, icon: Users },
          ].map(({ label, value, icon: Icon }, i) => (
            <motion.div 
              key={label} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 p-8 text-center transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
            >
              <div className="rounded-full bg-civic-100/50 p-3 dark:bg-civic-900/30">
                <Icon className="h-7 w-7 text-civic-600 dark:text-civic-400" aria-hidden="true" />
              </div>
              <p className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {value ?? "—"}
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* AWARENESS HIGHLIGHTS */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Awareness Highlights
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-500">
            The heart of this CEP project: understanding your rights and the grievance redressal process.
          </p>
        </motion.div>
        
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }, i) => (
            <motion.article 
              key={title} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="card p-8 group border-0 bg-white/60 dark:bg-slate-900/60"
            >
              <span className="inline-flex rounded-2xl bg-civic-50 p-4 text-civic-600 transition-colors group-hover:bg-civic-600 group-hover:text-white dark:bg-civic-950 dark:text-civic-400 dark:group-hover:bg-civic-600 dark:group-hover:text-white">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-3 text-slate-500 font-medium leading-relaxed">{text}</p>
            </motion.article>
          ))}
          <motion.article 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="card flex flex-col items-start justify-center gap-4 bg-gradient-to-br from-civic-600 to-civic-800 p-8 text-white shadow-xl border-0"
          >
            <h3 className="text-2xl font-extrabold tracking-tight">Ready to learn more?</h3>
            <p className="text-civic-100 font-medium leading-relaxed">
              Visit the full Awareness Hub with guides, tips, common mistakes and FAQs.
            </p>
            <Link to="/awareness" className="btn bg-white px-5 py-2.5 text-civic-700 hover:bg-civic-50 mt-2 shadow-lg">
              Open Hub <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.article>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="card relative overflow-hidden flex flex-col items-center gap-6 bg-gradient-to-r from-slate-900 to-slate-800 p-16 text-center text-white border-0 shadow-2xl dark:from-black dark:to-slate-900"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl relative z-10">
            Have a civic issue? Don't stay silent.
          </h2>
          <p className="max-w-2xl text-slate-300 text-lg font-medium relative z-10">
            Every grievance you raise makes public services more accountable.
            Try the complete workflow on this educational platform.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 relative z-10">
            <Link to="/register" className="btn bg-civic-500 px-8 py-4 text-white hover:bg-civic-400 shadow-xl shadow-civic-500/20">
              Create Free Account
            </Link>
            <Link to="/track" className="btn glass-panel border border-white/20 px-8 py-4 text-white hover:bg-white/10">
              Track a Grievance
            </Link>
          </div>
        </motion.div>
      </section>
    </PageWrapper>
  );
}
