import { useEffect, useState } from "react";
import {
  FileText,
  Globe,
  ThumbsUp,
  ClipboardList,
  Info,
  SearchCheck,
  Workflow,
  UserCheck,
  AlertTriangle,
  ChevronDown,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import PageWrapper from "../components/PageWrapper";

const SECTIONS = [
  {
    icon: FileText,
    title: "A. What is a grievance?",
    body: "A grievance is a formal complaint raised by a citizen about a deficiency in a public service — for example a broken street light, irregular water supply, uncollected garbage, potholes, or delays in getting certificates. It is different from a suggestion or an enquiry: a grievance points to something specific that has gone wrong and needs corrective action.",
  },
  {
    icon: Globe,
    title: "B. What is an online grievance redressal system?",
    body: "It is a web platform where citizens can lodge complaints digitally instead of visiting offices. Each complaint gets a unique reference number, is routed to the responsible department, and its progress is recorded step by step until closure. Real-world examples in India include CPGRAMS (national level) and various state/municipal portals. OGRSA is an educational model of such a system.",
  },
  {
    icon: ThumbsUp,
    title: "C. Why should citizens use online grievance systems?",
    body: "Convenience: file from home, 24×7. Proof: every submission is time-stamped with a reference ID. Transparency: you can see the status at any time. Accountability: officials' actions are recorded in a permanent history. Speed: digital routing removes paperwork delays. Inclusivity: elderly and differently-abled citizens can participate without travelling.",
  },
  {
    icon: ClipboardList,
    title: "D. How to file a grievance",
    body: "1) Register with your email and sign in. 2) Click 'Submit Grievance'. 3) Choose the correct category (e.g. Water Supply). 4) Write a clear subject and a detailed description — what, where, since when. 5) Add the location and department if known. 6) Attach a photo or document as evidence. 7) Submit and save the reference ID shown on the confirmation screen.",
  },
  {
    icon: Info,
    title: "E. What information should be provided?",
    body: "Provide facts: exact location (ward, street, landmark), date and duration of the problem, how it affects residents, and any earlier complaint attempts. Attach supporting evidence (photo, bill, receipt — PDF/JPG/PNG). Give a working mobile number so officials can reach you. Avoid abusive language, speculation and unrelated issues.",
  },
  {
    icon: SearchCheck,
    title: "F. How to track a grievance",
    body: "Use the 'Track Grievance' page and enter your reference ID (format OGRSA-YYYY-NNNNNN). You will see the current status and the complete timeline of transitions. Tracking is public but privacy-safe: it never reveals personal details, only the subject, category, status and dates. Signed-in citizens see full details, remarks and attachments in their dashboard.",
  },
  {
    icon: Workflow,
    title: "G. What happens after submission?",
    body: "Your grievance follows a defined workflow: SUBMITTED → UNDER REVIEW (an officer verifies details) → ASSIGNED (routed to the responsible department) → IN PROGRESS (action being taken) → RESOLVED (with closing remarks) — or REJECTED with a recorded reason if it is invalid or outside scope. You receive an in-app notification at every step, and every change is stored permanently in the status history.",
  },
  {
    icon: UserCheck,
    title: "H. Citizen responsibilities",
    body: "Report truthfully — false complaints waste public resources. One grievance per issue. Choose the correct category. Respond if officials ask for additional information. Track your grievance and give honest feedback after resolution. Never misuse the system for personal disputes, spam or defamation.",
  },
  {
    icon: AlertTriangle,
    title: "I. Common mistakes when submitting grievances",
    body: "Vague descriptions ('road is bad' — where exactly?). Wrong category, which delays routing. Missing location details. No evidence attached when it was easily available. Multiple unrelated problems in one complaint. Submitting duplicates instead of tracking the original. Ignoring requests for additional information. Losing the reference ID.",
  },
];

export default function Awareness() {
  const [dynamic, setDynamic] = useState({ tips: [], faqs: [] });
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    api
      .get("/awareness")
      .then(({ data }) => {
        const rows = data.data;
        setDynamic({
          tips: rows.filter((r) => r.section === "TIP"),
          faqs: rows.filter((r) => r.section === "FAQ"),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <PageWrapper className="relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" aria-hidden="true"></div>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24 relative z-10">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl drop-shadow-sm">
            Awareness Hub
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            The educational core of this CEP project — everything an ordinary
            citizen should know about online grievance redressal, in simple
            language.
          </p>
        </motion.header>

      {/* A–I sections */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="mt-10 grid gap-6 md:grid-cols-2"
      >
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <motion.article 
            key={title} 
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -5 }}
            className="card p-8 group border-0 bg-white/60 dark:bg-slate-900/60 transition-all hover:shadow-xl hover:shadow-civic-900/5 dark:hover:shadow-civic-900/20 relative overflow-hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-civic-50/50 to-transparent dark:from-civic-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative inline-flex self-start rounded-2xl bg-civic-50 p-3.5 text-civic-600 transition-colors group-hover:bg-civic-600 group-hover:text-white dark:bg-civic-950 dark:text-civic-400 dark:group-hover:bg-civic-600 dark:group-hover:text-white shadow-sm">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="relative mt-5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
            <p className="relative mt-3 text-sm leading-relaxed text-slate-500 font-medium dark:text-slate-400">
              {body}
            </p>
          </motion.article>
        ))}
      </motion.div>

      {/* Dynamic tips from the database */}
      {dynamic.tips.length > 0 && (
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <Lightbulb className="h-6 w-6 text-amber-500" aria-hidden="true" />
            Quick Tips
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {dynamic.tips.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4 dark:bg-amber-950/30"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-100">{t.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* J. FAQs (expandable, from database) */}
      <section className="mt-20" id="faqs">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          J. Frequently Asked Questions
        </h2>
        <div className="mt-6 space-y-4">
          {dynamic.faqs.map((f) => (
            <motion.div 
              key={f.id} 
              layout
              className="card overflow-hidden border-0 bg-white/60 dark:bg-slate-900/60 transition-all hover:shadow-md"
            >
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-slate-900 dark:text-slate-100"
                onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                aria-expanded={openFaq === f.id}
              >
                {f.title}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${openFaq === f.id ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {openFaq === f.id && (
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
          {dynamic.faqs.length === 0 && (
            <p className="text-sm font-medium text-slate-500">FAQs are being prepared.</p>
          )}
        </div>
      </section>
      </div>
    </PageWrapper>
  );
}
