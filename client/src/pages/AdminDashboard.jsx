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
  FiUsers,
  FiClock,
  FiBook,
  FiFileText,
  FiCpu,
  FiList,
  FiVideo,
  FiGlobe,
  FiMessageSquare,
  FiPieChart,
  FiShield,
  FiActivity,
  FiZap,
  FiSettings,
  FiLogOut,
  FiCheckCircle,
  FiAlertTriangle,
  FiDownload,
  FiPlus,
  FiServer,
  FiDatabase,
  FiHardDrive,
  FiChevronRight,
  FiTrendingUp,
} from "react-icons/fi";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserTie,
  FaUserShield,
} from "react-icons/fa";

// ==========================================
// DUMMY DATA CONFIGURATIONS
// ==========================================

const DEMO_KPI_CARDS = [
  {
    title: "Total Students",
    value: "42,500",
    trend: "+12%",
    icon: FaGraduationCap,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Total Teachers",
    value: "1,240",
    trend: "+5%",
    icon: FaChalkboardTeacher,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    title: "Total Parents",
    value: "38,100",
    trend: "+10%",
    icon: FaUserTie,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    title: "Active Today",
    value: "18,450",
    trend: "+22%",
    icon: FiActivity,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    title: "Attendance Rate",
    value: "94.2%",
    trend: "+1.2%",
    icon: FiClock,
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    title: "Tests Conducted",
    value: "14,200",
    trend: "+45%",
    icon: FiCpu,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Study Materials",
    value: "8,430",
    trend: "+8%",
    icon: FiBook,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    title: "Active Rooms",
    value: "142",
    trend: "+15%",
    icon: FiGlobe,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
];

const DEMO_SYSTEM_HEALTH = [
  {
    metric: "Platform Uptime",
    value: "99.99%",
    status: "Operational",
    icon: FiServer,
    color: "text-emerald-500",
  },
  {
    metric: "Database Cluster",
    value: "Healthy",
    status: "3ms Latency",
    icon: FiDatabase,
    color: "text-emerald-500",
  },
  {
    metric: "API Response Time",
    value: "24ms",
    status: "Optimal",
    icon: FiActivity,
    color: "text-emerald-500",
  },
  {
    metric: "Storage Usage",
    value: "64%",
    status: "4.2 TB / 8 TB",
    icon: FiHardDrive,
    color: "text-amber-500",
  },
];

const DEMO_SECURITY_LOGS = [
  {
    id: 1,
    event: "Multiple Failed Logins",
    user: "IP: 192.168.1.45",
    time: "10 mins ago",
    severity: "High",
  },
  {
    id: 2,
    event: "New Admin Device",
    user: "admin@adhayan.edu",
    time: "1 hour ago",
    severity: "Info",
  },
  {
    id: 3,
    event: "Large Data Export",
    user: "teacher.rohit@...",
    time: "3 hours ago",
    severity: "Medium",
  },
];

const DEMO_PENDING_APPROVALS = [
  {
    id: 1,
    name: "Dr. Anita Desai",
    role: "Teacher",
    dept: "Physics",
    date: "Today",
  },
  {
    id: 2,
    name: "Prof. Rajesh Kumar",
    role: "Teacher",
    dept: "Mathematics",
    date: "Yesterday",
  },
];

const DEMO_AI_ANALYTICS = {
  testsGenerated: "45,200",
  interventions: "12,450",
  accuracy: "98.4%",
  topRiskArea: "Class 11 Organic Chemistry (42% Failure Prediction)",
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
// MAIN COMPONENT
// ==========================================
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { data: live } = useResource(user?.isDemo ? null : "/admin/stats");
  const KPI_CARDS = user?.isDemo
    ? DEMO_KPI_CARDS
    : DEMO_KPI_CARDS.map((s, i) => ({
        ...s,
        value:
          i < 3
            ? String(
                [live?.students || 0, live?.teachers || 0, live?.parents || 0][
                  i
                ],
              )
            : "—",
        trend: "",
      }));
  const SYSTEM_HEALTH = user?.isDemo ? DEMO_SYSTEM_HEALTH : [];
  const SECURITY_LOGS = user?.isDemo ? DEMO_SECURITY_LOGS : [];
  const PENDING_APPROVALS = user?.isDemo ? DEMO_PENDING_APPROVALS : [];
  const AI_ANALYTICS = user?.isDemo
    ? DEMO_AI_ANALYTICS
    : {
        testsGenerated: "—",
        interventions: "—",
        accuracy: "—",
        topRiskArea: "No model-based risk prediction is enabled.",
      };
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Safe fallback for user data
  const adminName = user?.name || "System Admin";
  const avatarLetter = adminName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // --- NAVIGATION CONFIG ---
  const SIDEBAR_SECTIONS = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          icon: FiHome,
          path: "/admin/dashboard",
          active: true,
        },
        { name: "Reports", icon: FiDownload, path: "/parent-connect" },
      ],
    },
    {
      title: "User Management",
      items: [
        { name: "All Users", icon: FiUsers, path: "/admin/users" },
        { name: "Students", icon: FaGraduationCap, path: "/learn" },
        { name: "Teachers", icon: FaChalkboardTeacher, path: "/discussions" },
        { name: "Parents", icon: FaUserTie, path: "/parent-connect" },
      ],
    },
    {
      title: "Platform Modules",
      items: [
        { name: "Attendance", icon: FiClock, path: "/attendance" },
        { name: "Study Materials", icon: FiBook, path: "/study-materials" },
        { name: "Assignments", icon: FiFileText, path: "/assignments" },
        { name: "Diagnostic Tests", icon: FiCpu, path: "/diagnostic-test" },
        { name: "Question Bank", icon: FiList, path: "/diagnostic-test" },
        { name: "Live Classes", icon: FiVideo, path: "/global-study-hall" },
        { name: "Study Rooms", icon: FiGlobe, path: "/global-study-hall" },
        {
          name: "Chat Moderation",
          icon: FiMessageSquare,
          path: "/discussions",
        },
        { name: "Notifications", icon: FiBell, path: "/notifications" },
      ],
    },
    {
      title: "System & Intelligence",
      items: [
        { name: "Analytics", icon: FiPieChart, path: "/analytics" },
        { name: "AI Center", icon: FiZap, path: "/ai-mentor" },
        { name: "Security Logs", icon: FiShield, path: "/admin/users" },
        { name: "System Health", icon: FiActivity, path: "/admin/users" },
      ],
    },
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 xl:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className={`fixed xl:static inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-transform duration-300 xl:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-black dark:from-slate-100 dark:to-slate-300 flex items-center justify-center shadow-lg mr-3">
            <FaUserShield className="text-white dark:text-slate-900" />
          </div>
          <span className="text-xl font-black tracking-tight">ADHAYAN OS</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto xl:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-6 custom-scrollbar">
          {SIDEBAR_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="px-4">
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      item.active
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={
                        item.active
                          ? "text-indigo-600 dark:text-indigo-400"
                          : ""
                      }
                      size={18}
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-1">
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <FiSettings size={18} /> Platform Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <FiLogOut size={18} /> Terminate Session
          </button>
        </div>
      </motion.aside>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50 dark:bg-[#0a0f1c]">
        {user?.isDemo ? (
          <p
            role="status"
            className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200"
          >
            Demonstration data. This account cannot access live records.
          </p>
        ) : (
          <Workspace embedded section="admin" />
        )}

        {/* --- TOP NAVBAR --- */}
        <header className="h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-30 shrink-0 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white focus:outline-none"
            >
              <FiMenu size={24} />
            </button>

            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 w-full max-w-lg focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-inner">
              <FiSearch className="text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search users, IDs, reports, or system logs (Press '/' to focus)..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white placeholder-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 ml-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="hidden lg:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:scale-105 transition-transform"
            >
              <FiPlus /> Create / Broadcast
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
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer pl-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {adminName}
                </span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mt-1">
                  Super Admin
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-black shadow-lg border border-slate-600 dark:border-slate-400">
                {avatarLetter}
              </div>
            </div>
          </div>
        </header>

        {/* --- SCROLLABLE DASHBOARD CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative">
          {/* Top glowing ambient effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-[1600px] mx-auto space-y-8 relative z-10"
          >
            {/* --- WELCOME & SYSTEM STATUS --- */}
            <motion.section
              variants={fadeUp}
              className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
            >
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Platform Control Center
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
                  Manage and monitor the entire learning ecosystem from one
                  place.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Healthy
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
                  <FiDownload /> Export Logs
                </div>
              </div>
            </motion.section>

            {/* --- PLATFORM OVERVIEW (8 KPI CARDS) --- */}

            <motion.section
              variants={fadeUp}
              className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4"
            >
              {KPI_CARDS.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon size={18} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 flex justify-between">
                    {stat.title}{" "}
                    <span className="text-emerald-500">{stat.trend}</span>
                  </p>
                </div>
              ))}
            </motion.section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* --- LEFT / CENTER COLUMN (WIDER) --- */}
              <div className="xl:col-span-2 space-y-8">
                {/* --- AI INTELLIGENCE CENTER (PREMIUM FEATURE) --- */}

                <motion.section
                  variants={fadeUp}
                  className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/30 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/10 backdrop-blur-md text-indigo-300 rounded-xl border border-white/10">
                        <FiZap size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight">
                          AI Intelligence Center
                        </h2>
                        <p className="text-xs text-indigo-300 font-medium mt-1">
                          Global AI Engine Status & Diagnostics
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/settings")}
                      className="bg-white text-indigo-900 hover:bg-indigo-50 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-105"
                    >
                      Configure AI Models
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6 relative z-10">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                      <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-2">
                        Automated Tests Gen
                      </p>
                      <p className="text-3xl font-black">
                        {AI_ANALYTICS.testsGenerated}
                      </p>
                      <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                        <FiTrendingUp /> Saves ~4,000 Teacher Hrs
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                      <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-2">
                        AI Interventions
                      </p>
                      <p className="text-3xl font-black">
                        {AI_ANALYTICS.interventions}
                      </p>
                      <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                        <FiCheckCircle /> {AI_ANALYTICS.accuracy} Accuracy Rate
                      </p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-5">
                      <p className="text-xs text-red-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <FiAlertTriangle /> Top Risk Alert
                      </p>
                      <p className="text-sm font-bold leading-snug">
                        {AI_ANALYTICS.topRiskArea}
                      </p>
                      <button
                        onClick={() => navigate("/parent-connect")}
                        className="mt-3 text-xs font-bold text-red-300 hover:text-white transition-colors underline"
                      >
                        Analyze Root Cause
                      </button>
                    </div>
                  </div>
                </motion.section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* --- USER APPROVALS --- */}

                  <motion.section
                    variants={fadeUp}
                    className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                          <FiUsers size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Pending Approvals
                        </h2>
                      </div>
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">
                        12 New
                      </span>
                    </div>
                    <div className="space-y-4">
                      {PENDING_APPROVALS.map((req) => (
                        <div
                          key={req.id}
                          className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group"
                        >
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {req.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {req.role} • {req.dept}
                            </p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate("/admin/users")}
                              className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 transition-colors"
                            >
                              <FiCheckCircle />
                            </button>
                            <button
                              onClick={() => navigate("/admin/users")}
                              className="p-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <FiX />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate("/admin/users")}
                      className="w-full mt-4 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View All Requests
                    </button>
                  </motion.section>

                  {/* --- ATTENDANCE & ACADEMICS SUMMARY --- */}
                  <motion.section
                    variants={fadeUp}
                    className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                          <FiClock size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Platform Activity
                        </h2>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-600 dark:text-slate-400">
                              Live Classes Ongoing
                            </span>
                            <span className="text-slate-900 dark:text-white">
                              124 / 150
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full w-[82%]"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-600 dark:text-slate-400">
                              Study Rooms Occupancy
                            </span>
                            <span className="text-slate-900 dark:text-white">
                              8,450 Users
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full w-[65%]"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-600 dark:text-slate-400">
                              Daily Test Completions
                            </span>
                            <span className="text-slate-900 dark:text-white">
                              12,100
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-[90%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/learn")}
                      className="w-full mt-6 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Open Full Analytics
                    </button>
                  </motion.section>
                </div>
              </div>

              {/* --- RIGHT COLUMN (NARROWER) --- */}
              <div className="space-y-8">
                {/* --- SYSTEM HEALTH --- */}

                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg">
                        <FiServer size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        System Health
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate("/learn")}
                      className="text-slate-400 hover:text-indigo-500"
                    >
                      <FiActivity size={18} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {SYSTEM_HEALTH.map((metric, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <metric.icon className="text-slate-400" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {metric.metric}
                            </p>
                            <p
                              className={`text-[10px] font-bold ${metric.color}`}
                            >
                              {metric.status}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* --- SECURITY MONITORING --- */}

                <motion.section
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-red-500"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                        <FiShield size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Security Logs
                      </h2>
                    </div>
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                  <div className="space-y-3">
                    {SECURITY_LOGS.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                      >
                        <div
                          className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${log.severity === "High" ? "bg-red-500" : log.severity === "Medium" ? "bg-amber-500" : "bg-blue-500"}`}
                        ></div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight mb-1">
                            {log.event}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {log.user}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 ml-auto whitespace-nowrap">
                          {log.time}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/admin/users")}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold transition-colors shadow-sm hover:opacity-90"
                  >
                    Audit Full Logs <FiChevronRight />
                  </button>
                </motion.section>
              </div>
            </div>

            {/* Footer padding */}
            <div className="h-10"></div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
