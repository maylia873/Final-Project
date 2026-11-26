/* =========================================================
   INTRO SCREEN
   "Set sail": the ship sails off to the right, the intro fades,
   and a small ship sails down the Strait of Melaka on the map
   (startVoyage() lives in script.js).
   ========================================================= */

(function () {
  const intro = document.getElementById('intro');
  const sailBtn = document.getElementById('set-sail');
  const skipBtn = document.getElementById('skip-intro');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;

  // Sound: browsers block autoplay with sound, so it starts off and the
  // visitor turns it on. Waves are the ambience, the flute plays softly on top.
  const soundBtn = document.getElementById('sound-toggle');
  const waves = document.getElementById('sfx-waves');
  const flute = document.getElementById('sfx-flute');
  waves.volume = 0.6;
  flute.volume = 0.35;
  let soundOn = false;

  function setSound(on) {
    soundOn = on;
    soundBtn.textContent = on ? 'Sound on' : 'Sound off';
    soundBtn.setAttribute('aria-pressed', String(on));
    [waves, flute].forEach(a => on ? a.play().catch(() => {}) : a.pause());
  }

  function fadeOutSound(ms) {
    if (!soundOn) return;
    const start = performance.now();
    const from = [waves.volume, flute.volume];
    (function step(now) {
      const t = Math.min((now - start) / ms, 1);
      waves.volume = from[0] * (1 - t);
      flute.volume = from[1] * (1 - t);
      if (t < 1) requestAnimationFrame(step);
      else { waves.pause(); flute.pause(); }
    })(start);
  }

  soundBtn.addEventListener('click', () => setSound(!soundOn));

  document.body.classList.add('intro-open');
  sailBtn.focus();

  // Scroll so the map card sits at the top of the screen
  function scrollToMap() {
    const card = document.querySelector('.map-card');
    window.scrollTo(0, card.getBoundingClientRect().top + window.scrollY - 16);
  }

  function closeIntro() {
    intro.hidden = true;
    intro.querySelector('.intro-bg').pause();
    if (soundOn) { waves.pause(); flute.pause(); }
    document.body.classList.remove('intro-open');
    slider.focus({ preventScroll: true });
  }

  function setSail() {
    if (started) return;
    started = true;

    if (reduceMotion) { skip(); return; }

    intro.classList.add('sailing');          // 1. ship sails away (CSS transition)

    setTimeout(() => {                       // 2. fade the intro, show the map
      document.body.classList.remove('intro-open');
      scrollToMap();
      intro.classList.add('leaving');
      fadeOutSound(800);
      startVoyage();                         // 3. the ship sails into Melaka on the map
    }, 1800);

    setTimeout(closeIntro, 2600);
  }

  function skip() {
    started = true;
    closeIntro();
    setYear(1511);
  }

  sailBtn.addEventListener('click', setSail);
  skipBtn.addEventListener('click', skip);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !intro.hidden && !intro.classList.contains('sailing')) skip();
  });
})();
