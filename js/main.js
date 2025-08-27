document.addEventListener('DOMContentLoaded', () => {
  // 1. Smooth page load
  document.body.classList.add('loaded');

  // DOM Elements
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const tabs = document.querySelectorAll('.services-tabs .tab');
  const panels = document.querySelectorAll('.tab-panel');
  const aboutTabs = document.querySelectorAll('.about-tabs .about-tab');
  const aboutPanels = document.querySelectorAll('.about-panel');
  const carouselTrack = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-btn.left');
  const nextBtn = document.querySelector('.carousel-btn.right');
  const contactForm = document.querySelector('.contact-form');
  const thankYouModal = document.getElementById('thank-you-modal');
  const closeModalBtn = document.querySelector('.close-modal');

  // 2. Smooth scroll for anchor nav links

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 3. Analog theme toggle

  const setTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const toggleTheme = () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  toggle?.addEventListener('click', toggleTheme);

  // 4. Initialize saved preference
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);

  // 5. Tab switching in Services section

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Skip if already active
      if (tab.classList.contains('active')) return;

      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Hide all panels and remove active/fade classes
      panels.forEach(panel => {
        panel.classList.remove('active', 'fade-out', 'fade-in');
        panel.style.display = 'none';
      });

      // Show new panel instantly
      const targetId = tab.dataset.tab;
      const newPanel = document.getElementById(targetId);
      if (newPanel) {
        newPanel.style.display = 'flex';
        newPanel.classList.add('active');
      }
    });
  });

  // 5b. Tab switching in About section

  aboutTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = tab.dataset.tab;
      const targetPanel = document.getElementById(targetId);
      if (!targetPanel) return;

      // Deactivate all tabs and panels
      aboutTabs.forEach(t => t.classList.remove('active'));
      aboutPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
      });

      // Activate clicked tab and panel
      tab.classList.add('active');
      targetPanel.classList.add('active');
      targetPanel.style.display = 'flex';
    });
  });

  // On load, hide all but the first active panel
  aboutPanels.forEach((panel, index) => {
    panel.style.display = panel.classList.contains('active') || index === 0 ? 'flex' : 'none';
  });

  // ============================
  // Hero: "Websites for ____." synchronized wheel-like swap
  // ============================
  const rotatingEl = document.getElementById('audience-word');
  const heroSection = document.getElementById('hero');

  // ============================
  // Hero Interactive Background (canvas grid with ripples)
  // ============================
  (function(){
    if (!heroSection) return;

    const ACCENT = '#50b465';
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create canvas and layer it behind hero content
    const canvas = document.createElement('canvas');
    canvas.id = 'hero-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      zIndex: '0',
      display: 'block',
      pointerEvents: 'none'
    });
    // Ensure hero is a stacking context
    const heroComputed = getComputedStyle(heroSection);
    if (heroComputed.position === 'static') {
      heroSection.style.position = 'relative';
    }
    heroSection.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let W = 0, H = 0;

    // Grid config
    let CELL = 56;                    // base cell size (px)
    const RADIUS = 6;                 // tile corner radius
    const BASE_AMP = 8;               // base jump amplitude
    const RIPPLE_SIGMA = 160;         // ripple spread (px)
    const RIPPLE_WAVE_K = 0.06;       // spatial frequency
    const RIPPLE_SPEED = 6;           // wave speed

    // Animation state
    const tiles = [];   // {x,y,phase,speed,amp}
    const ripples = []; // {x,y,t,life}
    let lastT = 0;

    function resize(){
      const rect = heroSection.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      tiles.length = 0;
      const cols = Math.ceil(W / CELL) + 2;
      const rows = Math.ceil(H / CELL) + 2;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          tiles.push({
            x: Math.floor((i - 1) * CELL),
            y: Math.floor((j - 1) * CELL),
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + Math.random() * 0.8,
            amp: BASE_AMP + Math.random() * 10
          });
        }
      }
    }

    function rippleAt(clientX, clientY, life){
      const rect = heroSection.getBoundingClientRect();
      ripples.push({ x: clientX - rect.left, y: clientY - rect.top, t: 0, life });
    }

    // Interactions (attach to hero so links still work)
    heroSection.addEventListener('mousemove', (e)=> rippleAt(e.clientX, e.clientY, 0.6));
    heroSection.addEventListener('click',     (e)=> rippleAt(e.clientX, e.clientY, 1.6));

    function hexToRgba(hex, a){
      const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
      if(!m) return `rgba(0,0,0,${a||1})`;
      const r = parseInt(m[1],16), g = parseInt(m[2],16), b = parseInt(m[3],16);
      return `rgba(${r},${g},${b},${a==null?1:a})`;
    }

    function roundRect(ctx, x, y, w, h, r){
      r = Math.min(r, w*0.5, h*0.5);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y,     x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x,     y + h, r);
      ctx.arcTo(x,     y + h, x,     y,     r);
      ctx.arcTo(x,     y,     x + w, y,     r);
      ctx.closePath();
    }

    function draw(ts){
      const t = ts / 1000;
      if (!lastT) lastT = t;
      const dt = Math.min(0.033, t - lastT);
      lastT = t;

      ctx.clearRect(0,0,W,H);

      // Subtle brand glows
      const g1 = ctx.createRadialGradient(W*0.1,H*0.18,0, W*0.1,H*0.18, Math.max(W,H)*0.8);
      g1.addColorStop(0, hexToRgba(ACCENT, 0.20));
      g1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g1; ctx.fillRect(0,0,W,H);

      const g2 = ctx.createRadialGradient(W*0.9,H*0.22,0, W*0.9,H*0.22, Math.max(W,H)*0.7);
      g2.addColorStop(0, hexToRgba('#24a063', 0.16));
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2; ctx.fillRect(0,0,W,H);

      // Update ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.t += dt;
        if (r.t > r.life) ripples.splice(i, 1);
      }

      // Draw tiles
      for (const tile of tiles) {
        const cx = tile.x + CELL * 0.5;
        const cy = tile.y + CELL * 0.5;

        // base oscillation
        const base = Math.sin(t * tile.speed + tile.phase);

        // ripple influence
        let influence = 0;
        for (const r of ripples) {
          const age = r.t / r.life; // 0..1
          const dx = cx - r.x;
          const dy = cy - r.y;
          const dist = Math.hypot(dx, dy);
          const envelope = Math.exp(-(dist*dist)/(2*RIPPLE_SIGMA*RIPPLE_SIGMA)) * (1 - age);
          const wave = Math.sin(10 + dist * RIPPLE_WAVE_K - t * RIPPLE_SPEED);
          influence += envelope * wave * 1.2;
        }

        const offset = (base + influence) * tile.amp; // vertical jump
        const alpha  = 0.09 + Math.abs(base) * 0.11 + Math.max(0, influence) * 0.10;

        const w = CELL - 2;
        const h = CELL - 2 + offset * 0.15;      // slight height change
        const x = tile.x + 1;
        const y = tile.y + 1 - offset * 0.5;     // jump effect

        // fill
        ctx.fillStyle = hexToRgba(ACCENT, Math.min(0.6, Math.max(0.05, alpha)));
        roundRect(ctx, x, y, w, h, RADIUS);
        ctx.fill();

        // highlight stroke
        ctx.strokeStyle = hexToRgba('#ffffff', Math.min(0.35, alpha*0.35));
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, w, h, RADIUS);
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    }

    function start(){
      resize();
      lastT = 0;
      requestAnimationFrame(draw);
    }

    function setDpr(){
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    }

    // Init
    if (!prefersReducedMotion) start();

    // Events
    window.addEventListener('resize', () => { setDpr(); resize(); });
    window.addEventListener('orientationchange', () => { setDpr(); resize(); });
  })();

  if (rotatingEl) {
    const WORDS = [
      'Founders',
      'Small Businesses',
      'Creatives',
      'Small Teams',
      'Makers',
      'Startups',
      'Entrepreneurs',
      'Freelancers',
      'Clinicians',
      'Coaches',
      'Local Brands',
      'Nonprofits',
      'Creators'
    ];

    let i = 0;
    const INTERVAL_MS = 3000;   // show time per word (longer pause)
    const ANIM_MS = 700;        // duration of the in/out animation
    const prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1) Create a fixed-width wrapper to prevent layout shift
    const wrap = document.createElement('span');
    wrap.className = 'rotating-word-wrap';

    // current and next layers
    const layerCurrent = document.createElement('span');
    layerCurrent.className = 'rotating-layer';
    const layerNext = document.createElement('span');
    layerNext.className = 'rotating-layer';

    // Move existing text into layerCurrent and replace node with wrapper
    layerCurrent.textContent = WORDS[i];
    rotatingEl.replaceWith(wrap);
    wrap.appendChild(layerCurrent);
    wrap.appendChild(layerNext);

    // Keep ARIA behavior from original span
    wrap.setAttribute('aria-live', 'polite');

    // 2) Measurements and sizing (no clipping; smooth width)
    const h1 = wrap.closest('h1') || document.body;

    // Hidden measurer span with identical typography
    const measure = document.createElement('span');
    measure.className = 'rotating-layer'; // same font/whitespace rules
    measure.style.position = 'absolute';
    measure.style.visibility = 'hidden';
    measure.style.whiteSpace = 'nowrap';

    const cs = getComputedStyle(wrap);
    measure.style.fontFamily = cs.fontFamily;
    measure.style.fontSize = cs.fontSize;
    measure.style.fontWeight = cs.fontWeight;
    measure.style.fontStyle = cs.fontStyle;
    if (cs.fontStretch) measure.style.fontStretch = cs.fontStretch;
    measure.style.letterSpacing = cs.letterSpacing;
    h1.appendChild(measure);

    const BUFFER = 2; // px – small safety margin

    const widthOf = (word) => {
      measure.textContent = word;
      return Math.ceil(measure.offsetWidth) + BUFFER;
    };

    // Use the h1 line-height to position layers on the baseline
    const h1cs = getComputedStyle(h1);
    const fontSizePx = parseFloat(cs.fontSize);
    let lineHeightPx = parseFloat(h1cs.lineHeight);

    // If line-height is 'normal', approximate
    if (isNaN(lineHeightPx)) {
      lineHeightPx = Math.round(fontSizePx * 1.2);
    }

    // Make the wrapper exactly one line tall (no clipping)
    wrap.style.height = lineHeightPx + 'px';
    wrap.style.lineHeight = lineHeightPx + 'px';

    // Offset: center the font-size box inside the line box
    const baselineOffset = Math.max(0, Math.round((lineHeightPx - fontSizePx) / 2)) + 13.5;

    // Place both layers at the same vertical offset
    layerCurrent.style.top = baselineOffset + 'px';
    layerNext.style.top = baselineOffset + 'px';

    // Apply to both layers (inline styles override CSS top:0)
    layerCurrent.style.top = baselineOffset + 'px';
    layerNext.style.top = baselineOffset + 'px';

    // Keep the wrapper using the same line-height as the h1 for consistency
    wrap.style.lineHeight = lineHeightPx + 'px';

    // Smoothly animate width changes to keep the period aligned without jumps
    wrap.style.transition = `width ${ANIM_MS}ms ease-in-out`;

    // Initial width for the first word
    wrap.style.width = widthOf(WORDS[i]) + 'px';

    // 3) Animation loop
    let ticking = false;

    function swap() {
      if (ticking) return;
      ticking = true;

      // Compute the next word
      const nextIndex = (i + 1) % WORDS.length;
      layerNext.textContent = WORDS[nextIndex];

      // Smoothly transition wrap width to match the incoming word
      wrap.style.width = widthOf(WORDS[nextIndex]) + 'px';

      // Reset starting positions
      layerCurrent.style.transform = 'rotateX(0deg)';
      layerNext.style.transform    = 'rotateX(-90deg)';
      layerNext.style.opacity      = '0';

      // Kick off synchronized animations
      layerCurrent.classList.add('rotating-out');
      layerNext.classList.add('rotating-in');

      // When the out-animation finishes, finalize state
      const handleEnd = () => {
        layerCurrent.classList.remove('rotating-out');
        layerNext.classList.remove('rotating-in');

        // Make next the new current by swapping references
        const temp = layerCurrent.textContent;
        layerCurrent.textContent = layerNext.textContent;
        layerNext.textContent = temp;

        // Ensure layers are reset to resting transforms
        layerCurrent.style.transform = 'rotateX(0deg)';
        layerCurrent.style.opacity   = '1';
        layerNext.style.transform    = 'rotateX(-90deg)';
        layerNext.style.opacity      = '0';

        i = nextIndex;
        ticking = false;

        // Schedule next cycle after the remaining pause
        setTimeout(swap, INTERVAL_MS);
        layerCurrent.removeEventListener('animationend', handleEnd);
      };

      layerCurrent.addEventListener('animationend', handleEnd);

      // Safety fallback in case animationend doesn’t fire
      setTimeout(() => {
        if (!ticking) return;
        handleEnd();
      }, ANIM_MS + 50);
    }

    if (!prefersReducedMotion) {
      // Initial still time before first swap
      setTimeout(swap, INTERVAL_MS);
    } else {
      // Reduced motion: just rotate the text content without animation
      setInterval(() => {
        i = (i + 1) % WORDS.length;
        layerCurrent.textContent = WORDS[i];
      }, INTERVAL_MS);
    }
  }

  
  // Carousel
  let currentIndex = 0;
  let slideInterval;

  let lastDirection = 'right';

  const updateCarousel = (index) => {
    if (!carouselTrack) return;

    const currentSlide = document.querySelector('.carousel-slide.current-slide');
    const newSlide = slides[index];

    if (currentSlide === newSlide) return;

    const incomingClass = lastDirection === 'right' ? 'slide-in-right' : 'slide-in-left';
    const outgoingClass = lastDirection === 'right' ? 'slide-out-left' : 'slide-out-right';

    // Reset animation classes on all slides
    slides.forEach(slide => {
      slide.classList.remove('slide-in-right', 'slide-in-left', 'slide-out-left', 'slide-out-right');
    });

    // Prepare new slide
    newSlide.style.removeProperty('display'); // reset any inline display:none
    void newSlide.offsetWidth; // Force reflow to restart animation

    // Animate outgoing slide
    if (currentSlide) {
      currentSlide.classList.add(outgoingClass);

      currentSlide.addEventListener('animationend', function handleOut() {
        currentSlide.classList.remove('current-slide', outgoingClass);
        currentSlide.style.display = 'none';
        currentSlide.removeEventListener('animationend', handleOut);

        newSlide.classList.add('current-slide');
        newSlide.classList.add(incomingClass);
      });
    }
  };

  const showNextSlide = () => {
    lastDirection = 'right';
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel(currentIndex);
  };

  const showPrevSlide = () => {
    lastDirection = 'left';
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel(currentIndex);
  };

  const startAutoSlide = () => {
    slideInterval = setInterval(showNextSlide, 15000);
  };

  const stopAutoSlide = () => {
    clearInterval(slideInterval);
  };

  nextBtn?.addEventListener('click', () => {
    stopAutoSlide();
    showNextSlide();
    startAutoSlide();
  });

  prevBtn?.addEventListener('click', () => {
    stopAutoSlide();
    showPrevSlide();
    startAutoSlide();
  });

  if (carouselTrack && slides.length > 0) {
    updateCarousel(currentIndex);
    startAutoSlide();
  }

  // Contact Form
  if (contactForm && thankYouModal) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(contactForm);
      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(() => {
        thankYouModal.classList.remove('hidden');
        contactForm.reset();
      }).catch(() => {
        alert('There was an error sending your message.');
      });
    });

    closeModalBtn?.addEventListener('click', () => {
      thankYouModal.classList.add('hidden');
    });
  }

  // Testimonials Carousel
  const testimonialTrack = document.querySelector('.testimonial-track');
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');

  let testimonialIndex = 0;

  const updateTestimonial = (index) => {
    testimonialSlides.forEach((slide, i) => {
      slide.classList.remove('active');
      slide.style.display = i === index ? 'flex' : 'none';
    });

    const current = testimonialSlides[index];
    if (current) {
      void current.offsetWidth; // Force reflow
      current.classList.add('active');
    }
  };

  const cycleTestimonials = () => {
    testimonialIndex = (testimonialIndex + 1) % testimonialSlides.length;
    updateTestimonial(testimonialIndex);
  };

  if (testimonialTrack && testimonialSlides.length > 0) {
    updateTestimonial(testimonialIndex);
    setInterval(cycleTestimonials, 8000);
  }
});