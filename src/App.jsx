import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { resolveGesture } from "./fingers.js";
import { illuminatiEffect, tintEffect, spidermanEffect, glitchEffect } from "./effects.js";

const GESTURE_TO_EFFECT = {
  2: "illuminati",
  3: "tint",
  4: "spiderman",
  5: "glitch",
};

const HOLD_FRAMES = 8;

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenRef = useRef(document.createElement("canvas"));
  const landmarkerRef = useRef(null);
  const [status, setStatus] = useState("loading model...");
  const [activeEffect, setActiveEffect] = useState(null);

  const candidateRef = useRef({ gesture: null, count: 0 });

  useEffect(() => {
    let stream;
    let rafId;

    async function setup() {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });

      setStatus("ready — show two hands");

      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      offscreenRef.current.width = video.videoWidth;
      offscreenRef.current.height = video.videoHeight;

      loop();
    }

    function loop() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const offscreen = offscreenRef.current;
      const ctx = canvas.getContext("2d");
      const octx = offscreen.getContext("2d");

      const now = performance.now();
      const result = landmarkerRef.current.detectForVideo(video, now);
      const handsLandmarks = result.landmarks || [];

      const rawGesture = resolveGesture(handsLandmarks);

      const cand = candidateRef.current;
      if (rawGesture === cand.gesture) {
        cand.count++;
      } else {
        cand.gesture = rawGesture;
        cand.count = 1;
      }
      if (cand.count >= HOLD_FRAMES) {
        const nextEffect = rawGesture ? GESTURE_TO_EFFECT[rawGesture] : null;
        setActiveEffect((prev) => (prev === nextEffect ? prev : nextEffect));
      }

      octx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      switch (activeEffect) {
        case "illuminati":
          illuminatiEffect(ctx, canvas, now);
          break;
        case "tint":
          tintEffect(ctx, canvas, now);
          break;
        case "spiderman":
          spidermanEffect(ctx, canvas, now, handsLandmarks);
          break;
        case "glitch":
          glitchEffect(ctx, canvas, now, handsLandmarks, offscreen);
          break;
        default:
          break;
      }

      rafId = requestAnimationFrame(loop);
    }

    setup().catch((err) => {
      console.error(err);
      setStatus(`error: ${err.message}`);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      landmarkerRef.current?.close();
    };
  }, []);

  return (
    <div className="stage">
      <video ref={videoRef} playsInline muted></video>
      <canvas ref={canvasRef}></canvas>
      <div className="hud">
        {status} {activeEffect ? `— ${activeEffect}` : ""}
      </div>
    </div>
  );
}
