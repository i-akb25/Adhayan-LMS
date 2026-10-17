import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiCpu,
  FiDownload,
  FiSearch,
  FiFilter,
  FiUserCheck,
  FiActivity,
  FiFileText,
  FiCamera,
  FiMapPin,
  FiSmartphone,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiSave,
} from "react-icons/fi";
import { BsQrCodeScan } from "react-icons/bs";

// ==========================================
// DUMMY DATA & CONSTANTS
// ==========================================

const KPI_STATS = {
  Student: [
    {
      title: "Attendance %",
      value: "94.5%",
      icon: FiActivity,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Present Days",
      value: "42",
      icon: FiCheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Absent Days",
      value: "2",
      icon: FiXCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Late Entries",
      value: "1",
      icon: FiAlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Current Streak",
      value: "15 Days",
      icon: FiTrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Monthly Avg",
      value: "96%",
      icon: FiCalendar,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ],
  Teacher: [
    {
      title: "Class Avg %",
      value: "88.2%",
      icon: FiActivity,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Total Present Today",
      value: "38/40",
      icon: FiUserCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Total Absent Today",
      value: "2",
      icon: FiXCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Late Entries Today",
      value: "0",
      icon: FiAlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Pending Registers",
      value: "1",
      icon: FiFileText,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Weekly Trend",
      value: "+2.1%",
      icon: FiTrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ],
  Admin: [
    {
      title: "Institution Avg",
      value: "92.4%",
      icon: FiActivity,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Total Students Present",
      value: "1420",
      icon: FiUserCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Total Defaulters",
      value: "85",
      icon: FiAlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Staff Attendance",
      value: "98%",
      icon: FiShield,
      color: "text-teal-500",
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      title: "System Anomalies",
      value: "3",
      icon: FiCpu,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Monthly Trend",
      value: "+1.5%",
      icon: FiTrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ],
};

const ATTENDANCE_HISTORY = [
  {
    id: 1,
    date: "2026-06-22",
    status: "Present",
    inTime: "08:50 AM",
    outTime: "03:10 PM",
    remarks: "On Time",
    teacher: "Dr. Sharma",
    source: "Biometric",
  },
  {
    id: 2,
    date: "2026-06-21",
    status: "Present",
    inTime: "08:55 AM",
    outTime: "03:05 PM",
    remarks: "On Time",
    teacher: "Prof. Verma",
    source: "Live Class Sync",
  },
  {
    id: 3,
    date: "2026-06-20",
    status: "Late",
    inTime: "09:15 AM",
    outTime: "03:00 PM",
    remarks: "Transport Issue",
    teacher: "Dr. Sharma",
    source: "Manual",
  },
  {
    id: 4,
    date: "2026-06-19",
    status: "Absent",
    inTime: "--",
    outTime: "--",
    remarks: "Medical Leave",
    teacher: "--",
    source: "Parent Approved",
  },
  {
    id: 5,
    date: "2026-06-18",
    status: "Present",
    inTime: "08:45 AM",
    outTime: "03:15 PM",
    remarks: "On Time",
    teacher: "Mr. Gupta",
    source: "QR Scan",
  },
];

const TEACHER_STUDENT_LIST = [
  { id: "S101", name: "Aarav Kumar", roll: "1", status: "Present" },
  { id: "S102", name: "Priya Singh", roll: "2", status: "Present" },
  { id: "S103", name: "Rohan Sharma", roll: "3", status: "Absent" },
  { id: "S104", name: "Sneha Patel", roll: "4", status: "Late" },
  { id: "S105", name: "Vikram Desai", roll: "5", status: "Present" },
];

const AI_INSIGHTS = [
  {
    id: 1,
    type: "warning",
    text: "Attendance dropped by 12% this month. Student may require intervention.",
  },
  {
    id: 2,
    type: "success",
    text: "Excellent consistency maintained over the last 15 days.",
  },
  {
    id: 3,
    type: "info",
    text: "Absence prediction: High probability of leave on Fridays based on historical data.",
  },
];

const ABSENCE_ALERTS = [
  {
    id: 1,
    text: "Consecutive absence alert: 2 days missed (June 19, June 20).",
    severity: "high",
  },
  {
    id: 2,
    text: "Late arrival flagged by 1st-period teacher.",
    severity: "medium",
  },
];

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AttendanceTracker() {
  const { user } = useAuth();

  // Role Detection (Fallback to Student for Demo)
  const role = user?.role || "Student";

  // Current Date
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Render logic based on Role
  const renderDashboardContent = () => {
    switch (role) {
      case "Teacher":
        return <TeacherView />;
      case "Admin":
        return <AdminView />;
      case "Parent":
        return <ParentStudentView isParent={true} />;
      case "Student":
      default:
        return <ParentStudentView isParent={false} />;
    }
  };

  const currentKPIs =
    KPI_STATS[role === "Parent" ? "Student" : role] || KPI_STATS["Student"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans flex flex-col overflow-hidden selection:bg-indigo-500/30">
      {/* PAGE HEADER */}
      <header className="px-6 py-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                <FiClock className="text-white text-xl" />
              </div>
              Attendance OS
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              {dateString} •{" "}
              <span className="uppercase tracking-widest text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                {role} Portal
              </span>
            </p>
          </div>

          {/* EXPORT OPTIONS */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <FiDownload /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-600/20">
              <FiFileText /> Generate PDF
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none z-0"></div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-[1600px] mx-auto relative z-10 space-y-8"
        >
          {/* SUMMARY CARDS */}

          <motion.section
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {currentKPIs.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon size={20} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {stat.title}
                </p>
              </div>
            ))}
          </motion.section>

          {/* DYNAMIC ROLE VIEWS */}
          {renderDashboardContent()}

          {/* EXTRA ADVANCED FEATURES PLACEHOLDERS (ALL ROLES) */}
          {/* Architecture prepared for future hardware/software integrations */}
          <motion.section
            variants={fadeUp}
            className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-lg">
                <FiCpu size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Next-Gen Tracking Integrations
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { name: "QR Scan Node", icon: BsQrCodeScan },
                { name: "Face Recognition", icon: FiCamera },
                { name: "Geofencing (GPS)", icon: FiMapPin },
                { name: "App Biometrics", icon: FiSmartphone },
                { name: "Live Video Sync", icon: FiActivity },
              ].map((tech, i) => (
                <div
                  key={i}
                  className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center opacity-60 cursor-not-allowed hover:opacity-80 transition-opacity"
                >
                  <tech.icon className="text-2xl mb-3 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {tech.name}
                  </span>
                  <span className="text-[10px] mt-2 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </motion.section>

          <div className="h-10"></div>
        </motion.div>
      </main>
    </div>
  );
}

// ==========================================
// ROLE SPECIFIC VIEWS
// ==========================================

/* --- STUDENT / PARENT VIEW --- */
const ParentStudentView = ({ isParent }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Left Column (Calendar & History) */}
    <div className="lg:col-span-2 space-y-8">
      {/* ATTENDANCE CALENDAR */}

      <motion.section
        variants={fadeUp}
        className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            June 2026 Calendar
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
              <FiChevronLeft />
            </button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
              <FiChevronRight />
            </button>
          </div>
        </div>

        {/* Simplified Dummy Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-bold text-slate-500 uppercase">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Blanks for month start offset */}
          <div className="aspect-square"></div>
          {/* Days */}
          {[...Array(30)].map((_, i) => {
            const day = i + 1;
            // Generate pseudo-random status
            let statusClass =
              "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold border-emerald-200 dark:border-emerald-800/50"; // Present default
            if (day % 7 === 0 || (day + 1) % 7 === 0)
              statusClass = "bg-slate-100 dark:bg-slate-900 text-slate-400"; // Weekend
            else if (day === 19)
              statusClass =
                "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold border-red-200 dark:border-red-800/50"; // Absent
            else if (day === 20)
              statusClass =
                "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold border-amber-200 dark:border-amber-800/50"; // Late
            else if (day > 22)
              statusClass =
                "bg-white dark:bg-slate-950 border-dashed text-slate-300 dark:text-slate-700"; // Future

            return (
              <div
                key={day}
                className={`aspect-square rounded-xl border flex items-center justify-center text-sm transition-transform hover:scale-105 cursor-pointer ${statusClass}`}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-6 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-400"></div> Present
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-400"></div> Absent
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-400"></div> Late
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700"></div>{" "}
            Holiday/Weekend
          </span>
        </div>
      </motion.section>

      {/* ATTENDANCE HISTORY TABLE */}
      <motion.section
        variants={fadeUp}
        className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent History
          </h2>
          <div className="flex gap-2">
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
              <FiFilter size={16} />
            </button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
              <FiSearch size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">In / Out</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {ATTENDANCE_HISTORY.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {record.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        record.status === "Present"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : record.status === "Absent"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                    {record.inTime} - {record.outTime}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {record.source}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                    {record.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>

    {/* Right Column (Insights & Alerts) */}
    <div className="space-y-8">
      {/* AI ATTENDANCE INSIGHTS */}

      <motion.section
        variants={fadeUp}
        className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2.5 bg-white/10 backdrop-blur-md text-indigo-300 rounded-xl border border-white/10">
            <FiCpu size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">AI Insights</h2>
        </div>
        <div className="space-y-3 relative z-10">
          {AI_INSIGHTS.map((insight) => (
            <div
              key={insight.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 backdrop-blur-sm"
            >
              {insight.type === "warning" && (
                <FiAlertTriangle className="text-amber-400 shrink-0 mt-0.5" />
              )}
              {insight.type === "success" && (
                <FiCheckCircle className="text-emerald-400 shrink-0 mt-0.5" />
              )}
              {insight.type === "info" && (
                <FiActivity className="text-indigo-300 shrink-0 mt-0.5" />
              )}
              <p className="text-sm leading-relaxed text-slate-200">
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ABSENCE ALERTS & PARENT NOTIFICATIONS */}
      {isParent && (
        <motion.section
          variants={fadeUp}
          className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-red-500"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Parent Alerts
          </h2>
          <div className="space-y-4">
            {ABSENCE_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3"
              >
                <span className="flex h-2 w-2 relative mt-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <div>
                  <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-2">
                    {alert.text}
                  </p>
                  <button className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                    Acknowledge & Sign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ATTENDANCE REPORTS QUICK ACTIONS */}
      <motion.section
        variants={fadeUp}
        className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Official Reports
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 hover:border-indigo-500 transition-colors">
            <FiDownload size={20} className="text-indigo-500" /> Weekly PDF
          </button>
          <button className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 hover:border-indigo-500 transition-colors">
            <FiDownload size={20} className="text-indigo-500" /> Monthly PDF
          </button>
        </div>
      </motion.section>
    </div>
  </div>
);

/* --- TEACHER VIEW --- */
const TeacherView = () => (
  <div className="space-y-8">
    {/* CONTROLS */}
    <motion.section
      variants={fadeUp}
      className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-end"
    >
      <div className="w-full md:w-auto flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Class & Section
          </label>
          <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Class 11 - Science (A)</option>
            <option>Class 12 - Commerce (B)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Subject
          </label>
          <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Physics (Theory)</option>
            <option>Physics (Lab)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Date
          </label>
          <input
            type="date"
            defaultValue="2026-06-22"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-500 dark:text-slate-400"
          />
        </div>
      </div>
      <button className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all text-sm shrink-0">
        Fetch Roster
      </button>
    </motion.section>

    {/* MARK ATTENDANCE TABLE */}

    <motion.section
      variants={fadeUp}
      className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FiUserCheck className="text-indigo-500" /> Mark Attendance
        </h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            Mark All Present
          </button>
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2">
            <FiSave /> Save Register
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4 w-20">Roll No</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Attendance Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {TEACHER_STUDENT_LIST.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <td className="px-6 py-4 font-bold text-slate-500">
                  #{student.roll}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                  {student.name} <br />
                  <span className="text-[10px] font-medium text-slate-500">
                    {student.id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 w-max p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${student.status === "Present" ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"}`}
                    >
                      Present
                    </button>
                    <button
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${student.status === "Absent" ? "bg-red-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"}`}
                    >
                      Absent
                    </button>
                    <button
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${student.status === "Late" ? "bg-amber-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"}`}
                    >
                      Late
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Add Remark
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  </div>
);

/* --- ADMIN VIEW --- */
const AdminView = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* MACRO ANALYTICS */}

    <motion.section
      variants={fadeUp}
      className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center min-h-[300px] text-center items-center"
    >
      <FiActivity className="text-4xl text-slate-300 dark:text-slate-700 mb-4" />
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        Institutional Trends
      </h3>
      <p className="text-sm text-slate-500 max-w-md">
        Chart Placeholder: A multi-line graph comparing Grade 9, 10, 11, and 12
        attendance rates over the current semester.
      </p>
    </motion.section>

    {/* EXPORT & REPORTS */}
    <motion.section
      variants={fadeUp}
      className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
        Master Reports Engine
      </h2>
      <div className="space-y-4">
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h4 className="font-bold text-sm">Monthly Compliance Report</h4>
            <p className="text-xs text-slate-500">
              All students below 75% threshold
            </p>
          </div>
          <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-indigo-600 hover:border-indigo-500 shadow-sm">
            <FiDownload />
          </button>
        </div>
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h4 className="font-bold text-sm">Staff Attendance Audit</h4>
            <p className="text-xs text-slate-500">
              Biometric & Manual sync logs
            </p>
          </div>
          <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-indigo-600 hover:border-indigo-500 shadow-sm">
            <FiDownload />
          </button>
        </div>
      </div>
    </motion.section>
  </div>
);
