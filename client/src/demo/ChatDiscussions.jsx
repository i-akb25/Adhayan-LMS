import { FiX } from "react-icons/fi";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare,
  FiHash,
  FiUsers,
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiShare2,
  FiBookmark,
  FiChevronUp,
  FiChevronDown,
  FiCheckCircle,
  FiAlertTriangle,
  FiPaperclip,
  FiImage,
  FiVideo,
  FiBarChart2,
  FiGlobe,
  FiTarget,
  FiClock,
  FiEye,
  FiMessageCircle,
  FiAward,
} from "react-icons/fi";
import { FaRobot } from "react-icons/fa";

// ==========================================
// DUMMY DATA FOR DEMONSTRATION
// ==========================================
const DEFAULT_USER = {
  id: "u101",
  name: "Anurag Kumar",
  role: "student",
  avatar: "A",
  points: 1250,
  badges: ["Problem Solver", "Consistency Champion"],
};

const COMMUNITIES = [
  { id: "c1", name: "JEE Aspirants 2026", members: "12.4k", type: "exam" },
  { id: "c2", name: "NEET Warriors", members: "8.2k", type: "exam" },
  {
    id: "c3",
    name: "Core Electrical Engg",
    members: "4.5k",
    type: "engineering",
  },
  { id: "c4", name: "MERN Stack Devs", members: "3.1k", type: "coding" },
  { id: "c5", name: "Class 12 Physics", members: "15.6k", type: "academic" },
  { id: "c6", name: "Career Guidance", members: "22k", type: "general" },
];

const DISCUSSIONS = [
  {
    id: "d1",
    author: { name: "Priya Singh", role: "student", avatar: "P" },
    title: "How to master Rotational Mechanics for JEE Advanced?",
    content:
      "I'm struggling with multi-concept problems in Rotational Mechanics, especially when combined with collision or energy conservation. Does anyone have a systematic approach or recommended resources?",
    tags: ["Physics", "JEE Advanced", "Mechanics"],
    community: "JEE Aspirants 2026",
    timestamp: "2 hours ago",
    upvotes: 142,
    answers: 15,
    views: 890,
    isSolved: false,
    hasTeacherResponse: true,
    type: "question",
  },
  {
    id: "d2",
    author: { name: "Dr. Sharma", role: "teacher", avatar: "S" },
    title: "Complete Formula Sheet: Thermodynamics",
    content:
      "I've compiled all necessary formulas and sign conventions for Thermodynamics. This covers both Physics and Chemistry variations. Download the PDF below.",
    tags: ["Physics", "Chemistry", "Resources"],
    community: "Class 12 Physics",
    timestamp: "5 hours ago",
    upvotes: 356,
    answers: 42,
    views: 2100,
    isSolved: false,
    hasTeacherResponse: false,
    type: "resource",
  },
  {
    id: "d3",
    author: { name: "Rahul Dev", role: "student", avatar: "R" },
    title: "Best strategy for attempting Mock Tests?",
    content:
      "Should I attempt Chemistry first or Physics? How much time should I allocate to Mathematics?",
    tags: ["Strategy", "Mock Tests", "Time Management"],
    community: "General",
    timestamp: "1 day ago",
    upvotes: 89,
    answers: 24,
    views: 560,
    isSolved: true,
    hasTeacherResponse: false,
    type: "discussion",
  },
];

