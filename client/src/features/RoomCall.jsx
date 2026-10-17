import { useEffect, useRef, useState } from "react";
import { SocketProvider, useSocket } from "../context/SocketContext";
import api from "../services/api";
function Video({ stream, muted = false, name }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <figure>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        className="w-full rounded-xl bg-slate-900"
      />
      <figcaption className="text-sm">{name}</figcaption>
    </figure>
  );
}
function RoomCall({ roomId }) {
  const { socket, connectSocket, disconnectSocket } = useSocket();
  const [active, setActive] = useState(false),
    [local, setLocal] = useState(null),
    [remote, setRemote] = useState([]),
    [message, setMessage] = useState(""),
    [muted, setMuted] = useState(false),
    [camera, setCamera] = useState(true),
    [sharing, setSharing] = useState(false);
  const peers = useRef(new Map()),
    stream = useRef(null),
    screen = useRef(null),
    ice = useRef([]),
    canvas = useRef(null),
    previous = useRef(null),
    strokeTime = useRef(0),
    activeRef = useRef(false);
  const stop = () => {
    activeRef.current = false;
    socket.emit("call:leave", { roomId });
    for (const p of peers.current.values()) p.pc.close();
    peers.current.clear();
    stream.current?.getTracks().forEach((t) => t.stop());
    screen.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    screen.current = null;
    setLocal(null);
    setRemote([]);
    setActive(false);
    setSharing(false);
    setMuted(false);
    setCamera(true);
  };
  useEffect(() => {
    const connections = peers.current;
    const addPeer = (id, name) => {
      if (connections.has(id)) return connections.get(id);
      const pc = new RTCPeerConnection({
        iceServers: ice.current,
        iceTransportPolicy: "relay",
      });
      const peer = { pc, name, queue: [] };
      connections.set(id, peer);
      for (const track of stream.current.getTracks())
        pc.addTrack(track, stream.current);
      pc.onicecandidate = (event) => {
        if (event.candidate)
          socket.emit("signal", {
            roomId,
            to: id,
            signal: { candidate: event.candidate.toJSON() },
          });
      };
      pc.ontrack = (event) =>
        setRemote((rows) => [
          ...rows.filter((r) => r.id !== id),
          { id, name, stream: event.streams[0] },
        ]);
      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) {
          pc.close();
          connections.delete(id);
          setRemote((rows) => rows.filter((r) => r.id !== id));
        }
      };
      return peer;
    };
    const roster = async (rows) => {
      for (const row of rows) {
        try {
          const { pc } = addPeer(row.id, row.name);
          await pc.setLocalDescription(await pc.createOffer());
          socket.emit("signal", {
            roomId,
            to: row.id,
            signal: { description: pc.localDescription.toJSON() },
          });
        } catch {
          setMessage("A participant could not connect.");
        }
      }
    };
    const signal = async (data) => {
      if (data.roomId !== roomId || !activeRef.current || !stream.current)
        return;
      try {
        const peer = addPeer(data.from, data.name);
        if (data.signal.description) {
          await peer.pc.setRemoteDescription(data.signal.description);
          for (const c of peer.queue) await peer.pc.addIceCandidate(c);
          peer.queue = [];
          if (data.signal.description.type === "offer") {
            await peer.pc.setLocalDescription(await peer.pc.createAnswer());
            socket.emit("signal", {
              roomId,
              to: data.from,
              signal: { description: peer.pc.localDescription.toJSON() },
            });
          }
        } else if (data.signal.candidate) {
          if (peer.pc.remoteDescription)
            await peer.pc.addIceCandidate(data.signal.candidate);
          else peer.queue.push(data.signal.candidate);
        }
      } catch {
        setMessage("A call connection failed. Leave and rejoin to retry.");
      }
    };
    const left = ({ id }) => {
      connections.get(id)?.pc.close();
      connections.delete(id);
      setRemote((rows) => rows.filter((r) => r.id !== id));
    };
    const draw = ({ from, to, color }) => {
      const c = canvas.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(from.x * c.width, from.y * c.height);
      ctx.lineTo(to.x * c.width, to.y * c.height);
      ctx.stroke();
    };
    const disconnect = () => {
      activeRef.current = false;
      for (const peer of connections.values()) peer.pc.close();
      connections.clear();
      stream.current?.getTracks().forEach((t) => t.stop());
      screen.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      screen.current = null;
      setActive(false);
      setLocal(null);
      setRemote([]);
      setSharing(false);
    };
    socket.on("call:peers", roster);
    socket.on("signal", signal);
    socket.on("call:left", left);
    socket.on("board:stroke", draw);
    socket.on("disconnect", disconnect);
    return () => {
      activeRef.current = false;
      socket.emit("call:leave", { roomId });
      socket.off("call:peers", roster);
      socket.off("signal", signal);
      socket.off("call:left", left);
      socket.off("board:stroke", draw);
      socket.off("disconnect", disconnect);
      for (const peer of connections.values()) peer.pc.close();
      connections.clear();
      stream.current?.getTracks().forEach((t) => t.stop());
      screen.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      screen.current = null;
    };
  }, [socket, roomId]);
  const start = async () => {
    setMessage("");
    try {
      const r = await api.get(`/rooms/${roomId}/ice`);
      if (!r.data.configured)
        throw Error(
          "Audio/video requires configured TURN infrastructure. Room chat is still available.",
        );
      ice.current = r.data.iceServers;
      connectSocket();
      if (!socket.connected)
        await new Promise((resolve, reject) => {
          const done = () => {
            socket.off("connect", onConnect);
            socket.off("connect_error", onError);
            clearTimeout(timer);
          };
          const onConnect = () => {
            done();
            resolve();
          };
          const onError = () => {
            done();
            reject(Error("Live connection unavailable."));
          };
          const timer = setTimeout(onError, 10000);
          socket.once("connect", onConnect);
          socket.once("connect_error", onError);
        });
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setLocal(stream.current);
      activeRef.current = true;
      setActive(true);
      socket.emit("call:join", { roomId }, (r) => {
        if (!r.success) {
          stop();
          setMessage(r.message);
        }
      });
    } catch (e) {
      stop();
      setMessage(e.message);
    }
  };
  const share = async () => {
    try {
      if (screen.current) {
        screen.current.getTracks().forEach((t) => t.stop());
        screen.current = null;
        for (const { pc } of peers.current.values()) {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          await sender?.replaceTrack(stream.current.getVideoTracks()[0]);
        }
        setSharing(false);
        return;
      }
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screen.current = display;
      const track = display.getVideoTracks()[0];
      for (const { pc } of peers.current.values()) {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        await sender?.replaceTrack(track);
      }
      track.onended = () => {
        if (screen.current) share();
      };
      setSharing(true);
    } catch {
      setMessage("Screen sharing was cancelled or is unavailable.");
    }
  };
  const point = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
    };
  };
  const drawLocal = (e) => {
    if (!previous.current) return;
    const next = point(e),
      from = previous.current;
    previous.current = next;
    const c = canvas.current,
      ctx = c.getContext("2d");
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(from.x * c.width, from.y * c.height);
    ctx.lineTo(next.x * c.width, next.y * c.height);
    ctx.stroke();
    if (Date.now() - strokeTime.current > 600) {
      socket.emit("board:stroke", { roomId, from, to: next, color: "#4f46e5" });
      strokeTime.current = Date.now();
    }
  };
  return (
    <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
      <h3 className="font-bold">Live collaboration</h3>
      <p className="text-sm text-slate-500">
        Calls use your microphone/camera and the configured relay service.
        Maximum six participants. Whiteboard strokes are ephemeral.
      </p>
      {message && <p role="alert">{message}</p>}
      {!active ? (
        <button
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
          onClick={start}
        >
          Join audio/video
        </button>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-3">
            <Video stream={local} muted name="You" />
            {remote.map((r) => (
              <Video key={r.id} stream={r.stream} name={r.name} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const t = stream.current.getAudioTracks()[0];
                t.enabled = !t.enabled;
                setMuted(!t.enabled);
              }}
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={() => {
                const t = stream.current.getVideoTracks()[0];
                t.enabled = !t.enabled;
                setCamera(t.enabled);
              }}
            >
              {camera ? "Camera off" : "Camera on"}
            </button>
            <button onClick={share}>
              {sharing ? "Stop sharing" : "Share screen"}
            </button>
            <button
              onClick={() => {
                stop();
                disconnectSocket();
              }}
            >
              Leave call
            </button>
          </div>
          <canvas
            ref={canvas}
            width={800}
            height={400}
            aria-label="Shared whiteboard"
            className="w-full bg-white rounded-xl border border-slate-300 touch-none"
            onPointerDown={(e) => {
              previous.current = point(e);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={drawLocal}
            onPointerUp={() => {
              previous.current = null;
            }}
            onPointerCancel={() => {
              previous.current = null;
            }}
          />
        </>
      )}
    </section>
  );
}

export default function BoundRoomCall(props) {
  return (
    <SocketProvider>
      <RoomCall {...props} />
    </SocketProvider>
  );
}
