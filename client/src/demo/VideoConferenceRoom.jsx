import { FaBrain } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiMonitor,
  FiMessageSquare,
  FiUsers,
  FiSettings,
  FiPhoneOff,
  FiMoreVertical,
  FiUserCheck,
  FiCheckSquare,
  FiSend,
  FiPaperclip,
  FiShield,
  FiActivity,
  FiAward,
  FiMaximize2,
  FiGrid,
  FiAlertCircle,
} from "react-icons/fi";
import { FaRobot, FaChalkboard, FaRecordVinyl } from "react-icons/fa";

// ==========================================
// DUMMY DATA FOR DEMONSTRATION
// ==========================================

const DEFAULT_USER = {
  id: "u101",
  name: "Anurag Kumar",
  role: "student",
  avatar: "A",
};

const DEFAULT_MEETING = {
  id: "meet001",
  title: "JEE Physics Marathon",
  host: "Dr. Sharma",
  subject: "Physics",
  participants: 142,
  startTime: new Date().toISOString(),
  status: "Live",
  isRecording: true,
};

const PARTICIPANTS = [
  {
    id: "p1",
    name: "Dr. Sharma",
    role: "teacher",
    isHost: true,
    isMicOn: true,
    isCamOn: true,
    isSpeaking: true,
    handRaised: false,
  },
  {
    id: "p2",
    name: "Anurag Kumar",
    role: "student",
    isHost: false,
    isMicOn: false,
    isCamOn: true,
    isSpeaking: false,
    handRaised: false,
  },
  {
    id: "p3",
    name: "Priya Singh",
    role: "student",
    isHost: false,
    isMicOn: false,
    isCamOn: false,
    isSpeaking: false,
    handRaised: true,
  },
  {
    id: "p4",
    name: "Rohan Verma",
    role: "student",
    isHost: false,
    isMicOn: false,
    isCamOn: true,
    isSpeaking: false,
    handRaised: false,
  },
  {
    id: "p5",
    name: "Sneha Patel",
    role: "student",
    isHost: false,
    isMicOn: false,
    isCamOn: false,
    isSpeaking: false,
    handRaised: false,
  },
  {
    id: "p6",
    name: "Vikram Desai",
    role: "student",
    isHost: false,
    isMicOn: false,
    isCamOn: true,
    isSpeaking: false,
    handRaised: false,
  },
  // ... adding a few more for grid demonstration
  {
    id: "p7",
    name: "Neha Gupta",
    role: "student",
    isHost: false,
    isMicOn: false,
    isCamOn: false,
    isSpeaking: false,
    handRaised: false,
  },
  {
    id: "p8",
    name: "Aman Kumar",
    role: "student",
    isHost: false,
    isMicOn: false,
    isCamOn: true,
    isSpeaking: false,
    handRaised: false,
  },
];

const CHAT_MESSAGES = [
  {
    id: 1,
    sender: "System",
    text: "Welcome to the JEE Physics Marathon. Please mute your mic unless speaking.",
    time: "10:00 AM",
    type: "system",
  },
  {
    id: 2,
    sender: "Dr. Sharma",
    text: "I have shared the formula sheet in the class notes section.",
    time: "10:05 AM",
    type: "announcement",
    role: "teacher",
  },
  {
    id: 3,
    sender: "Priya Singh",
    text: "Sir, could you repeat the last step of the derivation?",
    time: "10:15 AM",
    type: "chat",
    role: "student",
  },
];

const LIVE_POLLS = [
  {
    id: "poll1",
    question: "Did you understand the concept of Moment of Inertia?",
    options: [
      { id: "o1", text: "Yes, completely clear", votes: 85 },
      { id: "o2", text: "Needs some revision", votes: 40 },
      { id: "o3", text: "No, please repeat", votes: 17 },
    ],
    isActive: true,
  },
];

// ==========================================
// ANIMATION VARIANTS
// ==========================================

const pulseGlow = {
  initial: { boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)" },
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(16, 185, 129, 0.4)",
      "0 0 0 10px rgba(16, 185, 129, 0)",
      "0 0 0 0 rgba(16, 185, 129, 0)",
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};

// ==========================================
// COMPONENT PROPS & MAIN FUNCTION
// ==========================================
/**
 * @param {Object} currentUser - Details of logged in user
 * @param {Object} meeting - Details of current meeting
 * @param {Array} participants - List of participants
 * @param {Object} socket - Future Socket.io instance
 */
