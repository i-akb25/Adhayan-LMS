import { FiPause, FiPlay, FiRotateCcw } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiGlobe,
  FiClock,
  FiActivity,
  FiMessageSquare,
  FiVideo,
  FiMic,
  FiHeadphones,
  FiFilter,
  FiPlus,
  FiAward,
  FiStar,
  FiTrendingUp,
  FiMap,
  FiSettings,
  FiSend,
} from "react-icons/fi";
import { FaBrain } from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

// ==========================================
// DUMMY DATA FOR DEMONSTRATION
// ==========================================
const DEFAULT_USER = {
  id: "u101",
  name: "Anurag Kumar",
  role: "student",
  avatar: "A",
  focusScore: 88,
  level: 12,
};

const HALL_CATEGORIES = [
  {
    id: "h1",
    title: "JEE Advanced Warriors",
    type: "exam",
    participants: "12.4k",
    status: "High Focus",
  },
  {
    id: "h2",
    title: "NEET 2026 Batch",
    type: "exam",
    participants: "18.2k",
    status: "Moderate",
  },
  {
    id: "h3",
    title: "Electrical Engineering Core",
    type: "university",
    participants: "4.1k",
    status: "High Focus",
  },
  {
    id: "h4",
    title: "MERN Stack Builders",
    type: "coding",
    participants: "8.5k",
    status: "Collaborative",
  },
  {
    id: "h5",
    title: "Silent Library",
    type: "focus",
    participants: "25.6k",
    status: "Ultra Quiet",
  },
  {
    id: "h6",
    title: "Pomodoro 50/10",
    type: "timer",
    participants: "6.2k",
    status: "In Session",
  },
];

const STUDY_TABLES = [
  {
    id: "t1",
    name: "Rotational Mechanics Doubts",
    topic: "Physics",
    users: 8,
    max: 10,
    type: "voice",
  },
  {
    id: "t2",
    name: "Organic Chem Reactions",
    topic: "Chemistry",
    users: 12,
    max: 15,
    type: "text",
  },
  {
    id: "t3",
    name: "Power Systems Revision",
    topic: "Electrical",
    users: 4,
    max: 6,
    type: "video",
  },
  {
    id: "t4",
    name: "Silent Reading Room 1A",
    topic: "General",
    users: 45,
    max: 50,
    type: "silent",
  },
];

const LEADERBOARD_DATA = [
  {
    rank: 1,
    name: "Vikram Desai",
    time: "12h 45m",
    score: 98,
    badge: "Focus Master",
  },
  {
    rank: 2,
    name: "Priya Singh",
    time: "11h 20m",
    score: 95,
    badge: "Consistency Pro",
  },
  {
    rank: 3,
    name: "Anurag Kumar",
    time: "10h 15m",
    score: 92,
    badge: "Rising Star",
  },
  {
    rank: 4,
    name: "Rohan Verma",
    time: "9h 30m",
    score: 88,
    badge: "Early Bird",
  },
];

const CHAT_MESSAGES = [
  {
    id: 1,
    sender: "System",
    text: "Welcome to the Global Study Hall. Productivity mode is active.",
    time: "08:00 AM",
    type: "system",
  },
  {
    id: 2,
    sender: "Priya Singh",
    text: "Is anyone studying Electrostatics right now?",
    time: "08:05 AM",
    type: "chat",
    role: "student",
  },
  {
    id: 3,
    sender: "Dr. Sharma",
    text: "I have pinned the new Electrostatics worksheet to the global board.",
    time: "08:10 AM",
    type: "announcement",
    role: "teacher",
  },
];

