import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiLoader,
  FiBookOpen,
  FiCpu,
  FiVideo,
  FiPieChart,
  FiUsers,
} from "react-icons/fi";
import {
  FaGoogle,
  FaGithub,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserTie,
  FaShieldAlt,
} from "react-icons/fa";

// ==========================================
// CONSTANTS & DATA
// ==========================================
const LEFT_PANEL_FEATURES = [
  {
    icon: FiCpu,
    title: "AI Diagnostic Tests",
    desc: "Identify strengths and weaknesses instantly.",
  },
  {
    icon: FiVideo,
    title: "Live Study Rooms",
    desc: "Collaborate with peers globally in real-time.",
  },
  {
    icon: FiPieChart,
    title: "Smart Analytics",
    desc: "Track your growth with data-driven insights.",
  },
  {
    icon: FiUsers,
    title: "Parent Connect",
    desc: "Seamless communication between home and school.",
  },
];

const DEMO_ROLES = [
  {
    id: "Student",
    icon: FaGraduationCap,
    label: "Student",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    id: "Teacher",
    icon: FaChalkboardTeacher,
    label: "Teacher",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    id: "Parent",
    icon: FaUserTie,
    label: "Parent",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
  },
  {
    id: "Admin",
    icon: FaShieldAlt,
    label: "Admin",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function Login() {
  // --- Context & Navigation ---
  const {
    login,
    demoLogin,
    isAuthenticated,
    user,
    error: authError,
    clearError,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- Local State ---
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  // --- Redirect Logic ---
  const origin = location.state?.from || null;
  const reason = location.state?.reason || null;

  useEffect(() => {
    if (isAuthenticated && user) {
      if (origin) {
        navigate(origin, { replace: true });
      } else {
        // Role-based routing
        const routes = {
          Student: "/student/dashboard",
          Teacher: "/teacher/dashboard",
          Parent: "/parent/dashboard",
          Admin: "/admin/dashboard",
          DemoUser: `/demo/${user.role?.toLowerCase() || "student"}`,
        };
        navigate(routes[user.role] || "/unauthorized", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, origin]);

  // Clear auth errors on unmount
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);

  // ==========================================
  // HANDLERS & VALIDATION
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (authError && clearError) clearError();
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // login function from AuthContext
    const result = await login(
      formData.email,
      formData.password,
      formData.totp,
    );
    setIsSubmitting(false);

    if (!result.success) {
      // Error handled by AuthContext and displayed via authError
    }
  };

  const handleDemoLogin = async (role) => {
    setDemoLoading(role);
    await demoLogin(role);
    setDemoLoading(null);
  };

  // ==========================================
  // UI RENDER
  // ==========================================
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 font-sans selection:bg-indigo-500/30">
      {/* ========================================== */}
      {/* LEFT PANEL (BRAND SHOWCASE) - DESKTOP ONLY */}
      {/* ========================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 text-white flex-col justify-between p-12">
        {/* Background Gradients & Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/30 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01OS45IDAuMWwtNTkuOCA1OS44IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPg==')] opacity-20" />
        </div>

        {/* Header / Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FiBookOpen className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              ADHAYAN
            </h1>
            <p className="text-[0.65rem] font-bold tracking-[0.2em] text-indigo-300 uppercase">
              Enlighten. Engage. Empower.
            </p>
          </div>
        </motion.div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg mt-12">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-black leading-tight mb-6"
          >
            Welcome Back To <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Smarter Learning
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-slate-300 mb-12 leading-relaxed"
          >
            Access your personalized learning dashboard, diagnostic tests, study
            rooms, attendance records, and progress analytics.
          </motion.p>

          {/* Feature Cards (Glassmorphism) */}
          <div className="grid grid-cols-2 gap-4">
            {LEFT_PANEL_FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
              >
                <feature.icon className="text-2xl text-indigo-400 mb-3" />
                <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="relative z-10 flex items-center gap-2 text-sm text-slate-400"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          All systems operational
        </motion.div>
      </div>

      {/* ========================================== */}
      {/* RIGHT PANEL (LOGIN FORM) */}
      {/* ========================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Mobile Logo Header */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <FiBookOpen className="text-white text-lg" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            ADHAYAN
          </span>
        </div>

        <div className="max-w-md w-full space-y-8">
          {/* Form Header */}
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Log in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Alert Message for unauthenticated redirects */}
          <AnimatePresence>
            {reason === "unauthenticated" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-3"
              >
                <FiAlertCircle className="text-amber-500 text-xl flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Please log in to access that page.
                </p>
              </motion.div>
            )}

            {/* Global API Auth Error */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex gap-3"
              >
                <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  {authError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
            >
              <FaGoogle className="text-red-500 text-lg" /> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
            >
              <FaGithub className="text-slate-900 dark:text-white text-lg" />{" "}
              GitHub
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-50 dark:bg-slate-900 text-slate-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-slate-300 dark:border-slate-700"} rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow sm:text-sm`}
                  placeholder="you@example.com"
                  aria-invalid={errors.email ? "true" : "false"}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <FiAlertCircle /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 border ${errors.password ? "border-red-500 ring-1 ring-red-500" : "border-slate-300 dark:border-slate-700"} rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow sm:text-sm`}
                  placeholder="••••••••"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <FiAlertCircle /> {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {authError?.includes("verification code") && (
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Administrator verification code
                <input
                  aria-label="Administrator verification code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  onChange={(e) =>
                    setFormData({ ...formData, totp: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 dark:bg-slate-800"
                />
              </label>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin -ml-1 mr-2 text-lg" />
                  Signing you in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* ========================================== */}
          {/* DEMO ACCESS SECTION */}
          {/* ========================================== */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 text-center sm:text-left">
              Explore Without Registration
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleDemoLogin(role.id)}
                  disabled={!!demoLoading || isSubmitting}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${role.border} ${role.bg} hover:shadow-md transition-all group disabled:opacity-50`}
                  aria-label={`Log in as Demo ${role.label}`}
                >
                  <div
                    className={`p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${role.color}`}
                  >
                    {demoLoading === role.id ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <role.icon />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Login as
                    </span>
                    <span
                      className={`text-sm font-bold text-slate-900 dark:text-white group-hover:${role.color} transition-colors`}
                    >
                      {role.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="pt-8 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <Link
              to="/privacy"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/support"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
