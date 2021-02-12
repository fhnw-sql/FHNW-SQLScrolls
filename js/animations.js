function delay(durationMs, that) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, that), durationMs);
  });
}

async function hideElement(id) {
  const element = document.getElementById(id);
  if (!element) return console.error(`Element by id ${id} not found`);
  element.classList.add("hidden-fadeout");
  await delay(300);
  element.classList.add("hidden");
  element.classList.remove("hidden-fadeout");
}

async function hideElementImmediately(id) {
  const element = document.getElementById(id);
  if (!element) return console.error(`Element by id ${id} not found`);
  element.classList.add("hidden");
}

async function showElement(id) {
  const element = document.getElementById(id);
  if (!element) return console.error(`Element by id ${id} not found`);
  element.classList.remove("hidden");
  await delay(10);
  element.classList.add("hidden-fadein");
  await delay(300);
  element.classList.remove("hidden-fadein");
}

async function showElementImmediately(id) {
  const element = document.getElementById(id);
  if (!element) return console.error(`Element by id ${id} not found`);
  element.classList.remove("hidden");
}

async function fadeToBlack() {
  const fade = document.getElementById("fade-to-black");
  fade.style.display = "";
  await delay(50);
  fade.style.opacity = "1";
  await delay(400);
}

async function fadeFromBlack() {
  const fade = document.getElementById("fade-to-black");
  fade.style.opacity = "0";
  await delay(400);
  fade.style.display = "none";
}

async function lightningStrike(id) {
  const element = document.getElementById(id);

  async function waitFor(atLeastMs, plusRandomMaxMs) {
    await delay(atLeastMs + Math.random() * plusRandomMaxMs);
  }

  async function strikeFor(atLeastMs, plusRandomMaxMs) {
    element.classList.remove("hidden");
    await waitFor(atLeastMs, plusRandomMaxMs);
    element.classList.add("hidden");
  }

  await strikeFor(25, 50);
  await waitFor(25, 50);
  await strikeFor(25, 50);
  const chanceOfThirdStrike = Math.random();
  if (chanceOfThirdStrike > 0.5) {
    await waitFor(100, 150);
    await strikeFor(50, 100);
  } else if (chanceOfThirdStrike > 0.3) {
    await waitFor(25, 50);
    await strikeFor(25, 50);
  }
}

function showModal(id, changeToViewAfter, trigger) {
  return new Promise((resolve) => {
    $(id)
      .modal()
      .on("hidden.bs.modal", () => {
        $(id).off("hidden.bs.modal");
        resolve();
      });
  })
    .then(() => {
      return changeSecondaryView(changeToViewAfter ? changeToViewAfter : Views.NONE);
    })
    .then(() => {
      if (trigger) {
        trigger.setAttribute("tabindex", "-1");
        trigger.focus();
        trigger.setAttribute("tabindex", "0");
      }
    });
}

async function shakeElement(id) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  async function rotateRight(element) {
    element.style.transform = "rotate(5deg)";
    await delay(100);
  }

  async function rotateLeft(element) {
    element.style.transform = "rotate(-5deg)";
    await delay(100);
  }

  const element = document.getElementById(id);
  await rotateRight(element);
  for (let i = 0; i < 3; i++) {
    await rotateLeft(element);
    await rotateRight(element);
  }
  element.style.transform = "";
}

async function shookElement(id) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  async function moveRight(element) {
    element.style.transform = "translate(7px)";
    await delay(100);
  }

  async function moveLeft(element) {
    element.style.transform = "translate(-7px)";
    await delay(100);
  }

  const element = document.getElementById(id);
  await moveRight(element);
  for (let i = 0; i < 2; i++) {
    await moveLeft(element);
    await moveRight(element);
  }
  element.style.transform = "";
}

