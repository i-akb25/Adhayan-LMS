import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getCSRF } from "../services/api";
export const SocketContext = createContext(null);
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket] = useState(() =>
    io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
      autoConnect: false,
      withCredentials: true,
      reconnectionAttempts: 3,
    }),
  );
  const [isConnected, setIsConnected] = useState(false),
    [lastError, setLastError] = useState(null);
  const connectSocket = useCallback(() => {
    if (user && !user.isDemo) {
      socket.auth = { csrf: getCSRF() };
      socket.connect();
    }
  }, [socket, user]);
  const disconnectSocket = useCallback(() => {
    socket.disconnect();
    setIsConnected(false);
  }, [socket]);
  useEffect(() => {
    const connected = () => {
      setIsConnected(true);
      setLastError(null);
    };
    const disconnected = () => setIsConnected(false);
    const error = () => setLastError("Live connection unavailable.");
    socket.on("connect", connected);
    socket.on("disconnect", disconnected);
    socket.on("connect_error", error);
    return () => {
      socket.off("connect", connected);
      socket.off("disconnect", disconnected);
      socket.off("connect_error", error);
      socket.disconnect();
    };
  }, [socket]);
  useEffect(() => {
    if (!user || user.isDemo) socket.disconnect();
  }, [socket, user]);
  const value = useMemo(
    () => ({
      socket,
      isConnected,
      lastError,
      connectionStatus: isConnected ? "connected" : "disconnected",
      connectSocket,
      disconnectSocket,
      joinRoom: (roomId) => socket.emit("room:join", { roomId }),
      leaveRoom: (roomId) => socket.emit("room:leave", { roomId }),
      sendMessage: (roomId, content) =>
        socket.emit("chat:message:send", { roomId, content, type: "text" }),
    }),
    [socket, isConnected, lastError, connectSocket, disconnectSocket],
  );
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw Error("SocketProvider required");
  return context;
}
