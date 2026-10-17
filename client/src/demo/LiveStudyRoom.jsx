import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiClock,
  FiVideo,
  FiMic,
  FiMicOff,
  FiMonitor,
  FiMessageSquare,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiSettings,
  FiLogOut,
  FiSend,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiVolume2,
  FiVolumeX,
  FiAlertCircle,
  FiCheckCircle,
  FiMaximize2,
  FiImage,
  FiPaperclip,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaRobot, FaBrain } from "react-icons/fa";
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
};

const DEFAULT_ROOM = {
  id: "room_jee_phys_1",
  name: "JEE Physics Focus Room",
  subject: "Physics",
  host: "Dr. Sharma",
  participants: 142,
  maxParticipants: 500,
  type: "Silent Focus Room",
  status: "Live",
  created: "08:00 AM",
};

const PARTICIPANTS = [
  {
    id: "u1",
    name: "Priya Singh",
    role: "student",
    status: "Studying",
    time: "1h 45m",
    avatar: "P",
  },
  {
    id: "u2",
    name: "Rohan Verma",
    role: "student",
    status: "Break",
    time: "45m",
    avatar: "R",
  },
  {
    id: "u3",
    name: "Sneha Patel",
    role: "student",
    status: "Studying",
    time: "2h 10m",
    avatar: "S",
  },
  {
    id: "u4",
    name: "Dr. Sharma",
    role: "teacher",
    status: "Host",
    time: "3h 00m",
    avatar: "DS",
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Vikram Desai", time: "5h 20m", badge: "Focus Champion" },
  { rank: 2, name: "Neha Gupta", time: "4h 45m", badge: "Consistency Pro" },
  { rank: 3, name: "Anurag Kumar", time: "4h 10m", badge: "Rising Star" },
];

const CHAT_MESSAGES = [
  {
    id: 1,
    sender: "System",
    text: "Welcome to the Physics Focus Room. Please keep mics muted.",
    time: "08:00 AM",
    type: "system",
  },
  {
    id: 2,
    sender: "Dr. Sharma",
    text: "We will begin the Pomodoro session in 5 minutes.",
    time: "08:05 AM",
    type: "announcement",
    role: "teacher",
  },
  {
    id: 3,
    sender: "Priya Singh",
    text: "Ready! Solving HC Verma today.",
    time: "08:06 AM",
    type: "chat",
    role: "student",
  },
];

const PRODUCTIVITY_TREND = [
  { time: "08:00", focus: 65, participants: 120 },
  { time: "09:00", focus: 85, participants: 145 },
  { time: "10:00", focus: 90, participants: 160 },
  { time: "11:00", focus: 75, participants: 155 }, // Break time
  { time: "12:00", focus: 95, participants: 170 },
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
// COMPONENT PROPS & MAIN FUNCTION
// ==========================================
/**
 * @param {Object} currentUser - Details of the logged-in user
 * @param {Object} room - Details of the current study room
 * @param {Object} socket - Future Socket.io instance
 */
export default function LiveStudyRoom({
  currentUser = DEFAULT_USER,
  room = DEFAULT_ROOM,
}) {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("focus"); // focus, participants, leaderboard, analytics
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);

  // Audio/Video/Screen States (WebRTC Placeholders)
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [soundEnabled] = useState(true);

  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState("focus"); // focus, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      if (timerMode === "focus") {
        setSessionsCompleted((prev) => prev + 1);
        setTimerMode("shortBreak");
        setTimeLeft(5 * 60);
      } else {
        setTimerMode("focus");
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, timerMode]);

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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderRoomInfo = () => (
    <motion.div
      variants={fadeUp}
      className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {room.name}
          </h1>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md uppercase tracking-wider border border-indigo-200 dark:border-indigo-800/50">
            {room.type}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <FaChalkboardTeacher /> Host: {room.host} • {room.subject}
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Participants
          </p>
          <p className="text-xl font-black text-emerald-500 flex items-center gap-1 justify-center">
            <FiUsers /> {room.participants}
          </p>
        </div>
        <div className="text-center px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Total Focus Time
          </p>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 justify-center">
            <FiClock /> 1,240h
          </p>
        </div>
        <button className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-bold text-sm border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2">
          <FiLogOut /> Leave Room
        </button>
      </div>
    </motion.div>
  );

  const renderWebRTCTools = () => (
    <motion.div
      variants={fadeUp}
      className="bg-slate-900 rounded-3xl p-4 flex flex-wrap items-center justify-center gap-4 shadow-xl border border-slate-800 relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 opacity-50 blur-xl"></div>

      <div className="flex gap-3 relative z-10">
        <button
          onClick={() => setIsMicOn(!isMicOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? "bg-slate-700 text-white" : "bg-red-500 text-white"}`}
          title={isMicOn ? "Mute" : "Unmute"}
        >
          {isMicOn ? <FiMic size={20} /> : <FiMicOff size={20} />}
        </button>
        <button
          onClick={() => setIsCamOn(!isCamOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCamOn ? "bg-slate-700 text-white" : "bg-red-500 text-white"}`}
          title={isCamOn ? "Turn Off Camera" : "Turn On Camera"}
        >
          <FiVideo size={20} />
          {!isCamOn && (
            <div className="absolute w-6 h-0.5 bg-white transform rotate-45"></div>
          )}
        </button>
        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isScreenSharing ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300 hover:text-white"}`}
          title="Share Screen"
        >
          <FiMonitor size={20} />
        </button>
      </div>

      <div className="h-8 w-px bg-slate-700 mx-2 hidden sm:block relative z-10"></div>

      <div className="flex items-center gap-3 relative z-10">
        <div className="flex -space-x-3">
          {PARTICIPANTS.slice(0, 4).map((p, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-sm z-10"
            >
              {p.avatar}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 z-0">
            +138
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <FiMaximize2 />
        </button>
      </div>
    </motion.div>
  );

  const renderFocusTimer = () => (
    <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-[400px]">
      <div
        className={`absolute top-0 w-full h-2 ${timerMode === "focus" ? "bg-indigo-500" : "bg-emerald-500"}`}
      ></div>

      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-full border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setTimerMode("focus");
            setTimeLeft(25 * 60);
            setTimerActive(false);
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${timerMode === "focus" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => {
            setTimerMode("shortBreak");
            setTimeLeft(5 * 60);
            setTimerActive(false);
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${timerMode === "shortBreak" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
        >
          Short Break
        </button>
        <button
          onClick={() => {
            setTimerMode("longBreak");
            setTimeLeft(15 * 60);
            setTimerActive(false);
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${timerMode === "longBreak" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
        >
          Long Break
        </button>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            className={`transition-all duration-1000 ${timerMode === "focus" ? "stroke-indigo-500" : "stroke-emerald-500"}`}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="553"
            strokeDashoffset={
              553 -
              553 *
                (timeLeft /
                  (timerMode === "focus"
                    ? 25 * 60
                    : timerMode === "shortBreak"
                      ? 5 * 60
                      : 15 * 60))
            }
          />
        </svg>
        <span
          className={`font-mono text-5xl font-black tabular-nums ${timerMode === "focus" ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400"}`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setTimerActive(!timerActive)}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-transform hover:scale-105 ${timerMode === "focus" ? "bg-indigo-600 shadow-indigo-500/30" : "bg-emerald-500 shadow-emerald-500/30"}`}
        >
          {timerActive ? <FiPause /> : <FiPlay className="ml-1" />}
        </button>
        <button
          onClick={() => {
            setTimerActive(false);
            setTimeLeft(
              timerMode === "focus"
                ? 25 * 60
                : timerMode === "shortBreak"
                  ? 5 * 60
                  : 15 * 60,
            );
          }}
          className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <FiRotateCcw size={20} />
        </button>
      </div>

      <p className="mt-6 text-xs font-bold text-slate-500">
        Sessions Completed:{" "}
        <span className="text-slate-900 dark:text-white">
          {sessionsCompleted}
        </span>
        /4
      </p>
    </div>
  );

  const renderParticipantsList = () => (
    <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-t-3xl">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FiUsers className="text-indigo-500" /> Live Roster
        </h3>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
          {room.participants} Online
        </span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {PARTICIPANTS.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${p.role === "teacher" ? "bg-emerald-500" : "bg-indigo-500"}`}
              >
                {p.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {p.name}{" "}
                  {p.role === "teacher" && (
                    <FiCheckCircle className="text-emerald-500" size={12} />
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${p.status === "Studying" || p.status === "Host" ? "bg-emerald-500" : "bg-amber-500"}`}
                  ></span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {p.status} • {p.time}
                  </span>
                </div>
              </div>
            </div>
            {currentUser.role === "teacher" && (
              <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                <FiLogOut size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-t-3xl">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FiAward className="text-amber-500" /> Daily Leaderboard
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {LEADERBOARD.map((user, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border flex items-center gap-4 ${idx === 0 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
          >
            <span
              className={`font-black text-xl w-6 text-center ${idx === 0 ? "text-amber-500" : "text-slate-400"}`}
            >
              #{user.rank}
            </span>
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {user.name}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {user.badge}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block mb-0.5">
                Focus Time
              </span>
              <span
                className={`text-sm font-black ${idx === 0 ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400"}`}
              >
                {user.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] flex flex-col p-6">
      <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <FiTrendingUp className="text-blue-500" /> Room Productivity Trend
      </h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={PRODUCTIVITY_TREND}
            margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
              domain={[0, 100]}
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
              dataKey="focus"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorFocus)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderChatPanel = () => (
    <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FiMessageSquare className="text-indigo-500" /> Room Chat
        </h3>
        <div className="flex gap-2">
          <button
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Toggle Sound"
          >
            {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
          </button>
          <button
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Settings"
          >
            <FiSettings />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center my-2"
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </motion.div>
              );
            }
            if (msg.type === "announcement") {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FiAlertCircle className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      Announcement • {msg.sender}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    {msg.text}
                  </p>
                </motion.div>
              );
            }

            const isMe = msg.sender === currentUser.name;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1">
                    {msg.sender}
                  </span>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"}`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] font-medium text-slate-400 mt-1">
                  {msg.time}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
          <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
            <FiPaperclip />
          </button>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
            placeholder="Send message to room..."
            className="flex-1 bg-transparent text-sm outline-none px-2 text-slate-900 dark:text-white"
          />
          <button
            onClick={handleChatSend}
            disabled={!chatInput.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:dark:bg-slate-800 text-white rounded-lg transition-colors"
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderAIAssistant = () => (
    <motion.div
      variants={fadeUp}
      className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-500/30"
    >
      <div className="absolute top-0 right-0 opacity-10">
        <FaRobot size={100} className="text-indigo-400 -mt-6 -mr-6" />
      </div>
      <h3 className="font-bold text-indigo-300 flex items-center gap-2 mb-4 relative z-10">
        <FaBrain /> Focus Coach
      </h3>
      <div className="space-y-4 relative z-10">
        <p className="text-sm font-medium leading-relaxed text-indigo-100">
          "The room productivity is peaking right now. Let's aim to complete the
          Electromagnetism assignment before the next short break."
        </p>
        <div className="pt-4 border-t border-indigo-500/30">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2">
            Current Room Goal
          </p>
          <div className="w-full h-2 bg-indigo-950 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[60%]"></div>
          </div>
          <div className="flex justify-between mt-1 text-[10px] font-bold text-indigo-300">
            <span>Progress: 60%</span>
            <span>Target: Solve 50 PYQs</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ==========================================
  // MAIN RENDER RETURN
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] font-sans pb-12 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <FiTarget className="text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                Live Study Environment
              </h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
                Connected • Global Network
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top: Room Info & WebRTC Controls */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2">{renderRoomInfo()}</div>
          <div className="lg:col-span-1">{renderWebRTCTools()}</div>
        </motion.div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* LEFT/CENTER COLUMN: Workspace Tools */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            {/* View Toggle Tabs */}
            <div className="bg-white dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex overflow-x-auto custom-scrollbar w-max">
              {[
                { id: "focus", label: "Pomodoro Focus", icon: FiClock },
                { id: "participants", label: "Live Roster", icon: FiUsers },
                { id: "leaderboard", label: "Leaderboard", icon: FiAward },
                {
                  id: "analytics",
                  label: "Room Analytics",
                  icon: FiTrendingUp,
                },
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

            {/* Dynamic View Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "focus" && renderFocusTimer()}
                {activeTab === "participants" && renderParticipantsList()}
                {activeTab === "leaderboard" && renderLeaderboard()}
                {activeTab === "analytics" && renderAnalytics()}
              </motion.div>
            </AnimatePresence>

            {/* Action Center / AI Coach */}
            <div className="grid md:grid-cols-2 gap-6">
              {renderAIAssistant()}
              <motion.div
                variants={fadeUp}
                className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center gap-3"
              >
                <button className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-sm font-bold border border-indigo-200 dark:border-indigo-800/50 transition-colors flex items-center justify-center gap-2">
                  <FiImage /> Open Shared Whiteboard
                </button>
                <button className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-800/50 transition-colors flex items-center justify-center gap-2">
                  <FiCheckCircle /> Mark Attendance Segment
                </button>
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN: Real-time Chat */}
          <div className="lg:col-span-1 xl:col-span-1">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="sticky top-24"
            >
              {renderChatPanel()}
            </motion.div>
          </div>
        </div>

        {/* FUTURE API PLACEHOLDERS */}
      </main>
    </div>
  );
}
