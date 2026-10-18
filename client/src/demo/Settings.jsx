import {
  FiLayout,
  FiMail,
  FiTarget,
  FiTrendingUp,
  FiMessageSquare,
} from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiShield,
  FiBell,
  FiLock,
  FiEye,
  FiMonitor,
  FiBookOpen,
  FiTrash2,
  FiLogOut,
  FiDownload,
  FiSmartphone,
  FiMoon,
  FiSun,
  FiType,
  FiActivity,
  FiSave,
  FiRefreshCcw,
  FiChevronRight,
  FiUsers,
} from "react-icons/fi";
import { FaRobot } from "react-icons/fa";

// ==========================================
// DUMMY DATA FOR SETTINGS
// ==========================================
const USER_PROFILE = {
  name: "Anurag Bharti",
  email: "anurag.bharti@adhayan.ai",
  phone: "+91 98765 43210",
  institution: "NIT Patna",
  class: "Class 12",
  stream: "Science (PCM)",
  bio: "Aspiring Engineer | Full Stack Learner | AI Enthusiast",
  avatar: "A",
  status: "Active",
  lastUpdated: "June 20, 2026",
};

const ACTIVE_DEVICES = [
  {
    id: 1,
    name: "MacBook Pro M2",
    browser: "Chrome",
    location: "Patna, India",
    lastActive: "Just now",
    current: true,
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    browser: "Safari",
    location: "Patna, India",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: 3,
    name: "Windows Desktop",
    browser: "Edge",
    location: "Delhi, India",
    lastActive: "2 days ago",
    current: false,
  },
];

// ==========================================
// SHARED UI COMPONENTS
// ==========================================

