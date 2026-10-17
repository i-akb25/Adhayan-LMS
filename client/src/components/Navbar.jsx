import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiBookOpen, FiArrowRight } from "react-icons/fi";

// ==========================================
// NAVIGATION CONFIGURATION
// ==========================================
const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Features", path: "/#features" },
  { name: "AI Diagnostic", path: "/diagnostic-test" },
  { name: "Study Rooms", path: "/study-rooms" },
  { name: "Live Classes", path: "/live-class/demo" },
  { name: "Parents", path: "/parent-portal" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // ==========================================
  // SCROLL DETECTION FOR GLASSMORPHISM
  // ==========================================
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Helper to determine if a link is active
  const isActive = (path) => {
    if (path.includes("#")) {
      return location.pathname === "/" && location.hash === path.substring(1);
    }
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20 py-3"
            : "bg-transparent py-5 border-b border-transparent"
        }`}
        aria-label="Main Navigation"
      >
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* --- LOGO & TAGLINE --- */}
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
              aria-label="Adhayan Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-105">
                <FiBookOpen className="text-white text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  ADHAYAN
                </span>
                {/* Hidden on mobile to save space, visible on md screens */}
                <span className="hidden md:block text-[0.65rem] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                  Enlighten. Engage. Empower.
                </span>
              </div>
            </Link>

            {/* --- DESKTOP NAVIGATION --- */}
            {/* Hidden on screens smaller than large (lg) due to link count */}
            <nav className="hidden xl:flex items-center space-x-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      active
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                        : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {link.name}
                    {/* Active Link Indicator (Dot) */}
                    {active && (
                      <motion.span
                        layoutId="activeNavDot"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* --- DESKTOP ACTION BUTTONS --- */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link
                to={user ? "/dashboard" : "/login"}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full"
              >
                Login
              </Link>
              <Link
                to={user ? "/settings" : "/register"}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full"
              >
                Register
              </Link>
              <Link
                to="/demo"
                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 flex items-center gap-2 group"
              >
                Explore Demo
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* --- MOBILE MENU TOGGLE --- */}
            <div className="flex lg:hidden items-center gap-4">
              <Link
                to="/demo"
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-full shadow-md sm:hidden"
              >
                Demo
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE NAVIGATION MENU (Slide Down) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-x-0 top-[72px] z-40 lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl h-[calc(100vh-72px)] overflow-y-auto"
          >
            <div className="px-4 py-6 flex flex-col h-full">
              {/* Links */}
              <div className="flex flex-col space-y-1 flex-grow">
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`px-4 py-4 text-lg font-medium rounded-xl transition-colors flex items-center justify-between ${
                        active
                          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {link.name}
                      {active && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Action Buttons Container pinned to bottom */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-3 pb-8">
                <Link
                  to={user ? "/dashboard" : "/login"}
                  className="w-full px-5 py-4 text-center font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to={user ? "/settings" : "/register"}
                  className="w-full px-5 py-4 text-center font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  to="/demo"
                  className="w-full px-5 py-4 text-center font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Explore Demo Environment
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional Backdrop overlay to prevent clicking content while mobile menu is open.
        Comment out if you prefer the user to still interact with background.
      */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden mt-[72px]"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
