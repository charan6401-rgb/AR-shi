export function illuminatiEffect(ctx, canvas, t) {
  const { width: w, height: h } = canvas;
  const pulse = 0.5 + 0.5 * Math.sin(t / 300);

  const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.75);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,0,0,${0.55 + 0.25 * pulse})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.4 * (0.8 + 0.2 * pulse));
  glow.addColorStop(0, `rgba(255,215,0,${0.25 + 0.15 * pulse})`);
  glow.addColorStop(1, "rgba(255,215,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  ctx.save();
  ctx.translate(w - 70, 60);
  ctx.strokeStyle = `rgba(255,215,0,${0.7 + 0.3 * pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.quadraticCurveTo(0, -22, 30, 0);
  ctx.quadraticCurveTo(0, 22, -30, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 8 + 2 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function tintEffect(ctx, canvas, t) {
  const { width: w, height: h } = canvas;
  const hue = (t / 20) % 360;
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.45)`;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function spidermanEffect(ctx, canvas, t, handsLandmarks) {
  const { width: w, height: h } = canvas;

  const bounce = Math.abs(Math.sin(t / 250));
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `bold ${60 + bounce * 20}px Impact, sans-serif`;
  ctx.fillStyle = "#d40000";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4;
  ctx.strokeText("THWIP!", w / 2, h * 0.15);
  ctx.fillText("THWIP!", w / 2, h * 0.15);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.5;
  for (const hand of handsLandmarks) {
    const wrist = hand[0];
    const x = wrist.x * w;
    const y = wrist.y * h;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + t / 800;
      const len = 120 + 40 * Math.sin(t / 400 + i);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function glitchEffect(ctx, canvas, t, handsLandmarks, sourceCanvas) {
  const { width: w, height: h } = canvas;

  const offset = 6 + 4 * Math.sin(t / 60);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.5;
  ctx.drawImage(sourceCanvas, offset, 0);
  ctx.drawImage(sourceCanvas, -offset, 0);
  ctx.restore();

  const sliceCount = 8;
  const sliceH = h / sliceCount;
  for (let i = 0; i < sliceCount; i++) {
    if (Math.random() < 0.3) {
      const dx = (Math.random() - 0.5) * 30;
      ctx.drawImage(
        sourceCanvas,
        0, i * sliceH, w, sliceH,
        dx, i * sliceH, w, sliceH
      );
    }
  }

  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? "#fff" : "#000";
    ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 3, Math.random() * 3);
  }
  ctx.restore();
}
