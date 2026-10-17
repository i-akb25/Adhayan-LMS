import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FiGlobe,
  FiCpu,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiPlayCircle,
  FiFileText,
  FiLoader,
} from "react-icons/fi";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserTie,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";

// ==========================================
// DATA CONFIGURATIONS
// ==========================================

const DEMO_ROLES = [
  {
    id: "Student",
    icon: FaGraduationCap,
    label: "Student",
    desc: "Experience personalized learning, diagnostic tests, and study materials.",
    color: "from-blue-500 to-indigo-600",
    features: [
      "AI Diagnostic Tests",
      "Study Materials",
      "Attendance",
      "Performance Reports",
      "Global Study Rooms",
    ],
  },
  {
    id: "Teacher",
    icon: FaChalkboardTeacher,
    label: "Teacher",
    desc: "Manage students, upload notes, track attendance, and monitor performance.",
    color: "from-emerald-500 to-teal-600",
    features: [
      "Attendance Management",
      "Upload Materials",
      "Create Assessments",
      "Student Analytics",
      "Communication Tools",
    ],
  },
  {
    id: "Parent",
    icon: FaUserTie,
    label: "Parent",
    desc: "Monitor attendance, academic performance, and teacher communication.",
    color: "from-orange-500 to-red-600",
    features: [
      "Attendance Tracking",
      "Child Progress",
      "Notifications",
      "Teacher Communication",
      "Performance Reports",
    ],
  },
  {
    id: "Admin",
    icon: FaShieldAlt,
    label: "Admin",
    desc: "Manage the entire ecosystem including users, analytics, and reports.",
    color: "from-purple-500 to-pink-600",
    features: [
      "User Management",
      "Analytics",
      "Audit Logs",
      "Attendance Monitoring",
      "Platform Statistics",
    ],
  },
];

const AI_PREVIEW_DATA = {
  scores: [
    { subject: "Physics", score: 85, color: "bg-emerald-500" },
    { subject: "Chemistry", score: 72, color: "bg-amber-500" },
    { subject: "Mathematics", score: 60, color: "bg-red-500" },
  ],
  weakTopics: ["Integration", "Organic Chemistry", "Rotational Mechanics"],
  recommendations: [
    "Practice Calculus Module 4",
    "Revise SN1/SN2 Reactions",
    "Watch Video: Moment of Inertia",
  ],
};

const TESTIMONIALS = [
  {
    role: "Student",
    text: "The AI diagnostic test completely changed my prep strategy. I knew exactly what to study.",
    author: "Aarav M.",
  },
  {
    role: "Teacher",
    text: "Uploading materials and taking attendance is finally seamless. Saves me hours every week.",
    author: "Priya S.",
  },
  {
    role: "Parent",
    text: "I love getting instant updates on my phone when my son skips a class or aces a test.",
    author: "Rahul V.",
  },
];

