import { Tooltip as RechartsTooltip } from "recharts";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiMic,
  FiPaperclip,
  FiMoreVertical,
  FiSearch,
  FiPlus,
  FiMessageSquare,
  FiBookmark,
  FiStar,
  FiClock,
  FiTarget,
  FiBriefcase,
  FiMap,
  FiPieChart,
  FiSidebar,
  FiThumbsUp,
  FiCopy,
  FiShare2,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaBrain, FaRobot, FaGraduationCap } from "react-icons/fa";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";

// ==========================================
// DUMMY CONTEXT DATA (Personalized for Demo)
// ==========================================
const DEFAULT_STUDENT = {
  name: "Anurag Kumar",
  role: "Student",
  targetExam: "GATE 2026 (Electrical)",
  currentLevel: "B.Tech Graduate",
  careerInterest: "Core Electrical PSU / Full-Stack MERN Developer",
};

const DEFAULT_ANALYTICS = {
  learningScore: 813, // Scaled CGPA representation
  accuracy: 78,
  readiness: 82,
  consistency: 85,
};

const DEFAULT_TEST_RESULTS = {
  weakTopics: ["Power Systems", "Electromagnetic Fields", "Control Systems"],
  strongTopics: [
    "Network Theory",
    "Electrical Machines",
    "Digital Electronics",
  ],
  recentScore: "65/100",
};

const DEFAULT_ATTENDANCE = {
  percentage: 92,
  streak: 15,
};

const QUICK_ACTIONS = [
  { id: "plan", label: "Create GATE 2026 Study Plan", icon: FiMap },
  { id: "analyze", label: "Analyze Weak Topics", icon: FiPieChart },
  { id: "career", label: "Career Guidance (PSU vs Dev)", icon: FiBriefcase },
  { id: "mock", label: "Generate Power Systems Quiz", icon: FiTarget },
  { id: "motivate", label: "Daily Motivation", icon: FiStar },
];

const CHAT_HISTORY = [
  {
    id: "c1",
    title: "Power Systems Revision Strategy",
    date: "Today",
    pinned: true,
  },
  {
    id: "c2",
    title: "GATE 2026 6-Month Roadmap",
    date: "Yesterday",
    pinned: true,
  },
  {
    id: "c3",
    title: "Network Theory Doubts",
    date: "3 days ago",
    pinned: false,
  },
  {
    id: "c4",
    title: "MERN Stack Interview Prep",
    date: "1 week ago",
    pinned: false,
  },
];

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const messageVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const sidebarVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: 320,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

// ==========================================
// MAIN COMPONENT
// ==========================================
/**
 * AIMentorChat
 * @param {Object} student - Student profile details
 * @param {Object} analytics - Performance data
 * @param {Object} studyPlan - Current active study plan
 * @param {Object} attendance - Attendance metrics
 * @param {Object} testResults - Diagnostic data
 * @param {String} userRole - 'student', 'teacher', 'parent', 'admin'
 */
