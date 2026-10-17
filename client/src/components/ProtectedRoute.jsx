import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiBookOpen } from "react-icons/fi";

/**
 * ==========================================
 * PROTECTED ROUTE COMPONENT
 * ==========================================
 * * This component acts as the primary client-side security boundary for Adhayan.
 * It ensures that users are authenticated and possess the required role(s)
 * before allowing them to view sensitive routes.
 * * SECURITY NOTE:
 * Frontend route protection is purely for UX. It prevents users from
 * accidentally navigating to unauthorized pages and reduces unnecessary API calls.
 * Absolute security and RBAC must always be enforced at the Backend API layer.
 * * @param {ReactNode} children - The protected UI component to render.
 * @param {Array<string>} allowedRoles - Array of roles permitted to access the route.
 */

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Extract state from the global AuthContext
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  /**
   * SESSION VERIFICATION
   * Ensure we have the most up-to-date session state on initial mount
   * or when the route changes, in case the user hard-refreshed.
   */
  useEffect(() => {
    const verifyAccess = async () => {
      // If the context is already loading, wait for it to finish.
      // Otherwise, we might need to manually trigger a session check if state was lost on refresh.
      if (!isLoading) {
        // Optional: Call a checkSession function from context if needed
        // await checkSession();
        setIsVerifying(false);
      }
    };

    verifyAccess();
  }, [isLoading, location.pathname]);

  // ==========================================
  // RENDER: LOADING STATE
  // ==========================================
  // Display a premium loading screen while verifying the JWT or session status.
  if (isLoading || isVerifying) {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 rounded-xl border-4 border-slate-200 dark:border-slate-800 transform rotate-45"></div>
          <div className="absolute inset-0 rounded-xl border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          {/* Inner Logo */}
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg z-10">
            <FiBookOpen className="text-white text-xl" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Verifying Access
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase animate-pulse">
          Secure Connection Established
        </p>
      </div>
    );
  }

  // ==========================================
  // RENDER: UNAUTHENTICATED
  // ==========================================
  // Case 1 & 2: User is not logged in or token is missing.
  // Redirect to login page, preserving the intended destination so they can
  // be redirected back after successful authentication.
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, reason: "unauthenticated" }}
        replace
      />
    );
  }

  // ==========================================
  // RENDER: UNAUTHORIZED (RBAC)
  // ==========================================
  // Case 3: User is authenticated but does not have the required role.
  // E.g., A Student trying to access an Admin route.
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.some((role) => role.toLowerCase() === user.role.toLowerCase())
  ) {
    // Log the security event (optional, usually handled by backend)
    return (
      <Navigate
        to="/unauthorized"
        state={{
          from: location.pathname,
          reason: "insufficient_permissions",
          requiredRoles: allowedRoles,
        }}
        replace
      />
    );
  }

  // ==========================================
  // RENDER: AUTHORIZED
  // ==========================================
  // Case 4: User is authenticated and authorized. Render the protected content.
  return <>{children}</>;
};

// Use React.memo to prevent unnecessary re-renders of the boundary
// if the parent component re-renders but the route/auth state hasn't changed.
export default React.memo(ProtectedRoute);
