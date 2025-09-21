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
  const header = document.querySelector('header');
  const burger = document.querySelector('.nav-toggle');

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
  const saved = localStorage.getItem('theme') || 'light';
  setTheme(saved);

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

  // 4c. Close burger on scroll
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

  document.querySelectorAll('#primary-nav a').forEach(a => {
    a.addEventListener('click', () => {
      if (document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        burger?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // 5. Nav Burger
  function setHeaderVar() {
    const h = header ? header.offsetHeight : 72;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }
  setHeaderVar();
  window.addEventListener('resize', setHeaderVar, { passive: true });
  
  if (burger) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      document.body.classList.toggle('nav-open', !open);
      // recalc in case sticky state/line wraps changed header height
      setHeaderVar();
    });
  }

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

    let animating = true;

    // Create canvas and layer it behind hero content
    const canvas = document.createElement('canvas');
    canvas.id = 'hero-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
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
    let CELL = 39;                    // base cell size (px)
    const RADIUS = 6;                 // tile corner radius
    const GAP = 0.5;                // gap between tiles (px)
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
        baseFill: null,
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
      ctx.globalCompositeOperation = 'source-over';

      // THEME detection and base background (unified for light/dark)
      const themeIsDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const THEME = themeIsDark ? THEMES.dark : THEMES.light;

      // Paint solid base only when provided
      if (THEME.baseFill) {
        ctx.fillStyle = THEME.baseFill;
        ctx.fillRect(0, 0, W, H);
      }
    
      // unified base & vignette using THEME
      ctx.fillStyle = THEME.baseFill;
      ctx.fillRect(0,0,W,H);
      
      // Vignette/glow over transparent base
      const [vx, vy] = THEME.vignetteCenter;
      const vr = ctx.createRadialGradient(
        W * vx, H * vy, 0,
        W * vx, H * vy, Math.max(W, H) * THEME.vignetteRadius
      );
      vr.addColorStop(0, `rgba(80,180,101,${THEME.vignetteAlpha})`);
      vr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vr;
      ctx.fillRect(0, 0, W, H);

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
        const x = tile.x + GAP;
        const y = tile.y + GAP;
        const w = CELL - GAP * 2;
        const h = CELL - GAP * 2;

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
        roundRect(ctx, xs + sx, ys + sy, ws, hs, RADIUS);
        ctx.fill();

        // Pin body
        ctx.fillStyle = `rgb(${rC|0},${gC|0},${bC|0})`;
        roundRect(ctx, xs, ys, ws, hs, RADIUS);
        ctx.fill();
        // Add subtle tile border and bevel controlled by THEME (seams disabled by default)
        if (THEME.borderOuterAlpha > 0 || THEME.borderInnerAlpha > 0) {
          if (THEME.borderOuterAlpha > 0) {
            ctx.strokeStyle = `rgba(0,0,0,${THEME.borderOuterAlpha})`;
            ctx.lineWidth = 1;
            roundRect(ctx, xs, ys, ws, hs, RADIUS);
            ctx.stroke();
          }
          if (THEME.borderInnerAlpha > 0) {
            ctx.strokeStyle = `rgba(255,255,255,${THEME.borderInnerAlpha})`;
            roundRect(ctx, xs+1, ys+1, ws-2, hs-2, Math.max(0, RADIUS - 1));
            ctx.stroke();
          }
        }

        // Depth highlight & inner shadow — theme controlled (identical dark/light for now)
        const hi = THEME.hi;
        const lo = THEME.lo;
        // highlight stroke
        ctx.strokeStyle = hi; ctx.lineWidth = 1; roundRect(ctx, xs+0.5, ys+0.5, ws-1, hs-1, RADIUS); ctx.stroke();
        // inner shadow via inset path
        ctx.save();
        ctx.clip();
        const grad = ctx.createLinearGradient(xs, ys, xs+ws, ys+hs);
        // Same orientation in both themes; light mode uses accent green highlight and deeper shadow
        grad.addColorStop(0.0, hi);
        grad.addColorStop(0.5 + depthClamped*0.2, 'rgba(0,0,0,0)');
        grad.addColorStop(1.0, lo);
        ctx.fillStyle = grad;
        roundRect(ctx, xs, ys, ws, hs, RADIUS);
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
      if (animating) requestAnimationFrame(draw);
    }

    function setDpr(){
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    }

    // Init (respect Reduce Motion but still render one frame)
    if (prefersReducedMotion) {
      animating = false;
      resize();
      lastT = 0;
      draw(0);   // draw a single static frame
    } else {
      start();   // full animation
    }

    // Events
    window.addEventListener('resize', () => { setDpr(); resize(); });
    window.addEventListener('orientationchange', () => { setDpr(); resize(); });
  })();

  if (rotatingEl) {
    const WORDS = [
      'Founders',
      'Small Businesses',
      'Creatives',
      'Innovators',
      'Small Teams',
      'Makers',
      'Startups',
      'Entrepreneurs',
      'Freelancers',
      'Clinicians',
      'Local Brands',
      'Nonprofits',
      'Creators'
    ];

    let i = 0;
    const INTERVAL_MS = 3000;   // show time per word (longer pause)
    const ANIM_MS = 700;        // duration of the in/out animation
    const prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Baseline tweak (in px) to fine-tune after metrics; use small values if needed
    const BASELINE_TWEAK = 0; // negative raises, positive lowers

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
    // Always inherit font and letterSpacing so measurer stays in sync
    measure.style.font = 'inherit';
    measure.style.letterSpacing = 'inherit';
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

    // ---- Baseline alignment (responsive + font-metrics based) ----
    // One offscreen canvas for font metrics (reuse across recalcs)
    const _fmCanvas = document.createElement('canvas');
    const _fmCtx = _fmCanvas.getContext('2d');

    function applyBaseline() {
      // Recompute styles every time (font-size/line-height can change with viewport)
      const wrapCS = getComputedStyle(wrap);
      const h1CS = getComputedStyle(h1);

      // Font string that matches rendering
      _fmCtx.font = [
        wrapCS.fontStyle || 'normal',
        wrapCS.fontVariant || 'normal',
        wrapCS.fontWeight || '400',
        wrapCS.fontSize,
        wrapCS.fontFamily
      ].join(' ');

      // Prefer fontBoundingBox*; fall back to actualBoundingBox*
      const metrics = _fmCtx.measureText('Hg');
      const fontSizePx = parseFloat(wrapCS.fontSize) || 16;
      const ascent  = (metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent ?? fontSizePx * 0.8);
      const descent = (metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent ?? fontSizePx * 0.2);

      // Resolve 'normal' line-height to px
      let lineHeightPx = parseFloat(h1CS.lineHeight);
      if (isNaN(lineHeightPx)) lineHeightPx = Math.round(fontSizePx * 1.2);

      // Compute the baseline position from the top of the line box:
      // baseline = half-leading + ascent
      const baselineFromTop = Math.max(0, (lineHeightPx - (ascent + descent)) / 2 + ascent);

      // Lock wrapper to single line height, but do NOT force line-height (inherit from h1)
      wrap.style.height = lineHeightPx + 'px';
      wrap.style.lineHeight = '';
    }

    // Ensure fonts are ready before sizing — prevents the period from “sticking”
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        applyBaseline();
        try { wrap.style.width = widthOf(WORDS[i]) + 'px'; } catch {}
      });
    } else {
      // Fallback: apply immediately
      applyBaseline();
      try { wrap.style.width = widthOf(WORDS[i]) + 'px'; } catch {}
    }

    // Smoothly animate width changes to keep the period aligned without jumps
    wrap.style.transition = `width ${ANIM_MS}ms ease-in-out`;

    // Initial width for the first word
    wrap.style.width = widthOf(WORDS[i]) + 'px';

    // initial application
    applyBaseline();

    // ensure we recalc after webfonts finish swapping in
    if ('fonts' in document && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(applyBaseline);
    }

    // recalc on resize (debounced) and whenever the H1 box changes size
    const _debounce = (fn, d = 100) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); }; };
    window.addEventListener('resize', _debounce(applyBaseline, 80), { passive: true });

    // catch any reflow (clamps, container width, etc.)
    const ro = new ResizeObserver(() => applyBaseline());
    ro.observe(h1);

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
  
  // Portfolio Carousel
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
    slideInterval = setInterval(showNextSlide, 12000);
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

  // Testimonials Carousel (robust: aria-hidden + hidden; pause on hover/focus)
  const testimonialsRoot = document.querySelector('.testimonials-carousel');
  const testimonialTrack = document.querySelector('.testimonial-track');
  const testimonialSlides = testimonialTrack ? Array.from(testimonialTrack.querySelectorAll('.testimonial-slide')) : [];
  
  let testimonialIndex = 0;
  let testimonialTimer = null;
  const TESTIMONIAL_INTERVAL = 8000;
  const prefersReducedMotion_TEST = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  function showTestimonial(i) {
    testimonialIndex = (i + testimonialSlides.length) % testimonialSlides.length;
    testimonialSlides.forEach((slide, idx) => {
      const isActive = idx === testimonialIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      // use hidden to fully remove from flow; CSS ensures display:none
      if (!isActive) {
        slide.setAttribute('hidden', '');
      } else {
        slide.removeAttribute('hidden');
      }
    });
  }
  
  function nextTestimonial() {
    showTestimonial(testimonialIndex + 1);
  }
  
  function startTestimonials() {
    if (prefersReducedMotion_TEST || testimonialSlides.length <= 1) return;
    stopTestimonials();
    testimonialTimer = setInterval(nextTestimonial, TESTIMONIAL_INTERVAL);
  }
  
  function stopTestimonials() {
    if (testimonialTimer) {
      clearInterval(testimonialTimer);
      testimonialTimer = null;
    }
  }
  
  if (testimonialsRoot && testimonialSlides.length > 0) {
    // Initialize state
    testimonialSlides.forEach((s, idx) => {
      s.style.removeProperty('display'); // clear inline displays from previous code
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'testimonial');
      s.setAttribute('aria-hidden', String(idx !== 0));
      if (idx !== 0) s.setAttribute('hidden', '');
    });
    showTestimonial(0);
    startTestimonials();
  
    // Pause on hover/focus inside carousel
    ['mouseenter', 'focusin'].forEach(evt => testimonialsRoot.addEventListener(evt, stopTestimonials, { passive: true }));
    ['mouseleave', 'focusout'].forEach(evt => testimonialsRoot.addEventListener(evt, startTestimonials, { passive: true }));
  
    // (Optional) pause when offscreen to save cycles
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) startTestimonials();
          else stopTestimonials();
        });
      }, { threshold: 0.1 });
      io.observe(testimonialsRoot);
    }
  }

  // ============================
  // About "Read more" toggle 
  // ============================

  document.addEventListener('click', (e) => {
    const link = e.target.closest('.about-readmore');
    if (!link) return;

    e.preventDefault();
    const box = link.closest('.about-text');
    const isClamped = box.getAttribute('data-clamp') !== '0';

    // Toggle state
    box.setAttribute('data-clamp', isClamped ? '0' : '1');
    link.setAttribute('aria-expanded', String(isClamped));

    // Keep the anchor width identical between labels to avoid any nudge
    // (CSS gives it a fixed width, so we just swap the text)
    link.textContent = isClamped ? 'Read less' : 'Read more';
  });

  // ============================
  // FAQ search / filter
  // ============================
  const faqSearch = document.getElementById('faq-search');
  const faqList = document.querySelector('.faq-list');
  const faqItems = document.querySelectorAll('.faq-item');

  // Close all open FAQ items (hoisted so filterFaq can call it)
  function closeAllFaq() {
    const toggles = document.querySelectorAll('.faq-toggle');
    toggles.forEach(btn => {
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (panel) panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });
  }

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
  // FAQ accordion (click/keyboard)
  // ============================
  const faqToggles = document.querySelectorAll('.faq-toggle');

  faqToggles.forEach(btn => {
    // Click toggles its panel
    btn.addEventListener('click', () => {
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded; // hide if it was open; show if it was closed
    });

    // Keyboard support (Enter / Space)
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Optional: open a specific FAQ when linked as ...#faq-services
  (function openFaqFromHash() {
    const hash = window.location.hash;
    if (!hash) return;
    const panel = document.querySelector(hash);
    if (!panel || !panel.classList.contains('faq-panel')) return;
    const btn = document.querySelector(`[aria-controls="${panel.id}"]`);
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
  })();
});