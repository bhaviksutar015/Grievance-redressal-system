import { Mail, MapPin, GraduationCap, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";

export default function Contact() {
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
            Get In Touch
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl drop-shadow-sm">
            Contact
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            Questions about this CEP project or the platform? Reach out.
          </p>
        </motion.header>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="mt-12 grid gap-6 sm:grid-cols-2"
        >
          {[
            {
              icon: GraduationCap,
              title: "Project",
              content: (
                <>
                  OGRSA — Online Grievance Redressal System Awareness.
                  <br /> BSc IT Community Engagement Project (CEP).
                </>
              )
            },
            {
              icon: Mail,
              title: "Email",
              content: "Use your institution-provided project contact address."
            },
            {
              icon: MapPin,
              title: "Location",
              content: "Mumbai, Maharashtra, India."
            },
            {
              icon: MessageSquareText,
              title: "Have a grievance instead?",
              content: (
                <>
                  Don't email it — <Link to="/submit" className="font-bold text-civic-600 hover:text-civic-700 dark:text-civic-400 dark:hover:text-civic-300 hover:underline underline-offset-2">submit it through the platform</Link>{" "}
                  so it gets a reference ID and a trackable timeline.
                </>
              )
            }
          ].map((item, i) => (
            <motion.div 
              key={item.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -5 }}
              className="card p-8 group border-0 bg-white/60 dark:bg-slate-900/60 transition-all hover:shadow-xl hover:shadow-civic-900/5 dark:hover:shadow-civic-900/20 relative overflow-hidden flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-civic-50/50 to-transparent dark:from-civic-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative inline-flex self-start rounded-2xl bg-civic-50 p-3.5 text-civic-600 transition-colors group-hover:bg-civic-600 group-hover:text-white dark:bg-civic-950 dark:text-civic-400 dark:group-hover:bg-civic-600 dark:group-hover:text-white shadow-sm">
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="relative mt-5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{item.title}</h2>
              <p className="relative mt-3 text-sm leading-relaxed text-slate-500 font-medium">
                {item.content}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-100 dark:border-amber-900/50 p-6 text-center text-sm font-medium leading-relaxed text-amber-800 dark:text-amber-300 shadow-sm"
        >
          <strong className="block text-amber-900 dark:text-amber-200 mb-1 font-bold text-base">Educational Disclaimer</strong>
          OGRSA is a student project. For real grievances,
          please use the official portals of your local municipal corporation or
          the relevant government department.
        </motion.p>
      </div>
    </PageWrapper>
  );
}
