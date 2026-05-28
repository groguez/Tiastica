/**
 * TIASTICA V5 — Immersive Space Cockpit + Guided Onboarding + Drill Down System
 *
 * New in V5:
 *  - warpSpeed radial kinetic zoom transition on Hero Canvas particles.
 *  - Fullscreen Platform Cockpit (Level 1) with glassmorphic console, sidebar, and HUD.
 *  - Sequential deck navigation (Avanzar/Retroceder) to shift between solution consoles.
 *  - Feature Drill Down (Level 2) into guided step-by-step onboarding walkthroughs.
 *  - Real-time simulation synchronizations (SVG animations, sensor telemetries, ETA truck pathing).
 *  - Drill Up controls to return to Cockpit console or Cosmos level seamlessly.
 *  - Cockpit cosmic starfield drift canvas background.
 */

(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const noMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================================
     CONFIG — Separation & Físicas
     ======================================================================== */
  const CFG = {
    orbR:               60,
    orbRMobile:         29,

    /* Spacing metrics to prevent overlapping */
    nodeR:              210,   // desktop hero
    nodeRMobile:        115,   // mobile hero
    nodeRLatent:        170,   // desktop latent
    nodeRLatentMobile:  90,    // mobile latent

    /* Better spread angles for 6 nodes */
    heroAngles:         [-95, -50, -5, 42, 95, -145],
    heroAnglesMobile:   [15, 55, 95, 135, 175, 225],
    latentAngles:       [-55, -18, 18, 52, 86, 118],
    latentAnglesMobile: [10, 42, 68, 96, 122, 150],

    curveFactor:        42,
    curveFactorMobile:  16,
    orbitSpeed:         0.007,
    errAmplitude:       5,
    errAmplitudeMobile: 1.5,
    errFreqBase:        0.32,
    attractStrength:    0.05,
    minNodeDist:        140,   // min separation
    minNodeDistMobile:  72,
    collisionPasses:    8,     // robust physics loop
    nodePadEdge:        60,
    nodePadEdgeMobile:  32,
  };

  const NODE_LABELS_MOBILE = ['Geo', 'ERP', 'Ú. Milla', 'IA', 'Beneficios', 'Portal'];
  const NODE_LABELS_DESKTOP = ['Geointeligencia', 'ERP Transporte', 'Última Milla', 'IA Logística', 'Beneficios', 'Portal Cliente'];

  function isMobile() { return innerWidth <= 768; }


  /* ========================================================================
     CANVAS PARTICLES & WARP SPEED HIPIERESPACIO
     ======================================================================== */
  let isWarping = false;

  function initParticles() {
    const canvas = $('#heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [], animId, mx = 0, my = 0;
    
    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    
    function spawn() {
      const n = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 90);
      particles = [];
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.4,
          vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
          a: Math.random() * 0.3 + 0.08,
          px: undefined, py: undefined
        });
      }
    }
    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (isWarping) {
        /* Warp Speed Tunnel Effect */
        particles.forEach(p => {
          if (p.px === undefined) { p.px = p.x; p.py = p.y; }
          const dx = p.x - cx, dy = p.y - cy;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const rx = dx / d, ry = dy / d;

          p.px = p.x; p.py = p.y;
          p.x += rx * (d * 0.09 + 3);
          p.y += ry * (d * 0.09 + 3);

          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(14,165,233,${Math.min(p.a * 3 * (d / 100), 0.95)})`;
          ctx.lineWidth = p.r * 1.8;
          ctx.stroke();

          /* Respawn near center to keep the stream going */
          if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
            p.x = cx + (Math.random() - 0.5) * 50;
            p.y = cy + (Math.random() - 0.5) * 50;
            p.px = p.x;
            p.py = p.y;
          }
        });
      } else {
        /* Normal Floating Cosmos Particles */
        particles.forEach(p => {
          p.px = undefined;
          const dx = mx - p.x, dy = my - p.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 300) { p.vx += dx * 0.000012; p.vy += dy * 0.000012; }
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(14,165,233,${p.a})`; ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110) {
              ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(14,165,233,${0.04 * (1 - d / 110)})`;
              ctx.lineWidth = 0.4; ctx.stroke();
            }
          }
        }
      }
      if (!noMotion) animId = requestAnimationFrame(draw);
    }

    resize(); spawn(); draw();
    addEventListener('resize', () => { resize(); spawn(); updateNodeLabels(); });
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else if (!noMotion) draw();
    });
  }

  /* Trigger Warp Speed tridimensional animation */
  window.triggerWarpSpeed = function(duration, callback) {
    console.log('[Warp] Starting warp speed for', duration, 'ms');
    if (noMotion) { 
      console.log('[Warp] No motion preferred, calling callback immediately');
      if (callback) callback(); 
      return; 
    }
    isWarping = true;
    document.body.classList.add('is-warping');
    console.log('[Warp] is-warping class added to body');
    setTimeout(() => {
      isWarping = false;
      document.body.classList.remove('is-warping');
      console.log('[Warp] Warp finished, calling callback');
      if (callback) callback();
    }, duration);
  };

  /* Update node labels based on screen size */
  function updateNodeLabels() {
    const mobile = isMobile();
    const labels = mobile ? NODE_LABELS_MOBILE : NODE_LABELS_DESKTOP;
    $$('.orb-nav__branches .orb-nav__node').forEach((n, i) => {
      const span = n.querySelector('span');
      if (span && labels[i]) span.textContent = labels[i];
    });
  }


  /* ========================================================================
     ORB STATE MACHINE
     ======================================================================== */
  let orbState = 'hero';
  let orbitAnim = null;
  let orbitT = 0;
  let hintChaseTimer = null;

  function initOrb() {
    const nav = $('#orbNav'), core = $('#orbCore');
    if (!nav || !core) return;

    updateNodeLabels();
    buildBranchSVG();
    positionNodes();

    let hintDismissed = false;
    core.addEventListener('click', () => {
      if (!hintDismissed) {
        hintDismissed = true;
        const hint = $('#orbHint');
        if (hint) {
          clearInterval(hintChaseTimer);
          hint.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          hint.style.opacity = '0';
          setTimeout(() => { hint.remove(); }, 700);
        }
      }
      if (orbState === 'expanded') {
        if (nav.dataset.origin === 'latent') goToHero();
        else goState('hero');
      } else {
        goState('expanded');
      }
    });

    /* Node clicks trigger Warp Transition to Cockpit (for ALL 6 platforms) */
    $$('.orb-nav__branches .orb-nav__node').forEach(n => {
      n.addEventListener('click', e => {
        console.log('[NodeClick] Clicked on node:', n.dataset.section);
        e.preventDefault(); e.stopPropagation();
        const dest = n.dataset.section;
        const cockpitPlatforms = ['geointeligencia', 'erp', 'ultima-milla', 'ia', 'beneficios', 'portal'];
        
        console.log('[NodeClick] Destination:', dest, 'Is cockpit platform:', cockpitPlatforms.includes(dest));
        
        if (cockpitPlatforms.includes(dest)) {

          /* Move Orb to latent dock */
          console.log('[NodeClick] Going to latent state');
          goState('latent');

          /* Scroll FIRST to real section */
          const targetSection = $(`#${dest}`);

          if (targetSection) {
            console.log('[NodeClick] Scrolling to section:', dest);
            targetSection.scrollIntoView({
              behavior: noMotion ? 'auto' : 'smooth',
              block: 'start'
            });
          }

          /* Then activate Warp + Cockpit */
          setTimeout(() => {
            console.log('[NodeClick] Triggering warp speed...');
            window.triggerWarpSpeed(900, () => {
              console.log('[NodeClick] Warp callback executed, checking openCockpit');
              if (typeof window.openCockpit === 'function') {
                console.log('[NodeClick] Calling openCockpit with:', dest);
                window.openCockpit(dest);
              } else {
                console.error('[NodeClick] openCockpit function NOT FOUND');
              }
            });

          }, 550);

        } else {

          /* Fallback for unknown sections */
          console.log('[NodeClick] Unknown section, using fallback');
          goState('latent');

          setTimeout(() => {

            const t = $(`#${dest}`);

            if (t) {
              t.scrollIntoView({
                behavior: noMotion ? 'auto' : 'smooth',
                block: 'start'
              });
            }

          }, 300);

        }
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && orbState === 'expanded') {
        const nav = $('#orbNav');
        if (nav && nav.dataset.origin === 'latent') goToHero();
        else goState('hero');
      }
    });

    const backdrop = $('#orbBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        if (orbState === 'expanded') {
          const nav = $('#orbNav');
          if (nav && nav.dataset.origin === 'latent') goToHero();
          else goState('hero');
        }
      });
    }
  }

  function goToHero() {
    goState('hero');
    setTimeout(() => { window.scrollTo({ top: 0, behavior: noMotion ? 'auto' : 'smooth' }); }, 200);
  }

  function goState(s) {
    const nav = $('#orbNav');
    if (!nav) return;
    nav._prev = orbState;
    orbState = s;
    nav.dataset.state = s;

    if (s === 'expanded' && nav._prev === 'latent') nav.dataset.origin = 'latent';
    else if (s === 'hero') nav.dataset.origin = 'hero';
    else if (s === 'latent') nav.dataset.origin = 'latent';

    const core = $('#orbCore');
    core?.setAttribute('aria-expanded', s === 'expanded');
    if (s === 'expanded' && nav.dataset.origin === 'latent') core?.setAttribute('aria-label', 'Ir al inicio');
    else core?.setAttribute('aria-label', s === 'expanded' ? 'Cerrar menú' : 'Abrir navegación');

    const branches = $('#orbBranches');
    if (branches) branches.setAttribute('aria-hidden', s !== 'expanded');

    const backdrop = $('#orbBackdrop');
    if (backdrop) {
      if (s === 'expanded') backdrop.classList.add('is-visible');
      else backdrop.classList.remove('is-visible');
    }

    updateSectionOffset(s === 'latent');

    if (s === 'expanded') {
      updateNodeLabels();
      buildBranchSVG();
      positionNodes();
      expandBranches();
      startNodeOrbit();
    } else {
      collapseBranches();
      stopNodeOrbit();
    }
  }


  /* ========================================================================
     AUTO-DOCK ON SCROLL
     ======================================================================== */
  function initAutoDock() {
    const hero = $('#inicio');
    if (!hero || noMotion) return;
    let userScrolled = false, scrollTimer;
    addEventListener('scroll', () => {
      userScrolled = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { userScrolled = false; }, 150);
    }, { passive: true });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!userScrolled && e.isIntersecting) return;
        if (!e.isIntersecting && orbState === 'hero') goState('latent');
        else if (e.isIntersecting && orbState === 'latent' && !userScrolled) goState('hero');
      });
    }, { threshold: 0.25 });
    obs.observe(hero);
  }


  /* ========================================================================
     SVG BRANCH SYSTEM
     ======================================================================== */
  function orbIsOnLeft() {
    const nav = $('#orbNav');
    return nav ? nav.dataset.origin === 'latent' : false;
  }
  function currentAngles() {
    if (isMobile()) return orbIsOnLeft() ? CFG.latentAnglesMobile : CFG.heroAnglesMobile;
    return orbIsOnLeft() ? CFG.latentAngles : CFG.heroAngles;
  }
  function nodeRadius() {
    if (isMobile()) return orbIsOnLeft() ? CFG.nodeRLatentMobile : CFG.nodeRMobile;
    return orbIsOnLeft() ? CFG.nodeRLatent : CFG.nodeR;
  }
  function currentOrbR() { return isMobile() ? CFG.orbRMobile : CFG.orbR; }
  function currentCurveFactor() { return isMobile() ? CFG.curveFactorMobile : CFG.curveFactor; }
  function svgNS(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

  function buildBranchSVG() {
    const svg = $('#branchSvg');
    if (!svg) return;
    svg.innerHTML = '';
    const nR = nodeRadius(), orbR = currentOrbR(), cf = currentCurveFactor();
    const sz = nR * 2 + 140, cx = sz / 2;
    const angles = currentAngles();
    svg.setAttribute('viewBox', `0 0 ${sz} ${sz}`);
    svg.style.width = sz + 'px'; svg.style.height = sz + 'px';
    svg.style.left = -cx + 'px'; svg.style.top = -cx + 'px';

    const defs = svgNS('defs');
    defs.innerHTML = `
      <filter id="bGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="bGlowSoft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="orbitGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;
    svg.appendChild(defs);

    const orbitRing = svgNS('circle');
    orbitRing.setAttribute('cx', cx); orbitRing.setAttribute('cy', cx); orbitRing.setAttribute('r', nR);
    orbitRing.setAttribute('fill', 'none'); orbitRing.setAttribute('stroke', 'rgba(14,165,233,0.12)');
    orbitRing.setAttribute('stroke-width', '1'); orbitRing.setAttribute('stroke-dasharray', '6 10');
    orbitRing.setAttribute('filter', 'url(#orbitGlow)');
    orbitRing.classList.add('orbit-ring'); orbitRing.style.opacity = '0';
    svg.appendChild(orbitRing);

    angles.forEach((deg, i) => {
      const rad = deg * Math.PI / 180;
      const sx = cx + Math.cos(rad) * orbR, sy = cx + Math.sin(rad) * orbR;
      const ex = cx + Math.cos(rad) * nR, ey = cx + Math.sin(rad) * nR;
      const perpRad = rad + Math.PI / 2;
      const cv = cf + (i % 2 === 0 ? 12 : -9);
      const t1 = 0.28, t2 = 0.74, segLen = nR - orbR;
      const cp1x = cx + Math.cos(rad) * (orbR + segLen * t1) + Math.cos(perpRad) * cv;
      const cp1y = cx + Math.sin(rad) * (orbR + segLen * t1) + Math.sin(perpRad) * cv;
      const cp2x = cx + Math.cos(rad) * (orbR + segLen * t2) - Math.cos(perpRad) * cv * 0.4;
      const cp2y = cx + Math.sin(rad) * (orbR + segLen * t2) - Math.sin(perpRad) * cv * 0.4;

      const grad = svgNS('linearGradient');
      grad.id = `bG${i}`; grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      grad.setAttribute('x1', sx); grad.setAttribute('y1', sy);
      grad.setAttribute('x2', ex); grad.setAttribute('y2', ey);
      grad.innerHTML = `<stop offset="0%" stop-color="rgba(14,165,233,0.65)"/><stop offset="55%" stop-color="rgba(14,165,233,0.30)"/><stop offset="100%" stop-color="rgba(14,165,233,0.10)"/>`;
      defs.appendChild(grad);

      const d = `M ${sx} ${sy} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${ex} ${ey}`;
      [{sw:5, f:'url(#bGlowSoft)', op:0.25, cls:'branch-halo'}, {sw:1.8, f:'url(#bGlow)', op:null, cls:'branch-path'}].forEach(cfg => {
        const el = svgNS('path');
        el.setAttribute('d', d); el.setAttribute('stroke', `url(#bG${i})`);
        el.setAttribute('stroke-width', cfg.sw); el.setAttribute('fill', 'none');
        el.setAttribute('stroke-linecap', 'round'); el.setAttribute('filter', cfg.f);
        if (cfg.op) el.setAttribute('opacity', cfg.op);
        el.dataset.idx = i; el.classList.add(cfg.cls);
        svg.appendChild(el);
        const len = el.getTotalLength();
        el.style.strokeDasharray = len; el.style.strokeDashoffset = len;
        el.style.setProperty('--i', i);
      });
    });
  }

  function positionNodes() {
    const nR = nodeRadius(), angles = currentAngles();
    $$('.orb-nav__branches .orb-nav__node').forEach((n, i) => {
      const deg = angles[i] !== undefined ? angles[i] : i * 60;
      const rad = deg * Math.PI / 180;
      n.style.setProperty('--nx', (Math.cos(rad) * nR) + 'px');
      n.style.setProperty('--ny', (Math.sin(rad) * nR) + 'px');
    });
  }

  function expandBranches() {
    const orbitRing = $('.orbit-ring');
    if (orbitRing) {
      orbitRing.style.transition = 'stroke 0.8s ease, stroke-width 0.8s ease, opacity 0.8s ease';
      orbitRing.setAttribute('stroke', 'rgba(14,165,233,0.30)');
      orbitRing.setAttribute('stroke-width', '1.5'); orbitRing.style.opacity = '1';
    }
    $$('.branch-path').forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.transition = 'none'; p.style.strokeDashoffset = len; void p.offsetWidth;
      setTimeout(() => { p.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.25,0.46,0.45,0.94)'; p.style.strokeDashoffset = '0'; }, i * 70);
    });
    $$('.branch-halo').forEach((h, i) => {
      const len = h.getTotalLength();
      h.style.transition = 'none'; h.style.strokeDashoffset = len; void h.offsetWidth;
      setTimeout(() => { h.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.25,0.46,0.45,0.94)'; h.style.strokeDashoffset = '0'; }, i * 70);
    });
    $$('.orb-nav__branches .orb-nav__node').forEach((n, i) => {
      n.style.transition = 'none'; n.style.opacity = '0';
      n.style.transform = `translate(var(--nx), var(--ny)) translate(-50%, -50%) scale(0)`;
      void n.offsetWidth;
      setTimeout(() => {
        n.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)';
        n.style.opacity = '1';
        n.style.transform = `translate(var(--nx), var(--ny)) translate(-50%, -50%) scale(1)`;
      }, 350 + i * 70);
    });
  }

  function collapseBranches() {
    const orbitRing = $('.orbit-ring');
    if (orbitRing) {
      orbitRing.style.transition = 'stroke 0.5s ease, stroke-width 0.5s ease, opacity 0.5s ease';
      orbitRing.setAttribute('stroke', 'rgba(14,165,233,0.12)');
      orbitRing.setAttribute('stroke-width', '1'); orbitRing.style.opacity = '0';
    }
    $$('.branch-path').forEach(p => { const len = p.getTotalLength(); p.style.transition = 'stroke-dashoffset 0.7s ease'; p.style.strokeDashoffset = len; });
    $$('.branch-halo').forEach(h => { const len = h.getTotalLength(); h.style.transition = 'stroke-dashoffset 0.7s ease'; h.style.strokeDashoffset = len; });
    $$('.orb-nav__branches .orb-nav__node').forEach(n => {
      n.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      n.style.opacity = '0';
      n.style.transform = `translate(var(--nx), var(--ny)) translate(-50%, -50%) scale(0)`;
    });
  }


  /* ========================================================================
     NODE ORBITAL ANIMATION
     ======================================================================== */
  let nodeState = [];

  function initNodeState() {
    const nodes = $$('.orb-nav__branches .orb-nav__node');
    nodeState = nodes.map((n) => ({ el: n, x: 0, y: 0, vx: 0, vy: 0, phase: Math.random() * Math.PI * 2 }));
  }

  function startNodeOrbit() {
    if (noMotion) return;
    stopNodeOrbit(); orbitT = 0; initNodeState();
    function tick() {
      orbitT += CFG.orbitSpeed;
      const mobile = isMobile();
      const nR = nodeRadius(), angles = currentAngles();
      const errAmp = mobile ? CFG.errAmplitudeMobile : CFG.errAmplitude;
      const minDist = mobile ? CFG.minNodeDistMobile : CFG.minNodeDist;
      const padEdge = mobile ? CFG.nodePadEdgeMobile : CFG.nodePadEdge;
      const nodes = $$('.orb-nav__branches .orb-nav__node');
      const nav = $('#orbNav');
      if (!nav) return;
      const navRect = nav.getBoundingClientRect();
      const orbScreenX = navRect.left + navRect.width / 2;
      const orbScreenY = navRect.top + navRect.height / 2;

      const targets = [];
      nodes.forEach((n, i) => {
        const deg = angles[i] !== undefined ? angles[i] : i * 60;
        const rad = deg * Math.PI / 180;
        targets.push({ x: Math.cos(rad) * nR, y: Math.sin(rad) * nR });
      });
      if (nodeState.length !== nodes.length) initNodeState();

      const perturbations = nodeState.map((ns, i) => {
        const s1 = CFG.errFreqBase + i * 0.08, s2 = CFG.errFreqBase * 0.7 + i * 0.05, s3 = CFG.errFreqBase * 1.3 + i * 0.12;
        return {
          px: Math.sin(orbitT * s1 + ns.phase) * errAmp * 0.6 + Math.cos(orbitT * s2 + ns.phase * 1.5) * errAmp * 0.3 + Math.sin(orbitT * s3 + ns.phase * 0.8) * errAmp * 0.1,
          py: Math.cos(orbitT * s1 + ns.phase * 1.2) * errAmp * 0.6 + Math.sin(orbitT * s2 + ns.phase * 0.7) * errAmp * 0.3 + Math.cos(orbitT * s3 + ns.phase * 1.3) * errAmp * 0.1,
        };
      });

      const pos = targets.map((t, i) => ({ x: t.x + perturbations[i].px, y: t.y + perturbations[i].py }));

      for (let pass = 0; pass < CFG.collisionPasses; pass++) {
        for (let i = 0; i < pos.length; i++) {
          for (let j = i + 1; j < pos.length; j++) {
            const dx = pos[j].x - pos[i].x, dy = pos[j].y - pos[i].y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
            if (dist < minDist) {
              const overlap = (minDist - dist) / 2 + 2;
              pos[i].x -= (dx / dist) * overlap; pos[i].y -= (dy / dist) * overlap;
              pos[j].x += (dx / dist) * overlap; pos[j].y += (dy / dist) * overlap;
            }
          }
        }
      }

      const vw = innerWidth, vh = innerHeight;
      pos.forEach(p => {
        const sx = orbScreenX + p.x, sy = orbScreenY + p.y;
        if (sx - padEdge < 0) p.x = padEdge - orbScreenX;
        if (sx + padEdge > vw) p.x = vw - padEdge - orbScreenX;
        if (sy - padEdge < 0) p.y = padEdge - orbScreenY;
        if (sy + padEdge > vh) p.y = vh - padEdge - orbScreenY;
      });

      nodeState.forEach((ns, i) => {
        if (i >= pos.length) return;
        const target = pos[i];
        ns.vx = ns.vx * 0.82 + (target.x - ns.x) * CFG.attractStrength;
        ns.vy = ns.vy * 0.82 + (target.y - ns.y) * CFG.attractStrength;
        ns.x += ns.vx; ns.y += ns.vy;
        const sc = 1 + Math.sin(orbitT * 0.8 + i * 0.7) * 0.012;
        ns.el.style.transform = `translate(${ns.x}px, ${ns.y}px) translate(-50%, -50%) scale(${sc})`;
      });
      orbitAnim = requestAnimationFrame(tick);
    }
    tick();
  }

  function stopNodeOrbit() { if (orbitAnim) { cancelAnimationFrame(orbitAnim); orbitAnim = null; } }


  /* ========================================================================
     SECTION OFFSET
     ======================================================================== */
  function updateSectionOffset(push) {
    $$('[data-gravity-section]').forEach(s => {
      if (push) s.classList.add('is-orb-latent');
      else s.classList.remove('is-orb-latent');
    });
  }


  /* ========================================================================
     ORB BREATH (gentle float)
     ======================================================================== */
  function initOrbBreath() {
    const nav = $('#orbNav');
    if (!nav || noMotion) return;
    let t = 0;
    function tick() {
      t += 0.01;
      nav.style.setProperty('--float-x', `${Math.cos(t * 0.7) * 1}px`);
      nav.style.setProperty('--float-y', `${Math.sin(t) * 1.5}px`);
      requestAnimationFrame(tick);
    }
    tick();
  }


  /* ========================================================================
     STAT COUNTERS
     ======================================================================== */
  function initStatCounters() {
    const counters = $$('.stat-number[data-count]');
    if (!counters.length) return;
    if (noMotion) {
      counters.forEach(el => {
        const count = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        el.textContent = prefix + count + suffix;
      });
      return;
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        animateCounter(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => obs.observe(el));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const isFloat = target % 1 !== 0 || suffix.startsWith('.');
    const duration = 1800;
    const start = performance.now();

    function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

    function step(now) {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = easeOutExpo(elapsed);
      let current;
      if (isFloat) {
        current = (eased * target).toFixed(1);
      } else {
        current = Math.round(eased * target);
      }
      el.textContent = prefix + current + suffix;
      if (elapsed < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }


  /* ========================================================================
     IA NEURAL NETWORK CANVAS
     ======================================================================== */
  function initIANetwork() {
    const canvas = $('#iaNetworkCanvas');
    if (!canvas || noMotion) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const layers = [4, 6, 6, 4, 3];
    const nodes = [];
    const layerXs = layers.map((_, li) => (li / (layers.length - 1)) * (W - 60) + 30);
    layers.forEach((count, li) => {
      for (let ni = 0; ni < count; ni++) {
        const y = (ni / (count - 1 || 1)) * (H - 60) + 30;
        nodes.push({ x: layerXs[li], y, layer: li, active: Math.random(), phase: Math.random() * Math.PI * 2 });
      }
    });

    let t = 0;
    let animId;
    function draw() {
      t += 0.018;
      ctx.clearRect(0, 0, W, H);

      const layerNodes = layers.map((_, li) => nodes.filter(n => n.layer === li));
      layerNodes.forEach((lNodes, li) => {
        if (li >= layerNodes.length - 1) return;
        lNodes.forEach(a => {
          layerNodes[li + 1].forEach(b => {
            const pulse = (Math.sin(t * 1.2 + a.phase + b.phase) + 1) / 2;
            const alpha = 0.06 + pulse * 0.18;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx.lineWidth = 0.5 + pulse * 0.5;
            ctx.stroke();
          });
        });
      });

      nodes.forEach(n => {
        const pulse = (Math.sin(t * 1.8 + n.phase) + 1) / 2;
        const r = 4 + pulse * 2.5;
        const alpha = 0.5 + pulse * 0.5;

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3);
        grad.addColorStop(0, `rgba(139,92,246,${alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(139,92,246,0)');
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,181,253,${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { if (!animId) draw(); }
        else { cancelAnimationFrame(animId); animId = null; }
      });
    }, { threshold: 0.1 });
    obs.observe(canvas);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(animId); animId = null; }
    });
  }


  /* ========================================================================
     BENEFIT BARS
     ======================================================================== */
  function initBenefitBars() {
    const bars = $$('.benefit-metric__fill');
    if (!bars.length || noMotion) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.width = e.target.style.getPropertyValue('--pct') ||
            getComputedStyle(e.target).getPropertyValue('--pct');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    bars.forEach(b => {
      b.style.width = '0%';
      obs.observe(b);
    });
  }


  /* ========================================================================
     SCROLL ANIMATIONS
     ======================================================================== */
  function initScrollAnimations() {
    const els = $$('[data-animate]');
    if (!els.length) return;
    if (noMotion) { els.forEach(e => e.classList.add('is-visible')); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });
    els.forEach(e => obs.observe(e));
  }


  /* ========================================================================
     POPUP
     ======================================================================== */
  function initPopup() {
    const overlay = $('#popupOverlay'), closeBtn = $('#popupClose');
    if (!overlay || !closeBtn) return;
    function open() {
      overlay.removeAttribute('hidden'); void overlay.offsetHeight;
      overlay.classList.add('is-visible'); document.body.style.overflow = 'hidden';
      setTimeout(() => { const fi = $('input', overlay); if (fi) fi.focus(); }, 300);
    }
    function close() {
      overlay.classList.remove('is-visible'); document.body.style.overflow = '';
      setTimeout(() => overlay.setAttribute('hidden', ''), 350);
    }
    $$('.js-open-popup').forEach(t => t.addEventListener('click', e => { e.preventDefault(); open(); }));
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('is-visible')) close(); });
    window.showPopup = open; window.closePopup = close;
  }


  /* ========================================================================
     FORMS
     ======================================================================== */
  function initForms() {
    const contact = $('#contactForm');
    if (contact) {
      contact.addEventListener('submit', e => {
        e.preventDefault();
        if (validateForm(contact)) { alert('Gracias por tu interés. Nos pondremos en contacto contigo pronto.'); window.closePopup?.(); contact.reset(); }
      });
    }
    const login = $('#loginForm');
    if (login) {
      login.addEventListener('submit', e => {
        e.preventDefault();
        const em = $('#loginEmail'), emE = $('#loginEmailError');
        const pw = $('#loginPassword'), pwE = $('#loginPasswordError');
        let ok = true;
        if (!em.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) { emE.textContent = 'Email inválido'; ok = false; } else emE.textContent = '';
        if (!pw.value || pw.value.length < 6) { pwE.textContent = 'Mínimo 6 caracteres'; ok = false; } else pwE.textContent = '';
        if (ok) alert('Portal en desarrollo. Próximamente disponible.');
      });
    }
  }
  function validateForm(f) {
    let ok = true;
    $$('input[required]', f).forEach(i => { if (!i.value.trim()) ok = false; if (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value)) ok = false; });
    return ok;
  }


  /* ========================================================================
     HINT CHASE ANIMATION
     ======================================================================== */
  function initHintChase() {
    const hint = $('#orbHint');
    if (!hint || noMotion) return;
    setTimeout(() => { if ($('#orbHint')) hint.classList.add('is-shown'); }, 1500);
    setTimeout(() => { startHintChase(); }, 1800);
    setTimeout(() => { const label = $('.orb-nav__hint-label'); if (label) label.classList.add('is-visible'); }, 3200);
  }

  function startHintChase() {
    const arrows = $$('.orb-nav__hint-arrow');
    if (!arrows.length) return;
    let step = 0;
    function clearAll() { arrows.forEach(a => a.classList.remove('is-lit', 'is-glow50', 'is-glow25')); }
    function setArrow(idx, cls) { if (arrows[idx]) { arrows[idx].classList.remove('is-lit', 'is-glow50', 'is-glow25'); if (cls) arrows[idx].classList.add(cls); } }
    function tick() {
      const phase = step % 3;
      clearAll();
      if (phase === 0) setArrow(2, 'is-lit');
      else if (phase === 1) { setArrow(1, 'is-lit'); setArrow(2, 'is-glow50'); }
      else { setArrow(0, 'is-lit'); setArrow(1, 'is-glow50'); setArrow(2, 'is-glow25'); }
      step++;
    }
    tick();
    hintChaseTimer = setInterval(tick, 450);
  }


  /* ========================================================================
     HERO PLATFORM DOTS
     ======================================================================== */
  function initHeroDots() {
    $$('.hero__platforms-dots span').forEach((dot, i) => {
      dot.style.setProperty('--i', i);
      dot.style.animationDelay = `${i * 0.3}s`;
    });
  }


  /* ========================================================================
     TIASTICA V5 — IMMERSIVE COCKPIT ENGINE (Drill-Down / Drill-Up)
     ======================================================================== */
  
  /* Onboarding guided database step-by-step */
  const ONBOARDING_DATA = {
    geo_territorial: {
      title: "Análisis Territorial",
      steps: [
        { t: "Carga de Cobertura Geográfica", d: "El sistema realiza una ingesta masiva de puntos de datos operativos en tiempo real de tu territorio.", s: 1 },
        { t: "Generación de Zonas de Calidad", d: "Los puntos se clusterizan dinámicamente y se trazan mapas de calor de cian mostrando concentraciones.", s: 2 },
        { t: "Trazado de Rutas Óptimas", d: "La IA genera el trazado de cobertura recomendada para maximizar la cobertura del territorio.", s: 3 }
      ]
    },
    geo_prediccion: {
      title: "Predicción Zonal",
      steps: [
        { t: "Historial de Tráfico", d: "Recopilación de patrones de demanda histórica por zona en las últimas 52 semanas.", s: 1 },
        { t: "Modelo Predictivo Activo", d: "Se procesan redes de machine learning para anticipar la demanda de mañana con 94% de precisión.", s: 2 },
        { t: "Asignación Recomendada", d: "El panel arroja las recomendaciones de flota necesarias para abastecer la demanda predicha.", s: 3 }
      ]
    },
    geo_realtime: {
      title: "Datos Tiempo Real",
      steps: [
        { t: "Sincronización GPS", d: "Conexión en vivo con el flujo GPS de las unidades de transporte de campo.", s: 1 },
        { t: "Detección de Eventos", d: "Alertas tempranas de paradas imprevistas o bloqueos de rutas en la zona de operaciones.", s: 2 },
        { t: "Panel de Tráfico GIS", d: "Visualización en vivo del tráfico y la densidad zonal para coordinadores GIS.", s: 3 }
      ]
    },
    geo_gis: {
      title: "Reportes GIS",
      steps: [
        { t: "Compilación Geoespacial", d: "Unificación de capas territoriales (zonas, heatmaps, rutas y puntos) en un reporte.", s: 1 },
        { t: "Exportación de Capas", d: "Generación automática del mapa listo para ser exportado en formatos estándar (GeoJSON, KML).", s: 2 },
        { t: "Dashboard GIS Corporativo", d: "Publicación interactiva del mapa en el Portal del Cliente para analistas GIS.", s: 3 }
      ]
    },
    // ERP
    erp_gps: {
      title: "GPS Tiempo Real",
      steps: [
        { t: "Ingesta GPS Activa", d: "Conexión continua con satélites GPS. Latencia del sensor reducida a 2 segundos.", s: 1 },
        { t: "Monitoreo del Chofer", d: "Cálculo en vivo de la velocidad y aceleración de la flota.", s: 2 },
        { t: "Alertas de Geocerca", d: "Notificación de desvíos de ruta o paradas no autorizadas al instante.", s: 3 }
      ]
    },
    erp_telemetria: {
      title: "Telemetría Activa",
      steps: [
        { t: "Lectura CAN Bus", d: "Lectura en tiempo real de temperatura del motor, RPM y estado del alternador.", s: 1 },
        { t: "Eco-Conducción", d: "Calificación automatizada de estilo de manejo (frenados bruscos, ralentí).", s: 2 },
        { t: "Control de Combustible", d: "Detección inmediata de descargas imprevistas o anomalías de consumo.", s: 3 }
      ]
    },
    erp_viajes: {
      title: "Gestión de Viajes",
      steps: [
        { t: "Despacho Automático", d: "Asignación de choferes y unidades basado en disponibilidad e historial.", s: 1 },
        { t: "Monitoreo en Ruta", d: "Seguimiento automático de hitos del viaje (Origen, Hito 1, Destino).", s: 2 },
        { t: "Cierre de Manifiesto", d: "Validación digital de finalización de ruta y horas de conducción.", s: 3 }
      ]
    },
    erp_costos: {
      title: "Control de Costos",
      steps: [
        { t: "Cálculo de Peajes y Diésel", d: "Cálculo automatizado de costos directos de la ruta seleccionada.", s: 1 },
        { t: "Cálculo de Margen Neto", d: "Gráfico financiero mostrando rentabilidad por viaje y rendimiento de unidad.", s: 2 },
        { t: "Reporte de Optimización", d: "La consola despliega el reporte de ahorros con un 35% de optimización alcanzada.", s: 3 }
      ]
    },
    // UM
    um_rutas: {
      title: "Rutas Inteligentes",
      steps: [
        { t: "Carga de Pedidos", d: "Ingesta automática de órdenes de despacho desde el ERP.", s: 1 },
        { t: "Secuenciación Óptima", d: "Reordenamiento algorítmico de paradas para minimizar distancia recorrida.", s: 2 },
        { t: "Despacho a Chofer", d: "Envío instantáneo de la secuencia de paradas a la aplicación móvil del chofer.", s: 3 }
      ]
    },
    um_evidencia: {
      title: "Evidencia Digital",
      steps: [
        { t: "Verificación de Destino", d: "Validación de geolocalización cuando el chofer se encuentra en la dirección correcta.", s: 1 },
        { t: "Firma y Captura Visual", d: "El cliente firma en la pantalla del celular y se adjunta una fotografía del paquete.", s: 2 },
        { t: "Cierre de Orden", d: "Sincronización en la nube con estado 'Entregado con Evidencia' sin papel.", s: 3 }
      ]
    },
    um_notificaciones: {
      title: "Alertas Automáticas",
      steps: [
        { t: "Programación de Alerta", d: "Configuración de notificaciones proactivas basadas en el avance del viaje.", s: 1 },
        { t: "Mensaje de WhatsApp", d: "Envío automático de WhatsApp al cliente con link de tracking en tiempo real.", s: 2 },
        { t: "Encuesta de Satisfacción", d: "WhatsApp de entrega que adjunta un botón de feedback rápido de 5 estrellas.", s: 3 }
      ]
    },
    um_despacho: {
      title: "Control Despacho",
      steps: [
        { t: "Panel de Monitoreo", d: "El coordinador visualiza la barra de progreso de todos los choferes.", s: 1 },
        { t: "Re-Asignación en Vivo", d: "Capacidad de reordenar o cancelar paradas en caliente ante imprevistos.", s: 2 },
        { t: "Consolidación Operativa", d: "Cierre del día con 98% de entregas exitosas a la primera visita.", s: 3 }
      ]
    },
    // IA
    ia_demanda: {
      title: "Predicción Demanda",
      steps: [
        { t: "Series Temporales", d: "Inicialización del modelo LSTM para procesar volumen de cargamentos históricos.", s: 1 },
        { t: "Entrenamiento de Pesos", d: "Ajuste fino de parámetros en tiempo real en la red neuronal.", s: 2 },
        { t: "Predicción de Demanda", d: "Generación de gráfico de pronóstico de carga para los siguientes 15 días.", s: 3 }
      ]
    },
    ia_rpa: {
      title: "Automatización RPA",
      steps: [
        { t: "Lanzador de Bot", d: "Monitoreo automático de bandejas de entrada para ingesta de órdenes de compra.", s: 1 },
        { t: "Extracción OCR", d: "El robot procesa PDFs de clientes y extrae datos de dirección y peso sin intervención.", s: 2 },
        { t: "Registro en ERP", d: "El bot registra la orden en TIASTICA ERP de forma inmediata.", s: 3 }
      ]
    },
    ia_dinamica: {
      title: "Modelado Dinámico",
      steps: [
        { t: "Ambiente Simulado", d: "Se modela la operación como un ecosistema dinámico de recompensas y penalizaciones.", s: 1 },
        { t: "Reinforcement Learning", d: "El algoritmo IA aprende las decisiones óptimas tras miles de iteraciones simuladas.", s: 2 },
        { t: "Decisión Ejecutiva", d: "Recomendaciones optimizadas en tiempo real ante colas de espera o retrasos en puertos.", s: 3 }
      ]
    },
    ia_anomalias: {
      title: "Anomalías y Alertas",
      steps: [
        { t: "Escaneo de Comportamiento", d: "Evaluación en vivo de las rutas y velocidades para detectar desviaciones estadísticas.", s: 1 },
        { t: "Glow de Alerta", d: "El sistema señala en color rojo un comportamiento sospechoso o potencial fraude.", s: 2 },
        { t: "Bloqueo Preventivo", d: "Inhabilitación de combustible o alertas al centro de control para auditoría inmediata.", s: 3 }
      ]
    },
    // BENEFICIOS
    ben_costos: {
      title: "Reducción de Costos",
      steps: [
        { t: "Análisis de Línea Base", d: "El sistema ingesta los costos operativos históricos de los últimos 12 meses.", s: 1 },
        { t: "Identificación de Fugas", d: "Detección automática de sobrecostos en combustible, mantenimiento y peajes.", s: 2 },
        { t: "Proyección de Ahorros", d: "Gráfico comparativo mostrando hasta 35% de reducción de costos operativos.", s: 3 }
      ]
    },
    ben_productividad: {
      title: "Productividad Operativa",
      steps: [
        { t: "Benchmark Inicial", d: "Medición de KPIs actuales: viajes/día, entregas/hora, tiempo de ciclo.", s: 1 },
        { t: "Optimización de Procesos", d: "Implementación de automatizaciones que eliminan tareas manuales repetitivas.", s: 2 },
        { t: "Salto Productivo", d: "Dashboard mostrando incremento del 40% en productividad por chofer.", s: 3 }
      ]
    },
    ben_seguridad: {
      title: "Seguridad y Cumplimiento",
      steps: [
        { t: "Monitoreo de Riesgos", d: "Sensores activos detectando frenados bruscos, aceleraciones y exceso de velocidad.", s: 1 },
        { t: "Alertas Tempranas", d: "Notificaciones preventivas que reducen accidentes en 60%.", s: 2 },
        { t: "Certificación Normativa", d: "Reportes automáticos para cumplimiento de regulaciones de transporte.", s: 3 }
      ]
    },
    ben_escala: {
      title: "Escalabilidad Comprobada",
      steps: [
        { t: "Crecimiento Orgánico", d: "Arquitectura cloud que permite escalar de 10 a 1000 unidades sin cambios.", s: 1 },
        { t: "Multi-Cliente Nativo", d: "Gestión simultánea de múltiples cuentas y operaciones independientes.", s: 2 },
        { t: "Expansión Regional", d: "Casos de éxito: clientes que expandieron operación a 5 países usando TIASTICA.", s: 3 }
      ]
    },
    // PORTAL CLIENTE
    portal_dashboard: {
      title: "Dashboard Ejecutivo",
      steps: [
        { t: "Vista 360° de Operación", d: "Panel unificado con KPIs críticos: flota activa, entregas, incidencias.", s: 1 },
        { t: "Filtros Inteligentes", d: "Segmentación por fecha, región, cliente o tipo de unidad en tiempo real.", s: 2 },
        { t: "Exportación de Reportes", d: "Generación de PDF/Excel personalizados para juntas directivas.", s: 3 }
      ]
    },
    portal_reportes: {
      title: "Reportes Automatizados",
      steps: [
        { t: "Programación de Envíos", d: "Configuración de reportes diarios/semanales/mensuales automáticos por email.", s: 1 },
        { t: "Plantillas Personalizables", d: "Selección de métricas específicas por departamento (Operaciones, Finanzas, etc).", s: 2 },
        { t: "Historial Accesible", d: "Archivo centralizado de todos los reportes generados con búsqueda inteligente.", s: 3 }
      ]
    },
    portal_tracking: {
      title: "Tracking en Vivo",
      steps: [
        { t: "Mapa Interactivo", d: "Visualización GPS de todas las unidades en movimiento con actualización cada 3 segundos.", s: 1 },
        { t: "Búsqueda de Unidades", d: "Localización instantánea por placa, chofer o número de orden.", s: 2 },
        { t: "Línea de Tiempo", d: "Replay histórico de rutas completas con eventos marcados (paradas, incidencias).", s: 3 }
      ]
    },
    portal_config: {
      title: "Configuración y Permisos",
      steps: [
        { t: "Gestión de Usuarios", d: "Creación de cuentas con roles diferenciados (Admin, Operador, Viewer).", s: 1 },
        { t: "Geocercas Personalizadas", d: "Dibujo de zonas de interés para alertas de entrada/salida automáticas.", s: 2 },
        { t: "Integraciones API", d: "Conexión con sistemas externos (ERP, WMS, TMS) mediante webhooks configurables.", s: 3 }
      ]
    }
  };

  const PLATFORMS_DECK = ['geo', 'erp', 'um', 'ia', 'ben', 'portal'];
  const PLATFORMS_MAPPING = {
    'geointeligencia': 'geo',
    'geo': 'geo',
    'erp': 'erp',
    'ultima-milla': 'um',
    'um': 'um',
    'ia': 'ia',
    'beneficios': 'ben',
    'ben': 'ben',
    'portal': 'portal',
    'portal-cliente': 'portal'
  };
  const PLATFORMS_TITLES = {
    'geo': 'Geointeligencia',
    'erp': 'ERP Transporte',
    'um': 'Última Milla',
    'ia': 'IA Logística',
    'ben': 'Beneficios',
    'portal': 'Portal Cliente'
  };

  let activePlatformIdx = 0;
  let activeFeatureId = null;
  let activeStepIdx = 0;
  let cockpitStarsAnim = null;
  let simulatorTimer = null;
  let cockpitIaCanvasAnim = null;

  function initCockpit() {
    const overlay = $('#cockpitOverlay');
    if (!overlay) return;

    /* hud buttons */
    const exitBtn = $('#cockpitExitBtn');
    exitBtn.addEventListener('click', drillUpToCosmos);

    /* platform sequential navigation */
    const prevBtn = $('#deckPrevBtn');
    const nextBtn = $('#deckNextBtn');
    prevBtn.addEventListener('click', () => navigatePlatform(-1));
    nextBtn.addEventListener('click', () => navigatePlatform(1));

    /* stepper controls */
    const stepperPrevBtn = $('#stepperPrevBtn');
    const stepperNextBtn = $('#stepperNextBtn');
    stepperPrevBtn.addEventListener('click', () => navigateStep(-1));
    stepperNextBtn.addEventListener('click', () => navigateStep(1));

    const stepperExitBtn = $('#stepperExitBtn');
    stepperExitBtn.addEventListener('click', drillUpToPlatform);

    /* cosmic background stars init */
    initCockpitStars();

    /* Global opening hooks */
    window.openCockpit = function(platformId) {
      console.log('[Cockpit] Opening for platform:', platformId);
      const mapped = PLATFORMS_MAPPING[platformId] || 'geo';
      console.log('[Cockpit] Mapped to:', mapped);
      activePlatformIdx = PLATFORMS_DECK.indexOf(mapped);
      console.log('[Cockpit] Active index:', activePlatformIdx, 'PLATFORMS_DECK:', PLATFORMS_DECK);
      
      // 1. AGREGAR CLASE AL BODY PARA COEXISTENCIA CON ORB (CSS maneja la posición)
      document.body.classList.add('cockpit-active');
      console.log('[Cockpit] Body class cockpit-active added');
      
      // 2. REMOVER HIDDEN Y AÑADIR CLASES DE ACTIVACION
      overlay.removeAttribute('hidden');
      console.log('[Cockpit] Overlay hidden attr removed');

      requestAnimationFrame(() => {
        overlay.classList.add('is-active');
        overlay.setAttribute('aria-hidden', 'false');
        console.log('[Cockpit] Overlay is-active class added, aria-hidden=false');

        document.body.style.overflow = 'hidden';

        /* Bind feature card clicks AFTER overlay is visible */
        $$('.btn-console-card').forEach(btn => {
          btn.removeEventListener('click', handleFeatureClick);
          btn.addEventListener('click', handleFeatureClick);
        });

        updateCockpitView();
        console.log('[Cockpit] Open sequence completed');
      });
    };
    
    function handleFeatureClick() {
      const featureId = this.dataset.feature;
      drillDownFeature(featureId);
    }
  }

  /* Return from Cockpit to main Living Orb space */
  function drillUpToCosmos() {
    const overlay = $('#cockpitOverlay');
    if (!overlay) return;
    
    // REMOVER CLASE DEL BODY PARA RESTAURAR ORB
    document.body.classList.remove('cockpit-active');
    console.log('[Cockpit] Body class cockpit-active removed');
    
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
    
    stopSimulatorAnimations();
    
    setTimeout(() => {
      overlay.setAttribute('hidden', '');
      /* Scroll to corresponding section on main page */
      const platId = PLATFORMS_DECK[activePlatformIdx];
      const sections = { geo: 'geointeligencia', erp: 'erp', um: 'ultima-milla', ia: 'ia' };
      const t = $(`#${sections[platId]}`);
      if (t) t.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 450);
  }

  /* Shift cockpit view to another platform console */
  function navigatePlatform(dir) {
    activePlatformIdx = (activePlatformIdx + dir + PLATFORMS_DECK.length) % PLATFORMS_DECK.length;
    updateCockpitView();
  }

  /* Sync entire Level 1 dashboard based on active index */
  function updateCockpitView() {
    /* Reset any active Level 2 drill-downs */
    drillUpToPlatform();

    const activePlat = PLATFORMS_DECK[activePlatformIdx];

    /* HUD Updates */
    const breadcrumb = $('#hudBreadcrumb');
    breadcrumb.textContent = `Cosmos > ${PLATFORMS_TITLES[activePlat]}`;
    
    const coordsVal = $('#hudCoordsVal');
    const coordsCodes = { geo: 'GEO-01', erp: 'ERP-02', um: 'UM-03', ia: 'IA-04' };
    coordsVal.textContent = coordsCodes[activePlat];

    /* Screen glow class */
    const overlay = $('#cockpitOverlay');
    overlay.className = 'cockpit-overlay is-active'; // reset
    overlay.classList.add(`cockpit-overlay--${activePlat}`);

    /* Info panels left */
    const panelIds = { geo: 'platformInfoGeo', erp: 'platformInfoErp', um: 'platformInfoUm', ia: 'platformInfoIa', ben: 'platformInfoBen', portal: 'platformInfoPortal' };
    Object.keys(panelIds).forEach(k => {
      const el = $(`#${panelIds[k]}`);
      if (el) el.style.display = (k === activePlat) ? 'block' : 'none';
    });

    /* Deck Indicators text */
    const indicatorVal = $('#deckIndicatorVal');
    indicatorVal.textContent = `Plataforma ${activePlatformIdx + 1} de 6`;

    /* Central Visual Simulators */
    const simIds = { geo: 'simGeo', erp: 'simErp', um: 'simUm', ia: 'simIa', ben: 'simBen', portal: 'simPortal' };
    Object.keys(simIds).forEach(k => {
      const el = $(`#${simIds[k]}`);
      if (el) el.style.display = (k === activePlat) ? 'flex' : 'none';
    });

    /* Bottom card consoles */
    const consoleIds = { geo: 'consoleDeckGeo', erp: 'consoleDeckErp', um: 'consoleDeckUm', ia: 'consoleDeckIa', ben: 'consoleDeckBen', portal: 'consoleDeckPortal' };
    Object.keys(consoleIds).forEach(k => {
      const el = $(`#${consoleIds[k]}`);
      if (el) el.style.display = (k === activePlat) ? 'grid' : 'none';
    });

    /* ERP Modules Preview - bind click events when ERP platform is shown */
    if (activePlat === 'erp') {
      initERPModulesPreview();
    }

    /* Trigger static / base simulation state */
    stopSimulatorAnimations();
    setupSimulatorBase(activePlat);
    
    /* DEBUG: Final verification */
    console.log('[Cockpit] Final check - Overlay display:', overlay.style.display);
    console.log('[Cockpit] Final check - Overlay computed:', window.getComputedStyle(overlay).display);
    console.log('[Cockpit] Final check - Overlay hidden attr:', overlay.hasAttribute('hidden'));
    console.log('[Cockpit] Final check - Active platform:', activePlat);
    console.log('[Cockpit] Final check - simErp display:', $('#simErp') ? $('#simErp').style.display : 'NOT FOUND');
  }

  /* Initialize ERP Modules Preview interactivity */
  function initERPModulesPreview() {
    const modulesContainer = $('#erpModulesPreview');
    if (!modulesContainer) return;

    // Remove old listeners by cloning
    const newContainer = modulesContainer.cloneNode(true);
    modulesContainer.parentNode.replaceChild(newContainer, modulesContainer);

    // Add click handlers to each module mini-card
    $$('#erpModulesPreview .erp-module-mini').forEach(card => {
      card.addEventListener('click', function() {
        const moduleId = this.dataset.module;
        
        // Toggle active state
        $$('#erpModulesPreview .erp-module-mini').forEach(c => c.classList.remove('active'));
        this.classList.add('active');

        // Update simulator based on selected module
        updateERPSimulatorForModule(moduleId);
      });
    });
  }

  /* Update ERP simulator display based on selected module */
  function updateERPSimulatorForModule(moduleId) {
    const moduleInfo = ERP_MODULE_DATA[moduleId];
    if (!moduleInfo) return;

    // Stop any running animations
    stopSimulatorAnimations();

    // Update simulator display with module-specific content
    const simContainer = $('#simErp');
    if (!simContainer) return;

    // Create module detail overlay in simulator
    let simContent = simContainer.querySelector('.module-sim-detail');
    if (!simContent) {
      simContent = document.createElement('div');
      simContent.className = 'module-sim-detail';
      simContent.style.cssText = 'position:absolute;inset:0;background:rgba(16,185,129,0.08);backdrop-filter:blur(8px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;z-index:10;border-radius:12px;animation:fadeIn 0.3s;';
      simContainer.style.position = 'relative';
      simContainer.appendChild(simContent);
    }

    simContent.innerHTML = `
      <div style="text-align:center;max-width:320px;">
        <div style="font-size:42px;margin-bottom:1rem;">${moduleInfo.icon}</div>
        <h3 style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;color:var(--color-erp);margin-bottom:0.75rem;">${moduleInfo.title}</h3>
        <ul style="list-style:none;text-align:left;display:inline-block;">
          ${moduleInfo.items.map(item => `<li style="font-size:13px;color:rgba(255,255,255,0.85);padding:6px 0;display:flex;align-items:center;gap:8px;"><span style="color:var(--color-erp);font-size:10px;">✦</span>${item}</li>`).join('')}
        </ul>
        <button onclick="this.closest('.module-sim-detail').remove()" style="margin-top:1.5rem;background:var(--color-erp);color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:600;font-size:13px;cursor:pointer;transition:all 0.2s;">Cerrar</button>
      </div>
    `;
  }

  /* Level 2: Drill Down into feature stepper onboarding */
  function drillDownFeature(featureId) {
    if (!ONBOARDING_DATA[featureId]) return;

    activeFeatureId = featureId;
    activeStepIdx = 0;

    const overlay = $('#cockpitOverlay');
    overlay.classList.add('state-drilled-down');

    const prompt = $('#drilldownPrompt');
    const stepper = $('#cockpitStepper');
    prompt.style.display = 'none';
    stepper.style.display = 'flex';

    /* Set stepper breadcrumb title */
    const stepperFeatureTitle = $('#stepperFeatureTitle');
    stepperFeatureTitle.textContent = `FUNCIONALIDAD: ${ONBOARDING_DATA[featureId].title}`;

    updateStepView();
  }

  /* Exit Level 2 stepper, return to Level 1 Console cockpit */
  function drillUpToPlatform() {
    const overlay = $('#cockpitOverlay');
    overlay.classList.remove('state-drilled-down');

    const prompt = $('#drilldownPrompt');
    const stepper = $('#cockpitStepper');
    if (prompt) prompt.style.display = 'flex';
    if (stepper) stepper.style.display = 'none';

    activeFeatureId = null;

    /* Reset simulation graphics to base state */
    const activePlat = PLATFORMS_DECK[activePlatformIdx];
    stopSimulatorAnimations();
    setupSimulatorBase(activePlat);
  }

  /* Shift step anterior/siguiente inside Level 2 */
  function navigateStep(dir) {
    if (!activeFeatureId) return;
    const totalSteps = ONBOARDING_DATA[activeFeatureId].steps.length;
    activeStepIdx = (activeStepIdx + dir + totalSteps) % totalSteps;
    updateStepView();
  }

  /* Render step texts, glowing indicator dots, and update active simulator */
  function updateStepView() {
    if (!activeFeatureId) return;
    const data = ONBOARDING_DATA[activeFeatureId];
    const step = data.steps[activeStepIdx];

    const stepLabel = $('#stepperStepIndicator');
    const stepTitle = $('#stepperStepTitle');
    const stepDesc = $('#stepperStepDesc');

    stepLabel.textContent = `PASO ${activeStepIdx + 1} DE 3`;
    stepTitle.textContent = step.t;
    stepDesc.textContent = step.d;

    /* Update step progress dots */
    $$('.stepper-dot').forEach((dot, i) => {
      if (i === activeStepIdx) dot.classList.add('stepper-dot--active');
      else dot.classList.remove('stepper-dot--active');
    });

    /* Sync simulator visualization in real time based on active step */
    syncSimulatorToStep(PLATFORMS_DECK[activePlatformIdx], activeFeatureId, activeStepIdx);
  }


  /* ========================================================================
     REAL-TIME SIMULATION & ANIMATION CORE
     ======================================================================== */
  
  function stopSimulatorAnimations() {
    if (simulatorTimer) { clearInterval(simulatorTimer); simulatorTimer = null; }
    if (cockpitIaCanvasAnim) { cancelAnimationFrame(cockpitIaCanvasAnim); cockpitIaCanvasAnim = null; }
  }

  /* Set visual simulators to default idle state */
  function setupSimulatorBase(platform) {
    if (platform === 'geo') {
      $('#geoSimPoints').setAttribute('opacity', '1');
      $('#geoSimHeatmaps').setAttribute('opacity', '0');
      $('#geoSimOptRoute').setAttribute('opacity', '0');
    }
    else if (platform === 'erp') {
      $('#erpSimSavings').style.opacity = '0';
      $('#erpSimSavings').style.transform = 'scale(0.9)';
      $$('#erpSimChart .sim-bar').forEach(b => {
        b.style.height = '0%';
        b.classList.remove('is-active');
      });
      $('#erpSimVal1').textContent = '1,200';
      $('#erpSimVal2').textContent = '0 km/h';
    }
    else if (platform === 'um') {
      $$('.sim-sm-item').forEach(el => el.classList.remove('is-done'));
      $('#umSimMap').style.opacity = '0';
      $('#umSimPath').style.opacity = '0';
      $('#umSimTruck').style.opacity = '0';
      $('#umSimEta').style.display = 'none';
    }
    else if (platform === 'ia') {
      $('#iaSimReport').style.opacity = '0';
      $('#iaSimReport').style.transform = 'translate(-50%, 10px)';
      initIaCockpitCanvas(0.1, false); // slow connection base
    }
    else if (platform === 'ben') {
      $$('#benSimChart .sim-bar').forEach(b => {
        b.style.height = '0%';
        b.classList.remove('is-active');
      });
    }
    else if (platform === 'portal') {
      $$('.sim-portal-widget').forEach(w => {
        w.style.opacity = '0';
        w.style.transform = 'translateY(10px)';
        w.classList.remove('pulse-active');
      });
    }
  }

  /* Updates visuals inside the screen frame in real time */
  function syncSimulatorToStep(platform, feature, stepIdx) {
    stopSimulatorAnimations();

    if (platform === 'geo') {
      /* GEOINTELIGENCIA STEP CONTROL */
      const pts = $('#geoSimPoints');
      const heat = $('#geoSimHeatmaps');
      const opt = $('#geoSimOptRoute');

      if (stepIdx === 0) {
        pts.setAttribute('opacity', '1');
        heat.setAttribute('opacity', '0');
        opt.setAttribute('opacity', '0');
      } else if (stepIdx === 1) {
        pts.setAttribute('opacity', '1');
        heat.setAttribute('opacity', '1');
        opt.setAttribute('opacity', '0');
      } else {
        pts.setAttribute('opacity', '1');
        heat.setAttribute('opacity', '1');
        opt.setAttribute('opacity', '1');
      }
    }
    else if (platform === 'erp') {
      /* ERP TRANSPORTE STEP CONTROL */
      const svgs = $('#erpSimSavings');
      const chartBars = $$('#erpSimChart .sim-bar');
      const v1 = $('#erpSimVal1');
      const v2 = $('#erpSimVal2');

      if (stepIdx === 0) {
        /* Step 1: Raw telemetry fluctuations */
        svgs.style.opacity = '0';
        svgs.style.transform = 'scale(0.9)';
        chartBars.forEach(b => { b.style.height = '0%'; b.classList.remove('is-active'); });
        
        simulatorTimer = setInterval(() => {
          v1.textContent = Math.round(2300 + Math.random() * 300).toLocaleString();
          v2.textContent = Math.round(75 + Math.random() * 10) + ' km/h';
        }, 300);
      } 
      else if (stepIdx === 1) {
        /* Step 2: Bar charts active heights */
        svgs.style.opacity = '0';
        svgs.style.transform = 'scale(0.9)';
        v1.textContent = '2,560';
        v2.textContent = '84 km/h';
        
        chartBars.forEach((b, idx) => {
          b.classList.add('is-active');
          const finalHeights = ['45%', '70%', '82%', '98%', '88%', '76%'];
          b.style.height = finalHeights[idx] || '50%';
        });
      } 
      else {
        /* Step 3: Savings report expands */
        chartBars.forEach((b, idx) => {
          b.classList.add('is-active');
          const finalHeights = ['45%', '70%', '82%', '98%', '88%', '76%'];
          b.style.height = finalHeights[idx] || '50%';
        });
        v1.textContent = '2,450';
        v2.textContent = '82 km/h';
        
        svgs.style.opacity = '1';
        svgs.style.transform = 'scale(1)';
      }
    }
    else if (platform === 'um') {
      /* ÚLTIMA MILLA STEP CONTROL */
      const listItems = $$('.sim-sm-item');
      const smMap = $('#umSimMap');
      const smPath = $('#umSimPath');
      const smTruck = $('#umSimTruck');
      const smEta = $('#umSimEta');

      if (stepIdx === 0) {
        /* Step 1: deliveries list queue loaded */
        listItems.forEach(el => el.classList.remove('is-done'));
        smMap.style.opacity = '0';
        smPath.style.opacity = '0';
        smTruck.style.opacity = '0';
        smEta.style.display = 'none';
      } 
      else if (stepIdx === 1) {
        /* Step 2: Stops sequenced and done checked */
        listItems.forEach(el => el.classList.add('is-done'));
        smMap.style.opacity = '0';
        smPath.style.opacity = '0';
        smTruck.style.opacity = '0';
        smEta.style.display = 'none';
      } 
      else {
        /* Step 3: Truck active movement on path */
        listItems.forEach(el => el.classList.add('is-done'));
        smMap.style.opacity = '1';
        smPath.style.opacity = '1';
        smTruck.style.opacity = '1';
        smEta.style.display = 'block';

        /* Animate truck movement along SVG coords */
        let posIndex = 0;
        const coords = [
          {cx: 20, cy: 30},
          {cx: 50, cy: 30},
          {cx: 80, cy: 30},
          {cx: 80, cy: 50},
          {cx: 80, cy: 70},
          {cx: 110, cy: 70},
          {cx: 140, cy: 70}
        ];
        
        smTruck.setAttribute('cx', coords[0].cx);
        smTruck.setAttribute('cy', coords[0].cy);

        simulatorTimer = setInterval(() => {
          posIndex = (posIndex + 1) % coords.length;
          smTruck.setAttribute('cx', coords[posIndex].cx);
          smTruck.setAttribute('cy', coords[posIndex].cy);
        }, 1100);
      }
    }
    else if (platform === 'ia') {
      /* IA LOGÍSTICA STEP CONTROL */
      const rep = $('#iaSimReport');

      if (stepIdx === 0) {
        rep.style.opacity = '0';
        rep.style.transform = 'translate(-50%, 10px)';
        initIaCockpitCanvas(0.08, false); // slow
      }
      else if (stepIdx === 1) {
        rep.style.opacity = '0';
        rep.style.transform = 'translate(-50%, 10px)';
        initIaCockpitCanvas(0.24, true); // fast pulses
      }
      else {
        initIaCockpitCanvas(0.12, true);
        rep.style.opacity = '1';
        rep.style.transform = 'translate(-50%, 0)';
      }
    }
    else if (platform === 'ben') {
      /* BENEFICIOS COMPROBADOS STEP CONTROL */
      const chartBars = $$('#benSimChart .sim-bar');
      
      if (stepIdx === 0) {
        /* Step 1: Initial state - bars at zero */
        chartBars.forEach(b => { b.style.height = '0%'; b.classList.remove('is-active'); });
      } 
      else if (stepIdx === 1) {
        /* Step 2: Bars animate to mid-height */
        chartBars.forEach((b, idx) => {
          b.classList.add('is-active');
          const midHeights = ['20%', '40%', '30%', '55%', '70%', '50%'];
          b.style.height = midHeights[idx] || '40%';
        });
      } 
      else {
        /* Step 3: Full metrics display */
        chartBars.forEach((b, idx) => {
          b.classList.add('is-active');
          const finalHeights = ['35%', '60%', '45%', '80%', '95%', '70%'];
          b.style.height = finalHeights[idx] || '60%';
        });
      }
    }
    else if (platform === 'portal') {
      /* PORTAL CLIENTE STEP CONTROL */
      const widgets = $$('.sim-portal-widget');
      
      if (stepIdx === 0) {
        /* Step 1: Dashboard hidden */
        widgets.forEach(w => { w.style.opacity = '0'; w.style.transform = 'translateY(10px)'; });
      } 
      else if (stepIdx === 1) {
        /* Step 2: Widgets fade in sequentially */
        widgets.forEach((w, idx) => {
          setTimeout(() => {
            w.style.opacity = '1';
            w.style.transform = 'translateY(0)';
          }, idx * 150);
        });
      } 
      else {
        /* Step 3: All widgets active with data pulse */
        widgets.forEach(w => { 
          w.style.opacity = '1'; 
          w.style.transform = 'translateY(0)';
          w.classList.add('pulse-active');
        });
      }
    }
  }


  /* ========================================================================
     IA COCKPIT NEURAL NETWORK RENDERING
     ======================================================================== */
  function initIaCockpitCanvas(speedCoeff, intenseGlow) {
    const canvas = $('#cockpitIaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const layers = [4, 5, 5, 4, 3];
    const nodes = [];
    const layerXs = layers.map((_, li) => (li / (layers.length - 1)) * (W - 80) + 40);
    layers.forEach((count, li) => {
      for (let ni = 0; ni < count; ni++) {
        const y = (ni / (count - 1 || 1)) * (H - 80) + 40;
        nodes.push({ x: layerXs[li], y, layer: li, active: Math.random(), phase: Math.random() * Math.PI * 2 });
      }
    });

    let t = 0;
    function draw() {
      t += speedCoeff;
      ctx.clearRect(0, 0, W, H);

      const layerNodes = layers.map((_, li) => nodes.filter(n => n.layer === li));
      layerNodes.forEach((lNodes, li) => {
        if (li >= layerNodes.length - 1) return;
        lNodes.forEach(a => {
          layerNodes[li + 1].forEach(b => {
            const pulse = (Math.sin(t * 1.5 + a.phase + b.phase) + 1) / 2;
            const alpha = 0.04 + pulse * (intenseGlow ? 0.32 : 0.12);
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx.lineWidth = 0.6 + pulse * (intenseGlow ? 1.2 : 0.4);
            ctx.stroke();
          });
        });
      });

      nodes.forEach(n => {
        const pulse = (Math.sin(t * 2 + n.phase) + 1) / 2;
        const r = 3 + pulse * 2;
        const alpha = 0.4 + pulse * 0.6;

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * (intenseGlow ? 4 : 2.5));
        grad.addColorStop(0, `rgba(139,92,246,${alpha * (intenseGlow ? 0.7 : 0.4)})`);
        grad.addColorStop(1, 'rgba(139,92,246,0)');
        ctx.beginPath(); ctx.arc(n.x, n.y, r * (intenseGlow ? 4 : 2.5), 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = intenseGlow ? `rgba(224,204,254,${alpha})` : `rgba(196,181,253,${alpha})`;
        ctx.fill();
      });

      cockpitIaCanvasAnim = requestAnimationFrame(draw);
    }
    draw();
  }


  /* ========================================================================
     COCKPIT STARFIELD COSMIC BACKGROUND
     ======================================================================== */
  function initCockpitStars() {
    const canvas = $('#cockpitStarfield');
    if (!canvas || noMotion) return;
    const ctx = canvas.getContext('2d');
    let stars = [];

    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    
    function spawn() {
      stars = [];
      const count = 120;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 0.95 + 0.2,
          speed: Math.random() * 0.05 + 0.015,
          opacity: Math.random() * 0.5 + 0.2,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    let t = 0;
    function draw() {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) s.y = 0;
        
        const glow = s.opacity + Math.sin(t * 0.5 + s.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(glow, 0.15)})`;
        ctx.fill();
      });
      
      cockpitStarsAnim = requestAnimationFrame(draw);
    }

    resize(); spawn(); draw();
    addEventListener('resize', () => { resize(); spawn(); });
  }


  /* ========================================================================
     INIT
     ======================================================================== */
  function init() {
    initParticles();
    initOrb();
    initOrbBreath();
    initAutoDock();
    initScrollAnimations();
    initStatCounters();
    initIANetwork();
    initBenefitBars();
    initPopup();
    initForms();
    initHintChase();
    initHeroDots();
    initCockpit(); // initialize premium cockpit in V5
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init);
  else init();

})();
