// ==========================================
// 1. GERENCIAMENTO DO MENU MOBILE
// ==========================================
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobileMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('is-open');
    menu.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });
})();

// ==========================================
// 2. ENGINE DE PARTÍCULAS WEBGL (ORBITAGRO)
// ==========================================
(() => {
  const canvas = document.getElementById('particleCanvas');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false
  });

  if (!gl) {
    console.warn('WebGL não está disponível neste navegador.');
    return;
  }

  const config = {
    maxDesktop: 90000, 
    maxMobile: 45000,
    sampleDesktop: 2,
    sampleMobile: 2,
    pointDesktop: 1.82,
    pointMobile: 2.05,
    returnIdle: 0.024,
    returnActive: 0.0026,
    friction: 0.953,
    maxSpeed: 0.067,
    mouseFollow: 0.00055,
    mouseFollowRadiusDesktop: 185,
    mouseFollowRadiusMobile: 128,
    pathFollow: 0.0068,
    pathTargetPull: 0.038,
    pathEdgePull: 0.0085,
    pathOrbit: 0.0024,
    pathTubeDesktop: 178,
    pathTubeMobile: 122,
    pathEdgeDesktop: 64,
    pathEdgeMobile: 42,
    flow: 0.00172,
    headPush: 0.0048,
    noise: 0.00013,
    settleDelay: 190,
    releaseDelay: 520,
    scrollEase: 0.045
  };

  const state = {
    width: 1,
    height: 1,
    dpr: 1,
    mobile: false,
    count: 0,
    positions: null,
    textHomes: null,
    fieldHomes: null,
    sunHomes: null,
    currentHomes: null,
    velocities: null,
    alphas: null,
    seeds: null,
    trail: [],
    fieldTarget: 0,
    fieldProgress: 0,
    sunTarget: 0,
    sunProgress: 0,
    rainTarget: 0,
    rainProgress: 0,
    pointer: { active: false, px: 0, py: 0, lastX: 0, lastY: 0, lastTime: 0 },
    lastMove: 0
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const smoothstep01 = t => t * t * (3 - 2 * t);
  const pxToClipX = px => (px / state.width) * 2 - 1;
  const pxToClipY = py => 1 - (py / state.height) * 2;
  const clipToPxX = x => (x + 1) * 0.5 * state.width;
  const clipToPxY = y => (1 - y) * 0.5 * state.height;

  const computeRainMix = () => state.rainProgress;

  const vertexSource = `
    attribute vec3 aPosition;
    attribute float aAlpha;
    attribute float aSeed;
    uniform float uPointSize;
    uniform float uDpr;
    uniform float uFieldMix;
    uniform float uSunMix;
    varying float vAlpha;
    varying float vSeed;

    void main() {
      vAlpha = aAlpha;
      vSeed = aSeed;
      gl_Position = vec4(aPosition, 1.0);
      float maxMix = max(uFieldMix, uSunMix);
      float depth = 1.0 + aPosition.z * 0.22;
      gl_PointSize = uPointSize * uDpr * depth * (1.0 + maxMix * 0.16);
    }
  `;

  const fragmentSource = `
    precision highp float;
    varying float vAlpha;
    varying float vSeed;
    uniform highp float uFieldMix;
    uniform highp float uSunMix;
    uniform highp float uRainMix;

    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float dotMask = smoothstep(0.48, 0.075, d);
      float core = smoothstep(0.18, 0.0, d) * 0.22;
      float rim = smoothstep(0.50, 0.26, d) * 0.16;
      float shimmer = 0.92 + sin(vSeed * 44.0) * 0.08;
      float alpha = (dotMask + core + rim) * vAlpha * shimmer;

      vec3 warmWhite = vec3(0.965, 0.955, 0.925);
      vec3 earthSeed = vec3(0.58, 0.34, 0.18);
      vec3 sunColor = vec3(1.0, 0.65, 0.12); 
      vec3 rainColor = vec3(0.72, 0.82, 0.98);

      vec3 color = mix(warmWhite, earthSeed, uFieldMix);
      color = mix(color, sunColor, uSunMix);
      color = mix(color, rainColor, uRainMix);

      gl_FragColor = vec4(color, alpha);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  function createProgram() {
    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }
    return program;
  }

  const program = createProgram();
  const locations = {
    position: gl.getAttribLocation(program, 'aPosition'),
    alpha: gl.getAttribLocation(program, 'aAlpha'),
    seed: gl.getAttribLocation(program, 'aSeed'),
    pointSize: gl.getUniformLocation(program, 'uPointSize'),
    dpr: gl.getUniformLocation(program, 'uDpr'),
    fieldMix: gl.getUniformLocation(program, 'uFieldMix'),
    sunMix: gl.getUniformLocation(program, 'uSunMix'),
    rainMix: gl.getUniformLocation(program, 'uRainMix')
  };

  const positionBuffer = gl.createBuffer();
  const alphaBuffer = gl.createBuffer();
  const seedBuffer = gl.createBuffer();

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function readMaskCandidates(mask, sample) {
    const ctx = mask.getContext('2d', { willReadFrequently: true });
    const data = ctx.getImageData(0, 0, mask.width, mask.height).data;
    const candidates = [];

    for (let y = 0; y < mask.height; y += sample) {
      for (let x = 0; x < mask.width; x += sample) {
        const alpha = data[(y * mask.width + x) * 4 + 3];
        if (alpha > 24) candidates.push([x, y, alpha / 255.0]);
      }
    }
    return shuffle(candidates);
  }

  function createTextMask() {
    const mask = document.createElement('canvas');
    mask.width = Math.max(360, Math.floor(state.width));
    mask.height = Math.max(360, Math.floor(state.height));
    const ctx = mask.getContext('2d', { willReadFrequently: true });
    const mobile = state.mobile;

    ctx.clearRect(0, 0, mask.width, mask.height);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const fontSize = clamp(mask.width * (mobile ? 0.125 : 0.095), 44, mobile ? 82 : 118);
    const lineHeight = fontSize * 0.96;
    const cx = mask.width / 2;
    const cy = mask.height / 2;
    const lines = ['OrbitAgro', 'Copilot'];
    ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.lineWidth = Math.max(1.3, fontSize * 0.022);

    lines.forEach((line, index) => {
      const y = cy + (index - 0.5) * lineHeight;
      ctx.strokeText(line, cx, y);
      ctx.fillText(line, cx, y);
    });
    return mask;
  }

  function createFieldMask() {
    const mask = document.createElement('canvas');
    mask.width = Math.max(360, Math.floor(state.width));
    mask.height = Math.max(360, Math.floor(state.height));
    const ctx = mask.getContext('2d', { willReadFrequently: true });
    const w = mask.width;
    const h = mask.height;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rows = state.mobile ? 10 : 15;
    const horizonY = h * 0.62;
    const baseY = h * 0.96;
    const centerX = w * 0.5;

    for (let r = 0; r < rows; r++) {
      const t = r / Math.max(1, rows - 1);
      const y = horizonY + Math.pow(t, 1.72) * (baseY - horizonY);
      const spread = w * (0.10 + t * 0.58);
      const curvePower = h * (0.018 + t * 0.035);

      ctx.globalAlpha = 0.18 + t * 0.74;
      ctx.lineWidth = Math.max(1.1, 1.2 + t * 3.6);
      ctx.beginPath();
      ctx.moveTo(centerX - spread, y);
      ctx.bezierCurveTo(
        centerX - spread * 0.48,
        y - curvePower,
        centerX + spread * 0.48,
        y + curvePower * 0.55,
        centerX + spread,
        y
      );
      ctx.stroke();

      const seeds = Math.floor(42 + t * 128);
      for (let p = 0; p < seeds; p++) {
        const u = p / Math.max(1, seeds - 1);
        const wave = Math.sin(u * Math.PI * 2.0 + r * 0.62) * curvePower * 0.42;
        const jitterX = (Math.random() - 0.5) * (2.5 + t * 7.0);
        const jitterY = (Math.random() - 0.5) * (1.5 + t * 5.0);
        const x = centerX - spread + u * spread * 2.0 + jitterX;
        const py = y + wave + jitterY;
        const size = 1.1 + t * 3.2;

        ctx.globalAlpha = 0.26 + t * 0.68;
        ctx.beginPath();
        ctx.arc(x, py, size, 0, Math.PI * 2.0);
        ctx.fill();

        if (t > 0.28 && p % 3 === 0) {
          ctx.globalAlpha = 0.18 + t * 0.45;
          ctx.lineWidth = Math.max(0.8, size * 0.34);
          ctx.beginPath();
          ctx.moveTo(x, py);
          ctx.quadraticCurveTo(x - size * 1.3, py - size * 1.8, x - size * 2.25, py - size * 0.55);
          ctx.moveTo(x, py);
          ctx.quadraticCurveTo(x + size * 1.3, py - size * 1.8, x + size * 2.25, py - size * 0.55);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 0.28;
    for (let i = -5; i <= 5; i++) {
      const startX = centerX + i * w * 0.105;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(startX, h * 0.985);
      ctx.quadraticCurveTo(centerX + i * w * 0.035, h * 0.78, centerX, horizonY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    return mask;
  }

  // --- MÁSCARA DO SOL (SOMENTE SOL E RAIOS, SEM O CHÃO) ---
  function createSunMask() {
    const mask = document.createElement('canvas');
    mask.width = Math.max(360, Math.floor(state.width));
    mask.height = Math.max(360, Math.floor(state.height));
    const ctx = mask.getContext('2d', { willReadFrequently: true });
    const w = mask.width;
    const h = mask.height;

    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. O Sol
    const cx = 0; 
    const cy = h * 0.20; 
    const r = Math.min(w, h) * (state.mobile ? 0.25 : 0.35); 

    const sunGlow = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sunGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    sunGlow.addColorStop(0.8, 'rgba(255, 255, 255, 0.3)');
    sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 2. Raios solares em ondas
    const numRays = 26; 
    for(let i = 0; i < numRays; i++) {
       const baseAngle = -Math.PI * 0.15 + (i / numRays) * Math.PI * 0.75;
       const angle = baseAngle + (Math.random() * 0.08); 
       
       const r1 = r * 0.2; 
       const r2 = Math.max(w, h) * 1.5; 
       
       const rayGrad = ctx.createLinearGradient(
         cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1,
         cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2
       );
       rayGrad.addColorStop(0, `rgba(255, 255, 255, ${0.6 + Math.random() * 0.4})`);
       rayGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.3 + Math.random() * 0.3})`);
       rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

       ctx.strokeStyle = rayGrad;
       ctx.lineWidth = Math.max(4, r * 0.01 + Math.random() * 20);
       
       ctx.beginPath();
       const waves = 1.5 + Math.random() * 2.5; 
       const amplitude = r * (0.05 + Math.random() * 0.08); 

       for (let t = 0; t <= 1; t += 0.01) {
           const currentRadius = r1 + (r2 - r1) * t;
           const waveOffset = Math.sin(t * Math.PI * 2 * waves) * amplitude;
           
           const orthoX = Math.cos(angle + Math.PI / 2) * waveOffset;
           const orthoY = Math.sin(angle + Math.PI / 2) * waveOffset;
           
           const px = cx + Math.cos(angle) * currentRadius + orthoX;
           const py = cy + Math.sin(angle) * currentRadius + orthoY;
           
           if (t === 0) {
               ctx.moveTo(px, py);
           } else {
               ctx.lineTo(px, py);
           }
       }
       ctx.stroke();
    }

    // A plantação foi removida desta etapa!
    
    return mask;
  }

  function candidateToClip(candidate, mask) {
    const px = candidate[0] / mask.width * state.width;
    const py = candidate[1] / mask.height * state.height;
    return [pxToClipX(px), pxToClipY(py), candidate[2]];
  }

  function buildParticles() {
    const mobile = state.mobile;
    const max = mobile ? config.maxMobile : config.maxDesktop;
    const sample = mobile ? config.sampleMobile : config.sampleDesktop;
    
    const textMask = createTextMask();
    const fieldMask = createFieldMask();
    const sunMask = createSunMask();

    const textCandidates = readMaskCandidates(textMask, sample);
    const fieldCandidates = readMaskCandidates(fieldMask, sample);
    const sunCandidates = readMaskCandidates(sunMask, sample);
    
    const count = Math.min(max, textCandidates.length, fieldCandidates.length, sunCandidates.length);

    state.count = count;
    state.positions = new Float32Array(count * 3);
    state.textHomes = new Float32Array(count * 3);
    state.fieldHomes = new Float32Array(count * 3);
    state.sunHomes = new Float32Array(count * 3);
    state.currentHomes = new Float32Array(count * 3);
    state.velocities = new Float32Array(count * 3);
    state.alphas = new Float32Array(count);
    state.seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const text = candidateToClip(textCandidates[i], textMask);
      const field = candidateToClip(fieldCandidates[i], fieldMask);
      const sun = candidateToClip(sunCandidates[i], sunMask);
      
      const z = (Math.random() - 0.5) * 0.18;
      const fieldZ = (Math.random() - 0.5) * 0.24;
      const sunZ = (Math.random() - 0.5) * 0.24;
      const o = i * 3;

      state.positions[o] = text[0] + (Math.random() - 0.5) * 0.012;
      state.positions[o + 1] = text[1] + (Math.random() - 0.5) * 0.012;
      state.positions[o + 2] = z;

      state.textHomes[o] = text[0];
      state.textHomes[o + 1] = text[1];
      state.textHomes[o + 2] = z;

      state.fieldHomes[o] = field[0];
      state.fieldHomes[o + 1] = field[1];
      state.fieldHomes[o + 2] = fieldZ;

      state.sunHomes[o] = sun[0];
      state.sunHomes[o + 1] = sun[1];
      state.sunHomes[o + 2] = sunZ;

      state.currentHomes[o] = text[0];
      state.currentHomes[o + 1] = text[1];
      state.currentHomes[o + 2] = z;

      state.alphas[i] = 0.28 + Math.max(text[2], field[2], sun[2]) * 0.72;
      state.seeds[i] = Math.random();
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, state.alphas, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, state.seeds, gl.STATIC_DRAW);
  }

  function updateScrollTarget() {
    const vh = window.innerHeight || 1;
    const doc = document.documentElement;
    const maxScroll = Math.max(doc.scrollHeight - vh, 1);
    const ratio = clamp(window.scrollY / maxScroll, 0, 1);

    const fieldRatio = clamp(ratio / 0.25, 0, 1);
    state.fieldTarget = smoothstep01(fieldRatio);

    const sunRatio = clamp((ratio - 0.35) / 0.25, 0, 1);
    state.sunTarget = smoothstep01(sunRatio);

    const rainRaw = clamp((ratio - 0.75) / 0.25, 0, 1);
    state.rainTarget = smoothstep01(rainRaw);

    document.body.classList.toggle('is-field', state.fieldTarget > 0.18);
    document.body.classList.toggle('is-sun', state.sunTarget > 0.18);
    document.body.classList.toggle('is-rain', state.rainTarget > 0.05);
  }

  function sampleTrail(px, py) {
    const tubeRadius = state.mobile ? config.pathTubeMobile : config.pathTubeDesktop;
    let best = null;
    let bestScore = 0;

    if (state.trail.length < 2) return null;

    for (let i = 1; i < state.trail.length; i++) {
      const a = state.trail[i - 1];
      const b = state.trail[i];
      const abx = b.x - a.x;
      const aby = b.y - a.y;
      const len2 = abx * abx + aby * aby || 1;
      const u = clamp(((px - a.x) * abx + (py - a.y) * aby) / len2, 0, 1);
      const cx = a.x + abx * u;
      const cy = a.y + aby * u;
      const dx = px - cx;
      const dy = py - cy;
      const d2 = dx * dx + dy * dy;
      const trailAge = (state.trail.length - i) / Math.max(1, state.trail.length);
      const r = tubeRadius * (1.08 - trailAge * 0.42);

      if (d2 < r * r) {
        const d = Math.sqrt(d2) || 1;
        const len = Math.sqrt(len2) || 1;
        const life = (a.life * (1.0 - u) + b.life * u) * (1.0 - trailAge * 0.18);
        const score = Math.pow(1.0 - d / r, 1.25) * life;

        if (score > bestScore) {
          const tx = abx / len;
          const ty = aby / len;
          bestScore = score;
          best = {
            x: cx, y: cy, d, tx, ty,
            nx: d > 1.0 ? dx / d : -ty,
            ny: d > 1.0 ? dy / d : tx,
            vx: a.vx * (1.0 - u) + b.vx * u,
            vy: a.vy * (1.0 - u) + b.vy * u,
            score, head: i > state.trail.length - 5
          };
        }
      }
    }
    return best;
  }

  function pushPointer(x, y) {
    const now = performance.now();
    const last = state.pointer;
    const dt = Math.max(16, now - (last.lastTime || now));
    const vx = last.lastTime ? (x - last.lastX) / dt * 16.67 : 0;
    const vy = last.lastTime ? (y - last.lastY) / dt * 16.67 : 0;

    state.pointer.active = true;
    state.pointer.px = x;
    state.pointer.py = y;
    state.pointer.lastX = x;
    state.pointer.lastY = y;
    state.pointer.lastTime = now;
    state.lastMove = now;

    const previous = state.trail[state.trail.length - 1];
    if (!previous || Math.hypot(x - previous.x, y - previous.y) > 2.8) {
      state.trail.push({ x, y, vx, vy, life: 1.0 });
      while (state.trail.length > 128) state.trail.shift();
    }
  }

  function bindEvents() {
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('mousemove', e => pushPointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchstart', e => {
      if (e.touches[0]) pushPointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      if (e.touches[0]) pushPointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('mouseleave', () => {
      state.pointer.active = false;
      state.pointer.lastTime = 0;
      state.trail.length = 0;
    });
    window.addEventListener('touchend', () => {
      state.pointer.active = false;
      state.pointer.lastTime = 0;
      state.trail.length = 0;
    });
  }

  function updateHomes() {
    state.fieldProgress += (state.fieldTarget - state.fieldProgress) * config.scrollEase;
    state.sunProgress += (state.sunTarget - state.sunProgress) * config.scrollEase;
    state.rainProgress += (state.rainTarget - state.rainProgress) * config.scrollEase;

    const f = state.fieldProgress;
    const s = state.sunProgress;
    
    const text = state.textHomes;
    const field = state.fieldHomes;
    const sun = state.sunHomes;
    const home = state.currentHomes;

    for (let i = 0; i < state.count; i++) {
      const o = i * 3;
      
      let px = text[o]     + (field[o]     - text[o])     * f;
      let py = text[o + 1] + (field[o + 1] - text[o + 1]) * f;
      let pz = text[o + 2] + (field[o + 2] - text[o + 2]) * f;

      px = px + (sun[o]     - px) * s;
      py = py + (sun[o + 1] - py) * s;
      pz = pz + (sun[o + 2] - pz) * s;

      home[o]     = px;
      home[o + 1] = py;
      home[o + 2] = pz;
    }
  }

  function updatePhysics(now) {
    updateHomes();

    const activelyMoving = now - state.lastMove < config.settleDelay;
    const recentlyTouched = now - state.lastMove < config.releaseDelay;
    const rainMix = computeRainMix();

    const pos = state.positions;
    const home = state.currentHomes;
    const vel = state.velocities;
    const seed = state.seeds;
    const invW = 2 / state.width;
    const invH = 2 / state.height;
    const scrollMoving = Math.abs(state.fieldTarget - state.fieldProgress) > 0.006 || Math.abs(state.sunTarget - state.sunProgress) > 0.006;

    const baseReturn = (recentlyTouched || scrollMoving) ? config.returnActive : config.returnIdle;
    const globalReturnForce = baseReturn * (1.0 - rainMix);

    for (let t = state.trail.length - 1; t >= 0; t--) {
      state.trail[t].life *= activelyMoving ? 0.965 : 0.88;
      if (state.trail[t].life < 0.028) state.trail.splice(t, 1);
    }

    for (let i = 0; i < state.count; i++) {
      const o = i * 3;
      let x = pos[o];
      let y = pos[o + 1];
      let z = pos[o + 2];
      let vx = vel[o];
      let vy = vel[o + 1];
      let vz = vel[o + 2];
      const hx = home[o];
      const hy = home[o + 1];
      const hz = home[o + 2];

      vx += (hx - x) * globalReturnForce;
      vy += (hy - y) * globalReturnForce;
      vz += (hz - z) * globalReturnForce * 0.55;

      if (activelyMoving && state.trail.length) {
        const px = clipToPxX(x);
        const py = clipToPxY(y);
        const mx = state.pointer.px;
        const my = state.pointer.py;
        const mdx = mx - px;
        const mdy = my - py;
        const mouseRadius = state.mobile ? config.mouseFollowRadiusMobile : config.mouseFollowRadiusDesktop;
        const md2 = mdx * mdx + mdy * mdy;

        if (md2 < mouseRadius * mouseRadius) {
          const md = Math.sqrt(md2) || 1.0;
          const ms = Math.pow(1.0 - md / mouseRadius, 1.45);
          vx += (mdx / md) * config.mouseFollow * ms * invW * 260.0;
          vy += -(mdy / md) * config.mouseFollow * ms * invH * 260.0;
        }

        const hit = sampleTrail(px, py);
        if (hit) {
          const s = hit.score;
          const gesture = Math.hypot(hit.vx, hit.vy);
          let dirX = hit.tx;
          let dirY = hit.ty;
          if (gesture > 0.01 && dirX * hit.vx + dirY * hit.vy < 0.0) {
            dirX *= -1.0;
            dirY *= -1.0;
          }

          const flowX = dirX * invW;
          const flowY = -dirY * invH;
          const edgeX = hit.nx * invW;
          const edgeY = -hit.ny * invH;
          const orbitX = -hit.ty * invW;
          const orbitY = -hit.tx * invH;
          const headBoost = hit.head ? 1.65 : 1.0;
          const side = seed[i] > 0.5 ? 1.0 : -1.0;
          const desiredOffset = (state.mobile ? config.pathEdgeMobile : config.pathEdgeDesktop) * side;
          const targetPx = hit.x + hit.nx * desiredOffset;
          const targetPy = hit.y + hit.ny * desiredOffset;
          const targetX = pxToClipX(targetPx);
          const targetY = pxToClipY(targetPy);
          const targetPull = Math.min(0.066, config.pathTargetPull * s * headBoost);
          const edgeForce = clamp((desiredOffset - hit.d * side) / 70.0, -1.0, 1.0);

          vx += (targetX - x) * targetPull;
          vy += (targetY - y) * targetPull;
          vx += flowX * config.pathFollow * s * 430.0;
          vy += flowY * config.pathFollow * s * 430.0;
          vx += edgeX * config.pathEdgePull * edgeForce * s * 610.0 * headBoost;
          vy += edgeY * config.pathEdgePull * edgeForce * s * 610.0 * headBoost;
          vx += orbitX * config.pathOrbit * s * side * 165.0;
          vy += orbitY * config.pathOrbit * s * side * 165.0;
          vx += flowX * config.flow * s * gesture * 1.45;
          vy += flowY * config.flow * s * gesture * 1.45;
          vx += edgeX * config.headPush * s * (hit.head ? 72.0 : 22.0);
          vy += edgeY * config.headPush * s * (hit.head ? 72.0 : 22.0);
          vz += (Math.sin(seed[i] * 100.0) * 0.0032) * s;
        }
      }

      const n = Math.sin(now * 0.0012 + seed[i] * 80.0) * config.noise;
      const scrollDrift = state.fieldProgress * (1.0 - state.fieldProgress) * 0.0007;
      vx += n;
      vy += Math.cos(now * 0.0010 + seed[i] * 44.0) * config.noise - scrollDrift;

      if (rainMix > 0.1) {
        const g = 0.0025 + 0.0012 * seed[i];
        vy -= g * rainMix;
      }

      vx *= config.friction;
      vy *= config.friction;
      vz *= 0.94;

      const speed = Math.hypot(vx, vy);
      if (speed > config.maxSpeed) {
        const m = config.maxSpeed / speed;
        vx *= m;
        vy *= m;
      }

      x += vx;
      y += vy;
      z = clamp(z + vz, -0.42, 0.42);

      if (rainMix > 0.0) {
        const py = clipToPxY(y);
        if (py > state.height + 40) {
          const spawnX = Math.random() * state.width;
          const spawnY = -40 - Math.random() * 120;
          x = pxToClipX(spawnX);
          y = pxToClipY(spawnY);
          z = (Math.random() - 0.5) * 0.18;
          vx = 0.0;
          vy = 0.0;
          vz = 0.0;
        }
      }

      pos[o] = x;
      pos[o + 1] = y;
      pos[o + 2] = z;
      vel[o] = vx;
      vel[o + 1] = vy;
      vel[o + 2] = vz;
    }
  }

  function render(now) {
    if (!state.positions || !state.count) {
      requestAnimationFrame(render);
      return;
    }

    updatePhysics(now);
    const rainMix = computeRainMix();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, state.positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(locations.position);
    gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.enableVertexAttribArray(locations.alpha);
    gl.vertexAttribPointer(locations.alpha, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
    gl.enableVertexAttribArray(locations.seed);
    gl.vertexAttribPointer(locations.seed, 1, gl.FLOAT, false, 0, 0);

    gl.uniform1f(locations.pointSize, state.mobile ? config.pointMobile : config.pointDesktop);
    gl.uniform1f(locations.dpr, state.dpr);
    gl.uniform1f(locations.fieldMix, state.fieldProgress);
    gl.uniform1f(locations.sunMix, state.sunProgress);
    gl.uniform1f(locations.rainMix, rainMix);

    gl.drawArrays(gl.POINTS, 0, state.count);
    requestAnimationFrame(render);
  }

  function resize() {
    state.width = window.innerWidth || 1200;
    state.height = window.innerHeight || 700;
    state.mobile = state.width < 720;
    state.dpr = Math.min(window.devicePixelRatio || 1, state.mobile ? 1.4 : 1.6);
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    buildParticles();
    updateScrollTarget();
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 140);
  });

  resize();
  bindEvents();
  requestAnimationFrame(render);
})();