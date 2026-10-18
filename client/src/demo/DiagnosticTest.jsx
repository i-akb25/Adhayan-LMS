import DemoTrend from "./DemoTrend";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FiClock,
  FiCpu,
  FiTarget,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiChevronLeft,
  FiPlay,
  FiFileText,
  FiPieChart,
  FiTrendingUp,
  FiSettings,
  FiList,
  FiAward,
  FiUserCheck,
  FiBookmark,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import { FaBrain, FaRobot } from "react-icons/fa";

// ==========================================
// CONFIGURATIONS & DUMMY DATA
// ==========================================

const TEST_CATEGORIES = [
  {
    id: "School",
    title: "School Curriculum",
    desc: "Class 1 to 12 Academic Tests",
  },
  {
    id: "JEE",
    title: "JEE Main & Advanced",
    desc: "Engineering Entrance Pattern",
  },
  { id: "NEET", title: "NEET UG", desc: "Medical Entrance Pattern" },
  {
    id: "Engineering",
    title: "Engineering Branches",
    desc: "B.Tech Core Subjects",
  },
  {
    id: "Custom",
    title: "Custom AI Test",
    desc: "Generate customized assessments",
  },
];

const EXAM_PATTERNS = {
  JEE: { questions: 75, duration: 180, marking: { correct: 4, incorrect: -1 } },
  NEET: {
    questions: 180,
    duration: 180,
    marking: { correct: 4, incorrect: -1 },
  },
  School: {
    questions: 45,
    duration: 60,
    marking: { correct: 1, incorrect: 0 },
  },
  Engineering: {
    questions: 30,
    duration: 90,
    marking: { correct: 2, incorrect: -0.5 },
  },
};

const DUMMY_HISTORY = [
  {
    id: "T101",
    title: "Full Syllabus JEE Mock",
    date: "2026-06-15",
    score: 210,
    total: 300,
    accuracy: "82%",
  },
  {
    id: "T102",
    title: "Physics: Mechanics Quiz",
    date: "2026-06-10",
    score: 85,
    total: 100,
    accuracy: "90%",
  },
  {
    id: "T103",
    title: "Chemistry: Organic Baseline",
    date: "2026-06-05",
    score: 45,
    total: 100,
    accuracy: "60%",
  },
];

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const containerVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

