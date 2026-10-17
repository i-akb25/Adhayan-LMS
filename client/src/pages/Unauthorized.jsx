import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FiShield,
  FiHome,
  FiLifeBuoy,
  FiLogOut,
  FiArrowLeft,
} from "react-icons/fi";

// ==========================================
// ROLE-BASED CONFIGURATIONS
// ==========================================

// Maps user roles to their specific access denial messages
const ROLE_MESSAGES = {
  Student: "This area is reserved for teachers and administrators.",
  Teacher: "This area requires administrator privileges.",
  Parent: "This page is not available for parent accounts.",
  DemoUser: "This feature is unavailable in demo mode.",
  Admin: "You do not have the required permissions to view this resource.",
  Unknown: "Access to this page is restricted.",
};

// Maps user roles to their respective dashboards
const ROLE_DASHBOARDS = {
  Student: "/student/dashboard",
  Teacher: "/teacher/dashboard",
  Parent: "/parent/dashboard",
  Admin: "/admin/dashboard",
  DemoUser: "/demo",
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function Unauthorized() {
  // --- Hooks & Context ---
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // --- Role Detection ---
  // Safely determine the user's role, defaulting to 'Unknown' if session is lost or invalid
  const role = user?.role || "Unknown";
  const roleMessage = ROLE_MESSAGES[role] || ROLE_MESSAGES.Unknown;
  const targetDashboard = ROLE_DASHBOARDS[role];

  // --- Navigation Handlers ---
  const handleGoToDashboard = () => {
    if (targetDashboard) {
      navigate(targetDashboard, { replace: true });
    }
  };

  const handleReturnHome = () => navigate("/", { replace: true });

  const handleContactSupport = () => navigate("/contact");

  const handleLoginAgain = () => {
    if (logout) logout();
    navigate("/login", { replace: true });
  };

  // ==========================================
  // UI LAYOUT & RENDER
  // ==========================================
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* --- Animated Background Gradients --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px]" />
      </div>

      {/* --- Central Glassmorphism Card --- */}
      <motion.section
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-3xl p-8 sm:p-12 text-center"
        aria-labelledby="unauthorized-title"
      >
        {/* --- Floating Security Icon --- */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center border-4 border-red-100 dark:border-red-900/50 shadow-inner"
          >
            <FiShield
              className="text-red-500 dark:text-red-400 text-5xl"
              aria-hidden="true"
            />
          </motion.div>
        </div>

        {/* --- Text Content --- */}
        <h1
          id="unauthorized-title"
          className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight"
        >
          Access Restricted
        </h1>

        <div className="space-y-3 mb-10">
          <p className="text-base text-slate-600 dark:text-slate-300">
            You do not have permission to access this resource.
          </p>
          <p className="text-sm font-medium text-red-600 dark:text-red-400 px-4 py-2 bg-red-50 dark:bg-red-900/10 rounded-lg inline-block border border-red-100 dark:border-red-900/30">
            {roleMessage}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
            If you believe this is a mistake, please contact your administrator
            or return to a page you are authorized to access.
          </p>
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex flex-col space-y-3">
          {/* Primary Action: Contextual based on whether role was identified */}
          {targetDashboard ? (
            <button
              onClick={handleGoToDashboard}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
              aria-label="Go to your dashboard"
            >
              <FiArrowLeft className="text-lg" /> Go To Dashboard
            </button>
          ) : (
            <button
              onClick={handleLoginAgain}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
              aria-label="Log in again"
            >
              <FiLogOut className="text-lg" /> Login Again
            </button>
          )}

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={handleReturnHome}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900"
              aria-label="Return to homepage"
            >
              <FiHome className="text-lg" /> Home
            </button>
            <button
              onClick={handleContactSupport}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900"
              aria-label="Contact support"
            >
              <FiLifeBuoy className="text-lg" /> Support
            </button>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
