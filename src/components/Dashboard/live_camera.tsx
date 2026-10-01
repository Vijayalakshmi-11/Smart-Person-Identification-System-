import { useEffect, useRef, useState } from "react";
import { Video, Play, StopCircle } from "lucide-react";

const LiveCamera = () => {
  const imgRef = useRef<HTMLImageElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "connected" | "error">("idle");

  const startCamera = () => {
    if (wsRef.current) return;

    const ws = new WebSocket("ws://127.0.0.1:8000/live/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      setRunning(true);
    };

    ws.onmessage = (event) => {
      if (imgRef.current) {
        imgRef.current.src =
          "data:image/jpeg;base64," + event.data;
      }
    };

    ws.onerror = () => {
      setStatus("error");
      stopCamera();
    };

    ws.onclose = () => {
      setStatus("idle");
      setRunning(false);
      wsRef.current = null;
    };
  };

  const stopCamera = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setRunning(false);
    setStatus("idle");
  };

  // Cleanup on tab change
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="p-6 bg-white shadow rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Video className="text-blue-600" />
          Live Camera
        </h2>

        <div className="flex gap-2">
          {!running ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg"
            >
              <Play size={16} />
              Start
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg"
            >
              <StopCircle size={16} />
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      <p className="mb-3 text-sm">
        Status:{" "}
        <span
          className={
            status === "connected"
              ? "text-green-600"
              : status === "error"
              ? "text-red-600"
              : "text-gray-500"
          }
        >
          {status}
        </span>
      </p>

      {/* Video */}
      <div className="overflow-hidden bg-black rounded-lg">
        <img
          ref={imgRef}
          className="w-full h-[480px] object-contain"
          alt="Live Camera Feed"
        />
      </div>
    </div>
  );
};

export default LiveCamera;
