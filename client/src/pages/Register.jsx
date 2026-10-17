import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiBookOpen,
  FiChevronDown,
  FiShield,
  FiCpu,
  FiGlobe,
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
    title: "AI Diagnostic Testing",
    desc: "Identify your true potential instantly.",
  },
  {
    icon: FiBookOpen,
    title: "Personalized Learning",
    desc: "Custom roadmaps tailored just for you.",
  },
  {
    icon: FiGlobe,
    title: "Global Study Rooms",
    desc: "Collaborate with peers worldwide 24/7.",
  },
  {
    icon: FiUsers,
    title: "Parent Connect",
    desc: "Seamless insights into academic growth.",
  },
];

const ROLES = ["Student", "Parent"];

const PASSWORD_RULES = [
  { id: "length", text: "At least 12 characters", regex: /.{12,}/ },
  { id: "uppercase", text: "One uppercase letter", regex: /[A-Z]/ },
  { id: "lowercase", text: "One lowercase letter", regex: /[a-z]/ },
  { id: "number", text: "One number", regex: /[0-9]/ },
  { id: "special", text: "One special character", regex: /[^A-Za-z0-9]/ },
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
export default function Register() {
  // --- Context & Navigation ---
  const { register, demoLogin, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // --- Core Form State ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Student",
  });

  // --- Role Specific State ---
  const [consent, setConsent] = useState(false);
  const [studentData, setStudentData] = useState({
    class: "11",
    stream: "Science",
    target: "JEE",
  });

  // --- UI State ---
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  // Clear auth errors on unmount
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (authError && clearError) clearError();
  };

  const handleRoleDataChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ==========================================
  // VALIDATION LOGIC
  // ==========================================
  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    PASSWORD_RULES.forEach((rule) => {
      if (rule.regex.test(pwd)) score += 1;
    });
    return score;
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,}$/;

    // Core Validation
    if (!formData.name.trim() || formData.name.length < 3)
      newErrors.name = "Name must be at least 3 characters";
    if (!formData.email.trim() || !emailRegex.test(formData.email))
      newErrors.email = "Valid email is required";
    if (
      !formData.phone.trim() ||
      !phoneRegex.test(formData.phone.replace(/\D/g, ""))
    )
      newErrors.phone = "Valid 10+ digit phone number required";

    // Password Validation
    if (calculatePasswordStrength(formData.password) < 5)
      newErrors.password = "Password does not meet all requirements";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    // Role Specific Validation (Basic)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SUBMISSION LOGIC
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !consent) return;

    setIsSubmitting(true);

    // Construct final payload
    const payload = {
      password: formData.password,
      role: formData.role,
      consent,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    if (formData.role === "Student")
      Object.assign(payload, { profileData: studentData });

    // Call AuthContext
    const result = await register(payload);
    setIsSubmitting(false);

    if (result.success) {
      // Route based on role
      const routes = {
        Student: "/student/dashboard",
        Teacher: "/teacher/dashboard",
        Parent: "/parent/dashboard",
      };
      navigate(routes[formData.role] || "/dashboard");
    }
  };

  const handleDemoLogin = async (role) => {
    setDemoLoading(role);
    await demoLogin(role);
    navigate("/dashboard");
    setDemoLoading(null);
    // Routing handled by App.jsx ProtectedRoute logic based on AuthContext state change
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  const passwordStrength = calculatePasswordStrength(formData.password);
  const strengthColor =
    passwordStrength < 3
      ? "bg-red-500"
      : passwordStrength < 5
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* ========================================== */}
      {/* LEFT PANEL (BRAND SHOWCASE) - DESKTOP ONLY */}
      {/* ========================================== */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-slate-900 text-white flex-col justify-between p-12 lg:fixed lg:h-screen lg:left-0 lg:top-0">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full bg-purple-600/20 blur-[120px]"
          />
        </div>

        {/* Header / Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Link
            to="/"
            className="flex items-center gap-3 w-max focus:outline-none"
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
          </Link>
        </motion.div>

        {/* Center Content */}
        <div className="relative z-10 mt-12">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl xl:text-5xl font-black leading-tight mb-6"
          >
            Start Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Learning Journey
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-slate-300 mb-10 leading-relaxed max-w-md"
          >
            Create your account and unlock AI-powered learning, attendance
            tracking, personalized study plans, and performance analytics.
          </motion.p>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
        <div className="relative z-10 flex items-center gap-2 text-sm text-slate-400 mt-12">
          <FiShield className="text-emerald-400" /> Secure SSL Encryption
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT PANEL (REGISTRATION FORM) */}
      {/* ========================================== */}
      <div className="w-full lg:w-7/12 lg:ml-[41.666667%] flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Header */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <FiBookOpen className="text-white text-lg" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            ADHAYAN
          </span>
        </div>

        <div className="max-w-xl w-full space-y-8 py-10 lg:py-0">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors focus:outline-none focus:underline"
              >
                Log in instead
              </Link>
            </p>
          </div>

          {/* Global API Auth Error */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex gap-3 overflow-hidden"
              >
                <FiAlertCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
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
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
            >
              <FaGoogle className="text-red-500 text-lg" /> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
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
                Or register with email
              </span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* ROLE SELECTION */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    disabled={role === "Admin"}
                    onClick={() =>
                      handleMainChange({
                        target: { name: "role", value: role },
                      })
                    }
                    className={`relative py-3 rounded-xl border text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 ${
                      formData.role === role
                        ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                    } ${role === "Admin" ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800" : ""}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              {formData.role === "Admin" && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <FiAlertCircle /> Admin accounts are created only by platform
                  administrators.
                </p>
              )}
            </div>

            {/* CORE FIELDS (Name, Email, Phone) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-slate-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleMainChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.name ? "border-red-500 ring-1 ring-red-500" : "border-slate-300 dark:border-slate-700"} rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow sm:text-sm`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

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
                    value={formData.email}
                    onChange={handleMainChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-slate-300 dark:border-slate-700"} rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow sm:text-sm`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-slate-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleMainChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.phone ? "border-red-500 ring-1 ring-red-500" : "border-slate-300 dark:border-slate-700"} rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow sm:text-sm`}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* CONDITIONAL ROLE FIELDS */}
            <AnimatePresence mode="wait">
              {/* STUDENT FIELDS */}
              {formData.role === "Student" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Class
                    </label>
                    <div className="relative">
                      <select
                        name="class"
                        value={studentData.class}
                        onChange={(e) =>
                          handleRoleDataChange(e, setStudentData)
                        }
                        className="block w-full pl-3 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm appearance-none"
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Class {i + 1}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Stream
                    </label>
                    <div className="relative">
                      <select
                        name="stream"
                        value={studentData.stream}
                        onChange={(e) =>
                          handleRoleDataChange(e, setStudentData)
                        }
                        className="block w-full pl-3 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm appearance-none"
                      >
                        {["Science", "Commerce", "Arts", "Foundation"].map(
                          (opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ),
                        )}
                      </select>
                      <FiChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Target
                    </label>
                    <div className="relative">
                      <select
                        name="target"
                        value={studentData.target}
                        onChange={(e) =>
                          handleRoleDataChange(e, setStudentData)
                        }
                        className="block w-full pl-3 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm appearance-none"
                      >
                        {["JEE", "NEET", "Boards", "Other"].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TEACHER FIELDS */}

              {/* PARENT FIELDS */}
              {formData.role === "Parent" && (
                <p className="text-sm text-slate-500">
                  After registration, link your child using a private invitation
                  from their student account.
                </p>
              )}
            </AnimatePresence>

            {/* PASSWORD FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-slate-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleMainChange}
                    className={`block w-full pl-10 pr-10 py-2.5 border ${errors.password ? "border-red-500 ring-1 ring-red-500" : "border-slate-300 dark:border-slate-700"} rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {/* Password Strength UI */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.regex.test(formData.password);
                        return (
                          <li
                            key={rule.id}
                            className={`text-[10px] flex items-center gap-1 ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
                          >
                            {passed ? (
                              <FiCheckCircle size={10} />
                            ) : (
                              <div className="w-1 h-1 rounded-full bg-slate-400 ml-1 mr-0.5"></div>
                            )}
                            {rule.text}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {errors.password && !formData.password && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-slate-400" />
                  </div>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleMainChange}
                    className={`block w-full pl-10 pr-10 py-2.5 border ${errors.confirmPassword ? "border-red-500 ring-1 ring-red-500" : "border-slate-300 dark:border-slate-700"} rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <label className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I agree to the terms and privacy notice linked below.
            </label>
            <button
              type="submit"
              disabled={isSubmitting || formData.role === "Admin"}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-6"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin -ml-1 mr-2 text-lg" />
                  Creating Your Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* ========================================== */}
          {/* DEMO ACCESS SECTION */}
          {/* ========================================== */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 text-center sm:text-left">
              Want to Explore First?
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {DEMO_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleDemoLogin(role.id)}
                  disabled={!!demoLoading || isSubmitting}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border ${role.border} ${role.bg} hover:shadow-md transition-all group disabled:opacity-50`}
                >
                  <div className={`text-xl ${role.color}`}>
                    {demoLoading === role.id ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <role.icon />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide group-hover:${role.color} transition-colors`}
                  >
                    {role.label} Demo
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-full sm:w-auto text-center">
              By registering, you agree to our
            </span>
            <Link
              to="/privacy"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
