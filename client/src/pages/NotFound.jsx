import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiSearch, FiZap } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";

// ==========================================
// FUN FACTS
// ==========================================
const FUN_FACTS = [
  "Students using AI study plans improve consistency by 35%.",
  "Spaced repetition is the most effective way to retain information.",
  "Taking a 5-minute break every hour boosts long-term focus.",
  "Consistent study streaks are the #1 predictor of academic success.",
  "Solving PYQs increases exam readiness score by up to 20%.",
];

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function NotFound() {
  const navigate = useNavigate();
  const [fact, setFact] = useState(FUN_FACTS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-8xl font-black text-indigo-600 dark:text-indigo-400"
          >
            404
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Oops! Lost in Space?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            The page you're looking for doesn't exist. It might have been moved,
            deleted, or you typed a wrong URL. Let's get you back to learning.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1"
            >
              <FiHome /> Back to Home
            </button>
            <button
              onClick={() => navigate("/ai-mentor")}
              className="px-6 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold flex items-center gap-2 hover:border-indigo-500 transition-all"
            >
              <FaRobot className="text-indigo-500" /> Ask AI Mentor
            </button>
          </div>

          {/* Search Placeholder */}
          <div className="relative pt-4">
            <FiSearch className="absolute left-4 top-8 text-slate-400" />
            <input
              type="text"
              placeholder="Search for a feature or page..."
              className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </motion.div>

        {/* Right: Visual & Facts */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                <FiZap size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Did you know?
              </h3>
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300 min-h-[60px] flex items-center">
              {fact}
            </p>
          </div>

          {/* Demo Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg">Explore Demo Mode</h4>
              <p className="text-emerald-50 text-xs mt-1">
                See what Adhayan can do for you.
              </p>
            </div>
            <button
              onClick={() => navigate("/demo")}
              className="px-5 py-2 bg-white text-emerald-700 rounded-lg text-sm font-bold shadow-md hover:bg-emerald-50 transition-all"
            >
              Launch Demo
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer Links */}
      <footer className="absolute bottom-8 w-full text-center text-slate-400 text-xs font-bold space-x-6">
        <Link to="/about" className="hover:text-indigo-500">
          About
        </Link>
        <Link to="/features" className="hover:text-indigo-500">
          Features
        </Link>
        <Link to="/contact" className="hover:text-indigo-500">
          Support
        </Link>
        <Link to="/privacy" className="hover:text-indigo-500">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
