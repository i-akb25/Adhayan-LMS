import Workspace from "../features/Workspace";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiMoon,
  FiSun,
  FiHome,
  FiClock,
  FiBook,
  FiFileText,
  FiCpu,
  FiTrendingUp,
  FiUser,
  FiSettings,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
  FiMessageSquare,
  FiPieChart,
  FiVideo,
  FiActivity,
  FiStar,
  FiAward,
  FiArrowRight,
} from "react-icons/fi";
import { FaUserTie, FaGraduationCap } from "react-icons/fa";

// ==========================================
// DUMMY DATA CONFIGURATIONS
// ==========================================

const DEMO_CHILD_INFO = {
  name: "Aryan Kumar",
  class: "Class 11",
  section: "A",
  stream: "Science (PCM)",
  attendance: "92%",
  avgMarks: "85%",
  streak: 15,
};

const DEMO_QUICK_STATS = [
  {
    title: "Attendance",
    value: "92%",
    icon: FiClock,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    title: "Avg Score",
    value: "85%",
    icon: FiPieChart,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Assignments",
    value: "24/26",
    icon: FiFileText,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    title: "Tests Attempted",
    value: "12",
    icon: FiCpu,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Live Classes",
    value: "45",
    icon: FiVideo,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    title: "Consistency",
    value: "9.4/10",
    icon: FiActivity,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
];

const DEMO_ACADEMIC_PERFORMANCE = [
  { subject: "Physics", score: 88, color: "bg-blue-500" },
  { subject: "Chemistry", score: 76, color: "bg-amber-500" },
  { subject: "Mathematics", score: 92, color: "bg-emerald-500" },
  { subject: "English", score: 85, color: "bg-purple-500" },
  { subject: "Computer Science", score: 89, color: "bg-pink-500" },
];

const DEMO_ABSENCE_ALERTS = [
  {
    id: 1,
    date: "15 Jan 2026",
    type: "Absent",
    reason: "Medical Leave",
    acknowledged: true,
  },
  {
    id: 2,
    date: "23 Jan 2026",
    type: "Absent",
    reason: "Unexcused",
    acknowledged: false,
  },
  {
    id: 3,
    date: "27 Jan 2026",
    type: "Late",
    reason: "Transport Delay",
    acknowledged: true,
  },
];

const DEMO_TEACHER_MESSAGES = [
  {
    id: 1,
    teacher: "Dr. Sharma (Physics)",
    message: "Aryan has shown great improvement in Thermodynamics. Keep it up!",
    date: "Today, 10:30 AM",
    type: "praise",
  },
  {
    id: 2,
    teacher: "Prof. Verma (Math)",
    message: "Please ensure Aryan completes the Calculus worksheet by Friday.",
    date: "Yesterday",
    type: "alert",
  },
];

const DEMO_ASSIGNMENTS = [
  {
    id: 1,
    title: "Calculus Worksheet 4",
    subject: "Math",
    status: "Submitted",
    due: "Tomorrow",
    grade: "Pending",
  },
  {
    id: 2,
    title: "Organic Chem Lab",
    subject: "Chemistry",
    status: "Pending",
    due: "Friday",
    grade: "N/A",
  },
];

const DEMO_AI_ADVISOR = {
  summary:
    "Aryan is performing well above the class average, but needs focus on Organic Chemistry.",
  risks: [
    "Missed 2 Chemistry assignments this month.",
    "Consistency dropped by 5% last week.",
  ],
  actions: [
    "Schedule 30 mins extra for Chemistry daily.",
    "Acknowledge recent absence alert.",
  ],
};

const DEMO_ACHIEVEMENTS = [
  { title: "Consistency Champion", icon: FiStar, color: "text-yellow-500" },
  { title: "Math Quiz Master", icon: FiAward, color: "text-purple-500" },
  {
    title: "Perfect Attendance (Jan)",
    icon: FiCheckCircle,
    color: "text-emerald-500",
  },
];

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const CHILD_INFO = user?.isDemo
    ? DEMO_CHILD_INFO
    : { name: "your linked student", class: "", stream: "", streak: 0 };
  const QUICK_STATS = user?.isDemo
    ? DEMO_QUICK_STATS
    : DEMO_QUICK_STATS.map((s) => ({ ...s, value: "—" }));
  const ACADEMIC_PERFORMANCE = user?.isDemo ? DEMO_ACADEMIC_PERFORMANCE : [];
  const ABSENCE_ALERTS = user?.isDemo ? DEMO_ABSENCE_ALERTS : [];
  const TEACHER_MESSAGES = user?.isDemo ? DEMO_TEACHER_MESSAGES : [];
  const ASSIGNMENTS = user?.isDemo ? DEMO_ASSIGNMENTS : [];
  const AI_ADVISOR = user?.isDemo
    ? DEMO_AI_ADVISOR
    : {
        summary: "Link a student to view their recorded learning progress.",
        risks: [],
        actions: [],
      };
  const ACHIEVEMENTS = user?.isDemo ? DEMO_ACHIEVEMENTS : [];
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Safe fallback for user data
  const parentName = user?.name || "Mr. Kumar";
  const avatarLetter = parentName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // --- NAVIGATION CONFIG ---
  const NAV_ITEMS = [
    {
      name: "Dashboard",
      icon: FiHome,
      path: "/parent/dashboard",
      active: true,
    },
    { name: "Child Profile", icon: FiUser, path: "/profile" },
    { name: "Attendance", icon: FiClock, path: "/attendance" },
    { name: "Academic Performance", icon: FiTrendingUp, path: "/analytics" },
    { name: "Diagnostic Reports", icon: FiCpu, path: "/parent-connect" },
    { name: "Study Recommendations", icon: FiBook, path: "/study-plan" },
    { name: "Assignments", icon: FiFileText, path: "/assignments" },
    { name: "Teacher Connect", icon: FiMessageSquare, path: "/discussions" },
    { name: "Live Classes", icon: FiVideo, path: "/global-study-hall" },
    { name: "Analytics", icon: FiPieChart, path: "/analytics" },
  ];

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans flex overflow-hidden ${darkMode ? "dark" : ""}`}
    >
      {/* ========================================== */}
      {/* SIDEBAR */}
      {/* ========================================== */}

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 xl:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className={`fixed xl:static inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-transform duration-300 xl:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg mr-3">
            <FaUserTie className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">ADHAYAN</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto xl:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-4">
            Parent Portal
          </div>
          {NAV_ITEMS.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <item.icon
                className={
                  item.active ? "text-indigo-600 dark:text-indigo-400" : ""
                }
                size={18}
              />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-1">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <FiSettings size={18} /> Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </motion.aside>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {user?.isDemo ? (
          <p
            role="status"
            className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200"
          >
            Demonstration data. This account cannot access live records.
          </p>
        ) : (
          <Workspace embedded section="parent" />
        )}

        {/* --- TOP NAVBAR --- */}
        <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white focus:outline-none"
            >
              <FiMenu size={24} />
            </button>

            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 w-full max-w-md focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <FiSearch className="text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search reports, messages, assignments..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 ml-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 rounded-full transition-colors"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 rounded-full transition-colors"
            >
              <FiBell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {parentName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Parent of {CHILD_INFO.name.split(" ")[0]}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shadow-md">
                {avatarLetter}
              </div>
            </div>
          </div>
        </header>

        {/* --- SCROLLABLE DASHBOARD CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-[1600px] mx-auto space-y-8 relative z-10"
          >
            {/* --- WELCOME & OVERVIEW SECTION --- */}
            <motion.section
              variants={fadeUp}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome Back, {parentName}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Stay connected with {CHILD_INFO.name.split(" ")[0]}'s learning
                  journey.
                </p>
              </div>

              {/* Child Overview Mini Card */}
              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FaGraduationCap size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                    {CHILD_INFO.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {CHILD_INFO.class} • {CHILD_INFO.stream}
                  </p>
                </div>
                <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 hidden sm:block">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm font-bold">
                    🔥 {CHILD_INFO.streak} Day Streak
                  </div>
                </div>
              </div>
            </motion.section>

            {/* --- QUICK STATS (6 CARDS) --- */}
            <motion.section
              variants={fadeUp}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6"
            >
              {QUICK_STATS.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {stat.title}
                  </p>
                </div>
              ))}
            </motion.section>

            {/* --- MAIN GRID --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* --- LEFT COLUMN (WIDER) --- */}
              <div className="xl:col-span-2 space-y-8">
                {/* --- ACADEMIC PERFORMANCE --- */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FiTrendingUp size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Academic Performance
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate("/parent-connect")}
                      className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Detailed Report
                    </button>
                  </div>

                  <div className="space-y-6">
                    {ACADEMIC_PERFORMANCE.map((subject, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-slate-700 dark:text-slate-300">
                            {subject.subject}
                          </span>
                          <span className="text-slate-900 dark:text-white">
                            {subject.score}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${subject.score}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${subject.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* --- ATTENDANCE & ABSENCE ALERTS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* ATTENDANCE SUMMARY */}
                  <motion.section
                    variants={fadeUp}
                    className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                          <FiClock size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Monthly Attendance
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center justify-center py-2">
                      <div className="w-32 h-32 rounded-full border-8 border-emerald-500 border-r-slate-200 dark:border-r-slate-800 flex items-center justify-center">
                        <div className="text-2xl font-black">92%</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="text-xs text-slate-500">Present</p>
                        <p className="font-bold text-emerald-500">22</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Absent</p>
                        <p className="font-bold text-red-500">2</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Late</p>
                        <p className="font-bold text-amber-500">1</p>
                      </div>
                    </div>
                  </motion.section>

                  {/* ABSENCE ALERTS */}
                  <motion.section
                    variants={fadeUp}
                    className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                        <FiAlertCircle size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Recent Alerts
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {ABSENCE_ALERTS.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4
                              className={`font-bold text-sm ${alert.type === "Absent" ? "text-red-500" : "text-amber-500"}`}
                            >
                              {alert.type}: {alert.date}
                            </h4>
                            {!alert.acknowledged && (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                            Reason: {alert.reason}
                          </p>
                          {!alert.acknowledged ? (
                            <button
                              onClick={() => navigate("/learn")}
                              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors border border-indigo-200 dark:border-indigo-800/50"
                            >
                              Acknowledge
                            </button>
                          ) : (
                            <div className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                              <FiCheckCircle /> Acknowledged
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.section>
                </div>

                {/* --- ASSIGNMENTS OVERVIEW --- */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                        <FiFileText size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Assignments Overview
                      </h2>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {ASSIGNMENTS.map((assgn) => (
                      <div
                        key={assgn.id}
                        className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-indigo-500 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {assgn.title}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${assgn.status === "Submitted" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                            >
                              {assgn.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Subject: {assgn.subject} • Due: {assgn.due}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate("/learn")}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <FiArrowRight size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>

              {/* --- RIGHT COLUMN (NARROWER) --- */}
              <div className="space-y-8">
                {/* --- AI PARENT ADVISOR (PREMIUM WIDGET) --- */}
                <motion.section
                  variants={fadeUp}
                  className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                      <FiCpu size={20} />
                    </div>
                    <h2 className="text-lg font-bold">AI Parent Advisor</h2>
                  </div>
                  <div className="space-y-5 relative z-10">
                    <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                      {AI_ADVISOR.summary}
                    </p>

                    <div>
                      <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">
                        Attention Required
                      </h4>
                      <ul className="space-y-2">
                        {AI_ADVISOR.risks.map((risk, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-white bg-black/20 p-2 rounded-lg border border-white/10"
                          >
                            <FiAlertCircle className="mt-0.5 shrink-0 text-amber-300" />{" "}
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">
                        Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {AI_ADVISOR.actions.map((action, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-white"
                          >
                            <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-300" />{" "}
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.section>

                {/* --- TEACHER COMMUNICATION --- */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                        <FiMessageSquare size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Teacher Updates
                      </h2>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {TEACHER_MESSAGES.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {msg.teacher}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            {msg.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                          {msg.message}
                        </p>
                        <button
                          onClick={() => navigate("/discussions")}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Reply directly
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/discussions")}
                    className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Schedule PTM
                  </button>
                </motion.section>

                {/* --- ACHIEVEMENTS --- */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                    Recent Badges
                  </h2>
                  <div className="flex justify-around">
                    {ACHIEVEMENTS.map((badge, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center text-center gap-2"
                      >
                        <div
                          className={`w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm ${badge.color}`}
                        >
                          <badge.icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 max-w-[70px] leading-tight">
                          {badge.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>
            </div>

            {/* - PerformanceAPI: Line charts for growth
              - DiagnosticTestAPI: Detailed AI weak/strong topic fetching
              - ParentAdvisorAPI: Fetch NLP generated insights
            */}

            <div className="h-10"></div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
