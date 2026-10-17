import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useResource } from "../features/Workspace";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiAlertTriangle, FiSettings, FiSearch } from "react-icons/fi";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ==========================================
// DUMMY DATA
// ==========================================
const NOTIFICATIONS_DATA = [
  {
    id: 1,
    title: "Physics Test Scheduled",
    message: "Your JEE Physics Mock Test is scheduled for tomorrow at 10 AM.",
    category: "Tests",
    priority: "High",
    timestamp: "10 mins ago",
    read: false,
    pinned: true,
  },
  {
    id: 2,
    title: "New Notes Uploaded",
    message:
      'Dr. Sharma uploaded "Thermodynamics" notes to your Physics folder.',
    category: "Materials",
    priority: "Medium",
    timestamp: "1 hour ago",
    read: false,
    pinned: false,
  },
  {
    id: 3,
    title: "AI Study Plan Generated",
    message: "Your personalized JEE study plan for this week is ready.",
    category: "AI Alerts",
    priority: "High",
    timestamp: "3 hours ago",
    read: false,
    pinned: false,
  },
  {
    id: 4,
    title: "Attendance Alert",
    message:
      "Your attendance is at 74%. You need 75% to be eligible for exams.",
    category: "Attendance",
    priority: "Critical",
    timestamp: "Yesterday",
    read: true,
    pinned: true,
  },
  {
    id: 5,
    title: "Teacher Announcement",
    message: "Extra doubt clearing session on Sunday at 5 PM.",
    category: "Announcements",
    priority: "Medium",
    timestamp: "Yesterday",
    read: true,
    pinned: false,
  },
];

// ==========================================
// COMPONENT
// ==========================================
export default function NotificationCenter() {
  const { user } = useAuth();
  const {
    data: live,
    error,
    reload,
  } = useResource(user?.isDemo ? null : "/notifications", []);
  const [demoNotifications, setDemoNotifications] =
    useState(NOTIFICATIONS_DATA);
  const [actionError, setActionError] = useState("");
  const notifications = useMemo(
    () => (user?.isDemo ? demoNotifications : live || []),
    [user?.isDemo, demoNotifications, live],
  );
  const setNotifications = setDemoNotifications;
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "All"
          ? true
          : filter === "Unread"
            ? !n.read
            : filter === "Read"
              ? n.read
              : filter === "Important"
                ? n.priority === "High" || n.priority === "Critical"
                : n.category === filter;
      return matchSearch && matchFilter;
    });
  }, [notifications, filter, search]);

  const toggleRead = async (id) => {
    if (user?.isDemo) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
      );
      return;
    }
    try {
      await api.put(`/notifications/${id}/read`, {});
      await reload();
    } catch (e) {
      setActionError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Notification Center
            </h1>
            <p className="text-slate-500 font-medium">
              You have{" "}
              <span className="text-indigo-600 font-bold">
                {unreadCount} unread
              </span>{" "}
              notifications
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (user?.isDemo) {
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true })),
                  );
                  return;
                }
                try {
                  await api.put("/notifications/read-all", {});
                  await reload();
                } catch (e) {
                  setActionError(e.message);
                }
              }}
              className="px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm"
            >
              Mark All Read
            </button>
            <button className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg">
              <FiSettings size={20} />
            </button>
          </div>
        </div>
      </header>

      {(error || actionError) && (
        <p role="alert" className="p-4 text-amber-700">
          {error || actionError}
        </p>
      )}
      {!notifications.length && (
        <p className="max-w-7xl mx-auto p-4 text-slate-500">
          No notifications yet.
        </p>
      )}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Filters */}
        <aside className="space-y-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              Filters
            </h3>
            <div className="space-y-1">
              {[
                "All",
                "Unread",
                "Read",
                "Important",
                "Attendance",
                "Tests",
                "Materials",
              ].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === f ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30" : "text-slate-600 dark:text-slate-400"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: List */}
        <section className="lg:col-span-2 space-y-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400" />
            <input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <AnimatePresence>
            {filtered.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`bg-white dark:bg-slate-950 p-5 rounded-2xl border ${n.read ? "border-slate-200 dark:border-slate-800" : "border-indigo-200 dark:border-indigo-800/50"} shadow-sm flex items-start gap-4`}
              >
                <div
                  className={`p-3 rounded-xl ${n.read ? "bg-slate-100" : "bg-indigo-50 dark:bg-indigo-900/30"}`}
                >
                  {n.priority === "Critical" ? (
                    <FiAlertTriangle className="text-red-500" />
                  ) : (
                    <FiBell className="text-indigo-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {n.message}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleRead(n.id)}
                      className="text-xs font-bold text-indigo-600 underline"
                    >
                      Mark as {n.read ? "Unread" : "Read"}
                    </button>
                    <button className="text-xs font-bold text-red-600 underline">
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {/* Right: Analytics */}
        <aside className="space-y-8">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">
              Activity
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Read", value: 12 },
                      { name: "Unread", value: 8 },
                    ]}
                    dataKey="value"
                    innerRadius={40}
                    outerRadius={70}
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              {[
                "Open AI Mentor",
                "View Attendance",
                "Study Materials",
                "Live Classes",
              ].map((l) => (
                <button
                  key={l}
                  className="w-full text-left p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