// --- 1. SETUP WIZARD ---
const TestSetupWizard = ({ onStart, onCancel }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    category: "",
    exam: "",
    subjects: [],
    difficulty: "",
  });

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            variants={containerVariant}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {TEST_CATEGORIES.map((cat) => (
              <motion.div
                key={cat.id}
                variants={fadeUp}
                onClick={() => setConfig({ ...config, category: cat.id })}
                className={`p-5 rounded-2xl cursor-pointer border-2 transition-all ${config.category === cat.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900"}`}
              >
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            variants={containerVariant}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Target / Class
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {["Class 10", "Class 11", "Class 12", "Dropper"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setConfig({ ...config, exam: cls })}
                  className={`p-3 rounded-xl border font-bold text-sm transition-all ${config.exam === cls ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500"}`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            variants={containerVariant}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Subjects
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "Physics",
                "Chemistry",
                "Mathematics",
                "Biology",
                "All Subjects",
              ].map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    const newSubs = config.subjects.includes(sub)
                      ? config.subjects.filter((s) => s !== sub)
                      : [...config.subjects, sub];
                    setConfig({ ...config, subjects: newSubs });
                  }}
                  className={`p-3 rounded-xl border font-bold text-sm transition-all ${config.subjects.includes(sub) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500"}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            variants={containerVariant}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Difficulty
            </h3>
            <div className="flex gap-3">
              {["Beginner", "Intermediate", "Advanced", "AI Adaptive"].map(
                (diff) => (
                  <button
                    key={diff}
                    onClick={() => setConfig({ ...config, difficulty: diff })}
                    className={`flex-1 p-4 rounded-xl border font-bold text-sm transition-all ${config.difficulty === diff ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500"}`}
                  >
                    {diff}
                    {diff === "AI Adaptive" && (
                      <FaRobot className="inline ml-2 text-indigo-300" />
                    )}
                  </button>
                ),
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-3xl mx-auto bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mt-10"
    >
      <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FiSettings className="text-indigo-500" /> Diagnostic Test Setup
        </h2>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full ${step >= s ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`}
            />
          ))}
        </div>
      </div>
      <div className="p-8 min-h-[300px]">{renderStepContent()}</div>
      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between">
        <button
          onClick={step === 1 ? onCancel : handlePrev}
          className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>
        {step < 4 ? (
          <button
            onClick={handleNext}
            disabled={step === 1 && !config.category}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            Next Step <FiChevronRight />
          </button>
        ) : (
          <button
            onClick={() => onStart(config)}
            disabled={!config.difficulty}
            className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-black shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
          >
            <FaBrain /> Generate AI Test
          </button>
        )}
      </div>
    </motion.div>
  );
};

// --- 2. EXAM INTERFACE ---

const ExamInterface = ({ config, onSubmit }) => {
  const pattern = EXAM_PATTERNS[config.category] || EXAM_PATTERNS.School;
  const [timeLeft, setTimeLeft] = useState(pattern.duration * 60);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewMarked, setReviewMarked] = useState({});

  // Dummy Questions Generator
  const questions = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    text: `Sample diagnostic question ${i + 1} for ${config.category} pattern?`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    subject: i < 5 ? "Physics" : i < 10 ? "Chemistry" : "Mathematics",
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmit(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onSubmit, answers]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (optIdx) =>
    setAnswers({ ...answers, [currentQ]: optIdx });
  const toggleReview = () =>
    setReviewMarked({ ...reviewMarked, [currentQ]: !reviewMarked[currentQ] });
  const clearResponse = () => {
    const newAns = { ...answers };
    delete newAns[currentQ];
    setAnswers(newAns);
  };

  const qStatusColor = (idx) => {
    if (reviewMarked[idx] && answers[idx] !== undefined)
      return "bg-amber-500 text-white border-amber-600";
    if (reviewMarked[idx]) return "bg-purple-500 text-white border-purple-600";
    if (answers[idx] !== undefined)
      return "bg-emerald-500 text-white border-emerald-600";
    if (idx === currentQ)
      return "bg-indigo-100 dark:bg-indigo-900 border-indigo-500 text-indigo-700 dark:text-indigo-300";
    return "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-900 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-4">
      {/* Exam Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 shrink-0">
        <div>
          <h2 className="font-black text-slate-900 dark:text-white leading-tight">
            {config.category} Diagnostic Test
          </h2>
          <p className="text-xs font-bold text-slate-500">
            {config.difficulty} Level
          </p>
        </div>
        <div className="flex items-center gap-6">
          {/* Progress Warning */}
          {timeLeft < 300 && (
            <span className="animate-pulse text-red-500 font-bold text-sm hidden sm:block">
              5 Mins Remaining!
            </span>
          )}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-lg font-bold text-indigo-700 dark:text-indigo-400">
            <FiClock /> {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => onSubmit(answers)}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 pb-4">
        {/* Left: Question Area */}
        <div className="flex-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <span className="font-black text-lg text-slate-900 dark:text-white">
              Question {currentQ + 1}{" "}
              <span className="text-sm font-medium text-slate-500">
                of {questions.length}
              </span>
            </span>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">
              {questions[currentQ].subject}
            </span>
          </div>

          <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar">
            <h3 className="text-xl text-slate-800 dark:text-slate-200 leading-relaxed mb-8 font-medium">
              {questions[currentQ].text}
            </h3>
            <div className="space-y-3">
              {questions[currentQ].options.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${answers[currentQ] === idx ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${answers[currentQ] === idx ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-300 dark:border-slate-600 text-slate-500"}`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span
                    className={`font-medium ${answers[currentQ] === idx ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300"}`}
                  >
                    {opt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap justify-between gap-3 shrink-0">
            <div className="flex gap-2">
              <button
                onClick={toggleReview}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <FiBookmark
                  className={
                    reviewMarked[currentQ]
                      ? "fill-amber-500 text-amber-500"
                      : ""
                  }
                />{" "}
                Mark for Review
              </button>
              <button
                onClick={clearResponse}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:block"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                disabled={currentQ === 0}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-1 bg-white dark:bg-slate-800"
              >
                <FiChevronLeft /> Prev
              </button>
              <button
                onClick={() =>
                  setCurrentQ((prev) =>
                    Math.min(questions.length - 1, prev + 1),
                  )
                }
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-1"
              >
                Save & Next <FiChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Palette */}
        <div className="w-full lg:w-80 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col shrink-0 lg:h-full">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">
            Question Palette
          </h3>
          <div className="grid grid-cols-5 gap-2 mb-6 flex-1 content-start overflow-y-auto custom-scrollbar pr-2">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQ(idx)}
                className={`aspect-square rounded-lg border font-bold text-xs flex items-center justify-center transition-colors ${qStatusColor(idx)}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4 shrink-0">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div> Answered
              </span>{" "}
              <span>{Object.keys(answers).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border border-slate-400 rounded"></div>{" "}
                Not Answered
              </span>{" "}
              <span>{questions.length - Object.keys(answers).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div> Marked
              </span>{" "}
              <span>
                {
                  Object.keys(reviewMarked).filter(
                    (k) => reviewMarked[k] && answers[k] === undefined,
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded"></div> Answered &
                Marked
              </span>{" "}
              <span>
                {
                  Object.keys(reviewMarked).filter(
                    (k) => reviewMarked[k] && answers[k] !== undefined,
                  ).length
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. RESULTS DASHBOARD ---

const ResultsDashboard = ({ onHome }) => {
  const { user } = useAuth();
  const role = user?.role || "Student";

  return (
    <motion.div
      variants={containerVariant}
      initial="hidden"
      animate="visible"
      className="space-y-8 mt-6"
    >
      {/* Header Summary */}
      <motion.section
        variants={fadeUp}
        className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full uppercase tracking-wider mb-4 border border-emerald-500/30">
              <FiCheckCircle /> Test Evaluated Successfully
            </span>
            <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">
              Diagnostic Results
            </h1>
            <p className="text-indigo-200">
              JEE Mock Pattern • Completed on {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div className="text-center">
              <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-1">
                Total Score
              </p>
              <p className="text-4xl font-black text-emerald-400">
                210<span className="text-xl text-indigo-300">/300</span>
              </p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-1">
                Accuracy
              </p>
              <p className="text-4xl font-black text-white">82%</p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-1">
                Percentile Est.
              </p>
              <p className="text-4xl font-black text-white">94.5</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Grid: Subject Breakdown & AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Subject Performance */}
        <div className="xl:col-span-2 space-y-8">
          <motion.section
            variants={fadeUp}
            className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FiPieChart className="text-indigo-500" /> Subject Breakdown
            </h2>
            <div className="space-y-6">
              {[
                {
                  name: "Physics",
                  score: 85,
                  accuracy: 90,
                  color: "bg-emerald-500",
                },
                {
                  name: "Chemistry",
                  score: 65,
                  accuracy: 70,
                  color: "bg-amber-500",
                },
                {
                  name: "Mathematics",
                  score: 60,
                  accuracy: 85,
                  color: "bg-blue-500",
                },
              ].map((sub) => (
                <div key={sub.name}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">
                      {sub.name}
                    </span>
                    <div className="flex gap-4">
                      <span className="text-slate-500 font-medium">
                        Accuracy: {sub.accuracy}%
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        {sub.score} Marks
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sub.color}`}
                      style={{ width: `${sub.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* AI Recommended Study Plan */}
          <motion.section
            variants={fadeUp}
            className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FaBrain className="text-purple-500" /> AI Generated Study Plan
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 mb-3 uppercase tracking-wider">
                  Immediate Focus (Next 3 Days)
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-indigo-800 dark:text-indigo-200">
                    <FiPlay className="mt-1 shrink-0" /> Revise Organic
                    Chemistry Mechanisms (SN1/SN2).
                  </li>
                  <li className="flex items-start gap-2 text-sm text-indigo-800 dark:text-indigo-200">
                    <FiPlay className="mt-1 shrink-0" /> Practice 50 Numericals
                    on Integration.
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 mb-3 uppercase tracking-wider">
                  Recommended Resources
                </h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 bg-white dark:bg-slate-900 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 shadow-sm flex items-center gap-2 hover:shadow-md transition-shadow">
                    <FiFileText /> Chemistry Revision Notes PDF
                  </button>
                  <button className="w-full text-left p-2 bg-white dark:bg-slate-900 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 shadow-sm flex items-center gap-2 hover:shadow-md transition-shadow">
                    <FiCpu /> Generate Calculus Practice Quiz
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Right Rail: Weakness Detection & Role specific reports */}
        <div className="space-y-8">
          <motion.section
            variants={fadeUp}
            className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiTarget className="text-red-400" /> Micro-Topic Analysis
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-red-300 font-bold uppercase tracking-wider mb-2">
                  Critical Weaknesses
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg text-xs font-medium">
                    Integration
                  </span>
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg text-xs font-medium">
                    Coordination Compounds
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-2">
                  Core Strengths
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-xs font-medium">
                    Mechanics
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-xs font-medium">
                    Algebra
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/20">
                <p className="text-xs font-medium text-slate-300 italic">
                  "You are spending too much time on Chemistry calculations.
                  Review approximation techniques."
                </p>
              </div>
            </div>
          </motion.section>

          {/* Role Specific Blocks */}
          {(role === "Parent" || role === "Teacher" || role === "Admin") && (
            <motion.section
              variants={fadeUp}
              className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-amber-500"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FiUserCheck className="text-amber-500" /> {role} Insight Report
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="text-amber-500 mt-1 shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Student performance has plateaued in Chemistry over the last
                    3 tests.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <FiTrendingUp className="text-emerald-500 mt-1 shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Excellent time management in Physics (+15% speed
                    improvement).
                  </p>
                </div>
                <button className="w-full mt-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors">
                  Download Detailed PDF Report
                </button>
              </div>
            </motion.section>
          )}

          <button
            onClick={onHome}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            Return to Dashboard <FiChevronRight />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- 4. MAIN DASHBOARD (History & Entry) ---
const MainDashboard = ({ onStartWizard }) => {
  return (
    <motion.div
      variants={containerVariant}
      initial="hidden"
      animate="visible"
      className="space-y-8 mt-6 max-w-[1600px] mx-auto"
    >
      {/* Banner */}
      <motion.section
        variants={fadeUp}
        className="bg-white dark:bg-slate-950 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
      >
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-50 dark:from-indigo-900/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            AI Diagnostic Center
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Assess your knowledge, uncover hidden weaknesses, and let our AI
            generate a personalized learning roadmap just for you.
          </p>
        </div>
        <button
          onClick={onStartWizard}
          className="relative z-10 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-transform hover:scale-105 shrink-0 flex items-center gap-2 text-lg"
        >
          <FiCpu /> Create New Test
        </button>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test History Table */}
        <motion.section
          variants={fadeUp}
          className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FiList className="text-indigo-500" /> Previous Diagnostics
            </h2>
            <div className="flex gap-2">
              <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-slate-50">
                <FiFilter />
              </button>
              <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-slate-50">
                <FiSearch />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Test Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {DUMMY_HISTORY.map((test) => (
                  <tr
                    key={test.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {test.title}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{test.date}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {test.score}/{test.total}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-bold">
                        {test.accuracy}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 underline">
                        View Analytics
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Global Analytics Overview */}
        <motion.section
          variants={fadeUp}
          className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiTrendingUp className="text-emerald-500" /> Growth Trajectory
          </h2>
          <div className="aspect-video bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 text-sm font-bold">
            <DemoTrend />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Milestones
            </h3>
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
              <FiAward className="text-amber-500 text-xl shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Consistency Champion
                </p>
                <p className="text-xs text-slate-500">
                  Completed 5 tests this month.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

// ==========================================
// MASTER EXPORT COMPONENT
// ==========================================
export default function DiagnosticTest() {
  const [view, setView] = useState("dashboard"); // 'dashboard', 'setup', 'exam', 'results'
  const [testConfig, setTestConfig] = useState(null);

  const startSetup = () => setView("setup");
  const cancelSetup = () => setView("dashboard");
  const startExam = (config) => {
    setTestConfig(config);
    setView("exam");
  };
  const submitExam = (_answers) => {
    setView("results");
  };
  const goHome = () => setView("dashboard");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans selection:bg-indigo-500/30">
      {/* Universal Header (Hidden during exam to prevent distractions) */}
      {view !== "exam" && (
        <header className="px-6 py-5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="max-w-[1600px] mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg text-white font-black text-xl">
              A
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Diagnostic OS
            </span>
          </div>
        </header>
      )}

      {/* View Router */}
      <main className="p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <MainDashboard key="dash" onStartWizard={startSetup} />
          )}
          {view === "setup" && (
            <TestSetupWizard
              key="setup"
              onStart={startExam}
              onCancel={cancelSetup}
            />
          )}
          {view === "exam" && (
            <ExamInterface
              key="exam"
              config={testConfig}
              onSubmit={submitExam}
            />
          )}
          {view === "results" && (
            <ResultsDashboard key="results" onHome={goHome} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
