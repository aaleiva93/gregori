(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var header = document.getElementById("header");
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  var hamburger = document.getElementById("hamburger");
  var nav = document.getElementById("nav");

  function closeMenu() {
    if (nav) nav.classList.remove("open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "false");
  }

  if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".nav a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  if (header) {
    header.addEventListener("click", function (e) {
      if (e.target.closest(".brand")) closeMenu();
    });
  }

  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var summary = item.querySelector("summary");
    if (!summary) return;
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = item.hasAttribute("open");
      faqItems.forEach(function (other) {
        other.removeAttribute("open");
      });
      if (!isOpen) item.setAttribute("open", "open");
    });
  });

  function animateCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1300;
    var start = null;
    function format(v) {
      var n = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("es-ES");
      return n + suffix;
    }
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animatePhoneBars() {
    var el = document.querySelector(".phone-screen");
    if (!el) return;
    var bars = el.querySelectorAll(".mini-bar span, .bars span");
    bars.forEach(function (b, i) {
      var w = b.getAttribute("data-w");
      var h = b.getAttribute("data-h");
      setTimeout(function () {
        if (w) b.style.width = w;
        if (h) b.style.height = h;
      }, 500 + i * 80);
    });
  }

  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.classList.add("visible");
            observer.unobserve(el);
            el.querySelectorAll("[data-count]").forEach(animateCount);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  document.querySelectorAll(".scoreboard [data-count]").forEach(animateCount);
  setTimeout(animatePhoneBars, 200);
})();

/* Big padel ball crossing the viewport once on load */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var el = document.createElement("div");
  el.className = "big-ball";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    "<defs><radialGradient id=\"bbg\" cx=\"35%\" cy=\"30%\" r=\"80%\">" +
    '<stop offset="0%" stop-color="#7df2be"/>' +
    '<stop offset="55%" stop-color="#2ee6a0"/>' +
    '<stop offset="100%" stop-color="#14b576"/>' +
    "</radialGradient></defs>" +
    '<circle cx="12" cy="12" r="10.5" fill="url(#bbg)"/>' +
    '<g fill="none" stroke="rgba(11,17,23,0.32)" stroke-width="1" stroke-linecap="round">' +
    '<path d="M2.2 9h19.6M2.2 15h19.6"/>' +
    '<path d="M12 2.2a10 10 0 0 1 0 19.6M12 2.2a10 10 0 0 0 0 19.6" stroke-dasharray="2.6 3.8"/>' +
    "</g></svg>";
  document.body.appendChild(el);

  function removeIt() {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }
  el.addEventListener("animationend", removeIt);
  window.setTimeout(removeIt, 9000);

  function shake() {
    document.body.classList.add("is-shaking");
    window.setTimeout(function () {
      document.body.classList.remove("is-shaking");
    }, 440);
  }
  window.setTimeout(shake, 2450);
  window.setTimeout(shake, 3750);
})();

