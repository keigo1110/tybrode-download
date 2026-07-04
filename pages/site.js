(() => {
  document.documentElement.classList.add("reveal-ready");

  const translations = {
    ja: {
      headerDownload: "ダウンロード",
      heroCopy: "入力の断片から創造を広げる",
      heroDownload: "Tybrode.dmg をダウンロード",
      featureOneTitle: "すべてローカルでキャプチャ",
      featureOneBody:
        "Web、メモ、コード、ドキュメントなど、あらゆる情報をあなたのMac上に安全に保存。クラウドに送信されることは一切ありません。",
      featureTwoTitle: "許可したサイトだけを記録",
      featureTwoBody:
        "Allowlistに登録したサイトのみを自動でキャプチャ。プライベートな情報や不要なノイズを取り込みません。",
      featureThreeTitle: "ローカルで日次サマリーを生成",
      featureThreeBody:
        "その日に集めた情報をAIがローカルで要約。思考のつながりを見つけ、学びを定着させます。",
      featureFourTitle: "メニューバーから、すぐに記録",
      featureFourBody:
        "メニューバーからワンクリックでキャプチャ。思考を止めずに、自然に情報を積み重ねられます。",
      downloadKicker: "Latest DMG",
      downloadTitle: "Tybrode をMacで試す",
      downloadButton: "Download Latest DMG",
    },
    en: {
      headerDownload: "Download",
      heroCopy: "Expand creativity from fragments of input.",
      heroDownload: "Download Tybrode.dmg",
      featureOneTitle: "Capture everything locally",
      featureOneBody:
        "Save useful context from writing, notes, code, and documents on your Mac. Captured content is never uploaded to a cloud service.",
      featureTwoTitle: "Record allowlisted sites only",
      featureTwoBody:
        "Only the sites you add to the allowlist are captured automatically. Private surfaces and irrelevant noise stay outside the record.",
      featureThreeTitle: "Generate daily local summaries",
      featureThreeBody:
        "A local model summarizes the day, finds connections across your work, and leaves readable JSON and Markdown reports.",
      featureFourTitle: "Start from the menu bar",
      featureFourBody:
        "Capture begins from a quiet menu bar control, so you can keep thinking while Tybrode gathers context in the background.",
      downloadKicker: "Latest DMG",
      downloadTitle: "Try Tybrode on your Mac",
      downloadButton: "Download Latest DMG",
    },
  };

  const languageButtons = document.querySelectorAll("[data-language-set]");

  function applyLanguage(language) {
    const nextLanguage = translations[language] ? language : "ja";
    document.documentElement.lang = nextLanguage;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (key && translations[nextLanguage][key]) {
        element.textContent = translations[nextLanguage][key];
      }
    });
    // Highlight the active language segment so the toggle reads unambiguously.
    languageButtons.forEach((button) => {
      const isActive = button.getAttribute("data-language-set") === nextLanguage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    try {
      window.localStorage.setItem("tybrode-language", nextLanguage);
    } catch {
      // Ignore storage failures; the toggle still works for the current page.
    }
  }

  if (languageButtons.length > 0) {
    let storedLanguage = "ja";
    try {
      storedLanguage = window.localStorage.getItem("tybrode-language") || "ja";
    } catch {
      storedLanguage = "ja";
    }
    applyLanguage(storedLanguage);
    languageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        applyLanguage(button.getAttribute("data-language-set"));
      });
    });
  }

  const canvas = document.querySelector("#singularity-canvas");
  const revealItems = document.querySelectorAll("[data-reveal]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealVisibleItems() {
    const margin = window.innerHeight * 0.12;
    revealItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight - margin && rect.bottom > -margin) {
        item.classList.add("is-visible");
      }
    });
  }

  if (revealItems.length > 0) {
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
            }
          });
        },
        { threshold: 0.16 }
      );

      revealItems.forEach((item) => observer.observe(item));
    }

    window.addEventListener("load", revealVisibleItems, { once: true });
    window.addEventListener("hashchange", revealVisibleItems);
    window.setTimeout(revealVisibleItems, 0);
    window.setTimeout(revealVisibleItems, 250);
  }

  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    return;
  }

  // A cinematic accretion-disk vortex: motes ride logarithmic spiral arms and
  // wind inward toward a bright event-horizon ring, echoing an Interstellar-style
  // black hole. SPIRAL_WIND sets how tightly the arms coil; SQUASH tilts the disk.
  const SPIRAL_WIND = 3.05;
  const SQUASH = 0.8;
  const ROT_SPEED = 0.00055;

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    centerX: 0,
    centerY: 0,
    coreRadius: 110,
    maxRadius: 800,
    time: 0,
    particles: [],
    crystals: [],
    frame: 0,
    running: true,
  };

  const particleCount = reduceMotion ? 360 : 1320;
  const crystalCount = reduceMotion ? 12 : 24;

  function resetParticle(particle, fromEdge = false) {
    const min = state.coreRadius * 1.04;
    particle.radius = fromEdge
      ? state.maxRadius * (0.82 + Math.random() * 0.18)
      : min + Math.random() * (state.maxRadius - min);
    particle.phase = Math.random() * Math.PI * 2;
    particle.inflow = 0.0014 + Math.random() * 0.0019;
    particle.size = 0.35 + Math.random() * 1.25;
    particle.alpha = 0.13 + Math.random() * 0.35;
    particle.streak = 0.035 + Math.random() * 0.07;
  }

  function resetCrystal(crystal, fromEdge = false) {
    crystal.radius = fromEdge
      ? state.maxRadius * (0.7 + Math.random() * 0.3)
      : state.coreRadius * 1.8 + Math.random() * (state.maxRadius - state.coreRadius * 1.8);
    crystal.phase = Math.random() * Math.PI * 2;
    crystal.inflow = 0.0008 + Math.random() * 0.001;
    crystal.size = 7 + Math.random() * 18;
    crystal.alpha = 0.1 + Math.random() * 0.17;
    crystal.rotation = Math.random() * Math.PI * 2;
    crystal.spin = (Math.random() - 0.5) * 0.005;
  }

  // Map a mote's polar state onto the tilted spiral plane, writing into a reused
  // scratch point so the hot draw loop allocates nothing per frame.
  const scratchA = { x: 0, y: 0 };
  const scratchB = { x: 0, y: 0 };
  function project(radius, phase, out) {
    const angle = SPIRAL_WIND * Math.log(radius / state.coreRadius) + phase + state.time * ROT_SPEED;
    out.x = state.centerX + Math.cos(angle) * radius;
    out.y = state.centerY + Math.sin(angle) * radius * SQUASH;
    return out;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(1, Math.floor(rect.width));
    state.height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    state.centerX = state.width * 0.5;
    state.centerY = state.height * 0.42;
    state.coreRadius = Math.max(74, Math.min(128, Math.min(state.width, state.height) * 0.13));
    state.maxRadius = Math.hypot(state.width, state.height) * 0.62;
    // Seed once; on later resizes we keep the existing field so it doesn't visibly
    // reshuffle (e.g. when the mobile URL bar collapses and fires a resize).
    if (state.particles.length === 0) {
      state.particles = Array.from({ length: particleCount }, () => {
        const particle = {};
        resetParticle(particle, false);
        return particle;
      });
      state.crystals = Array.from({ length: crystalCount }, () => {
        const crystal = {};
        resetCrystal(crystal, false);
        return crystal;
      });
    }
    draw();
  }

  function drawCore() {
    const { centerX: cx, centerY: cy, coreRadius: r } = state;
    // Particles/crystals leave globalAlpha at an arbitrary value; reset so the
    // core renders at full, consistent opacity every frame (no flicker, solid horizon).
    context.globalAlpha = 1;

    // Soft outer bloom around the accretion ring.
    const bloom = context.createRadialGradient(cx, cy, r * 0.75, cx, cy, r * 3);
    bloom.addColorStop(0, "rgba(168, 116, 255, 0.3)");
    bloom.addColorStop(0.4, "rgba(132, 78, 236, 0.14)");
    bloom.addColorStop(1, "rgba(110, 64, 200, 0)");
    context.globalCompositeOperation = "lighter";
    context.fillStyle = bloom;
    context.beginPath();
    context.arc(cx, cy, r * 3, 0, Math.PI * 2);
    context.fill();
    context.globalCompositeOperation = "source-over";

    // Bright, slightly tilted accretion ring around a dark event horizon.
    context.save();
    context.translate(cx, cy);
    context.scale(1, 0.9);
    const ring = context.createRadialGradient(0, 0, r * 0.58, 0, 0, r * 1.42);
    ring.addColorStop(0, "rgba(2, 0, 6, 1)");
    ring.addColorStop(0.52, "rgba(2, 0, 6, 1)");
    ring.addColorStop(0.63, "rgba(232, 210, 255, 0.98)");
    ring.addColorStop(0.71, "rgba(182, 124, 255, 0.9)");
    ring.addColorStop(0.88, "rgba(118, 62, 214, 0.3)");
    ring.addColorStop(1, "rgba(100, 62, 182, 0)");
    context.fillStyle = ring;
    context.beginPath();
    context.arc(0, 0, r * 1.45, 0, Math.PI * 2);
    context.fill();

    // Event horizon.
    context.fillStyle = "#020007";
    context.beginPath();
    context.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawParticle(particle) {
    const { radius } = particle;
    const now = project(radius, particle.phase, scratchA);
    const past = project(radius * (1 + particle.streak), particle.phase, scratchB);
    const t = Math.min(1, Math.max(0, (radius - state.coreRadius) / (state.maxRadius - state.coreRadius)));
    const glow = Math.pow(1 - t, 1.5);

    context.globalAlpha = particle.alpha * (0.32 + glow * 0.95);
    context.strokeStyle = glow > 0.5 ? "#efe1ff" : "#9257ff";
    context.lineWidth = Math.max(0.32, particle.size * (0.42 + glow));
    context.beginPath();
    context.moveTo(past.x, past.y);
    context.lineTo(now.x, now.y);
    context.stroke();

    context.globalAlpha = particle.alpha * (0.4 + glow * 0.85);
    context.fillStyle = glow > 0.5 ? "#f5ecff" : "#a86dff";
    context.beginPath();
    context.arc(now.x, now.y, particle.size * (0.5 + glow * 1.7), 0, Math.PI * 2);
    context.fill();
  }

  // Wireframe octahedron drifting in the outer field.
  function drawCrystal(crystal) {
    const p = project(crystal.radius, crystal.phase, scratchA);
    const s = crystal.size;
    context.save();
    context.translate(p.x, p.y);
    context.rotate(crystal.rotation);
    context.globalAlpha = crystal.alpha;
    context.strokeStyle = "rgba(206, 170, 255, 0.9)";
    context.fillStyle = "rgba(138, 82, 226, 0.14)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, -s);
    context.lineTo(s * 0.62, 0);
    context.lineTo(0, s);
    context.lineTo(-s * 0.62, 0);
    context.closePath();
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(-s * 0.62, 0);
    context.lineTo(s * 0.62, 0);
    context.stroke();
    context.restore();
  }

  // dt is a frame-rate-independent multiplier (1 == a nominal 60fps frame), so
  // the vortex drifts at the same calm speed on 60Hz and 120Hz displays alike.
  function updateParticles(dt) {
    state.time += dt;
    state.particles.forEach((particle) => {
      particle.radius -= (particle.radius * particle.inflow + 0.08) * dt;
      if (particle.radius < state.coreRadius * 1.02) {
        resetParticle(particle, true);
      }
    });
    state.crystals.forEach((crystal) => {
      crystal.radius -= (crystal.radius * crystal.inflow + 0.04) * dt;
      crystal.rotation += crystal.spin * dt;
      if (crystal.radius < state.coreRadius * 1.5) {
        resetCrystal(crystal, true);
      }
    });
  }

  function draw() {
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    context.fillStyle = "#050409";
    context.fillRect(0, 0, state.width, state.height);

    const halo = context.createRadialGradient(
      state.centerX,
      state.centerY,
      0,
      state.centerX,
      state.centerY,
      state.maxRadius
    );
    halo.addColorStop(0, "rgba(104, 58, 198, 0.2)");
    halo.addColorStop(0.32, "rgba(84, 40, 176, 0.11)");
    halo.addColorStop(0.66, "rgba(60, 28, 134, 0.05)");
    halo.addColorStop(1, "rgba(5, 4, 8, 0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, state.width, state.height);

    context.globalCompositeOperation = "lighter";
    state.particles.forEach(drawParticle);
    state.crystals.forEach(drawCrystal);
    context.globalCompositeOperation = "source-over";
    drawCore();
    context.globalAlpha = 1;
  }

  let lastTime = 0;
  function tick(now) {
    if (!state.running) {
      return;
    }
    // Normalize motion to a 60fps baseline; clamp so a long pause (e.g. an
    // inactive tab) can't produce one giant jump on resume.
    const dt = lastTime && now ? Math.min((now - lastTime) / 16.667, 3) : 1;
    lastTime = now || 0;
    if (!reduceMotion) {
      updateParticles(dt);
    }
    draw();
    state.frame = window.requestAnimationFrame(tick);
  }

  // Animate only when it is actually worth it: motion is allowed, the tab is
  // visible, and the hero (the only place the canvas shows) is on screen.
  let heroInView = true;
  function updateRunning() {
    const shouldRun =
      !reduceMotion && document.visibilityState === "visible" && heroInView;
    if (shouldRun && !state.running) {
      state.running = true;
      lastTime = 0;
      state.frame = window.requestAnimationFrame(tick);
    } else if (!shouldRun && state.running) {
      state.running = false;
      window.cancelAnimationFrame(state.frame);
    }
  }

  document.addEventListener("visibilitychange", updateRunning);

  const heroSection = document.querySelector(".hero");
  if (heroSection && "IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        heroInView = entries[entries.length - 1].isIntersecting;
        updateRunning();
      },
      { threshold: 0 }
    ).observe(heroSection);
  }

  // Coalesce resize bursts (window drag, mobile URL-bar) into one update/frame.
  let resizePending = false;
  window.addEventListener(
    "resize",
    () => {
      if (resizePending) return;
      resizePending = true;
      window.requestAnimationFrame(() => {
        resizePending = false;
        resize();
      });
    },
    { passive: true }
  );

  state.running = false;
  resize(); // paints one static frame immediately
  updateRunning(); // starts the loop only if it should run
})();