const PRODUCTIVITY_TREND = [
  { time: "06:00", score: 65, users: 1200 },
  { time: "09:00", score: 85, users: 4500 },
  { time: "12:00", score: 92, users: 8900 },
  { time: "15:00", score: 88, users: 7600 },
  { time: "18:00", score: 95, users: 12400 },
  { time: "21:00", score: 98, users: 15600 },
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
/**
 * @param {Object} currentUser - User context
 * @param {string} userRole - Role of user
 * @param {Object} socket - Future Socket.io instance
 */
export default function GlobalStudyHall({ currentUser = DEFAULT_USER }) {
  // --- STATE MANAGEMENT ---
  const [activeHall, setActiveHall] = useState(HALL_CATEGORIES[0]);
  const [activeTab, setActiveTab] = useState("tables"); // tables, leaderboard, analytics, ai
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);

  // Focus Timer State
  const [timerMode] = useState("50/10");
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionType, setSessionType] = useState("focus"); // focus, break

  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      // Toggle logic for 50/10 mode
      if (sessionType === "focus") {
        setSessionType("break");
        setTimeLeft(10 * 60);
      } else {
        setSessionType("focus");
        setTimeLeft(50 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, sessionType]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: currentUser.name,
      text: chatInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "chat",
      role: currentUser.role,
    };
    setMessages([...messages, newMsg]);
    setChatInput("");
  };

  // ==========================================
  // RENDER HELPERS: LEFT SIDEBAR
  // ==========================================
  const renderSidebar = () => (
    <div className="w-full lg:w-72 shrink-0 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-4 hidden lg:flex flex-col space-y-6">
      <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-600/20 flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] transition-transform group-hover:scale-150"></div>
        <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center font-black text-xl backdrop-blur-md relative z-10">
          {currentUser.avatar}
        </div>
        <div className="relative z-10">
          <h3 className="font-bold text-base leading-tight">
            {currentUser.name}
          </h3>
          <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-0.5 flex items-center gap-1">
            Lvl {currentUser.level} Scholar
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
          <FiGlobe className="text-indigo-500" /> Global Halls
        </h4>
        <div className="space-y-2">
          {HALL_CATEGORIES.map((hall) => (
            <button
              key={hall.id}
              onClick={() => setActiveHall(hall)}
              className={`w-full text-left p-3 rounded-xl transition-all border ${
                activeHall.id === hall.id
                  ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800/50 shadow-sm"
                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
              }`}
            >
              <h5
                className={`font-bold text-sm mb-1 ${activeHall.id === hall.id ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-white"}`}
              >
                {hall.title}
              </h5>
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-500 uppercase">{hall.type}</span>
                <span
                  className={`flex items-center gap-1 ${activeHall.id === hall.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
                >
                  <FiUsers /> {hall.participants}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <button className="w-full py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors flex items-center justify-center gap-2">
          <FiPlus /> Create Private Hall
        </button>
      </div>
    </div>
  );

  // ==========================================
  // RENDER HELPERS: MAIN CONTENT AREA
  // ==========================================
  const renderDashboardCards = () => (
    <motion.div
      variants={fadeUp}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
          Global Online
        </p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          142.5k{" "}
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </h3>
      </div>
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
          Active Focus Sessions
        </p>
        <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
          45.2k
        </h3>
      </div>
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
          Today's Study Hrs
        </p>
        <h3 className="text-2xl font-black text-emerald-500">4.5 Hrs</h3>
      </div>
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
          Productivity Score
        </p>
        <h3 className="text-2xl font-black text-amber-500">
          {currentUser.focusScore}/100
        </h3>
      </div>
    </motion.div>
  );

  const renderStudyTables = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid sm:grid-cols-2 gap-4"
    >
      {STUDY_TABLES.map((table) => (
        <motion.div
          key={table.id}
          variants={fadeUp}
          className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 hover:border-indigo-500/50 transition-colors group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-2 inline-block ${
                  table.type === "voice"
                    ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400"
                    : table.type === "video"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400"
                      : table.type === "text"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800/50 dark:text-indigo-400"
                        : "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                }`}
              >
                {table.type === "voice" ? (
                  <FiMic className="inline mr-1" />
                ) : table.type === "video" ? (
                  <FiVideo className="inline mr-1" />
                ) : table.type === "text" ? (
                  <FiMessageSquare className="inline mr-1" />
                ) : (
                  <FiHeadphones className="inline mr-1" />
                )}
                {table.type} Table
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {table.name}
              </h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                {table.topic}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1 justify-end">
                <FiUsers /> {table.users}/{table.max}
              </span>
            </div>
          </div>
          <button className="w-full py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
            Join Table
          </button>
        </motion.div>
      ))}

      {/* Create Table Button */}
      <motion.div
        variants={fadeUp}
        className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 p-5 flex flex-col items-center justify-center text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer min-h-[140px]"
      >
        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-indigo-500 mb-3 shadow-sm">
          <FiPlus size={20} />
        </div>
        <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">
          Create Study Table
        </h4>
        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
          Host your own focus session
        </p>
      </motion.div>
    </motion.div>
  );

  const renderLeaderboard = () => (
    <motion.div
      variants={fadeUp}
      className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
          <FiAward className="text-amber-500" /> Hall of Fame
        </h3>
        <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none">
          <option>Today</option>
          <option>This Week</option>
          <option>All Time</option>
        </select>
      </div>
      <div className="space-y-3">
        {LEADERBOARD_DATA.map((user, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-4 rounded-2xl border ${i === 0 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 shadow-sm" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`font-black text-xl w-6 text-center ${i === 0 ? "text-amber-500" : "text-slate-400"}`}
              >
                #{user.rank}
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  {user.name}
                </h4>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  {user.badge}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-sm font-black ${i === 0 ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400"}`}
              >
                {user.time}
              </span>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">
                Focus Score: {user.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderAnalytics = () => (
    <motion.div
      variants={fadeUp}
      className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
    >
      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-2">
        <FiTrendingUp className="text-emerald-500" /> Global Productivity Trend
      </h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={PRODUCTIVITY_TREND}
            margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              opacity={0.2}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[50, 100]}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorFocus)"
              name="Avg Focus Score"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );

  // ==========================================
  // RENDER HELPERS: RIGHT SIDEBAR (Timer & Chat)
  // ==========================================
  const renderRightSidebar = () => (
    <div className="w-full xl:w-[350px] shrink-0 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar flex flex-col space-y-6 lg:pl-6 lg:border-l border-slate-200 dark:border-slate-800">
      {/* 1. Pomodoro Focus Timer */}
      <motion.div
        variants={fadeUp}
        className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden shrink-0 border border-slate-800"
      >
        <div
          className={`absolute top-0 w-full h-1.5 left-0 ${sessionType === "focus" ? "bg-indigo-500" : "bg-emerald-500"}`}
        ></div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <FiClock
              className={
                timerActive ? "animate-pulse text-amber-400" : "text-slate-400"
              }
            />{" "}
            Session Timer
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 px-2 py-1 rounded-md">
            {timerMode}
          </span>
        </div>

        <div className="flex justify-center mb-6">
          <span
            className={`font-mono text-5xl font-black tracking-tight tabular-nums ${sessionType === "focus" ? "text-white" : "text-emerald-400"}`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setTimerActive(!timerActive)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all shadow-lg ${timerActive ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20"}`}
          >
            {timerActive ? <FiPause /> : <FiPlay className="ml-0.5" />}
          </button>
          <button
            onClick={() => {
              setTimerActive(false);
              setTimeLeft(sessionType === "focus" ? 50 * 60 : 10 * 60);
            }}
            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
          >
            <FiRotateCcw />
          </button>
        </div>
      </motion.div>

      {/* 2. Global Chat */}
      <motion.div
        variants={fadeUp}
        className="flex-1 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[400px]"
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <FiMessageSquare className="text-indigo-500" /> Global Chat
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              {activeHall.title}
            </p>
          </div>
          <button className="text-slate-400 hover:text-indigo-500 transition-colors">
            <FiFilter size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              if (msg.type === "system")
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center my-2"
                  >
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
                      {msg.text}
                    </span>
                  </motion.div>
                );
              if (msg.type === "announcement")
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3"
                  >
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <FiStar /> {msg.sender} • Host
                    </span>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-100">
                      {msg.text}
                    </p>
                  </motion.div>
                );

              const isMe = msg.sender === currentUser.name;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col max-w-[90%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  {!isMe && (
                    <span className="text-[9px] font-bold text-slate-500 mb-0.5 ml-1">
                      {msg.sender}
                    </span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs ${isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"}`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
              placeholder="Chat in hall..."
              className="flex-1 bg-transparent text-xs outline-none px-3 text-slate-900 dark:text-white font-medium"
            />
            <button
              onClick={handleChatSend}
              disabled={!chatInput.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:dark:bg-slate-800 text-white rounded-lg transition-colors"
            >
              <FiSend size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // ==========================================
  // MAIN RENDER RETURN
  // ==========================================
  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-[#0a0f1c] font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* 1. HEADER */}
      <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <FiGlobe className="text-xl" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              Global Study Hall
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
              Network Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Stats (Desktop) */}
          <div className="hidden sm:flex items-center gap-4 mr-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <FiUsers className="text-indigo-500" /> {activeHall.participants}{" "}
              Online
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <FiActivity className="text-emerald-500" /> Focus Score:{" "}
              {currentUser.focusScore}
            </span>
          </div>

          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
            <FaBrain /> Match Study Buddy
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 rounded-lg transition-colors">
            <FiSettings size={18} />
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex min-h-0 max-w-[1800px] w-full mx-auto relative">
        {/* Left Sidebar (Halls Navigation) */}
        {renderSidebar()}

        {/* Center Dashboard */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:px-8">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeHall.title}
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Join a table or study silently. Boost your focus score.
              </p>
            </div>
            <div className="hidden sm:block">
              <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs font-bold uppercase tracking-wider">
                Status: {activeHall.status}
              </span>
            </div>
          </div>

          {renderDashboardCards()}

          {/* View Toggle Tabs */}
          <div className="bg-white dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex overflow-x-auto custom-scrollbar w-max mb-6">
            {[
              { id: "tables", label: "Study Tables", icon: FiMap },
              { id: "leaderboard", label: "Leaderboard", icon: FiAward },
              { id: "analytics", label: "Analytics", icon: FiTrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <tab.icon /> {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "tables" && renderStudyTables()}
              {activeTab === "leaderboard" && renderLeaderboard()}
              {activeTab === "analytics" && renderAnalytics()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Sidebar (Timer & Global Chat) */}
        {renderRightSidebar()}
      </main>

    </div>
  );
}
