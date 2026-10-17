import axios from "axios";
const baseURL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api";
const api = axios.create({
  baseURL,
  timeout: 25000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});
let demo = false;
export const setDemoMode = (value) => {
  demo = value;
};
export const getCSRF = () =>
  document.cookie
    .split("; ")
    .find((c) => c.startsWith("adhayan_csrf="))
    ?.split("=")
    .slice(1)
    .join("=") || "";
api.interceptors.request.use((config) => {
  if (demo)
    return Promise.reject(
      Object.assign(
        new Error("Demo accounts cannot read or change live records."),
        { status: 403 },
      ),
    );
  if (
    !["get", "head", "options"].includes((config.method || "get").toLowerCase())
  ) {
    config.headers["X-CSRF-Token"] = getCSRF();
    if (config.headers["Content-Type"] !== "application/octet-stream")
      config.headers["Content-Type"] = "application/json";
  }
  return config;
});
let refreshing = null;
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status === 401 &&
      request &&
      !request._retried &&
      !request.url.startsWith("/auth/")
    ) {
      request._retried = true;
      try {
        refreshing ||= api.post("/auth/refresh").finally(() => {
          refreshing = null;
        });
        await refreshing;
        return api(request);
      } catch {
        window.dispatchEvent(new Event("adhayan:session-expired"));
      }
    }
    const message =
      error.response?.data?.message || error.message || "Request failed.";
    return Promise.reject(
      Object.assign(new Error(message), {
        status: error.response?.status,
        response: error.response,
      }),
    );
  },
);
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/users/profile", data),
};
export const attendanceAPI = {
  getAttendance: (params) => api.get("/attendance", { params }),
  markAttendance: (data) => api.post("/attendance", data),
};
export const materialAPI = {
  getMaterials: (params) => api.get("/materials", { params }),
  uploadMaterial: (data) => api.post("/materials", data),
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
};
export const testAPI = {
  getDiagnosticTests: () => api.get("/tests/diagnostic"),
  startTest: (id) => api.post(`/tests/${id}/start`, {}),
  submitTest: (id, answers) => api.post(`/tests/${id}/submit`, { answers }),
  getTestResults: (id) => api.get(`/tests/${id}/results`),
};
export const notificationAPI = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`, {}),
  markAllAsRead: () => api.put("/notifications/read-all", {}),
};
export const roomAPI = {
  getActiveRooms: () => api.get("/rooms/active"),
  joinRoom: (id) => api.post(`/rooms/${id}/join`, {}),
  leaveRoom: (id) => api.post(`/rooms/${id}/leave`, {}),
  createStudyRoom: (data) => api.post("/rooms", data),
};
export const analyticsAPI = {
  getStudentAnalytics: (id) => api.get(`/analytics/student/${id}`),
  getPlatformStats: () => api.get("/admin/stats"),
};
export default api;
