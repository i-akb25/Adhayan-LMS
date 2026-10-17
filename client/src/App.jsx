import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
const Workspace = lazy(() => import("./features/Workspace"));
const CourseDetail = lazy(() =>
  import("./features/Workspace").then((m) => ({ default: m.CourseDetail })),
);
const Recovery = lazy(() =>
  import("./features/Workspace").then((m) => ({ default: m.Recovery })),
);
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VisitorDemo = lazy(() => import("./pages/VisitorDemo"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotificationCenter = lazy(() => import("./pages/NotificationCenter"));
const Mentor = lazy(() => import("./features/Mentor"));
const Notice = lazy(() => import("./features/Notice"));
const DemoAttendance = lazy(() => import("./demo/AttendanceTracker"));
const DemoMaterials = lazy(() => import("./demo/StudyMaterials"));
const DemoTest = lazy(() => import("./demo/DiagnosticTest"));
const DemoSettings = lazy(() => import("./demo/Settings"));
const DemoProfile = lazy(() => import("./demo/UserProfile"));
const DemoMentor = lazy(() => import("./demo/AIMentorChat"));
const DemoDiscussions = lazy(() => import("./demo/ChatDiscussions"));
const DemoHall = lazy(() => import("./demo/GlobalStudyHall"));
const DemoRoom = lazy(() => import("./demo/LiveStudyRoom"));
const DemoVideo = lazy(() => import("./demo/VideoConferenceRoom"));
const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow pt-24">
      <Outlet />
    </main>
    <Footer />
  </div>
);
function Dashboard() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  return <Navigate to={role ? `/${role}/dashboard` : "/login"} replace />;
}
function Access({ roles, children }) {
  return <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>;
}
function Feature({ section, Demo }) {
  const { user } = useAuth();
  return user?.isDemo && Demo ? (
    <>
      <p role="status" className="p-3 bg-amber-50 text-amber-800">
        Demonstration data. Changes are not saved.
      </p>
      <Demo />
    </>
  ) : (
    <Workspace section={section} />
  );
}
function LegacyAuth() {
  const { search } = useLocation();
  return (
    <Navigate
      to={
        search.includes("register")
          ? "/register"
          : search.includes("demo")
            ? "/demo"
            : "/login"
      }
      replace
    />
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense
          fallback={
            <p role="status" className="p-8">
              Loading ADHAYAN…
            </p>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/demo" element={<VisitorDemo />} />
            <Route path="/auth" element={<LegacyAuth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            {["forgot-password", "reset-password", "verify-email"].map(
              (mode) => (
                <Route
                  key={mode}
                  path={`/${mode}`}
                  element={<Recovery mode={mode} />}
                />
              ),
            )}
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={
                  <Access>
                    <Dashboard />
                  </Access>
                }
              />
              <Route
                path="/student/dashboard"
                element={
                  <Access roles={["student"]}>
                    <StudentDashboard />
                  </Access>
                }
              />
              <Route
                path="/teacher/dashboard"
                element={
                  <Access roles={["teacher"]}>
                    <TeacherDashboard />
                  </Access>
                }
              />
              <Route
                path="/parent/dashboard"
                element={
                  <Access roles={["parent"]}>
                    <ParentDashboard />
                  </Access>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <Access roles={["admin"]}>
                    <AdminDashboard />
                  </Access>
                }
              />
              <Route
                path="/live-class"
                element={<Navigate to="/global-study-hall" replace />}
              />
              <Route
                path="/legal/privacy-policy"
                element={<Navigate to="/privacy" replace />}
              />
              <Route
                path="/legal/terms"
                element={<Navigate to="/terms" replace />}
              />
              <Route
                path="/legal/cookie-policy"
                element={<Navigate to="/privacy" replace />}
              />
              <Route
                path="/legal/refund-policy"
                element={<Navigate to="/terms" replace />}
              />
              <Route
                path="/help-center"
                element={<Navigate to="/contact" replace />}
              />
              <Route path="/faqs" element={<Navigate to="/#faqs" replace />} />
              <Route path="/blog" element={<Navigate to="/about" replace />} />
              <Route
                path="/features"
                element={<Navigate to="/#features" replace />}
              />
              <Route
                path="/support"
                element={<Navigate to="/contact" replace />}
              />
              <Route
                path="/careers"
                element={<Navigate to="/about" replace />}
              />
              <Route
                path="/live-classes"
                element={<Navigate to="/global-study-hall" replace />}
              />
              <Route
                path="/admin/settings"
                element={<Navigate to="/settings" replace />}
              />
              <Route
                path="/student/tests"
                element={<Navigate to="/diagnostic-test" replace />}
              />
              <Route
                path="/student/materials"
                element={<Navigate to="/study-materials" replace />}
              />
              <Route
                path="/learn"
                element={
                  <Access>
                    <Workspace />
                  </Access>
                }
              />
              <Route
                path="/learn/:id"
                element={
                  <Access>
                    <CourseDetail />
                  </Access>
                }
              />
              {Object.entries({
                "/attendance": ["attendance", DemoAttendance],
                "/study-materials": ["materials", DemoMaterials],
                "/diagnostic-test": ["assessments", DemoTest],
                "/assignments": ["assignments"],
                "/analytics": ["analytics"],
                "/settings": ["settings", DemoSettings],
                "/profile": ["settings", DemoProfile],
                "/parent-connect": ["parent"],
                "/study-plan": ["plans"],
                "/discussions": ["discussions", DemoDiscussions],
                "/global-study-hall": ["rooms", DemoHall],
                "/study-room/:roomId": ["rooms", DemoRoom],
                "/live-class/:meetingId": ["classes", DemoVideo],
              }).map(([path, [section, Demo]]) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <Access>
                      <Feature section={section} Demo={Demo} />
                    </Access>
                  }
                />
              ))}
              <Route
                path="/ai-mentor"
                element={
                  <Access>
                    <MentorSwitch Demo={DemoMentor} />
                  </Access>
                }
              />
              <Route
                path="/notifications"
                element={
                  <Access>
                    <NotificationCenter />
                  </Access>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <Access roles={["admin"]}>
                    <Workspace section="admin" />
                  </Access>
                }
              />
              {Object.entries({
                "/study-rooms": "/global-study-hall",
                "/parent-portal": "/parent-connect",
              }).map(([from, to]) => (
                <Route
                  key={from}
                  path={from}
                  element={<Navigate to={to} replace />}
                />
              ))}
              {["about", "contact", "terms", "privacy"].map((kind) => (
                <Route
                  key={kind}
                  path={`/${kind}`}
                  element={<Notice kind={kind} />}
                />
              ))}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
function MentorSwitch({ Demo }) {
  const { user } = useAuth();
  return user?.isDemo ? (
    <>
      <p role="status" className="p-3 bg-amber-50 text-amber-800">
        Demonstration conversation. No AI provider is contacted.
      </p>
      <Demo />
    </>
  ) : (
    <Mentor />
  );
}
