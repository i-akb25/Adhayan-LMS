import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiMapPin,
  FiCalendar,
  FiAward,
  FiTrendingUp,
  FiClock,
  FiTarget,
  FiEdit3,
  FiBookOpen,
  FiZap,
} from "react-icons/fi";
import { FaBrain } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// ==========================================
// DUMMY DATA
// ==========================================
const STUDENT = {
  name: "Anurag Kumar",
  role: "Student",
  email: "anurag.bharti@nitp.ac.in",
  phone: "+91 98765 43210",
  institution: "NIT Patna",
  class: "Class 12",
  enrollmentId: "2025-EE-1044",
  joinDate: "July 2025",
  bio: "Electrical Engineering enthusiast & Full-Stack Developer. Aspiring for GATE 2026.",
  badges: ["Focus Master", "Consistency Champion", "Attendance Hero"],
};

const PERFORMANCE_DATA = [
  { name: "Physics", score: 85 },
  { name: "Chemistry", score: 72 },
  { name: "Math", score: 90 },
  { name: "Comp Sci", score: 95 },
];

// ==========================================
// ANIMATIONS
// ==========================================
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-50 p-4 sm:p-8 font-sans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto"
      >
        {/* HEADER */}
        <header className="bg-white dark:bg-slate-950 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-indigo-500/20 border-4 border-white dark:border-slate-800">
              {STUDENT.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-full border-4 border-white dark:border-slate-950 shadow-md hover:scale-105 transition-transform">
              <FiEdit3 size={16} />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black">{STUDENT.name}</h1>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-200 dark:border-indigo-800/50">
                {STUDENT.role}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
              <span className="flex items-center gap-1.5">
                <FiMail /> {STUDENT.email}
              </span>
              <span className="flex items-center gap-1.5">
                <FiMapPin /> {STUDENT.institution}
              </span>
              <span className="flex items-center gap-1.5">
                <FiCalendar /> Joined {STUDENT.joinDate}
              </span>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
                Edit Profile
              </button>
              <button className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700">
                Share Profile
              </button>
            </div>
          </div>
        </header>

        {/* TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["overview", "analytics", "achievements", "security"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-slate-950 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">About Me</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {STUDENT.bio}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FaBrain className="text-indigo-500" /> AI Insights
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Focus on Power Systems",
                      "Revise Integration",
                      "Daily Mock Tests",
                    ].map((rec, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold flex items-center gap-3"
                      >
                        <FiZap className="text-indigo-500" /> {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Attendance",
                      val: "92%",
                      icon: FiClock,
                      color: "text-emerald-500",
                    },
                    {
                      title: "Performance",
                      val: "82%",
                      icon: FiTrendingUp,
                      color: "text-indigo-500",
                    },
                    {
                      title: "Study Hours",
                      val: "124h",
                      icon: FiBookOpen,
                      color: "text-blue-500",
                    },
                    {
                      title: "Tests",
                      val: "15",
                      icon: FiTarget,
                      color: "text-amber-500",
                    },
                  ].map((k, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4"
                    >
                      <div
                        className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 ${k.color}`}
                      >
                        <k.icon size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">
                          {k.title}
                        </p>
                        <h4 className="text-2xl font-black">{k.val}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[300px]">
                  <h3 className="font-bold text-lg mb-6">
                    Subject Performance
                  </h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={PERFORMANCE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          backgroundColor: "#0f172a",
                          border: "none",
                        }}
                      />
                      <Bar
                        dataKey="score"
                        fill="#6366f1"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
            >
              {STUDENT.badges.map((badge, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-2xl mb-4">
                    <FiAward className="text-amber-500" />
                  </div>
                  <h4 className="font-bold text-sm">{badge}</h4>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
