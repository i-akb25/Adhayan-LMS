import { useState, useEffect, useRef, useCallback } from "react";
import Notice from "../features/Notice";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiArrowRight,
  FiBookOpen,
  FiUsers,
  FiCpu,
  FiVideo,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiGlobe,
  FiMessageCircle,
  FiTrendingUp,
  FiPlayCircle,
  FiStar,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserTie,
  FaUserShield,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";

// ==========================================
// IMAGE IMPORTS (Vite Compatibility)
// ==========================================
import logoImg from "../assets/images/logo.png";
import heroImg from "../assets/images/hero1.jpg";
import aiDiagnosticImg from "../assets/images/ai-diagnostic.jpg";
import studyRoomImg from "../assets/images/study-room.jpg";
import parentDashboardImg from "../assets/images/parent-dashboard.jpg";
import liveClassImg from "../assets/images/live-class.jpg";
import studentSuccessImg from "../assets/images/student-success.jpg";
import testimonial1Img from "../assets/images/testimonial1.jpg";
import testimonial2Img from "../assets/images/testimonial2.jpg";
import testimonial3Img from "../assets/images/testimonial3.jpg";

// ==========================================
// DATA CONFIGURATION & CONTENT
// ==========================================

const FEATURES = [
  {
    id: 1,
    icon: <FiCpu />,
    title: "AI Diagnostic Testing",
    desc: "Review performance by topic using teacher-authored assessments.",
  },
  {
    id: 2,
    icon: <FiGlobe />,
    title: "Global Study Rooms",
    desc: "Join focused, virtual study environments with peers worldwide.",
  },
  {
    id: 3,
    icon: <FiUsers />,
    title: "Parent Dashboard",
    desc: "Real-time attendance, progress tracking, and teacher communication.",
  },
  {
    id: 4,
    icon: <FiClock />,
    title: "Attendance Intelligence",
    desc: "Teacher-marked attendance with saved records and learning reports.",
  },
  {
    id: 5,
    icon: <FiBookOpen />,
    title: "Smart Study Materials",
    desc: "Curated notes, PYQs, and dynamic study plans based on performance.",
  },
  {
    id: 6,
    icon: <FiVideo />,
    title: "Live Classes",
    desc: "HD video, interactive whiteboards, and real-time doubt solving.",
  },
  {
    id: 7,
    icon: <FiMessageCircle />,
    title: "Doubt Forums",
    desc: "24/7 peer-to-peer and expert-assisted doubt resolution.",
  },
  {
    id: 8,
    icon: <FiTrendingUp />,
    title: "Performance Analytics",
    desc: "Deep-dive insights into subject mastery, consistency, and growth.",
  },
];

const TIMELINE_STEPS = [
  {
    step: "01",
    title: "Take Diagnostic Test",
    desc: "Start with an AI-generated assessment tailored to your class or stream.",
  },
  {
    step: "02",
    title: "Identify Weak Areas",
    desc: "Our engine pinpoints exactly which topics need your immediate attention.",
  },
  {
    step: "03",
    title: "Get Personalized Resources",
    desc: "Receive targeted video lectures, notes, and practice problems.",
  },
  {
    step: "04",
    title: "Track Progress",
    desc: "Monitor your growth through the comprehensive analytics dashboard.",
  },
];

const DEMO_ROLES = [
  {
    role: "Student Demo",
    icon: <FaGraduationCap />,
    desc: "Experience the AI test, study rooms, and dynamic learning dashboard.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    role: "Teacher Demo",
    icon: <FaChalkboardTeacher />,
    desc: "Upload notes, manage live classes, and view student analytics.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    role: "Parent Demo",
    icon: <FaUserTie />,
    desc: "Track attendance, monitor test scores, and communicate with teachers.",
    color: "from-orange-500 to-red-600",
  },
  {
    role: "Admin Demo",
    icon: <FaUserShield />,
    desc: "Manage users, view system health, and oversee global operations.",
    color: "from-purple-500 to-pink-600",
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Aarav M.",
    role: "Illustrative student example",
    image: testimonial1Img,
    text: "A learner can practise a topic, inspect the answer explanations and use their recorded weak topics to plan revision.",
  },
  {
    id: 2,
    name: "Priya S.",
    role: "Illustrative parent example",
    image: testimonial2Img,
    text: "A verified parent can view a linked student’s attendance and test reports and open a private conversation with their teacher.",
  },
  {
    id: 3,
    name: "Rahul V.",
    role: "Illustrative teacher example",
    image: testimonial3Img,
    text: "A teacher can publish lessons, review assessment questions and discuss doubts in member study rooms. Calls are not automatically recorded.",
  },
];

