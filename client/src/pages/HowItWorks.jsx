import { Link } from "react-router-dom";
import {
  UserPlus,
  FilePlus2,
  Ticket,
  Search,
  Wrench,
  CheckCircle2,
  Star,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";

const STEPS = [
  {
    icon: UserPlus,
    title: "Register / Login",
    text: "Create a free account with your email. Authentication is handled securely by Neon Auth — the platform never stores your password.",
  },
  {
    icon: FilePlus2,
    title: "Submit Grievance",
    text: "Fill in the category, subject, detailed description, location, department and priority. Attach photos or documents as evidence (PDF/JPG/PNG, up to 5 MB).",
  },
  {
    icon: Ticket,
    title: "Receive Reference ID",
    text: "Instantly get a unique reference number like OGRSA-2026-000001. Save it — it lets you (or anyone you share it with) track progress without logging in.",
  },
  {
    icon: Search,
    title: "Grievance Reviewed",
    text: "An administrator reviews your submission, verifies the details and moves it to 'Under Review'. You get a notification the moment this happens.",
  },
  {
    icon: Wrench,
    title: "Action Taken",
    text: "The grievance is assigned to the responsible department and marked 'In Progress'. Officials add remarks that you can read in your dashboard.",
  },
  {
    icon: CheckCircle2,
    title: "Resolution",
    text: "Once fixed, the grievance is marked 'Resolved' with closing remarks and a resolution timestamp. Invalid grievances are rejected with a recorded reason.",
  },
  {
    icon: Star,
    title: "Citizen Feedback",
    text: "Rate the resolution from 1 to 5 stars and leave a comment. Feedback keeps the process accountable and is visible to administrators.",
  },
];

export default function HowItWorks() {
  return (
    <PageWrapper className="relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" aria-hidden="true"></div>
      
      <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24 relative z-10">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-civic-100 dark:bg-civic-900/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-civic-700 dark:text-civic-300">
            The Process
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl drop-shadow-sm">
            How It Works
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-xl leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            Seven transparent steps from raising your voice to closing the loop.
          </p>
        </motion.header>

        <motion.ol 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="relative mt-12 space-y-8 border-l-2 border-civic-200/50 pl-8 dark:border-civic-900/50 sm:ml-6"
        >
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <motion.li 
              key={title} 
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0 }
              }}
              className="relative"
            >
              <span className="absolute -left-[49px] flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-civic-500 to-civic-700 text-white ring-4 ring-slate-50 dark:ring-[#0B1120] shadow-md shadow-civic-600/30">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="card p-6 border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-civic-900/5 dark:hover:shadow-civic-900/20 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-civic-50/30 to-transparent dark:from-civic-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-wider text-civic-600 dark:text-civic-400">
                    Step {i + 1}
                  </p>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                    {text}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-16 flex flex-wrap justify-center gap-4"
        >
          <Link to="/submit" className="btn bg-civic-600 text-white hover:bg-civic-700 px-6 py-4 rounded-xl shadow-xl shadow-civic-600/20 hover:shadow-civic-600/40 transition-all hover:-translate-y-1 font-semibold text-base">
            Start Now — Submit a Grievance <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
          </Link>
          <Link to="/track" className="btn bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 px-6 py-4 rounded-xl shadow-lg shadow-black/5 transition-all hover:-translate-y-1 font-semibold text-base">
            Track an Existing Grievance
          </Link>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