export default function AIMentorChat({
  student = DEFAULT_STUDENT,
  analytics = DEFAULT_ANALYTICS,
  attendance = DEFAULT_ATTENDANCE,
  testResults = DEFAULT_TEST_RESULTS,
}) {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      type: "text",
      text: `Hello ${student.name.split(" ")[0]}! I'm your Adhayan AI Mentor. I see you're preparing for ${student.targetExam}. Your Network Theory scores are excellent, but we need to focus on Power Systems. How can I help you today?`,
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ==========================================
  // CHAT LOGIC & MOCK AI RESPONSES
  // ==========================================
  const handleSend = (text = input) => {
    if (!text.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      sender: "user",
      type: "text",
      text: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);

    // Simulated AI Processing Delay
    setTimeout(() => {
      generateMockAIResponse(text);
    }, 1500);
  };

  const generateMockAIResponse = (query) => {
    const q = query.toLowerCase();
    let response = {
      id: Date.now() + 1,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (q.includes("plan") || q.includes("roadmap")) {
      response.type = "plan";
      response.text =
        "I've generated a customized 4-week recovery plan for Power Systems based on your recent diagnostic test.";
      response.data = {
        title: "Power Systems Recovery Roadmap",
        duration: "4 Weeks",
        milestones: [
          "Transmission Line Parameters",
          "Fault Analysis",
          "Load Flow Studies",
          "Stability Analysis",
        ],
      };
    } else if (q.includes("analyze") || q.includes("performance")) {
      response.type = "analytics";
      response.text = "Here is an analysis of your recent performance trends.";
      response.data = [
        { name: "Test 1", score: 45 },
        { name: "Test 2", score: 55 },
        { name: "Test 3", score: 52 },
        { name: "Test 4", score: 65 },
      ];
    } else if (q.includes("career") || q.includes("dev")) {
      response.type = "career";
      response.text =
        "Balancing Core Electrical (GATE/PSU) with MERN Stack Full-Stack development is highly strategic. Here is a dual-track career alignment matrix.";
      response.data = {
        primary: "PSU Engineering Trainee",
        secondary: "Full-Stack SDE",
        skillGap: "System System Design, Advanced Data Structures",
      };
    } else {
      response.type = "text";
      response.text =
        "That's a great question. To master that concept, I recommend reviewing your notes from yesterday's live session and attempting 15 numerical problems to solidify your understanding.";
    }

    setIsTyping(false);
    setMessages((prev) => [...prev, response]);
  };

  // ==========================================
  // RENDERERS: MESSAGE TYPES
  // ==========================================

  const renderMessageContent = (msg) => {
    switch (msg.type) {
      case "text":
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {msg.text}
          </p>
        );

      case "plan":
        return (
          <div className="space-y-3">
            <p className="text-sm">{msg.text}</p>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                <FiMap className="text-indigo-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {msg.data.title}
                </h4>
              </div>
              <ul className="space-y-2">
                {msg.data.milestones.map((m, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
                  >
                    <FiCheckCircle className="text-emerald-500 shrink-0" /> {m}
                  </li>
                ))}
              </ul>
              <button className="w-full mt-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                Apply Plan to Dashboard
              </button>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-3 w-full max-w-sm">
            <p className="text-sm">{msg.text}</p>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={msg.data}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    stroke="#64748b"
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "#334155", opacity: 0.1 }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#1e293b",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {msg.data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score > 60 ? "#10b981" : "#6366f1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "career":
        return (
          <div className="space-y-3">
            <p className="text-sm">{msg.text}</p>
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-xl p-4 shadow-sm text-white">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <FiBriefcase className="text-indigo-400" /> Career Vector
                Analysis
              </h4>
              <div className="space-y-2 text-xs">
                <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                  <span className="text-indigo-300 font-bold uppercase block mb-0.5">
                    Primary Target
                  </span>
                  {msg.data.primary}
                </div>
                <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                  <span className="text-emerald-300 font-bold uppercase block mb-0.5">
                    Secondary Track
                  </span>
                  {msg.data.secondary}
                </div>
                <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  <span className="text-red-300 font-bold uppercase block mb-0.5">
                    Current Skill Gap
                  </span>
                  {msg.data.skillGap}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-sm">{msg.text}</p>;
    }
  };

  // ==========================================
  // RENDERERS: LAYOUT SECTIONS
  // ==========================================

  const renderLeftSidebar = () => (
    <motion.div
      variants={sidebarVariants}
      initial="visible"
      animate={leftSidebarOpen ? "visible" : "hidden"}
      className="h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
          <FiPlus /> New Conversation
        </button>
      </div>

      <div className="p-3 shrink-0">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
            <FiBookmark className="text-amber-500" /> Pinned
          </h4>
          <ul className="space-y-1">
            {CHAT_HISTORY.filter((c) => c.pinned).map((chat) => (
              <li
                key={chat.id}
                className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl cursor-pointer group transition-colors flex items-center gap-2"
              >
                <FiMessageSquare
                  className="text-slate-400 group-hover:text-indigo-500 shrink-0"
                  size={14}
                />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                    {chat.title}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
            <FiClock className="text-blue-500" /> Recent
          </h4>
          <ul className="space-y-1">
            {CHAT_HISTORY.filter((c) => !c.pinned).map((chat) => (
              <li
                key={chat.id}
                className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl cursor-pointer group transition-colors flex items-center gap-2"
              >
                <FiMessageSquare
                  className="text-slate-400 group-hover:text-indigo-500 shrink-0"
                  size={14}
                />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                    {chat.title}
                  </p>
                  <p className="text-[9px] text-slate-500">{chat.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );

  const renderRightSidebar = () => (
    <motion.div
      variants={sidebarVariants}
      initial="visible"
      animate={rightSidebarOpen ? "visible" : "hidden"}
      className="h-full bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar"
    >
      <div className="p-6 space-y-6">
        {/* Student Mini Profile */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-md">
            {student.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {student.name}
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md inline-block mt-1">
              {student.targetExam}
            </p>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-4 rounded-2xl border border-indigo-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 -mt-4 -mr-4">
            <FaBrain size={80} className="text-indigo-500" />
          </div>
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 relative z-10 flex items-center gap-1">
            <FaRobot /> AI Context
          </h4>
          <p className="text-xs text-indigo-100 font-medium leading-relaxed relative z-10">
            Attendance is strong ({attendance.percentage}%). However, recent
            mock test scores dip in{" "}
            <strong className="text-white">Power Systems</strong>. Recommending
            targeted practice.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
              Learning Score
            </p>
            <p className="text-xl font-black text-emerald-500">
              {analytics.learningScore}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
              Consistency
            </p>
            <p className="text-xl font-black text-blue-500">
              {analytics.consistency}%
            </p>
          </div>
        </div>

        {/* Weak Topics */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
            <FiAlertTriangle className="text-amber-500" /> Focus Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {testResults.weakTopics.map((topic, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30 rounded-lg text-xs font-bold"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Strong Topics */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
            <FiCheckCircle className="text-emerald-500" /> Core Strengths
          </h4>
          <div className="flex flex-wrap gap-2">
            {testResults.strongTopics.map((topic, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 rounded-lg text-xs font-bold"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ==========================================
  // MAIN RENDER RETURN
  // ==========================================
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#0a0f1c] font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* LEFT SIDEBAR */}
      {renderLeftSidebar()}

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Chat Header */}
        <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors lg:hidden"
            >
              <FiSidebar size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FaRobot size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                Adhayan AI Mentor{" "}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Always online • Personalized Coach
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <FaGraduationCap /> Exam Mode
            </button>
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <FiSidebar
                size={20}
                className={rightSidebarOpen ? "text-indigo-500" : ""}
              />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <FiMoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4 border border-indigo-100 dark:border-indigo-800/50">
              <FaBrain size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              How can I assist your learning today?
            </h3>
            <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
              I'm trained on your academic history, attendance, and weak areas.
              Ask me anything or select an option below.
            </p>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex gap-4 max-w-3xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
                >
                  {msg.sender === "user" ? (
                    student.name.charAt(0)
                  ) : (
                    <FaRobot size={14} />
                  )}
                </div>

                <div
                  className={`flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-5 py-3.5 shadow-sm ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-[20px] rounded-tr-sm"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-[20px] rounded-tl-sm"
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>

                  <div
                    className={`flex items-center gap-3 px-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <span className="text-[10px] font-bold text-slate-400">
                      {msg.timestamp}
                    </span>
                    {msg.sender === "ai" && (
                      <div className="flex gap-2">
                        <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                          <FiThumbsUp size={12} />
                        </button>
                        <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                          <FiCopy size={12} />
                        </button>
                        <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                          <FiShare2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              className="flex gap-4 max-w-3xl mr-auto"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <FaRobot size={14} />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] rounded-tl-sm px-5 py-4 shadow-sm flex gap-1.5 items-center">
                <span
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shrink-0">
          {/* Quick Action Chips */}
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-3 mb-2 hide-scrollbar">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleSend(action.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shadow-sm"
              >
                <action.icon size={12} /> {action.label}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <button
              className="p-3 text-slate-400 hover:text-indigo-500 transition-colors shrink-0"
              title="Attach Document / Note"
            >
              <FiPaperclip size={20} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message AI Mentor (Press Enter to send)...`}
              className="w-full max-h-32 min-h-[44px] bg-transparent text-sm text-slate-900 dark:text-white outline-none resize-none py-3 custom-scrollbar"
              rows={1}
            />
            <button
              className="p-3 text-slate-400 hover:text-indigo-500 transition-colors shrink-0"
              title="Voice Input"
            >
              <FiMic size={20} />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:dark:bg-slate-800 text-white rounded-xl shadow-md transition-all shrink-0 disabled:cursor-not-allowed"
            >
              <FiSend size={20} />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] font-medium text-slate-400">
              AI Mentor can make mistakes. Consider verifying critical academic
              facts.
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      {renderRightSidebar()}

    </div>
  );
}