const TOP_CONTRIBUTORS = [
  {
    name: "Dr. Sharma",
    role: "teacher",
    points: 15400,
    answers: 450,
    badge: "Top Mentor",
  },
  {
    name: "Aman Verma",
    role: "student",
    points: 8200,
    answers: 120,
    badge: "Problem Solver",
  },
  {
    name: "Neha Gupta",
    role: "student",
    points: 5600,
    answers: 85,
    badge: "Active Learner",
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
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const pulseGlow = {
  initial: { boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)" },
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(99, 102, 241, 0.4)",
      "0 0 0 8px rgba(99, 102, 241, 0)",
      "0 0 0 0 rgba(99, 102, 241, 0)",
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};

// ==========================================
// COMPONENT PROPS & MAIN FUNCTION
// ==========================================
/**
 * @param {Object} currentUser - User details
 * @param {string} userRole - 'student', 'teacher', 'parent', 'admin'
 * @param {string} roomId - Specific room to join (optional)
 * @param {Object} socket - Demonstration-only discussion data
 */
export default function ChatDiscussions({
  currentUser = DEFAULT_USER,
  userRole = "student",
}) {
  // --- STATE MANAGEMENT ---
  const [activeCommunity, setActiveCommunity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Trending"); // Trending, Newest, Unanswered, Solved
  const [showCreateModal, setShowCreateModal] = useState(false);

  // --- FILTERING LOGIC ---
  const filteredDiscussions = useMemo(() => {
    return DISCUSSIONS.filter((d) => {
      const matchCommunity =
        activeCommunity === "All" ||
        d.community === activeCommunity ||
        (activeCommunity === "General" && d.community === "General");
      const matchSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchFilter =
        activeFilter === "All"
          ? true
          : activeFilter === "Unanswered"
            ? d.answers === 0
            : activeFilter === "Solved"
              ? d.isSolved
              : true; // Trending/Newest handled by sorting
      return matchCommunity && matchSearch && matchFilter;
    });
  }, [activeCommunity, searchQuery, activeFilter]);

  // ==========================================
  // RENDER HELPERS: LEFT SIDEBAR
  // ==========================================
  const renderLeftSidebar = () => (
    <div className="w-full lg:w-64 xl:w-72 shrink-0 space-y-6 hidden lg:block h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-4">
      {/* Create Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
      >
        <FiPlus /> New Discussion
      </button>

      {/* Main Navigation */}
      <div className="space-y-1">
        {[
          { label: "Home Feed", icon: FiGlobe, id: "All" },
          { label: "My Questions", icon: FiMessageCircle, id: "MyQuestions" },
          { label: "Bookmarks", icon: FiBookmark, id: "Bookmarks" },
          {
            label: "Announcements",
            icon: FiAlertTriangle,
            id: "Announcements",
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveCommunity(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeCommunity === item.id
                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            }`}
          >
            <item.icon /> {item.label}
          </button>
        ))}
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

      {/* Communities List */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-4 flex items-center gap-2">
          <FiHash /> Your Communities
        </h4>
        <div className="space-y-1">
          {COMMUNITIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCommunity(c.name)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium transition-colors group ${
                activeCommunity === c.name
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <span className="truncate pr-2">{c.name}</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
                {c.members}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ==========================================
  // RENDER HELPERS: MAIN FEED
  // ==========================================
  const renderFeed = () => (
    <div className="flex-1 min-w-0 space-y-6 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar px-2 pb-20">
      {/* Header & Filters */}
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-20">
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          {activeCommunity === "All" ? (
            <>
              <FiGlobe className="text-indigo-500" /> Global Feed
            </>
          ) : (
            <>
              <FiHash className="text-indigo-500" /> {activeCommunity}
            </>
          )}
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search discussions, subjects, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {["Trending", "Newest", "Unanswered", "Solved"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                  activeFilter === f
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Discussion Posts */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredDiscussions.map((post) => (
            <motion.div
              key={post.id}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-950 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-colors cursor-pointer group"
            >
              {/* Post Meta */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${post.author.role === "teacher" ? "bg-emerald-500" : "bg-indigo-500"}`}
                  >
                    {post.author.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {post.author.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          post.author.role === "teacher"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {post.author.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <FiClock /> {post.timestamp} in{" "}
                      <strong className="text-indigo-500 dark:text-indigo-400">
                        {post.community}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2">
                  {post.hasTeacherResponse && (
                    <span className="hidden sm:flex text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50 items-center gap-1">
                      <FiCheckCircle /> Teacher Verified
                    </span>
                  )}
                  <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <FiMoreVertical />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {post.content}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1 sm:gap-4">
                  {/* Upvote Control */}
                  <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-2 py-1">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors">
                      <FiChevronUp size={18} />
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[24px] text-center">
                      {post.upvotes}
                    </span>
                    <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors">
                      <FiChevronDown size={18} />
                    </button>
                  </div>

                  <button className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors">
                    <FiMessageCircle size={18} />{" "}
                    <span className="text-xs font-bold hidden sm:inline">
                      {post.answers} Answers
                    </span>
                  </button>

                  <span className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-slate-400 text-xs font-medium">
                    <FiEye size={18} /> {post.views}
                  </span>
                </div>

                <div className="flex gap-1">
                  <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors">
                    <FiBookmark size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors">
                    <FiShare2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredDiscussions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <FiMessageSquare className="text-4xl text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No discussions found
              </h3>
              <p className="text-sm text-slate-500">
                Try adjusting your filters or start a new discussion.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // ==========================================
  // RENDER HELPERS: RIGHT SIDEBAR
  // ==========================================
  const renderRightSidebar = () => (
    <div className="w-full xl:w-80 shrink-0 space-y-6 hidden xl:block h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pl-4">
      {/* Gamification Profile */}
      <motion.div
        variants={fadeUp}
        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none"></div>
        <h3 className="font-bold text-indigo-100 flex items-center gap-2 mb-4">
          <FiTarget /> Your Standing
        </h3>

        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-2xl font-black backdrop-blur-md">
            {currentUser.avatar}
          </div>
          <div>
            <p className="font-black text-xl">
              {currentUser.points}{" "}
              <span className="text-xs font-bold text-indigo-200">XP</span>
            </p>
            <p className="text-xs font-medium text-indigo-200">
              Top 15% Contributor
            </p>
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-1">
            Badges Earned
          </p>
          <div className="flex flex-wrap gap-2">
            {currentUser.badges.map((b) => (
              <span
                key={b}
                className="text-[10px] font-bold px-2 py-1 bg-white/10 border border-white/20 rounded-md flex items-center gap-1"
              >
                <FiAward className="text-amber-300" /> {b}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Assistant Banner */}
      {userRole === "student" && (
        <motion.div
          variants={fadeUp}
          className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-5 relative overflow-hidden"
        >
          <motion.div
            variants={pulseGlow}
            initial="initial"
            animate="animate"
            className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl"
          ></motion.div>
          <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-2 flex items-center gap-2 relative z-10">
            <FaRobot /> AI Community Assistant
          </h4>
          <p className="text-xs text-indigo-800 dark:text-indigo-400 font-medium leading-relaxed relative z-10">
            I can summarize long discussion threads, suggest related study
            materials, or instantly answer your doubts based on verified teacher
            responses.
          </p>
          <button className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors relative z-10">
            Ask AI Assistant
          </button>
        </motion.div>
      )}

      {/* Leaderboard / Top Contributors */}
      <motion.div
        variants={fadeUp}
        className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiAward className="text-amber-500" /> Top Contributors
          </h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            This Week
          </span>
        </div>
        <div className="space-y-4">
          {TOP_CONTRIBUTORS.map((c, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {c.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {c.role === "teacher" ? "Educator" : "Student"} • {c.badge}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {c.points}
                </span>
                <span className="text-[10px] block text-slate-400">XP</span>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
          View Full Leaderboard
        </button>
      </motion.div>

      {/* Events / Live Sessions */}
      <motion.div
        variants={fadeUp}
        className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-emerald-500"
      >
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FiVideo className="text-emerald-500" /> Upcoming Live Events
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md mb-2 inline-block">
              Today, 5:00 PM
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 leading-snug">
              JEE Advanced Strategy AMA with Dr. Sharma
            </h4>
            <p className="text-xs text-slate-500">Live Q&A Session</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md mb-2 inline-block">
              Tomorrow, 10:00 AM
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 leading-snug">
              Community Mock Test: Full Syllabus
            </h4>
            <p className="text-xs text-slate-500">Global Challenge</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // ==========================================
  // RENDER HELPERS: CREATE POST MODAL
  // ==========================================
  const renderCreateModal = () => (
    <AnimatePresence>
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FiMessageSquare className="text-indigo-500" /> Create
                Discussion
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Title / Question
                </label>
                <input
                  type="text"
                  placeholder="Be specific and clear..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Community
                  </label>
                  <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Select Community...</option>
                    {COMMUNITIES.map((c) => (
                      <option key={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Tags (Max 3)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Physics, Mechanics"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Details / Context
                </label>
                <textarea
                  rows="6"
                  placeholder="Explain your doubt, share your approach, or provide resources..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none custom-scrollbar"
                ></textarea>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <button
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                  title="Attach Image"
                >
                  <FiImage size={18} />
                </button>
                <button
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                  title="Attach File"
                >
                  <FiPaperclip size={18} />
                </button>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
                <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors flex items-center gap-1">
                  <FiBarChart2 size={16} /> Add Poll
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5">
                Post Discussion
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // ==========================================
  // MAIN RENDER RETURN
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shrink-0 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <FiUsers className="text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                Community Forums
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Learn together. Grow together.
              </p>
            </div>
          </div>

          {/* Mobile Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="lg:hidden w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20"
          >
            <FiPlus size={20} />
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col lg:flex-row gap-6 lg:gap-8"
        >
          {renderLeftSidebar()}
          {renderFeed()}
          {renderRightSidebar()}
        </motion.div>
      </main>

      {/* Create Post Modal */}
      {renderCreateModal()}

    </div>
  );
}