export default function VideoConferenceRoom({
  currentUser = DEFAULT_USER,
  meeting = DEFAULT_MEETING,
  initialParticipants = PARTICIPANTS,
}) {
  // --- STATE MANAGEMENT ---
  const [activePanel, setActivePanel] = useState(null); // 'chat', 'participants', 'polls', 'ai', 'analytics'
  const [layoutMode, setLayoutMode] = useState("grid"); // 'grid', 'speaker', 'focus'

  // Media States
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);

  // Participant State
  const [participants] = useState(initialParticipants);
  const [searchQuery, setSearchQuery] = useState("");

  // Timer State
  const [elapsedTime, setElapsedTime] = useState(0);

  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activePanel]);

  // Meeting Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // ==========================================
  // RENDER HELPERS: HEADER
  // ==========================================
  const renderHeader = () => (
    <header className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 z-20 shadow-sm relative">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
          <FiVideo className="text-xl" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-black text-white leading-tight flex items-center gap-2">
            {meeting.title}
            {meeting.isRecording && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30 uppercase tracking-wider">
                <FaRecordVinyl className="animate-pulse" /> Rec
              </span>
            )}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {meeting.subject} • Host: {meeting.host}
          </p>
        </div>
      </div>

      {/* Center: Timer & Status */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {formatTime(elapsedTime)}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-xs font-bold text-slate-300">
          <FiUsers /> {meeting.participants}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors">
          <FiActivity /> Live Metrics
        </button>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <FiSettings size={20} />
        </button>
      </div>
    </header>
  );

  // ==========================================
  // RENDER HELPERS: VIDEO GRID
  // ==========================================
  const renderVideoGrid = () => {
    // Determine grid columns based on layout and participant count
    let gridClass = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
    if (layoutMode === "speaker") gridClass = "grid-cols-1";
    if (layoutMode === "focus") gridClass = "grid-cols-2";

    // Split participants for speaker view
    const mainSpeaker =
      participants.find((p) => p.isSpeaking || p.isHost) || participants[0];
    const others = participants.filter((p) => p.id !== mainSpeaker.id);

    return (
      <div className="flex-1 bg-black p-2 sm:p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2 relative">
        {/* FUTURE WEBRTC PLACEHOLDERS */}

        {layoutMode === "speaker" && (
          <div className="flex-1 flex flex-col gap-2 h-full">
            {/* Main Speaker */}
            <div className="flex-1 w-full relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 shadow-xl group">
              {/* Speaker Video Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                {mainSpeaker.isCamOn ? (
                  <div className="text-slate-600 flex flex-col items-center">
                    <FiVideo size={48} className="mb-4 opacity-50" />
                    <span className="text-sm font-bold uppercase tracking-widest">
                      Video Stream
                    </span>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center text-4xl font-black text-slate-400 border-4 border-slate-700 shadow-2xl">
                    {mainSpeaker.avatar}
                  </div>
                )}
              </div>

              {/* Overlays */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                  {mainSpeaker.name}{" "}
                  {mainSpeaker.isHost && (
                    <span className="bg-indigo-500 px-1.5 py-0.5 rounded text-[10px] uppercase">
                      Host
                    </span>
                  )}
                </span>
                {!mainSpeaker.isMicOn && (
                  <span className="bg-red-500 text-white p-1.5 rounded-lg shadow-sm">
                    <FiMicOff size={14} />
                  </span>
                )}
              </div>

              {/* Speaking Indicator Glow */}
              {mainSpeaker.isSpeaking && (
                <motion.div
                  variants={pulseGlow}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-emerald-500"
                ></motion.div>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="h-32 shrink-0 flex gap-2 overflow-x-auto custom-scrollbar pb-2">
              {others.map((p) => (
                <div
                  key={p.id}
                  className="w-48 shrink-0 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {!p.isCamOn && (
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-500 border-2 border-slate-700">
                        {p.avatar}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md truncate max-w-[100px]">
                      {p.name}
                    </span>
                    {!p.isMicOn && (
                      <span className="bg-red-500 text-white p-1 rounded-md">
                        <FiMicOff size={10} />
                      </span>
                    )}
                  </div>
                  {p.handRaised && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white p-1 rounded-md animate-bounce">
                      <FiUserCheck size={12} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {layoutMode === "grid" && (
          <div
            className={`grid ${gridClass} gap-2 auto-rows-[minmax(150px,1fr)] h-full`}
          >
            {participants.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-xl overflow-hidden bg-slate-900 border-2 transition-colors ${p.isSpeaking ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-slate-800"}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {!p.isCamOn && (
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-500 border-2 border-slate-700">
                      {p.avatar}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md truncate max-w-[120px] border border-white/5">
                    {p.name}
                  </span>
                  {!p.isMicOn && (
                    <span className="bg-red-500/90 backdrop-blur-sm text-white p-1 rounded-md">
                      <FiMicOff size={10} />
                    </span>
                  )}
                </div>
                {p.handRaised && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-white p-1 rounded-md shadow-md">
                    <FiUserCheck size={12} />
                  </span>
                )}
                {p.isHost && (
                  <span className="absolute top-2 left-2 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">
                    <FiAward className="inline mr-0.5" /> Host
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER HELPERS: BOTTOM CONTROL BAR
  // ==========================================
  const renderControls = () => (
    <div className="h-20 bg-slate-900 border-t border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-20">
      {/* Left: Meeting Info / Layout */}
      <div className="flex items-center gap-2 hidden sm:flex">
        <button
          onClick={() => setLayoutMode("speaker")}
          className={`p-2 rounded-lg transition-colors ${layoutMode === "speaker" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          title="Speaker View"
        >
          <FiMaximize2 size={20} />
        </button>
        <button
          onClick={() => setLayoutMode("grid")}
          className={`p-2 rounded-lg transition-colors ${layoutMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          title="Grid View"
        >
          <FiGrid size={20} />
        </button>
        <div className="h-6 w-px bg-slate-700 mx-2"></div>
        <p className="text-xs font-bold text-slate-500">{meeting.id}</p>
      </div>

      {/* Center: Core Controls */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={() => setIsMicOn(!isMicOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isMicOn ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"}`}
          title={isMicOn ? "Mute" : "Unmute"}
        >
          {isMicOn ? <FiMic size={22} /> : <FiMicOff size={22} />}
        </button>
        <button
          onClick={() => setIsCamOn(!isCamOn)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isCamOn ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"}`}
          title={isCamOn ? "Stop Video" : "Start Video"}
        >
          {isCamOn ? <FiVideo size={22} /> : <FiVideoOff size={22} />}
        </button>
        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg hidden sm:flex ${isScreenSharing ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20" : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"}`}
          title="Share Screen"
        >
          <FiMonitor size={20} />
        </button>
        <button
          onClick={() => setHandRaised(!handRaised)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${handRaised ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20" : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"}`}
          title={handRaised ? "Lower Hand" : "Raise Hand"}
        >
          <FiUserCheck size={20} />
        </button>

        {/* End Call Button */}
        <div className="w-px h-8 bg-slate-700 mx-1 sm:mx-2"></div>
        <button className="px-6 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2">
          <FiPhoneOff size={20} className="hidden sm:block" /> Leave
        </button>
      </div>

      {/* Right: Panel Toggles */}
      <div className="flex items-center justify-end gap-2 flex-1 sm:flex-none">
        <button
          onClick={() => togglePanel("participants")}
          className={`p-3 rounded-full transition-colors relative ${activePanel === "participants" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
          title="Participants"
        >
          <FiUsers size={20} />
          <span className="absolute -top-1 -right-1 bg-slate-600 text-white text-[9px] font-bold px-1.5 rounded-full">
            {meeting.participants}
          </span>
        </button>
        <button
          onClick={() => togglePanel("chat")}
          className={`p-3 rounded-full transition-colors relative ${activePanel === "chat" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
          title="Chat"
        >
          <FiMessageSquare size={20} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => togglePanel("polls")}
            className={`p-3 rounded-full transition-colors ${activePanel === "polls" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
            title="Polls & Quizzes"
          >
            <FiCheckSquare size={20} />
          </button>
          <button
            onClick={() => togglePanel("ai")}
            className={`p-3 rounded-full transition-colors ${activePanel === "ai" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
            title="AI Assistant"
          >
            <FaRobot size={20} />
          </button>
          <button
            className="p-3 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            title="Whiteboard"
          >
            <FaChalkboard size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // RENDER HELPERS: SIDE PANELS
  // ==========================================
  const renderSidePanel = () => {
    if (!activePanel) return null;

    return (
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 350, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden relative z-10"
      >
        {/* PANEL: CHAT */}
        {activePanel === "chat" && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiMessageSquare className="text-indigo-500" /> In-call messages
              </h3>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md"
              >
                <FiMoreVertical />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/50 text-center mb-4">
                <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center justify-center gap-1">
                  <FiShield /> Messages are recorded
                </p>
              </div>

              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  if (msg.type === "system") {
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center my-2"
                      >
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
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
                            {msg.sender} • Host
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
                      className={`flex flex-col max-w-[90%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      {!isMe && (
                        <div className="flex items-center gap-1 mb-1 ml-1">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {msg.sender}
                          </span>
                          {msg.role === "teacher" && (
                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Teacher
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"}`}
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

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                  <FiPaperclip />
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                  placeholder="Send a message..."
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
        )}

        {/* PANEL: PARTICIPANTS */}
        {activePanel === "participants" && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FiUsers className="text-indigo-500" /> Participants (
                {meeting.participants})
              </h3>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                In Meeting
              </div>
              {participants
                .filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                        {p.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {p.name}{" "}
                          {p.isHost && (
                            <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-1.5 rounded uppercase">
                              Host
                            </span>
                          )}
                        </p>
                        {p.role === "teacher" && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            Educator
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      {p.handRaised && (
                        <FiUserCheck className="text-amber-500" />
                      )}
                      {p.isMicOn ? (
                        <FiMic className="text-emerald-500" />
                      ) : (
                        <FiMicOff className="opacity-50" />
                      )}
                      {p.isCamOn ? (
                        <FiVideo className="text-emerald-500" />
                      ) : (
                        <FiVideoOff className="opacity-50" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* PANEL: AI ASSISTANT */}
        {activePanel === "ai" && (
          <div className="flex flex-col h-full bg-gradient-to-br from-indigo-900 to-slate-950 text-white">
            <div className="p-4 border-b border-indigo-500/30 shrink-0 flex items-center gap-3 bg-white/5 backdrop-blur-md">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <FaBrain className="text-indigo-300" />
              </div>
              <h3 className="font-bold text-lg">AI Meeting Assistant</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FiActivity /> Engagement Analytics
                </h4>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-black">88%</span>
                  <span className="text-xs text-indigo-200">
                    Class Focus Score
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[88%]"></div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FiMessageSquare /> Live Transcription Summary
                </h4>
                <ul className="space-y-3">
                  <li className="text-sm text-indigo-100 flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span> Topic
                    Discussed: Moment of Inertia of solid shapes.
                  </li>
                  <li className="text-sm text-indigo-100 flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span> Formula
                    Derived: Parallel Axis Theorem.
                  </li>
                </ul>
              </div>

              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg transition-colors">
                Generate Class Notes PDF
              </button>
            </div>
          </div>
        )}

        {/* PANEL: POLLS */}
        {activePanel === "polls" && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiCheckSquare className="text-indigo-500" /> Live Polls &
                Quizzes
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {LIVE_POLLS.map((poll) => (
                <div
                  key={poll.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                      Live
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      142 Votes
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4 leading-snug">
                    {poll.question}
                  </h4>
                  <div className="space-y-2">
                    {poll.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="relative group cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-indigo-100 dark:bg-indigo-900/50 transition-all duration-1000"
                            style={{ width: `${(opt.votes / 142) * 100}%` }}
                          ></div>
                        </div>
                        <div className="relative z-10 px-3 py-2 flex justify-between items-center text-sm font-medium border border-transparent group-hover:border-indigo-500/50 rounded-lg transition-colors">
                          <span className="text-slate-700 dark:text-slate-300">
                            {opt.text}
                          </span>
                          <span className="text-slate-500 text-xs font-bold">
                            {Math.round((opt.votes / 142) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {currentUser.role === "teacher" && (
                <button className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 font-bold text-sm hover:border-indigo-500 hover:text-indigo-500 transition-colors">
                  + Create New Poll
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // ==========================================
  // MAIN RENDER RETURN
  // ==========================================
  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0f1c] font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* 1. HEADER */}
      {renderHeader()}

      {/* 2. MAIN WORKSPACE (Video + Sidebar) */}
      <main className="flex-1 flex min-h-0 relative">
        {/* Left/Center: Video Grid & Annotations */}
        {renderVideoGrid()}

        {/* Right: Collapsible Side Panel */}
        <AnimatePresence>{activePanel && renderSidePanel()}</AnimatePresence>
      </main>

      {/* 3. BOTTOM CONTROL BAR */}
      {renderControls()}

      {/* FUTURE API PLACEHOLDERS */}
    </div>
  );
}
