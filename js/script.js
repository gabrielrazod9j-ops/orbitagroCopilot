// ==========================================
// 1. CÉREBRO COPILOTO (LÓGICA PYTHON PORTADA)
// ==========================================
const CULTURAS = [
  { nome: "Mandioca", temp_min: 20, temp_max: 30, chuva_min_7d: 10, chuva_max_7d: 70, ph_min: 5.0, ph_max: 6.5 },
  { nome: "Feijão", temp_min: 18, temp_max: 30, chuva_min_7d: 15, chuva_max_7d: 80, ph_min: 5.5, ph_max: 6.8 },
  { nome: "Milho", temp_min: 18, temp_max: 32, chuva_min_7d: 15, chuva_max_7d: 90, ph_min: 5.5, ph_max: 7.0 },
  { nome: "Arroz", temp_min: 20, temp_max: 35, chuva_min_7d: 20, chuva_max_7d: 100, ph_min: 5.0, ph_max: 6.5 },
  { nome: "Café", temp_min: 18, temp_max: 26, chuva_min_7d: 10, chuva_max_7d: 70, ph_min: 5.5, ph_max: 6.5 },
  { nome: "Banana", temp_min: 20, temp_max: 30, chuva_min_7d: 20, chuva_max_7d: 100, ph_min: 5.5, ph_max: 7.0 },
  { nome: "Tomate", temp_min: 18, temp_max: 28, chuva_min_7d: 10, chuva_max_7d: 60, ph_min: 5.5, ph_max: 6.8 },
  { nome: "Alface", temp_min: 15, temp_max: 25, chuva_min_7d: 10, chuva_max_7d: 50, ph_min: 6.0, ph_max: 7.0 }
];

function processarDiagnostico() {
  const selectCultura = document.getElementById('cultura');
  const inputDiasSeca = document.getElementById('diasSeca');
  if (!selectCultura || !inputDiasSeca) return;

  const diasSeca = parseInt(inputDiasSeca.value) || 0;
  const calor = document.getElementById('calor').value;
  const soloObs = document.getElementById('soloObs').value;
  const pragas = document.getElementById('pragas').value;
  
  let pontos = 0;
  
  if (diasSeca >= 10) pontos += 3;
  else if (diasSeca >= 5) pontos += 2;
  else if (diasSeca >= 3) pontos += 1;

  if (calor === "2") pontos += 1;
  else if (calor === "3") pontos += 2;

  if (pragas === "1") pontos += 3;
  else if (pragas === "2") pontos += 1;

  if (soloObs === "1") pontos += 2;
  else if (soloObs === "2") pontos += 1;

  let nivel = "BAIXO";
  let colorBadge = "#4caf50";
  if (pontos > 2 && pontos <= 5) { nivel = "MÉDIO"; colorBadge = "#ff9800"; }
  else if (pontos > 5 && pontos <= 8) { nivel = "ALTO"; colorBadge = "#f44336"; }
  else if (pontos > 8) { nivel = "CRÍTICO"; colorBadge = "#d32f2f"; }

  let recs = [];
  if (diasSeca >= 3) recs.push("Olhe a umidade do solo antes de irrigar. Se estiver muito seco, priorize água.");
  if (calor === "2" || calor === "3") recs.push("Evite pulverizar ou adubar nas horas mais quentes do dia.");
  if (pragas === "1" || pragas === "2") recs.push("Verifique folhas, caule e frutos. Tire foto e procure cooperativa ou técnico.");
  if (soloObs === "1") recs.push("Evite entrada de máquina ou pisoteio se o solo estiver encharcado.");
  else if (soloObs === "2") recs.push("Solo muito rachado indica falta de água ou matéria orgânica. Acompanhe de perto.");

  if (nivel === "ALTO" || nivel === "CRÍTICO") recs.push("Risco alto: procure orientação técnica local ou cooperativa.");
  if (recs.length === 0) recs.push("Situação aparentemente tranquila. Continue observando a lavoura.");

  const badge = document.getElementById('riskBadge');
  if (badge) {
    badge.textContent = `Risco: ${nivel}`;
    badge.style.color = colorBadge;
    badge.style.borderColor = colorBadge;
    badge.style.background = `${colorBadge}22`;
  }

  const recList = document.getElementById('recList');
  if (recList) {
    recList.innerHTML = '';
    recs.forEach(r => {
      const li = document.createElement('li');
      li.textContent = r;
      recList.appendChild(li);
    });
  }

  document.getElementById('stage-resultado').scrollIntoView({ behavior: 'smooth' });
}