function shootConfetti(durationMs, particles) {
  const end = Date.now() + durationMs;
  const disableForReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  (function frame() {
    confetti({
      particleCount: particles ? particles : 5,
      colors: particles === 2 ? ["#21F0F3", "#4AB8FF"] : undefined,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      disableForReducedMotion,
    });
    confetti({
      particleCount: particles ? particles : 5,
      colors: particles === 2 ? ["#21F0F3", "#4AB8FF"] : undefined,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      disableForReducedMotion,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

async function animateFlame() {
  const flameStyle = document.getElementById("task-flame-container").style;
  flameStyle.animation = "explode 1.2s";
  await delay(1200);
  flameStyle.animation = "";
}

function preserveTaskBoxHeight() {
  const container = document.getElementById("tests-container");
  container.style.minHeight = window.getComputedStyle(container).height;
}

function removePreservedTaskBoxHeight() {
  const container = document.getElementById("tests-container");
  container.style.minHeight = "";
}

async function animateQueryResultsClose() {
  preserveTaskBoxHeight();
  const testBlock = document.querySelector(".tests");
  testBlock.classList.add("closing");
  await delay(200);
  testBlock.classList.remove("closing");
  testBlock.classList.add("closed");
}

async function animateQueryResultsOpen(renderedNav, renderedResults) {
  const testBlock = document.querySelector(".tests");
  await awaitUntil(() => testBlock.classList.contains("closed"));
  document.getElementById("query-out-tables-nav").innerHTML = renderedNav;
  document.getElementById("query-out-table").innerHTML = renderedResults;
  testBlock.classList.remove("closed");
  await delay(300);
  removePreservedTaskBoxHeight();
}

async function resetFlameAnimation() {
  const goodFlame = document.getElementById("good-flame");
  const evilFlame = document.getElementById("evil-flame");
  const speech = document.getElementById("task-animation-flame-speech");

  DISPLAY_STATE.endgame = false;
  await StarCounter.update();
  goodFlame.style.opacity = "1";
  evilFlame.style.opacity = "0";
  speech.classList.add("task-description");
  speech.classList.remove("evil-task-description");
  speech.innerHTML = "";
  document.getElementById("evil-flame-exit").innerHTML = i18n.get("skip");
  document.getElementById("evil-flame-animation-explanation").classList.add("hidden");
}

async function evilFlameAnimation() {
  let frameCount = 0;
  const body = document.getElementById("body");
  const goodFlame = document.getElementById("good-flame");
  const evilFlame = document.getElementById("evil-flame");
  const speech = document.getElementById("task-animation-flame-speech");
  const disableForReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let translation = 15;
  let starCount = taskGroups.getCompletedTaskCount();

  let shake = false;
  let starburst = false;
  let stealingStars = false;
  let previous;
  const particles = [];
  await (async function frame(time) {
    if (!previous) previous = time;
    const expected = 16; // Frame rate adjustment, higher speed monitors have smaller than expected elapsed time.
    const elapsed = time - previous;
    if (expected > elapsed) {
      requestAnimationFrame(frame);
      return;
    }
    frameCount++;
    if (frameCount === 1) {
      speech.innerHTML += `<span>${i18n.get("animation-speech-1")}</span>`;
    }

    if (frameCount === 50) {
      lightningStrike("lightning-bolt-left");
    }

    if (frameCount === 270) {
      speech.innerHTML += `<span>${i18n.get("animation-speech-2")}</span>`;
    }
    if (frameCount === 300) {
      stealingStars = true;
      shake = true;
      lightningStrike("lightning-bolt-right");
    }
    if (frameCount === 498) {
      shake = false;
    }

    if (frameCount === 500) {
      speech.innerHTML += `<span>${i18n.get("animation-speech-3")}</span>`;
    }

    if (frameCount % 3 === 0 && shake) {
      translation *= -1;
      body.style.transform = `translate(0, ${translation}px)`;
    } else if (frameCount % 2 === 0 && starburst) {
      async function flyFlame() {
        const flame = document.getElementById("evil-flame-animation-container");
        const position = getElementPosition(flame);
        const particle = flyFlameFromTo(
          "evil-flame-animation",
          { x: position.x + flame.offsetWidth / 1.8, y: position.y + flame.offsetHeight / 2 },
          { x: (0.2 + Math.random() * 0.2) * window.innerWidth, y: -0.2 * window.innerHeight }
        );
        particles.push(particle);
        await awaitUntil(() => !particle.animated);
        particle.element.remove();
      }

      if (!disableForReducedMotion) flyFlame();
    } else {
      body.style.transform = "";
    }

    if (frameCount % 3 === 0 && stealingStars && starCount > 0) {
      starCount--;

      async function flyStar() {
        const flame = document.getElementById("evil-flame-animation-container");
        const position = getElementPosition(flame);
        const particle = flyStarFromTo("evil-flame-animation", StarCounter.getElement(), {
          x: position.x,
          y: position.y + flame.offsetHeight / 2,
        });
        particles.push(particle);
        await awaitUntil(() => !particle.animated);
        particle.element.remove();
      }

      flyStar();
    }

    if (frameCount === 500) {
      lightningStrike("lightning-bolt-right");
    }

    if (frameCount > 500 && frameCount < 512) {
      goodFlame.style.opacity = (parseInt(goodFlame.style.opacity) + 1) % 2;
      evilFlame.style.opacity = (parseInt(evilFlame.style.opacity) + 1) % 2;
      speech.classList.toggle("task-description");
      speech.classList.toggle("evil-task-description");
    }

    if (frameCount === 800) {
      speech.innerHTML += `<span>${i18n.get("animation-speech-4")}</span>`;
      starburst = true;
      StarCounter.hide();
    }
    if (frameCount === 950) {
      speech.innerHTML += `<span>${i18n.get("animation-speech-5")}</span>`;
    }

    if (frameCount === 770) {
      lightningStrike("lightning-bolt-right");
    }
    if (frameCount === 782) {
      lightningStrike("lightning-bolt-left");
    }
    if (frameCount === 820) {
      lightningStrike("lightning-bolt-right");
    }
    if (frameCount === 829) {
      lightningStrike("lightning-bolt-right");
    }
    if (frameCount === 842) {
      lightningStrike("lightning-bolt-right");
    }
    if (frameCount === 869) {
      lightningStrike("lightning-bolt-left");
    }
    if (frameCount === 893) {
      lightningStrike("lightning-bolt-right");
    }
    if (frameCount === 925) {
      lightningStrike("lightning-bolt-right");
    }

    if (frameCount === 1050) {
      document.getElementById("evil-flame-animation-explanation").classList.remove("hidden");
      document.getElementById("evil-flame-exit").innerHTML = i18n.get("to-battle");
    }

    if (frameCount > 1000 && frameCount % 432 === 0) {
      lightningStrike("lightning-bolt-right");
    }
    if (frameCount > 1000 && frameCount % 342 === 0) {
      lightningStrike("lightning-bolt-left");
    }

    particles.forEach((particle) => particle.frame(time));

    if (DISPLAY_STATE.currentView === Views.FLAME_ANIMATION) {
      requestAnimationFrame(frame);
    }
  })();
}

async function resetEndAnimation() {
  document.getElementById("end-flame-speech").innerHTML = "";
  document.getElementById("end-exit").innerHTML = i18n.get("skip");
  const evilFlame = document.getElementById("end-evil-flame");
  evilFlame.style.transform = "scale(2)";
  evilFlame.style.opacity = "";
}

async function endAnimation() {
  let frameCount = 0;
  const evilFlame = document.getElementById("end-evil-flame");
  const speech = document.getElementById("end-flame-speech");
  const exitButton = document.getElementById("end-exit");

  let flameCount = taskGroups["X"].getCompletedTaskCount();
  let previous;
  const particles = [];
  await (async function frame(time) {
    if (!previous) previous = time;
    const expected = 16; // Frame rate adjustment, higher speed monitors have smaller than expected elapsed time.
    const elapsed = time - previous;
    if (expected > elapsed) {
      requestAnimationFrame(frame);
      return;
    }
    frameCount++;
    if (frameCount === 1) {
      speech.innerHTML += `<span>${i18n.get("end-animation-speech-1")}</span>`;
    }

    if (frameCount === 50) {
      lightningStrike("end-lightning-bolt-left");
    }

    if (frameCount === 270) {
      speech.innerHTML += `<span>${i18n.get("end-animation-speech-2")}</span>`;
    }
    if (frameCount === 370) {
      speech.innerHTML += `<span>${i18n.get("end-animation-speech-3")}</span>`;
    }
    if (frameCount > 370 && frameCount % 3 === 0 && flameCount > 0) {
      async function flyAndOrbit() {
        const particle = createFlameParticle("end-animation", StarCounter.getElement());
        const evilFlame = document.getElementById("end-evil-flame-container");
        const pos = getElementPosition(evilFlame);
        pos.x += (evilFlame.offsetWidth - 10) / 2;
        pos.y += 190 / 2;
        particle.flyTo({ x: 0.4 * window.innerWidth, y: 0.1 * window.innerHeight });
        particles.push(particle);
        await awaitUntil(() => !particle.animated);
        particle.orbit(pos);
      }

      flyAndOrbit();
      flameCount -= 1;
    }
    if (frameCount === 430) {
      evilFlame.style.animation = "flamedie2 infinite 0.5s";
    }
    if (frameCount === 450) {
      speech.innerHTML += `<span>${i18n.get("end-animation-speech-4")}</span>`;
    }

    if (frameCount === 700) {
      speech.innerHTML += `<span>${i18n.get("end-animation-speech-5")}</span>`;
    }

    async function flyParticleToFlame(particle) {
      particle.flyTo({ x: 0.3 * window.innerWidth, y: 0.3 * window.innerHeight });
      await awaitUntil(() => !particle.animated);
      particle.element.remove();
    }

    if (frameCount === 875) {
      evilFlame.style.animation = "";
    }

    if (frameCount === 900) {
      particles.forEach(flyParticleToFlame);
      evilFlame.style.transform = "scale(3) translateY(-5%) translateX(-5%)";
      evilFlame.style.opacity = "0";
      speech.innerHTML += `<span>${i18n.get("end-animation-speech-6")}</span>`;
    }

    if (frameCount === 1100) {
      exitButton.innerHTML = i18n.get("continue");
    }

    particles.forEach((particle) => particle.frame(time));

    if (DISPLAY_STATE.currentView === Views.END_ANIMATION) {
      requestAnimationFrame(frame);
    }
  })();
}

function endScreenAnimation() {
  const disableForReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let previous;
  let frameCount = 0;

  function frame(time) {
    if (!previous) previous = time;
    const expected = 16; // Frame rate adjustment, higher speed monitors have smaller than expected elapsed time.
    const elapsed = time - previous;
    if (expected > elapsed) {
      requestAnimationFrame(frame);
      return;
    }
    frameCount++;

    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    if (frameCount % 37 === 0 || frameCount % 57 === 0) {
      const particleCount = Math.floor(Math.random() * 75) + 25;
      // since particles fall down, start a bit higher than random
      const colors = ["#21F0F3", "#4AB8FF", "#1ccb1c", "#FFD700", "#c041ff", "#3f909a"];

      function pickRandomColors() {
        const picked = [];
        for (let i = 0; i < Math.floor(Math.random() * 4) + 1; i++) {
          picked.push(colors[Math.floor(Math.random() * colors.length)]);
        }
        return picked;
      }

      confetti(
        Object.assign({}, defaults, {
          particleCount,
          colors: pickRandomColors(),
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
          disableForReducedMotion,
        })
      );
    }

    if (DISPLAY_STATE.currentView === Views.END_TEXT) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}
