import { useEffect, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { api } from "../lib/api";
import { EmptyState, Spinner } from "../components/ui";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";

export default function Faqs() {
  const [faqs, setFaqs] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api
      .get("/awareness")
      .then(({ data }) => setFaqs(data.data.filter((r) => r.section === "FAQ")))
      .catch(() => setFaqs([]));
  }, []);

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
            Support
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl drop-shadow-sm">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            Quick answers about using this grievance redressal platform.
          </p>
        </motion.header>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
          className="mt-12 space-y-4"
        >
          {faqs === null && <div className="py-12"><Spinner label="Loading FAQs..." /></div>}
          {faqs?.length === 0 && (
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <EmptyState icon={HelpCircle} title="No FAQs yet" hint="Please check back soon." />
            </motion.div>
          )}
          {faqs?.map((f) => (
            <motion.div 
              key={f.id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              layout
              className="card overflow-hidden border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-all hover:shadow-lg hover:shadow-civic-900/5 dark:hover:shadow-civic-900/20"
            >
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-slate-900 dark:text-slate-100"
                onClick={() => setOpen(open === f.id ? null : f.id)}
                aria-expanded={open === f.id}
              >
                {f.title}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open === f.id ? "rotate-180 text-civic-600 dark:text-civic-400" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {open === f.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-slate-200/50 px-6 py-5 text-sm font-medium leading-relaxed text-slate-600 dark:border-slate-800/50 dark:text-slate-400"
                >
                  {f.body}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
