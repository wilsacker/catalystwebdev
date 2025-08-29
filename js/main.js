document.addEventListener('DOMContentLoaded', () => {
  // 1. Smooth page load
  document.body.classList.add('loaded');

  // DOM Elements
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const tabs = document.querySelectorAll('.process-tabs .tab');
  const panels = document.querySelectorAll('.tab-panel');
  const servicesTabs = document.querySelectorAll('.services-tabs .services-tab');
  const servicesPanels = document.querySelectorAll('.services-panel');
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
        // Smooth scroll accounting for sticky header height
        const headerOffset = document.querySelector('header')?.offsetHeight || 0;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
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

  // 4b. Sticky header styling on scroll + Back-to-top FAB
  const headerEl = document.querySelector('header');

  // Create Back-to-top button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.id = 'back-to-top';
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.type = 'button';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 4l-8 8h5v8h6v-8h5z"/>
    </svg>
  `;
  document.body.appendChild(backToTopBtn);

  const prefersReduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduceMotion ? 'auto' : 'smooth' });
  });

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (headerEl) {
      if (y > 8) headerEl.classList.add('is-stuck');
      else headerEl.classList.remove('is-stuck');
    }
    if (y > 600) backToTopBtn.classList.add('show');
    else backToTopBtn.classList.remove('show');
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  // 5b. Tab switching in Services section

  servicesTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = tab.dataset.tab;
      const targetPanel = document.getElementById(targetId);
      if (!targetPanel) return;

      // Deactivate all tabs and panels
      servicesTabs.forEach(t => t.classList.remove('active'));
      servicesPanels.forEach(panel => {
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
  servicesPanels.forEach((panel, index) => {
    panel.style.display = panel.classList.contains('active') || index === 0 ? 'flex' : 'none';
  });

  // ============================
  // FAQ accordion (accessible)
  // ============================
  const faqToggles = document.querySelectorAll('.faq-toggle');

  function closeAllFaq(exceptBtn) {
    faqToggles.forEach(btn => {
      if (btn !== exceptBtn) {
        const panelId = btn.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        if (!panel) return;
        btn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      }
    });
  }

  faqToggles.forEach(btn => {
    const panelId = btn.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    if (!panel) return;

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        btn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      } else {
        // keep one open at a time (remove next line if you want multi-open)
        closeAllFaq(btn);
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });

    // Keyboard navigation among questions
    btn.addEventListener('keydown', (e) => {
      const list = Array.from(faqToggles);
      const i = list.indexOf(btn);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        list[(i + 1) % list.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        list[(i - 1 + list.length) % list.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        list[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        list[list.length - 1].focus();
      }
    });
  });

  // Open from hash (e.g., /#faq-seo)
  if (location.hash) {
    const panel = document.querySelector(location.hash);
    const btn = panel ? document.querySelector(`[aria-controls="${panel.id}"]`) : null;
    if (panel && btn) {
      closeAllFaq(btn);
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      // scroll to it accounting for sticky header
      const headerOffset = document.querySelector('header')?.offsetHeight || 0;
      const y = panel.getBoundingClientRect().top + window.scrollY - headerOffset - 12;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  // ============================
  // FAQ search / filter
  // ============================
  const faqSearch = document.getElementById('faq-search');
  const faqList = document.querySelector('.faq-list');
  const faqItems = document.querySelectorAll('.faq-item');

  // Simple debounce helper
  const debounce = (fn, delay = 160) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  };

  // Empty-state message
  let faqEmpty = document.querySelector('.faq-empty');
  if (!faqEmpty) {
    faqEmpty = document.createElement('p');
    faqEmpty.className = 'faq-empty';
    faqEmpty.textContent = 'No matches found. Try a different term.';
    faqEmpty.hidden = true;
    faqList.insertAdjacentElement('afterend', faqEmpty);
  }

  const normalize = (s) => (s || '').toLowerCase().trim();

  const filterFaq = () => {
    const q = normalize(faqSearch.value);
    let shown = 0;

    // Close all open items before filtering
    closeAllFaq();

    faqItems.forEach(item => {
      const question = item.querySelector('h3')?.innerText || '';
      const answer = item.querySelector('.faq-panel')?.innerText || '';
      const hit = !q || (normalize(question).includes(q) || normalize(answer).includes(q));
      item.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });

    faqEmpty.hidden = shown !== 0;
  };

  if (faqSearch) {
    faqSearch.addEventListener('input', debounce(filterFaq, 120));
    faqSearch.addEventListener('search', filterFaq); // for clear "x" on WebKit
  }
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
    let gridOffsetX = 0, gridOffsetY = 0;
    let lastMouse = { x: -9999, y: -9999 };

    // Grid config
    let CELL = 56;                    // base cell size (px)
    const RADIUS = 6;                 // tile corner radius
    const BASE_AMP = 8;               // base jump amplitude
    const RIPPLE_SIGMA = 160;         // ripple spread (px)
    const RIPPLE_WAVE_K = 0.06;       // spatial frequency
    const RIPPLE_SPEED = 6;           // wave speed

    // --- Lighting (pins slide in a plane; light from SW so shadows cast NE) ---
    const DEG = Math.PI / 180;
    const LIGHT_ELEV = 30 * DEG;           // ~30° above horizon
    const LIGHT_AZIM = 225 * DEG;          // from SW (shadows toward NE)
    const Lx = Math.cos(LIGHT_ELEV) * Math.cos(LIGHT_AZIM);
    const Ly = Math.cos(LIGHT_ELEV) * Math.sin(LIGHT_AZIM);
    const Lz = Math.sin(LIGHT_ELEV);
    const LIGHT = { x: Lx, y: Ly, z: Lz };
    const AMBIENT = 0.12;
    const DIFFUSE_INTENSITY = 0.85;
    const SPECULAR_INTENSITY = 0.22;
    const SHININESS = 18;

    // --- THEME CONFIG:
    const THEMES = {
      dark: {
        baseFill: '#050505',                 // canvas base
        vignetteAlpha: 0.14,                 // brand glow strength
        vignetteCenter: [0.5, 0.2],          // x,y as fraction of W,H
        vignetteRadius: 0.9,                 // relative to max(W,H)
        tileShadowAlpha: 0.25,               // cast shadow inside plane
        borderOuterAlpha: 0.0,               // tile seams (0 to disable)
        borderInnerAlpha: 0.0,
        hi: 'rgba(255,255,255,0.10)',        // bevel highlight
        lo: 'rgba(0,0,0,0.35)',              // bevel inner shadow
        baseCol: { r:12, g:14, b:12 },       // pin base material
        tintCol: { r:12, g:40, b:16 },       // subtle green tint
        glowAlphaMax: 0.45,                  // accent glow cap
        glowAlphaBias: 0.25,
        glowAlphaScale: 0.5,
        glowRadiusBase: 0.9,                 // glow radius factors (in CELLs)
        glowRadiusScale: 0.5
      },
      light: {
        baseFill: '#',
        vignetteAlpha: 0.16,
        vignetteCenter: [0.5, 0.2],
        vignetteRadius: 0.9,
        tileShadowAlpha: 0.22,
        borderOuterAlpha: 0.0,
        borderInnerAlpha: 0.0,
        hi: 'rgba(255,255,255,0.05)', // softer highlights
        lo: 'rgba(0,0,0,0.28)', // less dark than dark mode
        baseCol: { r: 40, g: 70, b: 60 },
        tintCol: { r: 70, g: 100, b: 80 },
        glowAlphaMax: 0.45,
        glowAlphaBias: 0.25,
        glowAlphaScale: 0.5,
        glowRadiusBase: 0.9,
        glowRadiusScale: 0.5
      }
    };

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

      // Fit full tiles only and center the grid so no partial row/col shows
      const cols = Math.max(1, Math.floor(W / CELL));
      const rows = Math.max(1, Math.floor(H / CELL));
      gridOffsetX = Math.floor((W - cols * CELL) / 2);
      gridOffsetY = Math.floor((H - rows * CELL) / 2);

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          tiles.push({
            x: gridOffsetX + i * CELL,
            y: gridOffsetY + j * CELL,
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
    heroSection.addEventListener('mousemove', (e)=>{
      rippleAt(e.clientX, e.clientY, 0.6);
      const rect = heroSection.getBoundingClientRect();
      lastMouse.x = e.clientX - rect.left;
      lastMouse.y = e.clientY - rect.top;
    });
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

      // THEME detection and base background (unified for light/dark)
      const themeIsDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const THEME = themeIsDark ? THEMES.dark : THEMES.light;

      // unified base & vignette using THEME
      ctx.fillStyle = THEME.baseFill;
      ctx.fillRect(0,0,W,H);
      const [vx, vy] = THEME.vignetteCenter;
      const vr = ctx.createRadialGradient(W*vx, H*vy, 0, W*vx, H*vy, Math.max(W,H)*THEME.vignetteRadius);
      vr.addColorStop(0, `rgba(80,180,101,${THEME.vignetteAlpha})`);
      vr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vr; ctx.fillRect(0,0,W,H);

      // Update ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.t += dt;
        if (r.t > r.life) ripples.splice(i, 1);
      }

      // Draw pins: long rectangular cylinders sliding in a fixed plane
      for (const tile of tiles) {
        const cx = tile.x + CELL * 0.5;
        const cy = tile.y + CELL * 0.5;

        // base oscillation + interactive ripples
        const base = Math.sin(t * tile.speed + tile.phase);
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

        // "Depth" indicates how far the pin is pushed in/out within its cell
        const depth = (base + influence) * (tile.amp / 14); // roughly -1..1
        const depthClamped = Math.max(-1, Math.min(1, depth));

        // Lighting based on a normal derived from the height field around the pin center
        const EPS = 1.0;
        const hL = Math.sin(t * tile.speed + tile.phase); // local base for neighbors
        const nHx = (Math.sin(t * tile.speed + tile.phase + EPS*0.03) - Math.sin(t * tile.speed + tile.phase - EPS*0.03));
        const nHy = (Math.sin(t * tile.speed + tile.phase + EPS*0.03) - Math.sin(t * tile.speed + tile.phase - EPS*0.03));
        let nx = -nHx, ny = -nHy, nz = 2.0; // up vector
        const inv = 1/Math.hypot(nx, ny, nz); nx*=inv; ny*=inv; nz*=inv;
        const NdotL = Math.max(0, nx*LIGHT.x + ny*LIGHT.y + nz*LIGHT.z);
        const diffuse = DIFFUSE_INTENSITY * NdotL;
        const hxv = LIGHT.x, hyv = LIGHT.y, hzv = LIGHT.z + 1; // H ~ L + V (V≈[0,0,1])
        const hnorm = 1/Math.hypot(hxv, hyv, hzv);
        const Hx = hxv*hnorm, Hy = hyv*hnorm, Hz = hzv*hnorm;
        const spec = SPECULAR_INTENSITY * Math.pow(Math.max(0, nx*Hx + ny*Hy + nz*Hz), SHININESS);
        const I = Math.min(1, AMBIENT + diffuse + spec);

        // Theme palettes
        const baseCol = THEME.baseCol;
        const tintCol = THEME.tintCol;

        const rC = Math.min(255, baseCol.r + I * (30 + tintCol.r));
        const gC = Math.min(255, baseCol.g + I * (30 + tintCol.g));
        const bC = Math.min(255, baseCol.b + I * (30 + tintCol.b));

        // Pin geometry inside its cell: fixed position; height impression via inner offset & shading
        const x = tile.x + 1;
        const y = tile.y + 1;
        const w = CELL - 2;
        const h = CELL - 2;

        // mouse proximity influence (size + glow)
        const dxm = (tile.x + CELL*0.5) - lastMouse.x;
        const dym = (tile.y + CELL*0.5) - lastMouse.y;
        const md  = Math.hypot(dxm, dym);
        const mouseGlow = Math.exp(-(md*md)/(2*50*50)); // sigma~200px

        // scale geometry slightly toward mouse
        const scale = 1 + mouseGlow * 0.06; // up to +6%
        const ws = w * scale;
        const hs = h * scale;
        const xs = x + (w - ws) / 2;
        const ys = y + (h - hs) / 2;

        // Shadow cast within the plane (toward NE), proportional to depth
        const sLen = (depthClamped + 1) * 0.5 * 6; // 0..6px
        const sx = (-LIGHT.x) * sLen;
        const sy = (-LIGHT.y) * sLen;
        ctx.fillStyle = `rgba(0,0,0,${THEME.tileShadowAlpha})`;
        roundRect(ctx, xs + sx, ys + sy, ws, hs, 7);
        ctx.fill();

        // Pin body
        ctx.fillStyle = `rgb(${rC|0},${gC|0},${bC|0})`;
        roundRect(ctx, xs, ys, ws, hs, 7);
        ctx.fill();
        // Add subtle tile border and bevel controlled by THEME (seams disabled by default)
        if (THEME.borderOuterAlpha > 0 || THEME.borderInnerAlpha > 0) {
          if (THEME.borderOuterAlpha > 0) {
            ctx.strokeStyle = `rgba(0,0,0,${THEME.borderOuterAlpha})`;
            ctx.lineWidth = 1;
            roundRect(ctx, xs, ys, ws, hs, 7);
            ctx.stroke();
          }
          if (THEME.borderInnerAlpha > 0) {
            ctx.strokeStyle = `rgba(255,255,255,${THEME.borderInnerAlpha})`;
            roundRect(ctx, xs+1, ys+1, ws-2, hs-2, 6);
            ctx.stroke();
          }
        }

        // Depth highlight & inner shadow — theme controlled (identical dark/light for now)
        const hi = THEME.hi;
        const lo = THEME.lo;
        // highlight stroke
        ctx.strokeStyle = hi; ctx.lineWidth = 1; roundRect(ctx, xs+0.5, ys+0.5, ws-1, hs-1, 7); ctx.stroke();
        // inner shadow via inset path
        ctx.save();
        ctx.clip();
        const grad = ctx.createLinearGradient(xs, ys, xs+ws, ys+hs);
        // Same orientation in both themes; light mode uses accent green highlight and deeper shadow
        grad.addColorStop(0.0, hi);
        grad.addColorStop(0.5 + depthClamped*0.2, 'rgba(0,0,0,0)');
        grad.addColorStop(1.0, lo);
        ctx.fillStyle = grad;
        roundRect(ctx, xs, ys, ws, hs, 7);
        ctx.fill();
        ctx.restore();

        // Accent green glow
        {
          const peak = Math.max(0, depthClamped);
          const glow = (mouseGlow * 0.9) + (peak * 0.6);
          if (glow > 0.02) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const cx = tile.x + CELL*0.5;
            const cy = tile.y + CELL*0.5;
            const radius = CELL * (THEME.glowRadiusBase + peak*THEME.glowRadiusScale);
            const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            rg.addColorStop(0, `rgba(80,180,101,${Math.min(THEME.glowAlphaMax, THEME.glowAlphaBias + glow*THEME.glowAlphaScale)})`);
            rg.addColorStop(1, 'rgba(80,180,101,0)');
            ctx.fillStyle = rg;
            ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fill();
            ctx.restore();
          }
        }
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
    setInterval(cycleTestimonials, 12000);
  }
});