const SettingRow = ({ icon: Icon, title, subtitle, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div className="flex gap-4 mb-4 sm:mb-0">
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          {subtitle}
        </p>
      </div>
    </div>
    <div className="flex items-center">{children}</div>
  </div>
);

const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`${
      enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
  >
    <span
      className={`${
        enabled ? "translate-x-6" : "translate-x-1"
      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </button>
);

// ==========================================
// MAIN SETTINGS COMPONENT
// ==========================================
export default function Settings() {
  // --- STATE MANAGEMENT ---
  const [activeSection, setActiveSection] = useState("account");
  const [theme, setTheme] = useState("dark");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- HANDLERS ---
  const handleSave = () => {
    setIsSaving(true);

    setTimeout(() => setIsSaving(false), 1500);
  };

  const navItems = [
    { id: "account", label: "Account", icon: FiUser },
    { id: "security", label: "Security", icon: FiShield },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "privacy", label: "Privacy", icon: FiEye },
    { id: "appearance", label: "Appearance", icon: FiLayout },
    { id: "ai", label: "AI Preferences", icon: FaRobot },
    { id: "study", label: "Study Setup", icon: FiBookOpen },
    { id: "parent", label: "Parent Controls", icon: FiUsers },
    { id: "devices", label: "Devices", icon: FiMonitor },
    { id: "advanced", label: "Advanced", icon: FiActivity },
  ];

  // --- ANIMATIONS ---
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-600/20">
              {USER_PROFILE.avatar}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Settings
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Manage your ADHAYAN environment and security
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              {isSaving ? (
                <FiRefreshCcw className="animate-spin" />
              ) : (
                <FiSave />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SIDEBAR NAVIGATION */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white dark:bg-slate-950 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeSection === item.id
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                  {activeSection === item.id && (
                    <FiChevronRight className="ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Quick Analytics Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl border border-indigo-500/20 shadow-lg text-white">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">
                Security Score
              </h4>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black">94</span>
                <span className="text-indigo-300 font-bold mb-1">/100</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "94%" }}
                  className="h-full bg-emerald-500"
                />
              </div>
              <p className="text-[10px] text-indigo-100/60 mt-4 leading-relaxed font-medium">
                Your account is highly secure. Enabling 2FA would push this to
                100%.
              </p>
            </div>
          </aside>

          {/* CONTENT PANEL */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10"
              >
                {/* ACCOUNT SECTION */}
                {activeSection === "account" && (
                  <div className="space-y-8">
                    <section>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                        Profile Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            defaultValue={USER_PROFILE.name}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            defaultValue={USER_PROFILE.email}
                            disabled
                            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm opacity-70 cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            defaultValue={USER_PROFILE.phone}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                            Institution
                          </label>
                          <input
                            type="text"
                            defaultValue={USER_PROFILE.institution}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    </section>

                    <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        Biography
                      </h3>
                      <textarea
                        rows={4}
                        defaultValue={USER_PROFILE.bio}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                      />
                    </section>
                  </div>
                )}

                {/* SECURITY SECTION */}
                {activeSection === "security" && (
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                      Security & Authentication
                    </h2>
                    <SettingRow
                      icon={FiLock}
                      title="Two-Factor Authentication"
                      subtitle="Add an extra layer of security to your account."
                    >
                      <button className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold border border-indigo-100 dark:border-indigo-800/50">
                        Enable 2FA
                      </button>
                    </SettingRow>
                    <SettingRow
                      icon={FiShield}
                      title="Change Password"
                      subtitle="Update your password regularly for better security."
                    >
                      <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">
                        Update
                      </button>
                    </SettingRow>
                    <SettingRow
                      icon={FiEye}
                      title="Login Alerts"
                      subtitle="Get notified when someone logs into your account from a new device."
                    >
                      <Toggle enabled={true} onChange={() => {}} />
                    </SettingRow>
                  </div>
                )}

                {/* NOTIFICATIONS */}
                {activeSection === "notifications" && (
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                      Notification Preferences
                    </h2>
                    <SettingRow
                      icon={FiMail}
                      title="Email Digest"
                      subtitle="Weekly summary of your academic progress."
                    >
                      <Toggle enabled={true} onChange={() => {}} />
                    </SettingRow>
                    <SettingRow
                      icon={FiBell}
                      title="Push Notifications"
                      subtitle="Real-time alerts for tests, classes, and messages."
                    >
                      <Toggle enabled={true} onChange={() => {}} />
                    </SettingRow>
                    <SettingRow
                      icon={FiActivity}
                      title="Attendance Alerts"
                      subtitle="Warnings when your attendance drops below target."
                    >
                      <Toggle enabled={true} onChange={() => {}} />
                    </SettingRow>
                    <SettingRow
                      icon={FaRobot}
                      title="AI Mentor Alerts"
                      subtitle="Daily motivational nudges and plan updates."
                    >
                      <Toggle enabled={false} onChange={() => {}} />
                    </SettingRow>
                  </div>
                )}

                {/* AI PREFERENCES */}
                {activeSection === "ai" && (
                  <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-800/50 mb-8">
                      <h2 className="text-xl font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
                        <FaRobot /> Adhayan AI Engine
                      </h2>
                      <p className="text-sm text-indigo-800 dark:text-indigo-400 font-medium">
                        Control how your personal AI mentor interacts with your
                        data to optimize your learning path.
                      </p>
                    </div>
                    <SettingRow
                      icon={FiTarget}
                      title="Smart Study Planning"
                      subtitle="Allow AI to generate and adjust your schedule based on test performance."
                    >
                      <Toggle enabled={true} onChange={() => {}} />
                    </SettingRow>
                    <SettingRow
                      icon={FiTrendingUp}
                      title="Predictive Analytics"
                      subtitle="AI will predict your potential rank and scores based on current trends."
                    >
                      <Toggle enabled={true} onChange={() => {}} />
                    </SettingRow>
                    <SettingRow
                      icon={FiMessageSquare}
                      title="Conversational Mentor"
                      subtitle="Enable proactive chat interactions from your AI mentor."
                    >
                      <Toggle enabled={true} onChange={() => {}} />
                    </SettingRow>
                  </div>
                )}

                {/* APPEARANCE */}
                {activeSection === "appearance" && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                      Visual Settings
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: "light", label: "Light Mode", icon: FiSun },
                        { id: "dark", label: "Dark Mode", icon: FiMoon },
                        { id: "system", label: "System", icon: FiMonitor },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-4 ${
                            theme === t.id
                              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                              : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                          }`}
                        >
                          <t.icon
                            size={24}
                            className={
                              theme === t.id
                                ? "text-indigo-600"
                                : "text-slate-400"
                            }
                          />
                          <span
                            className={`text-sm font-bold ${theme === t.id ? "text-indigo-700 dark:text-indigo-300" : "text-slate-500"}`}
                          >
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <SettingRow
                      icon={FiType}
                      title="Font Scaling"
                      subtitle="Adjust interface text size for better readability."
                    >
                      <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold outline-none">
                        <option>Default (100%)</option>
                        <option>Large (110%)</option>
                        <option>X-Large (125%)</option>
                      </select>
                    </SettingRow>
                  </div>
                )}

                {/* DEVICES */}
                {activeSection === "devices" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Active Sessions
                      </h2>
                      <button className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline">
                        Log out all other devices
                      </button>
                    </div>
                    <div className="space-y-3">
                      {ACTIVE_DEVICES.map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {device.name.includes("iPhone") ? (
                                <FiSmartphone size={20} />
                              ) : (
                                <FiMonitor size={20} />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {device.name}
                                {device.current && (
                                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase rounded-md">
                                    This Device
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                {device.browser} • {device.location} •{" "}
                                {device.lastActive}
                              </p>
                            </div>
                          </div>
                          {!device.current && (
                            <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                              <FiLogOut />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ADVANCED */}
                {activeSection === "advanced" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                      Advanced Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button className="flex items-center gap-3 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-indigo-500 transition-all text-left">
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-indigo-600">
                          <FiDownload />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Export Academic Data
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                            PDF, CSV, JSON
                          </p>
                        </div>
                      </button>
                      <button className="flex items-center gap-3 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-indigo-500 transition-all text-left">
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-amber-600">
                          <FiRefreshCcw />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Reset Preferences
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                            UI & Dashboard Settings
                          </p>
                        </div>
                      </button>
                    </div>

                    <div className="mt-10 pt-10 border-t border-red-100 dark:border-red-900/20">
                      <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-xs text-slate-500 mb-6">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <button className="px-6 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800">
                          Deactivate Account
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 transition-all"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* CONFIRMATION MODAL (DELETE) */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTrash2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Are you absolutely sure?
              </h3>
              <p className="text-sm text-slate-500 mb-8">
                This action cannot be undone. All your progress, certificates,
                and AI history will be permanently wiped.
              </p>
              <div className="flex flex-col gap-3">
                <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all">
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
