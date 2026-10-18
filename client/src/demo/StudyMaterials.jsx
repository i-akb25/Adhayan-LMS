import { FiPieChart, FiShield, FiArrowRight } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiBookmark,
  FiEye,
  FiMoreVertical,
  FiPlayCircle,
  FiFileText,
  FiBook,
  FiFile,
  FiLink,
  FiCpu,
  FiTrendingUp,
  FiClock,
  FiStar,
  FiUploadCloud,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiFolder,
  FiHardDrive,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { BsFiletypePdf, BsFiletypePpt, BsFiletypeDocx } from "react-icons/bs";

// ==========================================
// DUMMY DATA & CONSTANTS
// ==========================================

const STATS = {
  Student: [
    {
      title: "Total Materials",
      value: "1,240+",
      icon: FiBook,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "My Downloads",
      value: "45",
      icon: FiDownload,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Bookmarked",
      value: "12",
      icon: FiBookmark,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "New This Week",
      value: "24",
      icon: FiClock,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
  ],
  Teacher: [
    {
      title: "My Uploads",
      value: "142",
      icon: FiUploadCloud,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Total Downloads",
      value: "3,450",
      icon: FiDownload,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Avg Rating",
      value: "4.8",
      icon: FiStar,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Storage Used",
      value: "4.2 GB",
      icon: FiHardDrive,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ],
  Admin: [
    {
      title: "Platform Total",
      value: "45,200",
      icon: FiBook,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Pending Approval",
      value: "18",
      icon: FiAlertCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Flagged Content",
      value: "2",
      icon: FiAlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Active Storage",
      value: "1.2 TB",
      icon: FiHardDrive,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
  ],
};

const CATEGORIES = [
  "All",
  "PDFs",
  "Videos",
  "Notes",
  "Assignments",
  "PYQs",
  "Formula Sheets",
];
const SUBJECTS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "Computer Science",
];

const MATERIALS = [
  {
    id: 1,
    title: "Rotational Mechanics Complete Notes",
    subject: "Physics",
    type: "PDF",
    teacher: "Dr. Sharma",
    date: "2 days ago",
    downloads: 1240,
    rating: 4.8,
    isBookmarked: true,
    difficulty: "Advanced",
    tags: ["JEE", "Mechanics"],
  },
  {
    id: 2,
    title: "Organic Chemistry SN1/SN2 Mechanisms",
    subject: "Chemistry",
    type: "Video",
    teacher: "Prof. Verma",
    date: "1 week ago",
    downloads: 850,
    rating: 4.9,
    isBookmarked: false,
    difficulty: "Intermediate",
    tags: ["NEET", "Organic"],
  },
  {
    id: 3,
    title: "Calculus Integration Tricks & Formulas",
    subject: "Mathematics",
    type: "Formula Sheet",
    teacher: "Mr. Gupta",
    date: "3 days ago",
    downloads: 2100,
    rating: 5.0,
    isBookmarked: true,
    difficulty: "Beginner",
    tags: ["Boards", "Calculus"],
  },
  {
    id: 4,
    title: "JEE Advanced 2023 Paper Analysis",
    subject: "Physics",
    type: "PYQ",
    teacher: "Dr. Sharma",
    date: "Yesterday",
    downloads: 540,
    rating: 4.7,
    isBookmarked: false,
    difficulty: "Advanced",
    tags: ["JEE Advanced", "PYQ"],
  },
  {
    id: 5,
    title: "Cell Biology Micro-Notes",
    subject: "Biology",
    type: "Notes",
    teacher: "Mrs. Singh",
    date: "1 month ago",
    downloads: 3200,
    rating: 4.6,
    isBookmarked: false,
    difficulty: "Beginner",
    tags: ["NEET", "Cell Biology"],
  },
  {
    id: 6,
    title: "Data Structures in C++",
    subject: "Computer Science",
    type: "Assignment",
    teacher: "Mr. Rao",
    date: "5 days ago",
    downloads: 420,
    rating: 4.5,
    isBookmarked: false,
    difficulty: "Intermediate",
    tags: ["Engineering", "DSA"],
  },
];

const AI_RECOMMENDATIONS = [
  {
    id: 101,
    title: "Mastering Integration",
    reason: "Based on your recent diagnostic test",
  },
  {
    id: 102,
    title: "Electromagnetism Top 50 PYQs",
    reason: "Trending among JEE aspirants",
  },
  {
    id: 103,
    title: "Organic Chemistry Mind Maps",
    reason: "To improve your retention speed",
  },
];

const TYPE_ICONS = {
  PDF: BsFiletypePdf,
  Video: FiPlayCircle,
  Notes: FiFileText,
  "Formula Sheet": FiFile,
  PYQ: FiBook,
  Assignment: BsFiletypeDocx,
  PPT: BsFiletypePpt,
  Link: FiLink,
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
// MATERIAL CARD COMPONENT
// ==========================================
const MaterialCard = ({ material, role }) => {
  const Icon = TYPE_ICONS[material.type] || FiFileText;

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-xl flex items-center justify-center ${
            material.type === "PDF"
              ? "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"
              : material.type === "Video"
                ? "bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400"
                : "bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
          }`}
        >
          <Icon size={24} />
        </div>
        <div className="flex gap-2">
          {role === "Student" && (
            <button
              className={`p-2 rounded-lg transition-colors ${material.isBookmarked ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              <FiBookmark
                className={material.isBookmarked ? "fill-current" : ""}
              />
            </button>
          )}
          {role === "Admin" || role === "Teacher" ? (
            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <FiMoreVertical />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
            {material.subject}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              material.difficulty === "Beginner"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                : material.difficulty === "Advanced"
                  ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {material.difficulty}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {material.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
          <FaChalkboardTeacher /> {material.teacher} • {material.date}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <FiDownload /> {material.downloads}
          </span>
          <span className="flex items-center gap-1 text-amber-500">
            <FiStar className="fill-current" /> {material.rating}
          </span>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
            <FiEye />
          </button>
          <button className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
            <FiDownload />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function StudyMaterials() {
  const { user } = useAuth();

  // Safe fallback for role detection
  const role = user?.role || "Student";
  const kpiData = STATS[role] || STATS["Student"];

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans flex flex-col overflow-hidden selection:bg-indigo-500/30">
      {/* ========================================== */}
      {/* HEADER SECTION */}
      {/* ========================================== */}
      <header className="px-6 py-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                <FiBook className="text-white text-xl" />
              </div>
              Study Materials
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Access, manage, and discover learning resources.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Powerful Search Bar */}
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, PYQs, videos..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Role Specific Actions */}
            {(role === "Teacher" || role === "Admin") && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 shrink-0"
              >
                <FiUploadCloud /> Upload Resource
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================== */}
      {/* MAIN CONTENT GRID */}
      {/* ========================================== */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none z-0"></div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-[1600px] mx-auto relative z-10 space-y-8"
        >
          {/* --- QUICK STATS (4 CARDS) --- */}

          <motion.section
            variants={fadeUp}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {kpiData.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon size={20} />
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

          <div className="flex flex-col xl:flex-row gap-8">
            {/* ========================================== */}
            {/* LEFT COLUMN: FILTERS (SIDEBAR) */}
            {/* ========================================== */}
            <motion.aside
              variants={fadeUp}
              className="w-full xl:w-64 shrink-0 space-y-6"
            >
              {/* Category Filter */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiFilter /> Resource Type
                </h3>
                <div className="space-y-1.5 flex flex-wrap xl:flex-col">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeCategory === cat
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Filter */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiBook /> Subjects
                </h3>
                <div className="space-y-2">
                  {SUBJECTS.map((sub) => (
                    <label
                      key={sub}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900 transition-colors cursor-pointer peer appearance-none checked:bg-indigo-600 checked:border-indigo-600"
                        />
                        <FiCheckCircle className="absolute inset-0 text-white w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 p-0.5" />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {sub}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Exam & Difficulty Dropdowns */}
              <div className="space-y-4">
                <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 font-medium shadow-sm">
                  <option>Target Exam</option>
                  <option>JEE Main & Adv</option>
                  <option>NEET</option>
                  <option>Class 12 Boards</option>
                </select>
                <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 font-medium shadow-sm">
                  <option>Difficulty Level</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </motion.aside>

            {/* ========================================== */}
            {/* CENTER COLUMN: MATERIAL GRID */}
            {/* ========================================== */}
            <div className="flex-1 space-y-8">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:text-indigo-600 transition-colors">
                    Trending
                  </button>
                  <button className="px-4 py-2 bg-transparent text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Recent
                  </button>
                  <button className="hidden sm:block px-4 py-2 bg-transparent text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Highest Rated
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 px-3">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {MATERIALS.length}
                  </span>{" "}
                  Results
                </div>
              </div>

              {/* Grid */}

              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-6"
              >
                {MATERIALS.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    role={role}
                  />
                ))}
              </motion.div>
            </div>

            {/* ========================================== */}
            {/* RIGHT COLUMN: AI & INSIGHTS (Netflix style side-rail) */}
            {/* ========================================== */}
            <motion.aside
              variants={fadeUp}
              className="w-full xl:w-80 shrink-0 space-y-8"
            >
              {/* AI RECOMMENDATIONS (STUDENTS/PARENTS ONLY) */}

              {(role === "Student" || role === "Parent") && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none"></div>

                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-white/10 backdrop-blur-md text-indigo-300 rounded-lg">
                      <FiCpu size={20} />
                    </div>
                    <h2 className="font-bold">AI Recommended</h2>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {AI_RECOMMENDATIONS.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        <h4 className="font-bold text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                          {rec.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <FiTrendingUp className="text-emerald-400" />{" "}
                          {rec.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TEACHER ANALYTICS (TEACHERS ONLY) */}
              {role === "Teacher" && (
                <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h2 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <FiPieChart /> Content Analytics
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          Completion Rate (Notes)
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          68%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full w-[68%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          Assignment Submissions
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          82%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[82%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN MODERATION (ADMIN ONLY) */}
              {role === "Admin" && (
                <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-red-500">
                  <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiShield /> Moderation Queue
                  </h2>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-md">
                            Flagged
                          </span>
                          <span className="text-[10px] text-slate-500">
                            By System AI
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mb-2 truncate">
                          Chemistry Notes (Copy).pdf
                        </p>
                        <div className="flex gap-2">
                          <button className="flex-1 py-1 bg-white dark:bg-slate-900 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:text-indigo-600">
                            Review
                          </button>
                          <button className="flex-1 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBJECT COLLECTIONS (ALL ROLES) */}
              <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiFolder /> Browse Collections
                </h2>
                <div className="space-y-2">
                  {[
                    "Physics Hub",
                    "Chemistry Labs",
                    "Math Masterclass",
                    "Engineering Core",
                  ].map((hub) => (
                    <div
                      key={hub}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer flex justify-between items-center group"
                    >
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {hub}
                      </span>
                      <FiArrowRight className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>

          <div className="h-10"></div>
        </motion.div>
      </main>

      {/* ========================================== */}
      {/* UPLOAD MODAL (TEACHERS / ADMIN) */}
      {/* ========================================== */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FiUploadCloud className="text-indigo-500" /> Upload Study
                  Material
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {/* Demonstration resource tools */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-4 flex gap-4">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm text-indigo-600 shrink-0">
                    <FiCpu size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 mb-1">
                      AI Document Analysis Active
                    </h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400">
                      Adhayan AI will automatically read your PDF to generate
                      smart tags, a summary, and extract potential quiz
                      questions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Material Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Thermodynamics Complete Notes"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Subject
                    </label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                      {SUBJECTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Resource Type
                    </label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                      {CATEGORIES.slice(1).map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Google Drive / Local Upload Area */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <FiUploadCloud size={32} />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                      Click to browse or drag and drop
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Supported formats: PDF, PPTX, DOCX, MP4, JPG (Max 50MB)
                    </p>

                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 max-w-[100px]"></div>
                      <span className="text-xs text-slate-400 font-bold uppercase">
                        OR
                      </span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 max-w-[100px]"></div>
                    </div>

                    <button className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:border-indigo-500 transition-colors flex items-center gap-2 mx-auto">
                      Import from Google Drive
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
                  <FiCheckCircle /> Publish Material
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