const FAQS = [
  {
    q: "What is Adhayan?",
    a: "ADHAYAN combines structured lessons, teacher-authored assessments, study rooms and dashboards for students, teachers and parents.",
  },
  {
    q: "How does AI Diagnostic Testing work?",
    a: "Teachers publish reviewed questions. Server-side scoring identifies weak topics from your answers, and a rule-based plan helps you choose what to revise.",
  },
  {
    q: "How do Global Study Rooms work?",
    a: "Study rooms provide member chat, a shared whiteboard and optional WebRTC calls. Camera and microphone access starts only when you choose to join a call. Cross-network calls require the operator to configure TURN.",
  },
  {
    q: "Can parents track progress?",
    a: "Yes. The dedicated Parent Dashboard provides real-time access to attendance records, test performance, and direct communication channels with teachers.",
  },
  {
    q: "Is Adhayan suitable for JEE and NEET?",
    a: "Teachers can create exam-specific courses and timed assessments. Availability depends on the reviewed content published for your track; a complete JEE or NEET curriculum is not preloaded.",
  },
];

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

const FadeIn = ({ children, delay = 0, direction = "up", className = "" }) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Custom Dialog/Modal for Footer Links
const DialogModal = ({ isOpen, onClose, title, content }) => {
  const panel = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const getButtons = () => [
      ...(panel.current?.querySelectorAll(
        'button,a[href],input,select,textarea,[tabindex="0"]',
      ) || []),
    ];
    getButtons()[0]?.focus();
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const controls = getButtons(),
          first = controls[0],
          last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [isOpen, onClose]);
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
          />
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <button
                aria-label="Close Modal"
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
              {content}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// MAIN LANDING PAGE COMPONENT
