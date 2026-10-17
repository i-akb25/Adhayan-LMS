import { FiArrowRight } from "react-icons/fi";
import Workspace, { useResource } from "../features/Workspace";
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
  FiCpu,
  FiBook,
  FiFileText,
  FiVideo,
  FiGlobe,
  FiMessageSquare,
  FiPieChart,
  FiTrendingUp,
  FiUser,
  FiLogOut,
  FiCheckCircle,
  FiPlayCircle,
  FiDownload,
  FiAward,
  FiStar,
} from "react-icons/fi";

// ==========================================
// DUMMY DATA CONFIGURATIONS
// ==========================================

const DEMO_STATS = [
  {
    title: "Attendance",
    value: "92%",
    icon: FiClock,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    title: "Tests Completed",
    value: "24",
    icon: FiCpu,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Study Hours",
    value: "142",
    icon: FiBook,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Avg. Score",
    value: "78%",
    icon: FiPieChart,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
];

const DEMO_DIAGNOSTIC_DATA = {
  scores: [
    { subject: "Physics", score: 85, color: "bg-emerald-500" },
    { subject: "Chemistry", score: 72, color: "bg-amber-500" },
    { subject: "Mathematics", score: 60, color: "bg-red-500" },
  ],
  weak: ["Integration", "Electrochemistry", "Organic Reactions"],
  strong: ["Mechanics", "Algebra", "Thermodynamics"],
  recommendations: [
    "Practice Calculus exercises",
    "Revise Organic Chemistry notes",
    "Attempt Weekly Mock Test",
  ],
};

const DEMO_UPCOMING_CLASSES = [
  {
    id: 1,
    title: "Rotational Mechanics",
    teacher: "Dr. Sharma",
    time: "10:00 AM Today",
    status: "live",
  },
  {
    id: 2,
    title: "Organic Nomenclature",
    teacher: "Prof. Verma",
    time: "02:00 PM Today",
    status: "upcoming",
  },
];

const DEMO_STUDY_MATERIALS = [
  { id: 1, title: "Physics Notes Ch-4", type: "PDF", size: "2.4 MB" },
  { id: 2, title: "Math Formula Sheet", type: "PDF", size: "1.1 MB" },
  { id: 3, title: "JEE PYQs 2023", type: "ZIP", size: "15 MB" },
];

const DEMO_ASSIGNMENTS = [
  {
    id: 1,
    title: "Calculus Worksheet",
    subject: "Math",
    due: "Tomorrow, 11:59 PM",
    status: "pending",
  },
  {
    id: 2,
    title: "Physics Lab Report",
    subject: "Physics",
    due: "Friday, 5:00 PM",
    status: "submitted",
  },
];

const DEMO_STUDY_ROOMS = [
  { id: 1, name: "JEE Advanced Focus", users: 142, status: "Silent Study" },
  { id: 2, name: "NEET Discussion", users: 89, status: "Active Chat" },
];

const DEMO_ACHIEVEMENTS = [
  { title: "7-Day Streak", icon: FiStar, color: "text-yellow-500" },
  { title: "Top 10% Physics", icon: FiAward, color: "text-purple-500" },
  {
    title: "Perfect Attendance",
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
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { data: live } = useResource(
    user?.isDemo ? null : `/analytics/student/${user.id}`,
  );
  const STATS = user?.isDemo
    ? DEMO_STATS
    : DEMO_STATS.map((s, i) => ({
        ...s,
        value: [
          live?.attendance == null ? "—" : live.attendance + "%",
          String(live?.testsCompleted || 0),
          "—",
          live?.averageScore == null ? "—" : live.averageScore + "%",
        ][i],
      }));
  const DIAGNOSTIC_DATA = user?.isDemo
    ? DEMO_DIAGNOSTIC_DATA
    : {
        scores: (live?.topics || []).map((t) => ({
          subject: t.topic,
          score: t.accuracy,
          color: "bg-indigo-500",
        })),
        weak: live?.weakTopics || [],
        strong: (live?.topics || [])
          .filter((t) => t.accuracy >= 80)
          .map((t) => t.topic),
        recommendations: (live?.weakTopics || []).map((t) => "Revise " + t),
      };
  const UPCOMING_CLASSES = user?.isDemo ? DEMO_UPCOMING_CLASSES : [];
  const STUDY_MATERIALS = user?.isDemo ? DEMO_STUDY_MATERIALS : [];
  const ASSIGNMENTS = user?.isDemo ? DEMO_ASSIGNMENTS : [];
  const STUDY_ROOMS = user?.isDemo ? DEMO_STUDY_ROOMS : [];
  const ACHIEVEMENTS = user?.isDemo ? DEMO_ACHIEVEMENTS : [];
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Defaulting to dark for premium feel

  // Safe fallback for user data
  const studentName = user?.name || "Student";
  const avatarLetter = studentName.charAt(0).toUpperCase();

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
      path: "/student/dashboard",
      active: true,
    },
    { name: "Attendance", icon: FiClock, path: "/attendance" },
    { name: "Diagnostic Tests", icon: FiCpu, path: "/diagnostic-test" },
    { name: "Study Materials", icon: FiBook, path: "/study-materials" },
    { name: "Assignments", icon: FiFileText, path: "/assignments" },
    { name: "Live Classes", icon: FiVideo, path: "/global-study-hall" },
    { name: "Study Rooms", icon: FiGlobe, path: "/global-study-hall" },
    { name: "Discussions", icon: FiMessageSquare, path: "/discussions" },
    { name: "Analytics", icon: FiTrendingUp, path: "/analytics" },
  ];

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans flex overflow-hidden ${darkMode ? "dark" : ""}`}
    >
      {/* ========================================== */}
      {/* SIDEBAR (DESKTOP & MOBILE DRAWER) */}
      {/* ========================================== */}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg mr-3">
            <FiBook className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">ADHAYAN</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
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

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <FiUser size={18} /> Profile
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
          <Workspace embedded section="courses" />
        )}

        {/* TOP NAVBAR */}
        <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white focus:outline-none"
            >
              <FiMenu size={24} />
            </button>

            {/* Search Bar */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 w-64 lg:w-96 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <FiSearch className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search materials, classes..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
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
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {studentName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Class 11 • Science
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                {avatarLetter}
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative">
          {/* Subtle Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-7xl mx-auto space-y-8 relative z-10"
          >
            {/* WELCOME SECTION */}
            <motion.section
              variants={fadeUp}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome back, {studentName} 👋
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  "Success is the sum of small efforts, repeated day in and day
                  out."
                </p>
              </div>
              <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl font-bold shadow-sm">
                🔥 15 Day Learning Streak
              </div>
            </motion.section>

            {/* QUICK STATS (4 CARDS) */}
            <motion.section
              variants={fadeUp}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {STATS.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                </div>
              ))}
            </motion.section>

            {/* MAIN GRID: 2 COLUMNS ON DESKTOP */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* LEFT COLUMN (WIDER) */}
              <div className="xl:col-span-2 space-y-8">
                {/* AI DIAGNOSTIC OVERVIEW */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <FiCpu size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        AI Diagnostic Analysis
                      </h2>
                    </div>
                    <Link
                      to="/student/tests"
                      className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Full Report
                    </Link>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8 relative z-10">
                    {/* Progress Bars */}
                    <div className="space-y-5">
                      {DIAGNOSTIC_DATA.scores.map((stat, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm font-bold mb-2">
                            <span className="text-slate-700 dark:text-slate-300">
                              {stat.subject}
                            </span>
                            <span className="text-slate-900 dark:text-white">
                              {stat.score}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.score}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-full rounded-full ${stat.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Insights */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="mb-4">
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider block mb-2">
                          Critical Weaknesses
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {DIAGNOSTIC_DATA.weak.map((w, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-md"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block mb-2">
                          Established Strengths
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {DIAGNOSTIC_DATA.strong.map((s, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-md"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* TWO COLUMN SUB-GRID (Classes & Assignments) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* UPCOMING CLASSES */}
                  <motion.section
                    variants={fadeUp}
                    className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                        <FiVideo size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Upcoming Classes
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {UPCOMING_CLASSES.map((cls) => (
                        <div
                          key={cls.id}
                          className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate pr-2">
                              {cls.title}
                            </h4>
                            {cls.status === "live" ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full shrink-0">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>{" "}
                                Live
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                                Upcoming
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            {cls.teacher} • {cls.time}
                          </p>
                          <button
                            onClick={() => navigate("/global-study-hall")}
                            className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${cls.status === "live" ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"}`}
                          >
                            {cls.status === "live"
                              ? "Join Classroom"
                              : "Waiting..."}
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.section>

                  {/* PENDING ASSIGNMENTS */}
                  <motion.section
                    variants={fadeUp}
                    className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                        <FiFileText size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Assignments
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {ASSIGNMENTS.map((assgn) => (
                        <div
                          key={assgn.id}
                          className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                {assgn.title}
                              </h4>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                                {assgn.subject}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                              <FiClock /> Due: {assgn.due}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate("/learn")}
                            className={`w-full py-2 rounded-lg text-xs font-bold transition-colors border ${assgn.status === "pending" ? "bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30" : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400"}`}
                          >
                            {assgn.status === "pending"
                              ? "Submit Work"
                              : "✓ Submitted"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                </div>

                {/* STUDY MATERIALS PREVIEW */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FiBook size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Recent Study Materials
                      </h2>
                    </div>
                    <Link
                      to="/student/materials"
                      className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {STUDY_MATERIALS.map((mat) => (
                      <div
                        key={mat.id}
                        className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col group hover:border-indigo-500/50 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <FiFileText className="text-indigo-500 text-xl" />
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {mat.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 truncate">
                          {mat.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                          {mat.size}
                        </p>
                        <div className="flex gap-2 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate("/study-materials")}
                            className="flex-1 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <FiPlayCircle /> View
                          </button>
                          <button
                            onClick={() => navigate("/study-materials")}
                            className="p-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md hover:text-indigo-500"
                          >
                            <FiDownload />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>

              {/* RIGHT COLUMN (NARROWER) */}
              <div className="space-y-8">
                {/* AI LEARNING COACH (PREMIUM WIDGET) */}
                <motion.section
                  variants={fadeUp}
                  className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                      <FiCpu size={20} />
                    </div>
                    <h2 className="text-lg font-bold">Your AI Coach</h2>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <p className="text-sm text-indigo-100 leading-relaxed italic mb-4">
                      "I noticed you struggled with Integration in yesterday's
                      test. I've prepared a custom 15-minute revision module for
                      you."
                    </p>
                    <ul className="space-y-2 mb-6">
                      {DIAGNOSTIC_DATA.recommendations
                        .slice(0, 2)
                        .map((rec, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-white/90"
                          >
                            <FiPlayCircle className="mt-0.5 shrink-0 text-emerald-300" />{" "}
                            {rec}
                          </li>
                        ))}
                    </ul>
                    <button
                      onClick={() => navigate("/study-plan")}
                      className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-transform text-sm"
                    >
                      Start Smart Revision
                    </button>
                  </div>
                </motion.section>

                {/* GLOBAL STUDY ROOMS */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
                        <FiGlobe size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Study Rooms
                      </h2>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {STUDY_ROOMS.map((room) => (
                      <div
                        key={room.id}
                        className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-indigo-500 transition-colors"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {room.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {room.users} Online • {room.status}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate("/learn")}
                          className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                        >
                          <FiArrowRight />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/global-study-hall")}
                    className="w-full mt-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    View All Rooms
                  </button>
                </motion.section>

                {/* ACHIEVEMENTS / BADGES */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
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
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 max-w-[60px] leading-tight">
                          {badge.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>
            </div>

            {/* - AnalyticsAPI: Line charts for Weekly/Monthly growth
              - NotificationAPI: Real-time dropdown bell integration
              - AttendanceAPI: Full calendar widget
            */}

            {/* Footer padding */}
            <div className="h-10"></div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