const btnDiagnostico = document.getElementById('btnDiagnostico');
if (btnDiagnostico) btnDiagnostico.addEventListener('click', processarDiagnostico);

const btnRecomecar = document.getElementById('btnRecomecar');
if (btnRecomecar) {
  btnRecomecar.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('diasSeca').value = 0;
    document.getElementById('pragas').value = "3";
  });
}

const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  menuToggle.addEventListener('click', function() {
    const isOpen = this.classList.toggle('is-open');
    document.getElementById('mobileMenu').classList.toggle('is-open', isOpen);
  });
}


// ==========================================
// 2. ENGINE WEBGL (FÍSICA ORIGINAL RESTAURADA)
// ==========================================
(() => {
  const canvas = document.getElementById('particleCanvas');
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: true, depth: false, stencil: false,
    premultipliedAlpha: false, preserveDrawingBuffer: false
  });

  if (!gl) return;

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
    width: 1, height: 1, dpr: 1, mobile: false, count: 0,
    positions: null, currentHomes: null, velocities: null, alphas: null, seeds: null,
    
    // As 6 Máscaras
    mText: null, mField: null, mSun: null, mRain: null, mPest: null, mResult: null,
    
    scrollTarget: 0, scrollProgress: 0, // Vai de 0.0 até 5.0
    
    trail: [],
    pointer: { active: false, px: 0, py: 0, lastX: 0, lastY: 0, lastTime: 0 },
    lastMove: 0
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const pxToClipX = px => (px / state.width) * 2 - 1;
  const pxToClipY = py => 1 - (py / state.height) * 2;
  const clipToPxX = x => (x + 1) * 0.5 * state.width;
  const clipToPxY = y => (1 - y) * 0.5 * state.height;

  const vertexSource = `
    attribute vec3 aPosition;
    attribute float aAlpha;
    attribute float aSeed;
    uniform float uPointSize;
    uniform float uDpr;
    uniform float uProgress;
    varying float vAlpha;
    varying float vSeed;

    void main() {
      vAlpha = aAlpha;
      vSeed = aSeed;
      gl_Position = vec4(aPosition, 1.0);
      float depth = 1.0 + aPosition.z * 0.22;
      
      // Partículas pulsam levemente dependendo da tela
      float mixFactor = fract(uProgress);
      gl_PointSize = uPointSize * uDpr * depth * (1.0 + mixFactor * 0.16);
    }
  `;

  const fragmentSource = `
    precision highp float;
    varying float vAlpha;
    varying float vSeed;
    uniform float uProgress;

    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float dotMask = smoothstep(0.48, 0.075, d);
      float core = smoothstep(0.18, 0.0, d) * 0.22;
      float rim = smoothstep(0.50, 0.26, d) * 0.16;
      float shimmer = 0.92 + sin(vSeed * 44.0) * 0.08;
      float alpha = (dotMask + core + rim) * vAlpha * shimmer;

      vec3 c0 = vec3(0.965, 0.955, 0.925); // Text (Branco)
      vec3 c1 = vec3(0.58, 0.34, 0.18);    // Field (Terra)
      vec3 c2 = vec3(1.0, 0.65, 0.12);     // Sun (Fogo/Dourado)
      vec3 c3 = vec3(0.45, 0.75, 0.98);    // Rain (Azul)
      vec3 c4 = vec3(0.65, 0.7, 0.2);      // Pest (Verde Doente)
      vec3 c5 = vec3(0.2, 0.9, 0.65);      // Result (Ciano/Tecnologia)

      vec3 color = mix(c0, c1, clamp(uProgress, 0.0, 1.0));
      color = mix(color, c2, clamp(uProgress - 1.0, 0.0, 1.0));
      color = mix(color, c3, clamp(uProgress - 2.0, 0.0, 1.0));
      color = mix(color, c4, clamp(uProgress - 3.0, 0.0, 1.0));
      color = mix(color, c5, clamp(uProgress - 4.0, 0.0, 1.0));

      gl_FragColor = vec4(color, alpha);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }

  function createProgram() {
    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    return program;
  }

  const program = createProgram();
  const locations = {
    position: gl.getAttribLocation(program, 'aPosition'),
    alpha: gl.getAttribLocation(program, 'aAlpha'),
    seed: gl.getAttribLocation(program, 'aSeed'),
    pointSize: gl.getUniformLocation(program, 'uPointSize'),
    dpr: gl.getUniformLocation(program, 'uDpr'),
    progress: gl.getUniformLocation(program, 'uProgress')
  };

  const bufs = { pos: gl.createBuffer(), alpha: gl.createBuffer(), seed: gl.createBuffer() };

  // ==========================================
  // GERAÇÃO DAS MÁSCARAS (ALTA FIDELIDADE)
  // ==========================================
  function readMaskCandidates(mask, sample) {
    const ctx = mask.getContext('2d', { willReadFrequently: true });
    const data = ctx.getImageData(0, 0, mask.width, mask.height).data;
    const candidates = [];
    for (let y = 0; y < mask.height; y += sample) {
      for (let x = 0; x < mask.width; x += sample) {
        const alpha = data[(y * mask.width + x) * 4 + 3];
        if (alpha > 24) candidates.push([pxToClipX(x), pxToClipY(y)]);
      }
    }
    // Shuffle
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    return candidates;
  }

  function getCanvas() {
    const c = document.createElement('canvas');
    c.width = Math.max(360, Math.floor(state.width));
    c.height = Math.max(360, Math.floor(state.height));
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff';
    return { c, ctx, w: c.width, h: c.height };
  }

  // 1. Text
  function createTextMask() {
    const { c, ctx, w, h } = getCanvas();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const fs = clamp(w * (state.mobile ? 0.125 : 0.095), 44, state.mobile ? 82 : 118);
    ctx.font = `800 ${fs}px Inter, sans-serif`;
    ctx.lineWidth = Math.max(1.3, fs * 0.022);
    const lh = fs * 0.96;
    ['OrbitAgro', 'Copilot'].forEach((line, i) => {
      const y = h/2 + (i - 0.5) * lh;
      ctx.strokeText(line, w/2, y); ctx.fillText(line, w/2, y);
    });
    return c;
  }

  // 2. Field
  function createFieldMask() {
    const { c, ctx, w, h } = getCanvas();
    const rows = state.mobile ? 10 : 15;
    const horizonY = h * 0.62; const baseY = h * 0.96; const cx = w * 0.5;

    for (let r = 0; r < rows; r++) {
      const t = r / Math.max(1, rows - 1);
      const y = horizonY + Math.pow(t, 1.72) * (baseY - horizonY);
      const spread = w * (0.10 + t * 0.58);
      const curve = h * (0.018 + t * 0.035);

      ctx.globalAlpha = 0.18 + t * 0.74;
      ctx.lineWidth = Math.max(1.1, 1.2 + t * 3.6);
      ctx.beginPath();
      ctx.moveTo(cx - spread, y);
      ctx.bezierCurveTo(cx - spread*0.48, y - curve, cx + spread*0.48, y + curve*0.55, cx + spread, y);
      ctx.stroke();

      const seeds = Math.floor(42 + t * 128);
      for (let p = 0; p < seeds; p++) {
        const u = p / Math.max(1, seeds - 1);
        const wave = Math.sin(u * Math.PI * 2 + r * 0.62) * curve * 0.42;
        const jx = (Math.random() - 0.5) * (2.5 + t * 7.0);
        const jy = (Math.random() - 0.5) * (1.5 + t * 5.0);
        const px = cx - spread + u * spread * 2.0 + jx;
        const py = y + wave + jy;
        const size = 1.1 + t * 3.2;

        ctx.globalAlpha = 0.26 + t * 0.68;
        ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fill();
      }
    }
    return c;
  }

  // 3. Sun
  function createSunMask() {
    const { c, ctx, w, h } = getCanvas();
    const cx = 0; const cy = h * 0.20; 
    const r = Math.min(w, h) * (state.mobile ? 0.25 : 0.35); 

    const sunGlow = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sunGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = sunGlow;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    const numRays = 26; 
    for(let i = 0; i < numRays; i++) {
       const baseAngle = -Math.PI * 0.15 + (i / numRays) * Math.PI * 0.75;
       const angle = baseAngle + (Math.random() * 0.08); 
       const r1 = r * 0.2; const r2 = Math.max(w, h) * 1.5; 
       
       const rayGrad = ctx.createLinearGradient(
         cx + Math.cos(angle)*r1, cy + Math.sin(angle)*r1, cx + Math.cos(angle)*r2, cy + Math.sin(angle)*r2
       );
       rayGrad.addColorStop(0, `rgba(255, 255, 255, ${0.6 + Math.random() * 0.4})`);
       rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

       ctx.strokeStyle = rayGrad;
       ctx.lineWidth = Math.max(4, r * 0.01 + Math.random() * 20);
       
       ctx.beginPath();
       const waves = 1.5 + Math.random() * 2.5; 
       const amplitude = r * (0.05 + Math.random() * 0.08); 

       for (let t = 0; t <= 1; t += 0.01) {
           const curR = r1 + (r2 - r1) * t;
           const wOffset = Math.sin(t * Math.PI * 2 * waves) * amplitude;
           const px = cx + Math.cos(angle)*curR + Math.cos(angle + Math.PI/2)*wOffset;
           const py = cy + Math.sin(angle)*curR + Math.sin(angle + Math.PI/2)*wOffset;
           if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
       }
       ctx.stroke();
    }
    return c;
  }

  // 4. Rain
  function createRainMask() {
    const { c, ctx, w, h } = getCanvas();
    
    // Nuvens no topo com gradiente volumétrico
    const numNuvens = 12;
    for(let i=0; i<numNuvens; i++) {
      const px = (i/numNuvens) * w + (Math.random()-0.5)*100;
      const py = -h*0.05 + Math.random()*h*0.15;
      const raio = h*0.15 + Math.random()*h*0.1;
      
      const grad = ctx.createRadialGradient(px, py, 0, px, py, raio);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(px, py, raio, 0, Math.PI*2); ctx.fill();
    }

    // Pingos de chuva (linhas tracejadas caindo)
    ctx.lineWidth = 2;
    for(let i=0; i<150; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const comp = 20 + Math.random() * 60;
      ctx.strokeStyle = `rgba(255,255,255,${0.2 + Math.random()*0.5})`;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - comp*0.2, py + comp); ctx.stroke();
    }
    return c;
  }

  // 5. Pest (Folha Mordida com Curvas)
  function createPestMask() {
    const { c, ctx, w, h } = getCanvas();
    const cx = w * 0.7; const cy = h * 0.45;
    const s = Math.min(w, h) * (state.mobile ? 0.35 : 0.45);

    // Desenha uma folha com Bezier
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.bezierCurveTo(cx + s*0.8, cy - s*0.5, cx + s*0.8, cy + s*0.5, cx, cy + s);
    ctx.bezierCurveTo(cx - s*0.8, cy + s*0.5, cx - s*0.8, cy - s*0.5, cx, cy - s);
    
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, s);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0.2)');
    ctx.fillStyle = grad; ctx.fill();

    // Recorta os pedaços (Mordidas de praga)
    ctx.globalCompositeOperation = 'destination-out';
    for(let i=0; i<25; i++) {
      ctx.beginPath(); 
      const bX = cx + (Math.random()-0.5)*s*1.8;
      const bY = cy + (Math.random()-0.5)*s*1.8;
      ctx.arc(bX, bY, s*0.1 + Math.random()*s*0.15, 0, Math.PI*2);
      ctx.fill();
    }
    return c;
  }

  // 6. Result (Vórtice Analítico)
  function createResultMask() {
    const { c, ctx, w, h } = getCanvas();
    const cx = w/2; const cy = h/2;
    const rBase = Math.min(w,h) * 0.4;

    for(let i=0; i<5; i++) {
      const raio = rBase + (i * 25);
      ctx.lineWidth = 1 + Math.random()*4;
      ctx.strokeStyle = `rgba(255,255,255,${1.0 - i*0.2})`;
      
      // Linhas tracejadas orgânicas
      if(i%2 === 0) ctx.setLineDash([10 + Math.random()*30, 10 + Math.random()*20]);
      else ctx.setLineDash([]);

      ctx.beginPath(); ctx.arc(cx, cy, raio, 0, Math.PI*2); ctx.stroke();
    }
    
    // Brilho central suave
    ctx.globalCompositeOperation = 'source-over';
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rBase*1.5);
    glow.addColorStop(0, 'rgba(255,255,255,0.15)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, rBase*1.5, 0, Math.PI*2); ctx.fill();

    return c;
  }

  function buildParticles() {
    state.mobile = window.innerWidth < 720;
    state.width = window.innerWidth; state.height = window.innerHeight;
    const sample = state.mobile ? config.sampleMobile : config.sampleDesktop;
    
    const m1 = readMaskCandidates(createTextMask(), sample);
    const m2 = readMaskCandidates(createFieldMask(), sample);
    const m3 = readMaskCandidates(createSunMask(), sample);
    const m4 = readMaskCandidates(createRainMask(), sample);
    const m5 = readMaskCandidates(createPestMask(), sample);
    const m6 = readMaskCandidates(createResultMask(), sample);

    const maxParticles = state.mobile ? config.maxMobile : config.maxDesktop;
    const count = Math.min(maxParticles, m1.length, m2.length, m3.length, m4.length, m5.length, m6.length);
    state.count = count;

    state.positions = new Float32Array(count * 3);
    state.currentHomes = new Float32Array(count * 3);
    state.velocities = new Float32Array(count * 3);
    state.alphas = new Float32Array(count); state.seeds = new Float32Array(count);

    state.mText = new Float32Array(count * 2); state.mField = new Float32Array(count * 2);
    state.mSun = new Float32Array(count * 2);  state.mRain = new Float32Array(count * 2);
    state.mPest = new Float32Array(count * 2); state.mResult = new Float32Array(count * 2);

    for (let i = 0; i < count; i++) {
      const o = i * 3, o2 = i * 2;
      const z = (Math.random() - 0.5) * 0.18;
      
      state.mText[o2] = m1[i][0]; state.mText[o2+1] = m1[i][1];
      state.mField[o2] = m2[i][0]; state.mField[o2+1] = m2[i][1];
      state.mSun[o2] = m3[i][0]; state.mSun[o2+1] = m3[i][1];
      state.mRain[o2] = m4[i][0]; state.mRain[o2+1] = m4[i][1];
      state.mPest[o2] = m5[i][0]; state.mPest[o2+1] = m5[i][1];
      state.mResult[o2] = m6[i][0]; state.mResult[o2+1] = m6[i][1];

      state.positions[o] = m1[i][0] + (Math.random()-0.5)*0.012;
      state.positions[o+1] = m1[i][1] + (Math.random()-0.5)*0.012;
      state.positions[o+2] = z;

      state.alphas[i] = 0.28 + Math.random() * 0.72;
      state.seeds[i] = Math.random();
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.alpha); gl.bufferData(gl.ARRAY_BUFFER, state.alphas, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.seed); gl.bufferData(gl.ARRAY_BUFFER, state.seeds, gl.STATIC_DRAW);
  }

  function updateScrollTarget() {
    const vh = window.innerHeight || 1;
    const maxScroll = Math.max(document.body.scrollHeight - vh, 1);
    const ratio = clamp(window.scrollY / maxScroll, 0, 1);
    
    // São 5 transições perfeitamente divididas pelo scroll (0.0 até 5.0)
    state.scrollTarget = ratio * 5.0; 
  }

  function sampleTrail(px, py) {
    const tubeRadius = state.mobile ? config.pathTubeMobile : config.pathTubeDesktop;
    let best = null; let bestScore = 0;
    if (state.trail.length < 2) return null;

    for (let i = 1; i < state.trail.length; i++) {
      const a = state.trail[i - 1], b = state.trail[i];
      const abx = b.x - a.x, aby = b.y - a.y;
      const len2 = abx * abx + aby * aby || 1;
      const u = clamp(((px - a.x) * abx + (py - a.y) * aby) / len2, 0, 1);
      const cx = a.x + abx * u, cy = a.y + aby * u;
      const dx = px - cx, dy = py - cy;
      const d2 = dx * dx + dy * dy;
      const trailAge = (state.trail.length - i) / Math.max(1, state.trail.length);
      const r = tubeRadius * (1.08 - trailAge * 0.42);

      if (d2 < r * r) {
        const d = Math.sqrt(d2) || 1, len = Math.sqrt(len2) || 1;
        const life = (a.life * (1.0 - u) + b.life * u) * (1.0 - trailAge * 0.18);
        const score = Math.pow(1.0 - d / r, 1.25) * life;

        if (score > bestScore) {
          bestScore = score;
          best = { x: cx, y: cy, d, tx: abx/len, ty: aby/len, nx: d>1 ? dx/d : -aby/len, ny: d>1 ? dy/d : abx/len, vx: a.vx*(1-u) + b.vx*u, vy: a.vy*(1-u) + b.vy*u, score, head: i > state.trail.length - 5 };
        }
      }
    }
    return best;
  }

  function pushPointer(x, y) {
    const now = performance.now();
    const dt = Math.max(16, now - (state.pointer.lastTime || now));
    const vx = state.pointer.lastTime ? (x - state.pointer.lastX) / dt * 16.67 : 0;
    const vy = state.pointer.lastTime ? (y - state.pointer.lastY) / dt * 16.67 : 0;

    state.pointer.active = true;
    state.pointer.px = x; state.pointer.py = y;
    state.pointer.lastX = x; state.pointer.lastY = y;
    state.pointer.lastTime = now; state.lastMove = now;

    const prev = state.trail[state.trail.length - 1];
    if (!prev || Math.hypot(x - prev.x, y - prev.y) > 2.8) {
      state.trail.push({ x, y, vx, vy, life: 1.0 });
      while (state.trail.length > 128) state.trail.shift();
    }
  }

  function bindEvents() {
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('mousemove', e => pushPointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchstart', e => { if(e.touches[0]) pushPointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('touchmove', e => { if(e.touches[0]) pushPointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('mouseleave', () => { state.pointer.active = false; state.pointer.lastTime = 0; state.trail.length = 0; });
    window.addEventListener('touchend', () => { state.pointer.active = false; state.pointer.lastTime = 0; state.trail.length = 0; });
  }

  function updatePhysics(now) {
    // Interpolação global suave (0.0 até 5.0)
    state.scrollProgress += (state.scrollTarget - state.scrollProgress) * config.scrollEase;
    const p = state.scrollProgress;
    const stage = Math.floor(p);
    const fract = p - stage;

    const activelyMoving = now - state.lastMove < config.settleDelay;
    const recentlyTouched = now - state.lastMove < config.releaseDelay;
    const scrollMoving = Math.abs(state.scrollTarget - state.scrollProgress) > 0.006;
    const globalReturnForce = (recentlyTouched || scrollMoving) ? config.returnActive : config.returnIdle;
    const invW = 2 / state.width, invH = 2 / state.height;

    for (let t = state.trail.length - 1; t >= 0; t--) {
      state.trail[t].life *= activelyMoving ? 0.965 : 0.88;
      if (state.trail[t].life < 0.028) state.trail.splice(t, 1);
    }

    const masks = [state.mText, state.mField, state.mSun, state.mRain, state.mPest, state.mResult];
    const maskA = masks[Math.min(stage, 5)];
    const maskB = masks[Math.min(stage + 1, 5)];

    for (let i = 0; i < state.count; i++) {
      const o = i * 3, o2 = i * 2;
      let x = state.positions[o], y = state.positions[o+1], z = state.positions[o+2];
      let vx = state.velocities[o], vy = state.velocities[o+1], vz = state.velocities[o+2];
      
      // Descobre a "Casa" atual interpolando as máscaras
      const hx = maskA[o2] + (maskB[o2] - maskA[o2]) * fract;
      const hy = maskA[o2+1] + (maskB[o2+1] - maskA[o2+1]) * fract;
      state.currentHomes[o] = hx; state.currentHomes[o+1] = hy;

      vx += (hx - x) * globalReturnForce;
      vy += (hy - y) * globalReturnForce;
      vz += (0 - z) * globalReturnForce * 0.55;

      // FÍSICA FLUIDA ORIGINAL (A Magia)
      if (activelyMoving && state.trail.length) {
        const px = clipToPxX(x), py = clipToPxY(y);
        const mx = state.pointer.px, my = state.pointer.py;
        const mdx = mx - px, mdy = my - py;
        const mR = state.mobile ? config.mouseFollowRadiusMobile : config.mouseFollowRadiusDesktop;
        const md2 = mdx * mdx + mdy * mdy;

        if (md2 < mR * mR) {
          const md = Math.sqrt(md2) || 1.0;
          const ms = Math.pow(1.0 - md / mR, 1.45);
          vx += (mdx / md) * config.mouseFollow * ms * invW * 260.0;
          vy += -(mdy / md) * config.mouseFollow * ms * invH * 260.0;
        }

        const hit = sampleTrail(px, py);
        if (hit) {
          const s = hit.score;
          const gesture = Math.hypot(hit.vx, hit.vy);
          let dirX = hit.tx, dirY = hit.ty;
          if (gesture > 0.01 && dirX * hit.vx + dirY * hit.vy < 0.0) { dirX *= -1; dirY *= -1; }

          const headBoost = hit.head ? 1.65 : 1.0;
          const side = state.seeds[i] > 0.5 ? 1.0 : -1.0;
          const desiredOffset = (state.mobile ? config.pathEdgeMobile : config.pathEdgeDesktop) * side;
          const targetPx = hit.x + hit.nx * desiredOffset;
          const targetPy = hit.y + hit.ny * desiredOffset;
          const targetPull = Math.min(0.066, config.pathTargetPull * s * headBoost);
          const edgeForce = clamp((desiredOffset - hit.d * side) / 70.0, -1.0, 1.0);

          vx += (pxToClipX(targetPx) - x) * targetPull;
          vy += (pxToClipY(targetPy) - y) * targetPull;
          vx += (dirX * invW) * config.pathFollow * s * 430.0;
          vy += (-dirY * invH) * config.pathFollow * s * 430.0;
          vx += (hit.nx * invW) * config.pathEdgePull * edgeForce * s * 610.0 * headBoost;
          vy += (-hit.ny * invH) * config.pathEdgePull * edgeForce * s * 610.0 * headBoost;
          vx += (-hit.ty * invW) * config.pathOrbit * s * side * 165.0;
          vy += (-hit.tx * invH) * config.pathOrbit * s * side * 165.0;
          vx += (dirX * invW) * config.flow * s * gesture * 1.45;
          vy += (-dirY * invH) * config.flow * s * gesture * 1.45;
          vx += (hit.nx * invW) * config.headPush * s * (hit.head ? 72.0 : 22.0);
          vy += (-hit.ny * invH) * config.headPush * s * (hit.head ? 72.0 : 22.0);
          vz += (Math.sin(state.seeds[i] * 100.0) * 0.0032) * s;
        }
      }

      vx += Math.sin(now * 0.0012 + state.seeds[i] * 80.0) * config.noise;
      vy += Math.cos(now * 0.0010 + state.seeds[i] * 44.0) * config.noise;

      vx *= config.friction; vy *= config.friction; vz *= 0.94;
      const speed = Math.hypot(vx, vy);
      if (speed > config.maxSpeed) { vx *= config.maxSpeed / speed; vy *= config.maxSpeed / speed; }

      x += vx; y += vy; z = clamp(z + vz, -0.42, 0.42);

      state.positions[o] = x; state.positions[o+1] = y; state.positions[o+2] = z;
      state.velocities[o] = vx; state.velocities[o+1] = vy; state.velocities[o+2] = vz;
    }
  }

  function render(now) {
    if (!state.positions || !state.count) { requestAnimationFrame(render); return; }

    updatePhysics(now);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.pos); gl.bufferData(gl.ARRAY_BUFFER, state.positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(locations.position); gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.alpha);
    gl.enableVertexAttribArray(locations.alpha); gl.vertexAttribPointer(locations.alpha, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.seed);
    gl.enableVertexAttribArray(locations.seed); gl.vertexAttribPointer(locations.seed, 1, gl.FLOAT, false, 0, 0);

    gl.uniform1f(locations.pointSize, state.mobile ? config.pointMobile : config.pointDesktop);
    gl.uniform1f(locations.dpr, state.dpr);
    gl.uniform1f(locations.progress, state.scrollProgress);

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
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 140); });

  resize(); bindEvents(); requestAnimationFrame(render);
})();