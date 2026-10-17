import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api, { setDemoMode } from "../services/api";
export const AuthContext = createContext(null);
const display = (u) =>
  u
    ? {
        ...u,
        role: u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase(),
      }
    : null;
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        user?.theme === "dark" || (user?.theme !== "light" && media.matches),
      );
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [user?.theme]);
  const clearAuthState = useCallback(() => {
    setUser(null);
    setDemoMode(false);
    sessionStorage.removeItem("adhayan_demo_role");
  }, []);
  const restoreSession = useCallback(async () => {
    const demoRole = sessionStorage.getItem("adhayan_demo_role");
    if (["Student", "Teacher", "Parent", "Admin"].includes(demoRole)) {
      setDemoMode(true);
      setUser({
        id: `demo-${demoRole.toLowerCase()}`,
        name: `Demo ${demoRole}`,
        role: demoRole,
        isDemo: true,
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setDemoMode(false);
      const r = await api.get("/auth/me");
      setUser(display(r.user));
    } catch (e) {
      if (e.status === 401) {
        try {
          const r = await api.post("/auth/refresh", {});
          setUser(display(r.user));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Remove credentials left by the previous version. Identity is restored only by the server.
    for (const key of [
      "adhayan_user",
      "adhayan_access_token",
      "adhayan_refresh_token",
    ])
      localStorage.removeItem(key);
    restoreSession();
    window.addEventListener("adhayan:session-expired", clearAuthState);
    return () =>
      window.removeEventListener("adhayan:session-expired", clearAuthState);
  }, [restoreSession, clearAuthState]);
  const clearError = useCallback(() => setError(null), []);
  const login = async (email, password, totp) => {
    setLoading(true);
    setError(null);
    setDemoMode(false);
    sessionStorage.removeItem("adhayan_demo_role");
    try {
      const r = await api.post("/auth/login", {
        email,
        password,
        ...(totp ? { totp } : {}),
      });
      setUser(display(r.user));
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };
  const register = async (data) => {
    setLoading(true);
    setError(null);
    setDemoMode(false);
    sessionStorage.removeItem("adhayan_demo_role");
    try {
      const r = await api.post("/auth/register", data);
      setUser(display(r.user));
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };
  const logout = useCallback(async () => {
    try {
      if (!user?.isDemo) await api.post("/auth/logout", {});
    } finally {
      clearAuthState();
    }
  }, [user, clearAuthState]);
  const demoLogin = async (role) => {
    if (!["Student", "Teacher", "Parent", "Admin"].includes(role))
      return { success: false };
    if (user && !user.isDemo) await api.post("/auth/logout", {});
    sessionStorage.setItem("adhayan_demo_role", role);
    setDemoMode(true);
    setUser({
      id: `demo-${role.toLowerCase()}`,
      name: `Demo ${role}`,
      role,
      isDemo: true,
    });
    setLoading(false);
    setError(null);
    return { success: true };
  };
  const updateProfile = async (data) => {
    try {
      const r = await api.put("/users/profile", data);
      setUser(display(r.user));
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, message: e.message };
    }
  };
  const refreshAccessToken = async () => {
    try {
      const r = await api.post("/auth/refresh", {});
      setUser(display(r.user));
      return true;
    } catch {
      clearAuthState();
      return false;
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoading: loading,
        error,
        isAuthenticated: !!user,
        userRole: user?.role,
        demoMode: !!user?.isDemo,
        login,
        register,
        logout,
        demoLogin,
        updateProfile,
        restoreSession,
        clearAuthState,
        refreshAccessToken,
        checkAuthStatus: () => !!user,
        hasRole: (role) => user?.role?.toLowerCase() === role.toLowerCase(),
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("AuthProvider required");
  return context;
}
