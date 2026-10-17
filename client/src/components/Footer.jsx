import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";
import {
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  // ==========================================
  // HANDLERS
  // ==========================================
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Placeholder for newsletter subscription logic
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
      {/* --- MAIN FOOTER CONTENT --- */}
      <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* --- BRAND & CONTACT INFO (Col Span 2) --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg w-max"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <FiBookOpen className="text-white text-xl" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                ADHAYAN
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-sm">
              Enlighten. Engage. Empower.
              <br />
              The premium AI-driven ecosystem for the next generation of
              learners, connecting students, teachers, and parents globally.
            </p>

            {/* Contact Details */}
            <ul className="space-y-3 text-sm mt-6">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-indigo-600 dark:text-indigo-400 text-lg flex-shrink-0 mt-0.5" />
                <span>
                  123 Innovation Drive, Tech Park
                  <br />
                  Silicon Valley, CA 94043
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-indigo-600 dark:text-indigo-400 text-lg flex-shrink-0" />
                <a
                  href="/contact"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  Contact administrator
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-indigo-600 dark:text-indigo-400 text-lg flex-shrink-0" />
                <a
                  href="/contact"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  Contact administrator
                </a>
              </li>
            </ul>
          </div>

          {/* --- PLATFORM LINKS --- */}
          <div className="lg:col-span-1">
            <h4 className="text-slate-900 dark:text-white font-bold tracking-wider uppercase text-sm mb-6">
              Platform
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/live-class"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  Live Classes
                </Link>
              </li>
              <li>
                <Link
                  to="/study-rooms"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  Study Rooms
                </Link>
              </li>
              <li>
                <Link
                  to="/diagnostic-test"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  AI Diagnostic
                </Link>
              </li>
              <li>
                <Link
                  to="/parent-portal"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  Parent Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* --- COMPANY & SUPPORT LINKS --- */}
          <div className="lg:col-span-1">
            <div className="mb-8">
              <h4 className="text-slate-900 dark:text-white font-bold tracking-wider uppercase text-sm mb-6">
                Company
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold tracking-wider uppercase text-sm mb-6">
                Support
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/help-center"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faqs"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                  >
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* --- LEGAL LINKS --- */}
          <div className="lg:col-span-1">
            <h4 className="text-slate-900 dark:text-white font-bold tracking-wider uppercase text-sm mb-6">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/legal/privacy-policy"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/terms"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/cookie-policy"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/refund-policy"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* --- NEWSLETTER & SOCIALS --- */}
          <div className="lg:col-span-1 flex flex-col justify-between">
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold tracking-wider uppercase text-sm mb-6">
                Stay Updated
              </h4>
              <p className="text-xs mb-4">
                Subscribe to our newsletter for the latest platform updates and
                educational insights.
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col gap-2"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="newsletter-email"
                    placeholder="Enter your email"
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-3 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
                    aria-label="Subscribe"
                  >
                    <FiArrowRight />
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8">
              <h4 className="text-slate-900 dark:text-white font-bold tracking-wider uppercase text-sm mb-4">
                Follow Us
              </h4>
              <div className="flex items-center gap-4 text-xl">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  aria-label="GitHub"
                >
                  <FaGithub />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  aria-label="Twitter"
                >
                  <FaTwitter />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-600 dark:hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  aria-label="YouTube"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM BAR (COPYRIGHT) --- */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50">
        <div className="w-[90%] max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; 2026 Adhayan. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            All Systems Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
