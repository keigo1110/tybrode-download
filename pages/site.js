(() => {
  document.documentElement.classList.add("reveal-ready");

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
    frame: 0,
    running: true,
  };

  const particleCount = reduceMotion ? 120 : 240;

  function resetParticle(particle, randomizeRadius = true) {
    const maxRadius = Math.max(state.width, state.height) * 0.7;
    const minRadius = Math.max(state.coreRadius * 1.35, 120);
    particle.radius = randomizeRadius
      ? minRadius + Math.random() * (maxRadius - minRadius)
      : maxRadius;
    particle.angle = Math.random() * Math.PI * 2;
    particle.speed = 0.18 + Math.random() * 0.42;
    particle.pull = 0.34 + Math.random() * 0.52;
    particle.size = 0.7 + Math.random() * 1.9;
    particle.alpha = 0.35 + Math.random() * 0.65;
    particle.tilt = Math.random() * 0.34 - 0.17;
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
    state.centerY = state.height * 0.46;
    state.coreRadius = Math.max(92, Math.min(state.width, state.height) * 0.17);
    state.particles = Array.from({ length: particleCount }, () => {
      const particle = {};
      resetParticle(particle, true);
      return particle;
    });
    draw();
  }

  function drawCore() {
    const ring = context.createRadialGradient(
      state.centerX,
      state.centerY,
      state.coreRadius * 0.72,
      state.centerX,
      state.centerY,
      state.coreRadius * 1.38
    );
    ring.addColorStop(0, "rgba(1, 0, 4, 1)");
    ring.addColorStop(0.54, "rgba(1, 0, 4, 1)");
    ring.addColorStop(0.72, "rgba(178, 120, 255, 0.96)");
    ring.addColorStop(0.86, "rgba(102, 64, 184, 0.34)");
    ring.addColorStop(1, "rgba(102, 64, 184, 0)");

    context.fillStyle = ring;
    context.beginPath();
    context.arc(state.centerX, state.centerY, state.coreRadius * 1.42, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#010005";
    context.beginPath();
    context.arc(state.centerX, state.centerY, state.coreRadius * 0.98, 0, Math.PI * 2);
    context.fill();
  }

  function drawParticle(particle) {
    const orbitScale = 1 + Math.sin(particle.angle * 1.7) * 0.08 + particle.tilt;
    const x = state.centerX + Math.cos(particle.angle) * particle.radius;
    const y = state.centerY + Math.sin(particle.angle) * particle.radius * orbitScale;
    const glow = Math.max(0, 1 - particle.radius / (Math.max(state.width, state.height) * 0.72));

    context.globalAlpha = particle.alpha * (0.45 + glow * 0.75);
    context.fillStyle = glow > 0.62 ? "#efe5ff" : "#a06cff";
    context.beginPath();
    context.arc(x, y, particle.size * (1 + glow * 1.8), 0, Math.PI * 2);
    context.fill();
  }

  function updateParticles() {
    state.particles.forEach((particle) => {
      particle.angle += (particle.speed / Math.max(particle.radius, 80)) * 8;
      particle.radius -= particle.pull + Math.max(0, state.coreRadius * 0.012);
      if (particle.radius < state.coreRadius * 1.02) {
        resetParticle(particle, false);
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
    halo.addColorStop(0.34, "rgba(64, 33, 124, 0.12)");
    halo.addColorStop(1, "rgba(5, 4, 7, 0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, state.width, state.height);

    context.globalCompositeOperation = "lighter";
    state.particles.forEach(drawParticle);
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
