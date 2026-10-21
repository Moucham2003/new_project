// effects.js - animated background + theme that reacts to the weather.
// script.js fires a "weather:update" event; this file listens and reacts.

(() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0, h = 0;
  let theme = "clear-day";
  let items = [];
  let flash = 0;
  let rafId = null;

  // Weather code + day/night -> theme name
  function pickTheme(code, isDay) {
    if (code >= 95) return "storm";
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
    if (code === 45 || code === 48) return "fog";
    if (!isDay) return "night";
    if (code <= 1) return "clear-day";
    return "cloudy";
  }

  const rand = (min, max) => min + Math.random() * (max - min);

  // Create the particles/shapes for the current theme
  function build() {
    items = [];
    if (theme === "rain" || theme === "storm") {
      const n = Math.round((w * h) / (theme === "storm" ? 6000 : 9000));
      for (let i = 0; i < n; i++) {
        items.push({ x: rand(0, w), y: rand(0, h), len: rand(10, 22), speed: rand(12, 20) });
      }
    } else if (theme === "snow") {
      const n = Math.round((w * h) / 12000);
      for (let i = 0; i < n; i++) {
        items.push({ x: rand(0, w), y: rand(0, h), r: rand(1.5, 4), speed: rand(0.6, 1.8), phase: rand(0, 6.28) });
      }
    } else if (theme === "night") {
      for (let i = 0; i < 110; i++) {
        items.push({ x: rand(0, w), y: rand(0, h * 0.8), r: rand(0.6, 1.8), phase: rand(0, 6.28), speed: rand(0.02, 0.06) });
      }
    } else if (theme === "cloudy") {
      for (let i = 0; i < 7; i++) {
        items.push({ x: rand(-100, w), y: rand(30, h * 0.6), scale: rand(0.8, 2), speed: rand(0.1, 0.4) });
      }
    } else if (theme === "fog") {
      for (let i = 0; i < 6; i++) {
        items.push({ x: rand(-300, w), y: (h / 6) * i + rand(0, 40), width: rand(400, 800), speed: rand(0.1, 0.35) });
      }
    }
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (reduceMotion) frame(0);
  }

  function drawCloud(x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, 30 * s, 0, Math.PI * 2);
    ctx.arc(x + 32 * s, y - 14 * s, 38 * s, 0, Math.PI * 2);
    ctx.arc(x + 70 * s, y, 30 * s, 0, Math.PI * 2);
    ctx.arc(x + 35 * s, y + 10 * s, 30 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);

    if (theme === "clear-day") {
      // glowing sun, top right, gently pulsing
      const pulse = reduceMotion ? 0 : Math.sin(t / 900) * 12;
      const cx = w * 0.82, cy = h * 0.18;
      const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 260 + pulse);
      g.addColorStop(0, "rgba(255, 224, 120, 0.95)");
      g.addColorStop(0.25, "rgba(255, 214, 90, 0.45)");
      g.addColorStop(1, "rgba(255, 214, 90, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    if (theme === "night") {
      // moon + twinkling stars
      const mx = w * 0.82, my = h * 0.17;
      const mg = ctx.createRadialGradient(mx, my, 5, mx, my, 120);
      mg.addColorStop(0, "rgba(255, 252, 230, 0.35)");
      mg.addColorStop(1, "rgba(255, 252, 230, 0)");
      ctx.fillStyle = mg;
      ctx.fillRect(mx - 130, my - 130, 260, 260);
      ctx.fillStyle = "#fffbe6";
      ctx.beginPath();
      ctx.arc(mx, my, 26, 0, Math.PI * 2);
      ctx.fill();
      for (const s of items) {
        s.phase += s.speed;
        ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.65 * Math.abs(Math.sin(s.phase))})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (theme === "cloudy") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      for (const c of items) {
        c.x += c.speed;
        if (c.x > w + 100) c.x = -200 * c.scale;
        drawCloud(c.x, c.y, c.scale);
      }
    }

    if (theme === "fog") {
      for (const b of items) {
        b.x += b.speed;
        if (b.x > w) b.x = -b.width;
        const g = ctx.createLinearGradient(b.x, 0, b.x + b.width, 0);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, "rgba(255,255,255,0.35)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(b.x, b.y, b.width, 90);
      }
    }

    if (theme === "rain" || theme === "storm") {
      ctx.strokeStyle = "rgba(220, 235, 250, 0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (const d of items) {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.len);
        d.y += d.speed;
        d.x -= 0.6;
        if (d.y > h) { d.y = -d.len; d.x = rand(0, w + 40); }
      }
      ctx.stroke();

      if (theme === "storm" && !reduceMotion) {
        if (Math.random() < 0.006) flash = 1;
        if (flash > 0.02) {
          ctx.fillStyle = `rgba(255,255,255,${flash * 0.5})`;
          ctx.fillRect(0, 0, w, h);
          flash *= 0.88;
        }
      }
    }

    if (theme === "snow") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      for (const f of items) {
        f.phase += 0.015;
        f.y += f.speed;
        f.x += Math.sin(f.phase) * 0.6;
        if (f.y > h + 5) { f.y = -5; f.x = rand(0, w); }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!reduceMotion) rafId = requestAnimationFrame(frame);
  }

  function setTheme(next) {
    theme = next;
    document.body.dataset.theme = next;
    build();
    if (rafId) cancelAnimationFrame(rafId);
    frame(performance.now());
  }

  window.addEventListener("weather:update", (e) => {
    setTheme(pickTheme(e.detail.code, e.detail.isDay));
  });
  window.addEventListener("resize", resize);

  resize();
  setTheme("clear-day");
})();
