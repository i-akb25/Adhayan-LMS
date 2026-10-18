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
  FiUsers,
  FiClock,
  FiBook,
  FiFileText,
  FiCpu,
  FiList,
  FiVideo,
  FiMessageSquare,
  FiPhoneCall,
  FiTrendingUp,
  FiUser,
  FiLogOut,
  FiPlus,
  FiUploadCloud,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiAlertTriangle,
  FiPieChart,
  FiCalendar,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";

// ==========================================
// DUMMY DATA CONFIGURATIONS
// ==========================================

const DEMO_QUICK_STATS = [
  {
    title: "Total Students",
    value: "320",
    icon: FiUsers,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Today's Attendance",
    value: "94%",
    icon: FiClock,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    title: "Active Assignments",
    value: "12",
    icon: FiFileText,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    title: "Classes Scheduled",
    value: "8",
    icon: FiVideo,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Tests Created",
    value: "45",
    icon: FiCpu,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    title: "Avg Class Score",
    value: "76%",
    icon: FiPieChart,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
];

const DEMO_UPCOMING_CLASSES = [
  {
    id: 1,
    title: "Physics: Rotational Dynamics",
    class: "Class 11 Science",
    time: "10:00 AM Today",
    status: "upcoming",
  },
  {
    id: 2,
    title: "JEE Advanced Problem Solving",
    class: "Batch A",
    time: "02:00 PM Today",
    status: "upcoming",
  },
];

const DEMO_RECENT_MATERIALS = [
  { id: 1, title: "Rotational Mechanics Notes v2", type: "PDF", views: 145 },
  { id: 2, title: "Thermodynamics Formula Sheet", type: "PDF", views: 89 },
  { id: 3, title: "Kinematics Weekly PYQ", type: "ZIP", views: 210 },
];

const DEMO_ACTIVE_ASSIGNMENTS = [
  {
    id: 1,
    title: "Calculus Worksheet 4",
    class: "Class 12",
    due: "Tomorrow",
    submitted: 42,
    total: 45,
  },
  {
    id: 2,
    title: "Physics Lab Report",
    class: "Class 11",
    due: "Friday",
    submitted: 12,
    total: 40,
  },
];

const DEMO_PARENT_MESSAGES = [
  {
    id: 1,
    parent: "Mr. Sharma",
    student: "Aarav",
    subject: "Regarding low test scores",
    time: "2 hours ago",
  },
  {
    id: 2,
    parent: "Mrs. Verma",
    student: "Priya",
    subject: "Leave application for tomorrow",
    time: "Yesterday",
  },
];

const DEMO_AI_INSIGHTS = {
  riskStudents: ["Rahul D.", "Sneha P.", "Vikram S."],
  recommendations: [
    "Generate extra mock test for Integration",
    "Send attendance warning to 3 parents",
    "Review Rotational Mechanics concepts",
  ],
  classTrend: "+4.2% improvement in Physics this month.",
};

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
export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const QUICK_STATS = user?.isDemo
    ? DEMO_QUICK_STATS
    : DEMO_QUICK_STATS.map((s) => ({ ...s, value: "—" }));
  const UPCOMING_CLASSES = user?.isDemo ? DEMO_UPCOMING_CLASSES : [];
  const RECENT_MATERIALS = user?.isDemo ? DEMO_RECENT_MATERIALS : [];
  const ACTIVE_ASSIGNMENTS = user?.isDemo ? DEMO_ACTIVE_ASSIGNMENTS : [];
  const PARENT_MESSAGES = user?.isDemo ? DEMO_PARENT_MESSAGES : [];
  const AI_INSIGHTS = user?.isDemo
    ? DEMO_AI_INSIGHTS
    : {
        riskStudents: [],
        recommendations: [],
        classTrend:
          "Reports appear after enrolled students submit assessments.",
      };
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Safe fallback for user data
  const teacherName = user?.name || "Prof. Sharma";
  const avatarLetter = teacherName.charAt(0).toUpperCase();

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
      path: "/teacher/dashboard",
      active: true,
    },
    { name: "Students", icon: FiUsers, path: "/learn" },
    { name: "Attendance", icon: FiClock, path: "/attendance" },
    { name: "Study Materials", icon: FiBook, path: "/study-materials" },
    { name: "Assignments", icon: FiFileText, path: "/assignments" },
    { name: "Diagnostic Tests", icon: FiCpu, path: "/diagnostic-test" },
    { name: "Question Bank", icon: FiList, path: "/diagnostic-test" },
    { name: "Live Classes", icon: FiVideo, path: "/global-study-hall" },
    { name: "Chat & Doubts", icon: FiMessageSquare, path: "/discussions" },
    { name: "Parent Connect", icon: FiPhoneCall, path: "/parent-connect" },
    { name: "Analytics", icon: FiTrendingUp, path: "/analytics" },
  ];

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans flex overflow-hidden ${darkMode ? "dark" : ""}`}
    >
      {/* ========================================== */}
      {/* SIDEBAR (DESKTOP & MOBILE DRAWER) */}
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
            <FaChalkboardTeacher className="text-white" />
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
            Menu
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
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <FiUser size={18} /> Profile & Settings
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
                placeholder="Search students, materials, assignments..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 ml-4">
            <button
              onClick={() => navigate("/learn")}
              className="hidden lg:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-600/20 transition-colors"
            >
              <FiPlus /> Quick Action
            </button>
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
                  {teacherName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Physics Dept
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
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
            {/* WELCOME SECTION */}
            <motion.section
              variants={fadeUp}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome back, {teacherName}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Here is what's happening across your classes today.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 px-5 py-2.5 rounded-xl font-bold shadow-sm">
                🎯 You impacted 320 students this month.
              </div>
            </motion.section>

            {/* QUICK STATS (6 CARDS) */}
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

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* LEFT/CENTER COLUMN (WIDER) */}
              <div className="xl:col-span-2 space-y-8">
                {/* --- AI TEACHING ASSISTANT (PREMIUM FEATURE) --- */}
                <motion.section
                  variants={fadeUp}
                  className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 backdrop-blur-md text-indigo-300 rounded-lg">
                        <FiCpu size={24} />
                      </div>
                      <h2 className="text-2xl font-bold">
                        AI Teaching Assistant
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate("/diagnostic-test")}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Generate Test
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4">
                        Smart Insights
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                          <FiTrendingUp className="text-emerald-400 mt-1 shrink-0" />
                          <p className="text-sm">{AI_INSIGHTS.classTrend}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                          <FiAlertTriangle className="text-amber-400 mt-1 shrink-0" />
                          <div>
                            <p className="text-sm font-bold mb-1">
                              Students At Risk
                            </p>
                            <p className="text-xs text-slate-300">
                              Requires attention:{" "}
                              {AI_INSIGHTS.riskStudents.join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4">
                        AI Recommendations
                      </h3>
                      <ul className="space-y-3">
                        {AI_INSIGHTS.recommendations.map((rec, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm bg-white/5 border border-white/10 rounded-xl p-3"
                          >
                            <FiCheckCircle className="text-indigo-400 mt-0.5 shrink-0" />{" "}
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* --- ATTENDANCE MANAGEMENT --- */}
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
                          Attendance
                        </h2>
                      </div>
                      <button
                        onClick={() => navigate("/attendance")}
                        className="text-sm font-bold text-indigo-600 dark:text-indigo-400"
                      >
                        Mark Now
                      </button>
                    </div>
                    <div className="flex items-center justify-center py-4">
                      {/* Demonstration attendance summary */}
                      <div className="w-32 h-32 rounded-full border-8 border-emerald-500 border-r-slate-200 dark:border-r-slate-800 flex items-center justify-center">
                        <div className="text-2xl font-black">94%</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="text-xs text-slate-500">Present</p>
                        <p className="font-bold text-emerald-500">42</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Absent</p>
                        <p className="font-bold text-red-500">3</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Late</p>
                        <p className="font-bold text-amber-500">0</p>
                      </div>
                    </div>
                  </motion.section>

                  {/* --- ASSIGNMENT OVERVIEW --- */}
                  <motion.section
                    variants={fadeUp}
                    className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                          <FiFileText size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Active Assignments
                        </h2>
                      </div>
                      <button
                        onClick={() => navigate("/learn")}
                        className="text-slate-400 hover:text-indigo-500"
                      >
                        <FiPlus size={20} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {ACTIVE_ASSIGNMENTS.map((assgn) => (
                        <div
                          key={assgn.id}
                          className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                        >
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                            {assgn.title}
                          </h4>
                          <p className="text-xs text-slate-500 mb-3">
                            {assgn.class} • Due: {assgn.due}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-500">
                              {assgn.submitted}/{assgn.total} Submitted
                            </span>
                            <button
                              onClick={() => navigate("/assignments")}
                              className="font-bold text-indigo-600 dark:text-indigo-400"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                </div>

                {/* --- STUDY MATERIALS MANAGEMENT --- */}
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
                        Recent Uploads
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate("/learn")}
                      className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                    >
                      <FiUploadCloud /> Upload New
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {RECENT_MATERIALS.map((mat) => (
                      <div
                        key={mat.id}
                        className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 group"
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
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                          <FiEye /> {mat.views} views
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate("/study-materials")}
                            className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => navigate("/study-materials")}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors ml-auto"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>

              {/* RIGHT COLUMN (NARROWER) */}
              <div className="space-y-8">
                {/* --- UPCOMING CLASSES --- */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                        <FiVideo size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Live Classes
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate("/learn")}
                      className="text-slate-400 hover:text-indigo-500"
                    >
                      <FiPlus size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {UPCOMING_CLASSES.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
                      >
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mb-1">
                          {cls.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          {cls.class} • {cls.time}
                        </p>
                        <button
                          onClick={() => navigate("/global-study-hall")}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          Start Class
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* --- PARENT COMMUNICATION --- */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                        <FiPhoneCall size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Parent Connect
                      </h2>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {PARENT_MESSAGES.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {msg.parent}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            {msg.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Re: {msg.student} ({msg.subject})
                        </p>
                        <button
                          onClick={() => navigate("/discussions")}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400"
                        >
                          Reply
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/discussions")}
                    className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    View All Messages
                  </button>
                </motion.section>

                {/* --- QUICK ACTIONS / TOOLS --- */}
                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Quick Tools
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate("/diagnostic-test")}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <FiList size={20} />
                      <span className="text-xs font-bold text-center">
                        Question Bank
                      </span>
                    </button>
                    <button
                      onClick={() => navigate("/attendance")}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <FiCalendar size={20} />
                      <span className="text-xs font-bold text-center">
                        Schedule PTM
                      </span>
                    </button>
                  </div>
                </motion.section>
              </div>
            </div>

            {/* - AnalyticsAPI: Bar charts for class average performance
              - ChatAPI: WebSocket integration for doubt solving 
            */}

            <div className="h-10"></div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