// Helper icon component for missing FiGlobe import above

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function VisitorDemo() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);

  // --- Handlers ---
  const handleDemoLaunch = async (role) => {
    setLoadingRole(role);
    const result = await demoLogin(role);
    setLoadingRole(null);
    if (result.success) {
      navigate(`/${role.toLowerCase()}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* ========================================== */}
      {/* HERO SECTION */}
      {/* ========================================== */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-slate-200 dark:border-slate-800">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-screen-2xl">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten animate-pulse" />
            <div
              className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-pulse"
              style={{ animationDelay: "2s" }}
            />
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mb-8"
            >
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Interactive Product Showcase
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight"
            >
              Explore Adhayan <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Without Registration
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Experience AI-powered learning, attendance tracking, study rooms,
              parent monitoring, and advanced analytics instantly. Choose your
              perspective below.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-4"
            >
              {DEMO_ROLES.map((role) => (
                <button
                  key={`btn-${role.id}`}
                  onClick={() => handleDemoLaunch(role.id)}
                  disabled={!!loadingRole}
                  className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  aria-label={`Launch ${role.label} Demo`}
                >
                  {loadingRole === role.id ? (
                    <FiLoader className="animate-spin text-indigo-500" />
                  ) : (
                    <role.icon className="text-indigo-500" />
                  )}
                  Launch {role.label} Demo
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================== */}
      {/* DEMO ROLE SECTION (THE CARDS) */}
      {/* ========================================== */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8"
          >
            {DEMO_ROLES.map((role) => (
              <motion.div
                key={role.id}
                variants={fadeUp}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col relative overflow-hidden group"
              >
                <div
                  className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${role.color}`}
                ></div>

                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl text-white bg-gradient-to-br ${role.color} mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                >
                  <role.icon />
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                  {role.label} View
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 flex-grow">
                  {role.desc}
                </p>

                <ul className="space-y-3 mb-8">
                  {role.features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <FiCheckCircle className="text-indigo-500 mt-0.5 flex-shrink-0" />{" "}
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleDemoLaunch(role.id)}
                  disabled={!!loadingRole}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-md bg-gradient-to-r ${role.color} hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-70`}
                >
                  {loadingRole === role.id ? (
                    <>
                      <FiLoader className="animate-spin" /> Preparing Demo...
                    </>
                  ) : (
                    <>
                      Enter {role.label} Demo <FiArrowRight />
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================== */}
      {/* FEATURE PREVIEWS (BENTO GRID STYLE) */}
      {/* ========================================== */}
      <section className="py-24 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-sm mb-3">
              Sneak Peek
            </h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
              Experience the Modules
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              A glimpse into the tools powering the next generation of
              education.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* --- AI Diagnostic Preview --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden relative"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <FiCpu className="text-xl" />
                </div>
                <h4 className="text-2xl font-bold">AI Diagnostic Result</h4>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {AI_PREVIEW_DATA.scores.map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span>{stat.subject}</span>
                        <span>{stat.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stat.score}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${stat.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h5 className="font-bold text-red-500 mb-3 text-sm uppercase">
                    Weak Topics Identified
                  </h5>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {AI_PREVIEW_DATA.weakTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <h5 className="font-bold text-emerald-500 mb-3 text-sm uppercase">
                    AI Recommendations
                  </h5>
                  <ul className="space-y-2">
                    {AI_PREVIEW_DATA.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <FiPlayCircle className="text-emerald-500" /> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* --- Attendance Preview --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-xl">
                  <FiClock className="text-xl" />
                </div>
                <h4 className="text-xl font-bold">Attendance</h4>
              </div>

              <div className="text-center mb-8">
                <div className="text-5xl font-black text-slate-900 dark:text-white mb-2">
                  92%
                </div>
                <div className="text-sm font-bold text-emerald-500">
                  Excellent Standing
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    Present Days
                  </span>
                  <span className="font-bold text-lg">46</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    Absent Days
                  </span>
                  <span className="font-bold text-lg text-red-500">4</span>
                </div>
              </div>
            </motion.div>

            {/* --- Study Materials Preview --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FiFileText className="text-xl" />
                </div>
                <h4 className="text-xl font-bold">Latest Materials</h4>
              </div>
              <div className="space-y-3">
                {[
                  "Physics Note Ch-4.pdf",
                  "Chemistry Formulas.pdf",
                  "Math PYQ 2025.zip",
                ].map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <FiFileText className="text-indigo-500 text-xl" />
                    <span className="text-sm font-bold truncate">{file}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* --- Global Study Rooms Preview --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 border border-indigo-500/30 shadow-xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-3 bg-white/10 text-indigo-300 rounded-xl backdrop-blur-md">
                  <FiGlobe className="text-xl" />
                </div>
                <h4 className="text-2xl font-bold">Live Global Study Rooms</h4>
              </div>

              <div className="grid md:grid-cols-2 gap-4 relative z-10">
                {[
                  {
                    name: "JEE Advanced Focus",
                    count: 142,
                    status: "Silent Study",
                  },
                  {
                    name: "NEET Biology Marathon",
                    count: 89,
                    status: "Discussion Active",
                  },
                  {
                    name: "Engineering Math",
                    count: 45,
                    status: "Pomodoro 25/5",
                  },
                  {
                    name: "Class 12 Boards",
                    count: 210,
                    status: "Silent Study",
                  },
                ].map((room, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold mb-1">{room.name}</h5>
                      <p className="text-xs text-indigo-300">{room.status}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold">{room.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* TESTIMONIALS */}
      {/* ========================================== */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Why Users Love Adhayan
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex text-yellow-400 mb-6 gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <FaStar key={idx} />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-8 italic text-lg leading-relaxed">
                  "{t.text}"
                </p>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">
                    {t.author}
                  </h5>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                    {t.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* CALL TO ACTION */}
      {/* ========================================== */}
      <section className="py-24 relative overflow-hidden bg-indigo-600 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready To Begin Your Learning Journey?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Stop previewing and start experiencing. Join thousands of students
            and teachers on Adhayan today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-indigo-600 hover:bg-slate-50 font-bold rounded-full shadow-xl hover:-translate-y-1 transition-all text-center"
            >
              Create Free Account
            </Link>
            <Link
              to="/"
              className="px-8 py-4 bg-transparent border border-white/30 text-white hover:bg-white/10 font-bold rounded-full transition-all text-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