// ==========================================

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    content: null,
  });

  // Handle Scroll for Navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = (title, content) =>
    setModalConfig({ isOpen: true, title, content });
  const closeModal = useCallback(
    () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
    [],
  );

  const legalContent = (
    <>
      <Notice kind="privacy" />
      <Notice kind="terms" />
    </>
  );
  const contactContent = <Notice kind="contact" />;
  const aboutContent = <Notice kind="about" />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200 overflow-x-hidden">
      {/* --- SECTION 1: NAVBAR --- */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg py-3" : "bg-transparent py-5"}`}
      >
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logoImg}
              alt="Adhayan Logo"
              className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md"
            />
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              ADHAYAN
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {[
              "Home",
              "Features",
              "AI Diagnostic",
              "Study Rooms",
              "Parents",
            ].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              Explore Demo
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            aria-label="Toggle Navigation"
            className="lg:hidden text-slate-900 dark:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
                {[
                  "Home",
                  "Features",
                  "AI Diagnostic",
                  "Study Rooms",
                  "Parents",
                ].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  >
                    {item}
                  </a>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-4 px-4 flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3 text-center rounded-lg border border-slate-300 dark:border-slate-700 font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/demo")}
                    className="w-full py-3 text-center rounded-lg bg-indigo-600 text-white font-medium"
                  >
                    Explore Demo
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- SECTION 2: HERO SECTION --- */}
      <section
        id="home"
        className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full w-[90%] max-w-[1600px] mx-auto pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-pulse" />
          <div
            className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-6 border border-indigo-200 dark:border-indigo-800/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Adhayan v2.0 is Live
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                Learn Smarter.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  Grow Faster.
                </span>
                <br />
                Achieve More.
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed">
                An AI-powered learning ecosystem helping students identify
                weaknesses, master concepts, collaborate globally, and stay
                connected with teachers and parents.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-600/30 transition-transform hover:-translate-y-1 flex items-center gap-2"
                >
                  Get Started <FiArrowRight />
                </button>
                <button
                  onClick={() => navigate("/demo")}
                  className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full font-bold shadow-sm transition-transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <FiPlayCircle className="text-xl text-indigo-600 dark:text-indigo-400" />{" "}
                  Watch Tour
                </button>
              </div>
            </motion.div>

            {/* Hero Image / Visuals */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent mix-blend-overlay z-10"></div>
                <img
                  src={heroImg}
                  alt="Platform Dashboard Preview"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700 bg-slate-200 dark:bg-slate-800 min-h-[400px]"
                />
              </div>

              {/* Floating Stat Card 1 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -left-8 top-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 flex items-center gap-4 z-20"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Assessment scoring
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    Server verified
                  </p>
                </div>
              </motion.div>

              {/* Floating Stat Card 2 */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-6 bottom-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 flex items-center gap-4 z-20"
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <FiUsers size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Learning spaces
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    Study together
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: TRUSTED FEATURES SHOWCASE --- */}
      <section
        id="features"
        className="py-24 bg-white dark:bg-slate-800/50 relative border-y border-slate-200 dark:border-slate-800"
      >
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase text-sm mb-3">
              Core Platform
            </h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
              Everything you need to excel, built into one dashboard.
            </h3>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, idx) => (
              <FadeIn key={feature.id} delay={idx * 0.1}>
                <div className="group bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 4 & 5: HOW IT WORKS (TIMELINE) & WHY ADHAYAN --- */}
      <section className="py-24 relative">
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Why Adhayan Text */}
            <FadeIn direction="right">
              <h2 className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase text-sm mb-3">
                The Adhayan Advantage
              </h2>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
                Not just another video library. An intelligent learning engine.
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">
                Traditional platforms give you content. We give you context. Our
                AI analyzes your every move, creating a unique "Learning
                Passport" that evolves as you grow.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Hyper-personalized study plans generated daily.",
                  "Bank-grade security and full OWASP compliance.",
                  "Predictive analytics for parents and teachers.",
                  "Seamless integration across School, JEE, and NEET.",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-slate-700 dark:text-slate-200"
                  >
                    <FiCheckCircle className="text-emerald-500 flex-shrink-0" />{" "}
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/demo")}
                className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 hover:gap-3 transition-all"
              >
                Read our engineering blog <FiArrowRight />
              </button>
            </FadeIn>

            {/* How It Works Timeline */}
            <FadeIn direction="left">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 relative">
                <h4 className="text-2xl font-bold mb-8">How it works</h4>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
                  {TIMELINE_STEPS.map((step, idx) => (
                    <div
                      key={idx}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-indigo-600 text-white font-bold text-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow md:mx-auto z-10">
                        {step.step}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-transform group-hover:-translate-y-1">
                        <h5 className="font-bold text-slate-900 dark:text-white mb-1">
                          {step.title}
                        </h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- SECTION 6: AI DIAGNOSTIC TESTING --- */}
      <section
        id="ai-diagnostic"
        className="py-24 bg-slate-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01OS45IDAuMWwtNTkuOCA1OS44IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPg==')] opacity-30"></div>
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                <img
                  src={aiDiagnosticImg}
                  alt="AI Diagnostic Report UI"
                  className="w-full h-auto object-cover opacity-80 min-h-[400px]"
                />
                <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                  <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                        Weakest Topic Detected
                      </p>
                      <p className="text-white font-bold">
                        Rotational Mechanics
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/login")}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Fix Now
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-semibold mb-6 border border-indigo-500/30">
                <FiCpu /> The Killer Feature
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Pinpoint weaknesses before the examiner does.
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Our AI test engine doesn't just give you a score. It breaks down
                your performance topic by topic, analyzes your time per
                question, and immediately generates a tailored study plan.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-bold mb-2">Exam Modes</h4>
                  <ul className="space-y-2 text-slate-400">
                    <li>• Class 1–12 Mocks</li>
                    <li>• JEE Main & Advanced</li>
                    <li>• NEET Prep Engine</li>
                    <li>• Engineering Branches</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">AI Output</h4>
                  <ul className="space-y-2 text-slate-400">
                    <li>• Accuracy Heatmaps</li>
                    <li>• Weak Topic Flagging</li>
                    <li>• Recommended PYQs</li>
                    <li>• Custom Video Links</li>
                  </ul>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- SECTION 7: GLOBAL STUDY ROOMS --- */}
      <section id="study-rooms" className="py-24 bg-white dark:bg-slate-800/50">
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse flex-col-reverse">
            <FadeIn direction="right" className="lg:order-2">
              <h2 className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase text-sm mb-3">
                WebRTC Powered
              </h2>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
                Global Study Rooms
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                Studying alone can be isolating. Join high-focus, virtual study
                rooms categorized by your specific exam. Turn on your camera for
                accountability, use the integrated Pomodoro timer, and ask
                doubts in the chat.
              </p>
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">
                    <FaGraduationCap />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      JEE Advanced Focus Room
                    </h5>
                    <p className="text-sm text-slate-500">
                      124 students • Silent mode active
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="ml-auto px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg shadow-sm"
                  >
                    Join
                  </button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 opacity-75">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl">
                    <FiBookOpen />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      NEET Biology Marathon
                    </h5>
                    <p className="text-sm text-slate-500">
                      89 students • Chat active
                    </p>
                  </div>
                  <button className="ml-auto px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg cursor-not-allowed">
                    Full
                  </button>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
                <img
                  src={studyRoomImg}
                  alt="Study Room Interface"
                  className="w-full h-auto object-cover bg-slate-200 dark:bg-slate-800 min-h-[400px]"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- SECTION 8 & 9: PARENT DASHBOARD & LIVE CLASSES --- */}
      <section
        id="parents"
        className="py-24 relative bg-slate-50 dark:bg-slate-900"
      >
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          {/* Parent Dashboard */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
                <img
                  src={parentDashboardImg}
                  alt="Parent Dashboard Interface"
                  className="w-full h-auto object-cover bg-slate-200 dark:bg-slate-800 min-h-[350px]"
                />
              </div>
            </FadeIn>
            <FadeIn direction="left">
              <FiShield className="text-4xl text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
                Absolute transparency for parents.
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">
                No more waiting for parent-teacher meetings. The Parent app
                provides immediate insights into attendance, diagnostic scores,
                and daily engagement.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Instant Absence Alerts",
                  "Subject Mastery Reports",
                  "Direct Teacher Chat",
                  "1-Click PTM Scheduling",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>

          {/* Live Classes */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right" className="lg:order-2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
                <img
                  src={liveClassImg}
                  alt="Live Classroom Interface"
                  className="w-full h-auto object-cover bg-slate-200 dark:bg-slate-800 min-h-[350px]"
                />
              </div>
            </FadeIn>
            <FadeIn direction="left" className="lg:order-1">
              <FiVideo className="text-4xl text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
                Interactive Live Classes
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">
                Experience PW-level streaming quality with low latency. Teachers
                can share screens, utilize interactive whiteboards, run live
                polls, and split students into breakout rooms.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "HD WebRTC Video",
                  "Live Polls & Quizzes",
                  "Raise Hand Feature",
                  "Auto-Recorded Sessions",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- SECTION 10: STUDENT SUCCESS ANALYTICS --- */}
      <section className="py-24 bg-indigo-600 text-white relative overflow-hidden">
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Stop guessing. Start measuring.
            </h2>
            <p className="text-indigo-200 text-lg mb-12 max-w-2xl mx-auto">
              Our holistic analytics engine combines test scores, class
              attendance, and homework consistency to generate a single metric:
              Your Learning Score.
            </p>
            <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-indigo-400/30">
              <img
                src={studentSuccessImg}
                alt="Student Success Analytics Graph"
                className="w-full h-auto object-cover bg-indigo-900 min-h-[300px]"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- SECTION 11: STATISTICS / COUNTERS --- */}
      <section className="py-20 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "Learn", label: "Structured lessons" },
              { val: "Practise", label: "Reviewed assessments" },
              { val: "Track", label: "Learning progress" },
              { val: "Connect", label: "Member study rooms" },
            ].map((stat, idx) => (
              <FadeIn key={idx} delay={idx * 0.1}>
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
                  {stat.val}
                </div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {stat.label}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 14: RECRUITER DEMO FEATURE --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase text-sm mb-3">
              For Evaluators & Judges
            </h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
              Explore Adhayan Without Registration
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Experience the platform from every perspective instantly. 1-click
              magic links for recruiters.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEMO_ROLES.map((demo, idx) => (
              <FadeIn key={idx} delay={idx * 0.1}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
                  <div
                    className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${demo.color}`}
                  ></div>
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white bg-gradient-to-br ${demo.color} mb-6 shadow-lg`}
                  >
                    {demo.icon}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {demo.role}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 flex-grow">
                    {demo.desc}
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3 rounded-xl font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors"
                  >
                    Login as {demo.role.split(" ")[0]}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 12: TESTIMONIALS --- */}
      <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Illustrative learning experiences
            </h3>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.id} delay={i * 0.1}>
                <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 relative">
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(5)].map((_, idx) => (
                      <FiStar key={idx} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-8 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover bg-slate-300 dark:bg-slate-600"
                      onError={(e) =>
                        (e.target.src =
                          "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==")
                      }
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">
                        {t.name}
                      </h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 13: FAQ --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
          </FadeIn>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div
                  className={`border ${openFaq === index ? "border-indigo-500 dark:border-indigo-500 bg-white dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"} rounded-2xl overflow-hidden transition-all duration-300`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className="font-bold text-lg text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 ml-4 flex-shrink-0">
                      {openFaq === index ? (
                        <FiChevronUp size={24} />
                      ) : (
                        <FiChevronDown size={24} />
                      )}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 text-slate-600 dark:text-slate-300"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 14: CALL TO ACTION --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Start Your Learning Journey Today.
            </h2>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
              Join thousands of students transforming the way they learn,
              practice, and succeed.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-900 hover:bg-slate-50 rounded-full font-bold shadow-xl transition-transform hover:-translate-y-1"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate("/demo")}
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 hover:bg-white/10 text-white rounded-full font-bold transition-all"
              >
                Explore Demo First
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- SECTION 15: FOOTER --- */}
      <footer className="bg-slate-900 pt-20 pb-10 border-t border-slate-800 text-slate-400 text-sm">
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img
                  src={logoImg}
                  alt="Adhayan Logo"
                  className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md"
                />
                <span className="text-2xl font-black text-white tracking-tight">
                  ADHAYAN
                </span>
              </div>
              <p className="max-w-xs mb-6">
                Enlighten. Engage. Empower. The premium AI-driven ecosystem for
                the next generation of learners.
              </p>
              <div className="flex items-center gap-4 text-xl">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="hover:text-white transition-colors"
                >
                  <FaLinkedin />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="hover:text-white transition-colors"
                >
                  <FaGithub />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="hover:text-white transition-colors"
                >
                  <FaTwitter />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:text-white transition-colors"
                >
                  <FaInstagram />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
                Platform
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/diagnostic-test"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    AI Diagnostic
                  </Link>
                </li>
                <li>
                  <Link
                    to="/global-study-hall"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Global Study Rooms
                  </Link>
                </li>
                <li>
                  <Link
                    to="/live-classes"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Live Classes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/parent/dashboard"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Parent Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => openModal("About Us", aboutContent)}
                    className="hover:text-indigo-400 transition-colors text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => openModal("Contact Support", contactContent)}
                    className="hover:text-indigo-400 transition-colors text-left"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => openModal("Privacy Policy", legalContent)}
                    className="hover:text-indigo-400 transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openModal("Terms & Conditions", legalContent)
                    }
                    className="hover:text-indigo-400 transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal("Cookie Policy", legalContent)}
                    className="hover:text-indigo-400 transition-colors text-left"
                  >
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal("Refund Policy", legalContent)}
                    className="hover:text-indigo-400 transition-colors text-left"
                  >
                    Refund Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>
              &copy; {new Date().getFullYear()} Adhayan EdTech Platform. All
              rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Explore the learning workspace
            </div>
          </div>
        </div>
      </footer>

      {/* --- FOOTER MODAL COMPONENT --- */}
      <DialogModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
      />
    </div>
  );
}
