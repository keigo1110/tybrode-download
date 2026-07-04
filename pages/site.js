(() => {
  document.documentElement.classList.add("reveal-ready");

  const translations = {
    ja: {
      headerDownload: "ダウンロード",
      heroCopy: "知識を静かに集め、あなたの思考を深めるローカルAIノート。",
      heroDownload: "Tybrode.dmg をダウンロード",
      heroNote: "macOS 14+ / Apple Silicon & Intel",
      introKicker: "Quiet capture, clear recall",
      introTitle: "入力の断片を、プロダクトの記憶として整える。",
      introBody:
        "Tybrode は許可したアプリだけを対象に、Accessibility のテキスト差分から一日の活動をまとめます。クラウドに送らず、ローカルのデータベースと Ollama で完結します。",
      featureOneTitle: "すべてローカルでキャプチャ",
      featureOneBody:
        "Web、メモ、コード、ドキュメントなど、あらゆる情報をあなたのMac上に安全に保存。クラウドに送信されることは一切ありません。",
      featureTwoTitle: "許可したアプリだけを記録",
      featureTwoBody:
        "Allowlistに登録したアプリだけを対象にキャプチャ。プライベートな情報や不要なノイズを取り込みません。",
      featureThreeTitle: "ローカルで日次サマリーを生成",
      featureThreeBody:
        "その日に集めた情報をローカルのAIが要約。思考のつながりを見つけ、学びを定着させます。",
      featureFourTitle: "メニューバーから、すぐに記録",
      featureFourBody:
        "メニューバーからワンクリックでキャプチャ。思考を止めずに、自然に情報を積み重ねられます。",
      downloadKicker: "Latest DMG",
      downloadTitle: "Tybrode をMacで試す",
      downloadBody:
        "公開リリースは Tybrode-download から配布されます。インストール後、macOSの権限を許可してから allowlist と Capture を設定してください。",
      downloadButton: "Download Latest DMG",
      footer: "Tybrode is a local-only macOS prototype. Source development remains private.",
    },
    en: {
      headerDownload: "Download",
      heroCopy: "Gather knowledge quietly and deepen your thinking with a local AI notebook.",
      heroDownload: "Download Tybrode.dmg",
      heroNote: "macOS 14+ / Apple Silicon & Intel",
      introKicker: "Quiet capture, clear recall",
      introTitle: "Turn scattered input into a product memory.",
      introBody:
        "Tybrode summarizes your day from Accessibility-backed text diffs in allowlisted apps only. Nothing is sent to the cloud; the database and Ollama summaries stay on your Mac.",
      featureOneTitle: "Capture everything locally",
      featureOneBody:
        "Save useful context from writing, notes, code, and documents on your Mac. Captured content is never uploaded to a cloud service.",
      featureTwoTitle: "Record allowlisted apps only",
      featureTwoBody:
        "Capture runs only for apps you explicitly approve. Private surfaces and irrelevant noise stay outside the record.",
      featureThreeTitle: "Generate daily local summaries",
      featureThreeBody:
        "A local model summarizes the day, finds connections across your work, and leaves readable JSON and Markdown reports.",
      featureFourTitle: "Start from the menu bar",
      featureFourBody:
        "Capture begins from a quiet menu bar control, so you can keep thinking while Tybrode gathers context in the background.",
      downloadKicker: "Latest DMG",
      downloadTitle: "Try Tybrode on your Mac",
      downloadBody:
        "Public releases are distributed through Tybrode-download. After installing, grant macOS permissions, choose your allowlist, and start capture.",
      downloadButton: "Download Latest DMG",
      footer: "Tybrode is a local-only macOS prototype. Source development remains private.",
    },
  };

  const languageToggle = document.querySelector("[data-language-toggle]");
  const languageLabel = document.querySelector("[data-language-label]");

  function applyLanguage(language) {
    const nextLanguage = translations[language] ? language : "ja";
    document.documentElement.lang = nextLanguage;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (key && translations[nextLanguage][key]) {
        element.textContent = translations[nextLanguage][key];
      }
    });
    if (languageLabel) {
      languageLabel.textContent = nextLanguage === "ja" ? "日本語" : "English";
    }
    if (languageToggle) {
      languageToggle.setAttribute("aria-pressed", String(nextLanguage === "en"));
    }
    try {
      window.localStorage.setItem("tybrode-language", nextLanguage);
    } catch {
      // Ignore storage failures; the toggle still works for the current page.
    }
  }

  if (languageToggle) {
    let storedLanguage = "ja";
    try {
      storedLanguage = window.localStorage.getItem("tybrode-language") || "ja";
    } catch {
      storedLanguage = "ja";
    }
    applyLanguage(storedLanguage);
    languageToggle.addEventListener("click", () => {
      applyLanguage(document.documentElement.lang === "ja" ? "en" : "ja");
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

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    centerX: 0,
    centerY: 0,
    coreRadius: 110,
    particles: [],
    crystals: [],
    frame: 0,
    running: true,
  };

  const particleCount = reduceMotion ? 180 : 520;
  const crystalCount = reduceMotion ? 18 : 34;

  function resetParticle(particle, randomizeRadius = true) {
    const maxRadius = Math.max(state.width, state.height) * 0.86;
    const minRadius = Math.max(state.coreRadius * 1.18, 90);
    particle.radius = randomizeRadius
      ? minRadius + Math.random() * (maxRadius - minRadius)
      : maxRadius;
    particle.angle = Math.random() * Math.PI * 2;
    particle.speed = (0.65 + Math.random() * 1.45) * (Math.random() > 0.5 ? 1 : -1);
    particle.pull = 0.52 + Math.random() * 1.25;
    particle.size = 0.45 + Math.random() * 1.65;
    particle.alpha = 0.2 + Math.random() * 0.58;
    particle.tilt = Math.random() * 0.22 - 0.11;
    particle.length = 22 + Math.random() * 86;
  }

  function resetCrystal(crystal) {
    const maxRadius = Math.max(state.width, state.height) * 0.7;
    crystal.radius = state.coreRadius * 2.15 + Math.random() * maxRadius;
    crystal.angle = Math.random() * Math.PI * 2;
    crystal.speed = (0.08 + Math.random() * 0.18) * (Math.random() > 0.5 ? 1 : -1);
    crystal.pull = 0.05 + Math.random() * 0.1;
    crystal.size = 8 + Math.random() * 21;
    crystal.sides = Math.random() > 0.55 ? 4 : 3;
    crystal.alpha = 0.18 + Math.random() * 0.3;
    crystal.rotation = Math.random() * Math.PI * 2;
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
    state.coreRadius = Math.max(70, Math.min(116, Math.min(state.width, state.height) * 0.12));
    state.particles = Array.from({ length: particleCount }, () => {
      const particle = {};
      resetParticle(particle, true);
      return particle;
    });
    state.crystals = Array.from({ length: crystalCount }, () => {
      const crystal = {};
      resetCrystal(crystal);
      return crystal;
    });
    draw();
  }

  function drawCore() {
    const ring = context.createRadialGradient(
      state.centerX,
      state.centerY,
      state.coreRadius * 0.68,
      state.centerX,
      state.centerY,
      state.coreRadius * 1.65
    );
    ring.addColorStop(0, "rgba(1, 0, 4, 1)");
    ring.addColorStop(0.48, "rgba(1, 0, 4, 1)");
    ring.addColorStop(0.64, "rgba(180, 116, 255, 0.94)");
    ring.addColorStop(0.78, "rgba(114, 58, 210, 0.46)");
    ring.addColorStop(1, "rgba(102, 64, 184, 0)");

    context.fillStyle = ring;
    context.beginPath();
    context.arc(state.centerX, state.centerY, state.coreRadius * 1.7, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#010005";
    context.beginPath();
    context.arc(state.centerX, state.centerY, state.coreRadius * 0.98, 0, Math.PI * 2);
    context.fill();
  }

  function drawParticle(particle) {
    const orbitScale = 0.54 + Math.sin(particle.angle * 1.8) * 0.08 + particle.tilt;
    const x = state.centerX + Math.cos(particle.angle) * particle.radius;
    const y = state.centerY + Math.sin(particle.angle) * particle.radius * orbitScale;
    const previousAngle = particle.angle - particle.speed * 0.02;
    const previousRadius = particle.radius + particle.length;
    const px = state.centerX + Math.cos(previousAngle) * previousRadius;
    const py = state.centerY + Math.sin(previousAngle) * previousRadius * orbitScale;
    const glow = Math.max(0, 1 - particle.radius / (Math.max(state.width, state.height) * 0.82));

    context.globalAlpha = particle.alpha * (0.34 + glow * 0.96);
    context.strokeStyle = glow > 0.58 ? "#e7d7ff" : "#8f5cff";
    context.lineWidth = Math.max(0.35, particle.size * (0.45 + glow));
    context.beginPath();
    context.moveTo(px, py);
    context.lineTo(x, y);
    context.stroke();

    context.globalAlpha = particle.alpha * (0.5 + glow);
    context.fillStyle = glow > 0.58 ? "#f3eaff" : "#9d63ff";
    context.beginPath();
    context.arc(x, y, particle.size * (1 + glow * 2.5), 0, Math.PI * 2);
    context.fill();
  }

  function drawCrystal(crystal) {
    const orbitScale = 0.58 + Math.sin(crystal.angle * 1.4) * 0.09;
    const x = state.centerX + Math.cos(crystal.angle) * crystal.radius;
    const y = state.centerY + Math.sin(crystal.angle) * crystal.radius * orbitScale;
    context.save();
    context.translate(x, y);
    context.rotate(crystal.rotation);
    context.globalAlpha = crystal.alpha;
    context.strokeStyle = "rgba(204, 168, 255, 0.92)";
    context.fillStyle = "rgba(135, 79, 223, 0.16)";
    context.lineWidth = 1;
    context.beginPath();
    for (let index = 0; index < crystal.sides; index += 1) {
      const angle = (Math.PI * 2 * index) / crystal.sides - Math.PI / 2;
      const radius = crystal.size * (index % 2 === 0 ? 1 : 0.72);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (index === 0) {
        context.moveTo(px, py);
      } else {
        context.lineTo(px, py);
      }
    }
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  }

  function updateParticles() {
    state.particles.forEach((particle) => {
      particle.angle += (particle.speed / Math.max(particle.radius, 80)) * 10;
      particle.radius -= particle.pull + Math.max(0, state.coreRadius * 0.008);
      if (particle.radius < state.coreRadius * 1.02) {
        resetParticle(particle, false);
      }
    });
    state.crystals.forEach((crystal) => {
      crystal.angle += crystal.speed / Math.max(crystal.radius, 80);
      crystal.radius -= crystal.pull;
      crystal.rotation += crystal.speed * 0.01;
      if (crystal.radius < state.coreRadius * 1.6) {
        resetCrystal(crystal);
      }
    });
  }

  function draw() {
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    context.fillStyle = "#050407";
    context.fillRect(0, 0, state.width, state.height);

    const halo = context.createRadialGradient(
      state.centerX,
      state.centerY,
      0,
      state.centerX,
      state.centerY,
      Math.max(state.width, state.height) * 0.56
    );
    halo.addColorStop(0, "rgba(100, 55, 190, 0.24)");
    halo.addColorStop(0.32, "rgba(92, 41, 182, 0.18)");
    halo.addColorStop(1, "rgba(5, 4, 7, 0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, state.width, state.height);

    context.globalCompositeOperation = "lighter";
    state.particles.forEach(drawParticle);
    state.crystals.forEach(drawCrystal);
    context.globalCompositeOperation = "source-over";
    drawCore();
    context.globalAlpha = 1;
  }

  function tick() {
    if (!state.running) {
      return;
    }
    if (!reduceMotion) {
      updateParticles();
    }
    draw();
    state.frame = window.requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", () => {
    state.running = document.visibilityState === "visible";
    if (state.running && !reduceMotion) {
      state.frame = window.requestAnimationFrame(tick);
    } else {
      window.cancelAnimationFrame(state.frame);
    }
  });

  window.addEventListener("resize", resize, { passive: true });
  resize();
  tick();
})();