/* Peloteo: minipadel game inside the hero phone */
(function () {
  "use strict";

  var canvas = document.getElementById("mini-game");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var W = canvas.width;
  var H = canvas.height;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var speedMul = reduced ? 0.55 : 1;

  var PAD = 7;
  var WALL_T = 12;
  var NET_Y = Math.round(H * 0.44);

  var rW = 16;
  var rH = 28;
  var racketY = H - 36;

  var ball = { x: W / 2, y: 0, vx: 0, vy: 0, r: 6, speed: 165 };
  var racketX = W / 2;
  var targetX = W / 2;
  var racketVX = 0;

  var rally = 0;
  var best = 0;
  var isRecord = false;
  try {
    best = parseInt(window.localStorage.getItem("padelpro-best") || "0", 10) || 0;
  } catch (e) {}

  var state = "idle";
  var running = false;
  var rafId = 0;
  var lastTs = 0;
  var keys = { left: false, right: false };
  var isVisible = true;

  var court = document.querySelector(".mini-game-court");
  var scoreEl = document.querySelector(".mini-game-score");
  var veil = document.querySelector(".mini-game-veil");
  var veilTitle = veil ? veil.querySelector("strong") : null;
  var veilNote = veil ? veil.querySelector("small") : null;

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function setVeil(title, note) {
    if (!veil) return;
    if (title === "") {
      veil.classList.add("hidden");
      return;
    }
    if (veilTitle) veilTitle.textContent = title;
    if (veilNote) veilNote.textContent = note;
    veil.classList.remove("hidden");
  }

  function resetBall() {
    ball.x = racketX;
    ball.y = racketY - rH / 2 - ball.r - 1;
    ball.vx = 0;
    ball.vy = 0;
  }

  function serve() {
    var dir = Math.random() < 0.5 ? -1 : 1;
    ball.x = racketX;
    ball.y = racketY - rH / 2 - ball.r - 1;
    ball.vx = dir * ball.speed * 0.35;
    ball.vy = -ball.speed;
    rally = 0;
    if (scoreEl) scoreEl.textContent = "0";
    setVeil("", "");
    state = "play";
  }

  function endRally() {
    state = "over";
    isRecord = rally > best;
    if (isRecord) {
      best = rally;
      try {
        window.localStorage.setItem("padelpro-best", String(best));
      } catch (e) {}
    }
    setVeil(
      isRecord ? "¡Nuevo récord: " + best + "!" : "¡Peloteo: " + rally + "!",
      isRecord ? "Récord en tu navegador" : "Toca para reintentar"
    );
  }

  function draw() {
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0c1a26");
    bg.addColorStop(1, "#16222f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (var x = 0; x <= W; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (var y = 0; y <= H; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(232,238,245,0.12)";
    ctx.fillRect(0, 0, W, WALL_T);

    ctx.strokeStyle = "rgba(38,194,129,0.55)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, NET_Y);
    ctx.lineTo(W, NET_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    var faceTop = racketY - rH / 2;

    ctx.lineWidth = 1.3;
    ctx.fillStyle = "#eef3f8";
    ctx.strokeStyle = "rgba(38,194,129,0.7)";
    roundRect(racketX - rW / 2, faceTop, rW, rH, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(11,17,23,0.33)";
    var holes = [-4.5, 0, 4.5];
    for (var hi = 0; hi < holes.length; hi++) {
      for (var hj = 0; hj < 2; hj++) {
        ctx.beginPath();
        ctx.arc(racketX + holes[hi], faceTop + 8 + hj * 10, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "#2ee6a0";
    ctx.beginPath();
    ctx.arc(racketX, faceTop + 1.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#eef3f8";
    roundRect(racketX - 4, faceTop + rH - 6, 8, 9, 3);
    ctx.fill();

    ctx.fillStyle = "#eef3f8";
    ctx.strokeStyle = "rgba(38,194,129,0.55)";
    ctx.lineWidth = 1.2;
    roundRect(racketX - 3.5, faceTop + rH - 4, 7, H - (faceTop + rH) - 6, 3);
    ctx.fill();
    ctx.stroke();

    var bx = ball.x;
    var by = ball.y;
    var br = ball.r;
    var bgBall = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.3, br * 0.2, bx, by, br * 1.15);
    bgBall.addColorStop(0, "#7df2be");
    bgBall.addColorStop(0.6, "#2ee6a0");
    bgBall.addColorStop(1, "#17a86c");
    ctx.fillStyle = bgBall;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(11,17,23,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bx, by, br - 1, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }

  function update(dt) {
    var s = dt / 1000;

    if (keys.left) racketX -= 300 * speedMul * s;
    if (keys.right) racketX += 300 * speedMul * s;
    var prev = racketX;
    racketX = clamp(racketX + (targetX - racketX) * Math.min(1, 14 * s), PAD + rW / 2, W - PAD - rW / 2);
    racketVX = s > 0 ? (racketX - prev) / s : 0;

    if (state === "idle" || state === "over") {
      resetBall();
      return;
    }

    ball.x += ball.vx * s;
    ball.y += ball.vy * s;

    if (ball.x - ball.r < PAD) {
      ball.x = PAD + ball.r;
      ball.vx = Math.abs(ball.vx);
    }
    if (ball.x + ball.r > W - PAD) {
      ball.x = W - PAD - ball.r;
      ball.vx = -Math.abs(ball.vx);
    }
    if (ball.y - ball.r < WALL_T) {
      ball.y = WALL_T + ball.r;
      ball.vy = Math.abs(ball.vy);
    }

    if (
      ball.vy > 0 &&
      ball.y + ball.r >= racketY - rH / 2 &&
      ball.y + ball.r <= racketY + rH / 2
    ) {
      if (Math.abs(ball.x - racketX) <= rW / 2 + ball.r) {
        var off = clamp((ball.x - racketX) / (rW / 2 + ball.r), -1, 1);
        var inc = ball.speed * (1 + Math.abs(off) * 0.45);
        var vy = Math.sqrt(Math.max(inc * inc - (off * inc) * (off * inc), inc * inc * 0.45));
        ball.vx = off * inc + racketVX * 0.18;
        ball.vy = -vy;
        ball.speed = Math.min(ball.speed * 1.035 + 2, reduced ? 220 : 390);
        rally++;
        if (scoreEl) scoreEl.textContent = String(rally);
        ball.y = racketY - rH / 2 - ball.r - 0.5;
      }
    }

    if (ball.y - ball.r > H) {
      endRally();
    }
  }

  function frame(ts) {
    if (!running) return;
    var dt = Math.min(ts - lastTs, 40);
    lastTs = ts;
    update(dt);
    draw();
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    lastTs = performance.now();
    rafId = requestAnimationFrame(frame);
    draw();
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  function pointerX(e) {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width) return W / 2;
    return ((e.clientX - rect.left) / rect.width) * W;
  }

  if (court) {
    court.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      targetX = clamp(pointerX(e), PAD + rW / 2, W - PAD - rW / 2);
      if (state === "idle" || state === "over") {
        if (e.pointerType === "mouse") canvas.focus();
        serve();
      }
    });

    court.addEventListener("pointermove", function (e) {
      targetX = clamp(pointerX(e), PAD + rW / 2, W - PAD - rW / 2);
    });
  }

  canvas.addEventListener("keydown", function (e) {
    if (!isVisible) return;
    var k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") {
      keys.left = true;
      e.preventDefault();
    } else if (k === "ArrowRight" || k === "d" || k === "D") {
      keys.right = true;
      e.preventDefault();
    } else if (k === " " || k === "Enter") {
      e.preventDefault();
      if (state === "idle" || state === "over") serve();
    }
  });

  canvas.addEventListener("keyup", function (e) {
    var k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = false;
    if (k === "ArrowRight" || k === "d" || k === "D") keys.right = false;
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (isVisible) start();
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        isVisible = entries[0].isIntersecting;
        if (isVisible) start();
        else stop();
      },
      { threshold: 0.4 }
    );
    io.observe(court || canvas);
  } else {
    start();
  }

  resetBall();
  draw();
})();