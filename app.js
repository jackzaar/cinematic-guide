/* ============================================
   iPhone 17 Pro — Cinematic Video Guide
   Horizontal Chapter Navigation + Animations
   ============================================ */

(() => {
  const wrapper = document.getElementById('chaptersWrapper');
  const panels = document.querySelectorAll('.chapter-panel');
  const dots = document.querySelectorAll('.chapter-dot');
  const navProgress = document.getElementById('navProgress');
  const counterCurrent = document.querySelector('.cc-current');
  const preloader = document.getElementById('preloader');
  const preloaderCounter = document.getElementById('preloaderCounter');
  const preloaderFill = document.getElementById('preloaderFill');

  const TOTAL = panels.length;
  let current = 0;
  let isTransitioning = false;
  let lastTransitionTime = 0;
  const COOLDOWN = 1000;

  // ─── Preloader ───
  let loadProgress = 0;
  const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 15 + 5;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(loadInterval);
      setTimeout(openPreloader, 300);
    }
    preloaderCounter.textContent = Math.floor(loadProgress);
    preloaderFill.style.width = loadProgress + '%';
  }, 80);

  function openPreloader() {
    gsap.to(preloader, {
      clipPath: 'inset(50% 0)',
      duration: 0.8,
      ease: 'power4.inOut',
      onComplete: () => {
        preloader.classList.add('done');
        preloader.style.display = 'none';
        animateHero();
      }
    });
  }

  // ─── Text Splitting ───
  document.querySelectorAll('[data-split]').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    [...text].forEach(char => {
      if (char === ' ') {
        const s = document.createElement('span');
        s.className = 'char-space';
        el.appendChild(s);
      } else {
        const s = document.createElement('span');
        s.className = 'char';
        s.textContent = char;
        s.setAttribute('aria-hidden', 'true');
        el.appendChild(s);
      }
    });
  });

  // ─── Hero Animation ───
  function animateHero() {
    const tl = gsap.timeline();

    tl.to('.hero-eyebrow', { opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.1);

    tl.to('.char', {
      opacity: 1,
      y: '0%',
      rotateX: 0,
      duration: 0.9,
      ease: 'elastic.out(1, 0.6)',
      stagger: 0.03,
    }, 0.3);

    tl.to('.hero-sub', { opacity: 1, duration: 0.7, ease: 'power3.out' }, 1.0);
    tl.to('.hero-workflow', { opacity: 1, duration: 0.7, ease: 'power3.out' }, 1.2);
    tl.to('.scroll-hint', { opacity: 1, duration: 0.8, ease: 'power3.out' }, 1.5);
  }

  // ─── Chapter Navigation ───
  function goToChapter(index) {
    if (index < 0 || index >= TOTAL || index === current || isTransitioning) return;
    if (Date.now() - lastTransitionTime < COOLDOWN) return;

    isTransitioning = true;
    lastTransitionTime = Date.now();

    const oldPanel = panels[current];
    const newPanel = panels[index];
    const direction = index > current ? 1 : -1;

    // Reset new panel scroll to top
    const newScroll = newPanel.querySelector('.chapter-scroll');
    if (newScroll) newScroll.scrollTop = 0;

    const tl = gsap.timeline({
      onComplete: () => {
        current = index;
        isTransitioning = false;
        // Reset old panel transforms
        gsap.set(oldPanel, { scale: 1, opacity: 1, filter: 'none' });
        animateChapterIn(index);
      }
    });

    // Old panel exits
    tl.to(oldPanel, {
      scale: 0.88,
      opacity: 0.3,
      filter: 'blur(6px)',
      duration: 0.6,
      ease: 'power3.inOut',
    }, 0);

    // Move wrapper
    tl.to(wrapper, {
      x: -index * window.innerWidth,
      duration: 0.9,
      ease: 'power3.inOut',
    }, 0.05);

    // New panel enters
    gsap.set(newPanel, { scale: 1.06, opacity: 0.6 });
    tl.to(newPanel, {
      scale: 1,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
    }, 0.35);

    updateNav(index);
  }

  function updateNav(index) {
    dots.forEach((dot, i) => {
      dot.classList.remove('active', 'passed');
      if (i === index) dot.classList.add('active');
      else if (i < index) dot.classList.add('passed');
    });
    const progress = (index / (TOTAL - 1)) * 100;
    navProgress.style.height = progress + '%';
    counterCurrent.textContent = String(index + 1).padStart(2, '0');
  }

  // ─── Content Animations on Chapter Enter ───
  function animateChapterIn(index) {
    const panel = panels[index];
    const cards = panel.querySelectorAll('.anim-card');

    if (cards.length === 0) return;

    gsap.fromTo(cards, {
      opacity: 0,
      y: 50,
      rotateX: -10,
      scale: 0.95,
    }, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.7,
      stagger: 0.06,
      ease: 'power3.out',
      overwrite: 'auto',
    });

    // Animate chapter index counter
    const chIndex = panel.querySelector('.ch-index');
    if (chIndex) {
      const target = parseInt(chIndex.textContent);
      if (!isNaN(target)) {
        gsap.fromTo(chIndex, {
          opacity: 0,
          scale: 0.7,
          y: 30,
        }, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
        });
      }
    }
  }

  // ─── Wheel / Scroll Detection ───
  function handleWheel(e) {
    if (isTransitioning) {
      e.preventDefault();
      return;
    }
    if (Date.now() - lastTransitionTime < COOLDOWN) {
      e.preventDefault();
      return;
    }

    const panel = panels[current];
    const scroll = panel.querySelector('.chapter-scroll');

    // Hero panel has no scroll area
    if (!scroll) {
      e.preventDefault();
      if (e.deltaY > 0) goToChapter(current + 1);
      else if (e.deltaY < 0) goToChapter(current - 1);
      return;
    }

    const atBottom = scroll.scrollHeight <= scroll.clientHeight + 5 ||
                     scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 8;
    const atTop = scroll.scrollTop <= 8;

    if (e.deltaY > 0 && atBottom && current < TOTAL - 1) {
      e.preventDefault();
      goToChapter(current + 1);
    } else if (e.deltaY < 0 && atTop && current > 0) {
      e.preventDefault();
      goToChapter(current - 1);
    }
    // else: let it scroll naturally within the chapter
  }

  document.addEventListener('wheel', handleWheel, { passive: false });

  // ─── Keyboard Navigation ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goToChapter(current + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToChapter(current - 1);
    }
  });

  // ─── Touch / Swipe Support ───
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;

    // Horizontal swipe detection
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60 && dt < 500) {
      if (dx < 0) goToChapter(current + 1);
      else goToChapter(current - 1);
    }

    // Vertical swipe at boundaries
    const scroll = panels[current].querySelector('.chapter-scroll');
    if (scroll && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 80 && dt < 500) {
      const atBottom = scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 8;
      const atTop = scroll.scrollTop <= 8;
      if (dy < 0 && atBottom) goToChapter(current + 1);
      else if (dy > 0 && atTop) goToChapter(current - 1);
    }
  }, { passive: true });

  // ─── Dot Click Navigation ───
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      goToChapter(index);
    });
  });

  // ─── Resize Handler ───
  window.addEventListener('resize', () => {
    gsap.set(wrapper, { x: -current * window.innerWidth });
  });

  // ─── Initial State ───
  gsap.set(wrapper, { x: 0 });
  updateNav(0);

  // Animate first chapter content (non-hero) cards are hidden by default
  // Hero is animated by animateHero(), other chapters wait for navigation

})();