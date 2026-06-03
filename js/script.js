// ==========================================
// 1. UI AVANÇADA E OBSERVER DE ALTA PERFORMANCE
// ==========================================

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.getElementById('mobileMenu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
  });
}

// Tipografia Cinética Leve
document.querySelectorAll('.split-text').forEach(title => {
  const text = title.innerText;
  title.innerHTML = '';
  const fragment = document.createDocumentFragment();
  text.split(' ').forEach((word, wordIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    const innerSpan = document.createElement('span');
    innerSpan.className = 'word-inner';
    innerSpan.innerText = word;
    innerSpan.style.transitionDelay = `${wordIndex * 60}ms`;
    wordSpan.appendChild(innerSpan);
    fragment.appendChild(wordSpan);
    fragment.appendChild(document.createTextNode(' '));
  });
  title.appendChild(fragment);
});

const observerOptions = { root: null, threshold: 0.2 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-active');
  });
}, observerOptions);
document.querySelectorAll('.stage').forEach(stage => observer.observe(stage));

// ==========================================
// 2. BASE DE DADOS E INTELIGÊNCIA DA LAVOURA
// ==========================================
const agroDB = {
  "soja": { 
    nome: "Soja", 
    ranking: "1º Liderança Nacional (R$ 260 Bi)",
    imagem: "image/image/soja.png", 
    solo: "Solos profundos e bem drenados. Ph ideal 6.0 a 6.5.", 
    manejo: "Requer inoculação bacteriana. Plantio direto é essencial para mitigar impactos.",
    pragas: [
      { nome: "Percevejo-marrom", id: "Grãos chochos.", act: "Controle biológico com Telenomus podisi." }
    ]
  },
  "milho": { 
    nome: "Milho", 
    ranking: "3º Commodity (R$ 88 Bi)",
    imagem: "image/image/milho.png", 
    solo: "Solos férteis, de textura média e ricos em matéria orgânica.", 
    manejo: "Sucessão de culturas (soja/milho) é crucial.",
    pragas: [
      { nome: "Lagarta-do-cartucho", id: "Furos nas folhas.", act: "Inseticida biológico no cartucho." }
    ]
  },
  "cafe": { 
    nome: "Café", 
    ranking: "4º Ouro Verde (R$ 69 Bi)",
    imagem: "image/image/cafe.png", 
    solo: "Terrenos em altitude. Sensível ao alagamento.", 
    manejo: "Adoção de sistemas sombreados mitiga variações climáticas.",
    pragas: [
      { nome: "Bicho-mineiro", id: "Lesões nas folhas.", act: "Controle químico inicial rigoroso." }
    ]
  },
  "algodao": { 
    nome: "Algodão", 
    ranking: "5º Maior Exportação",
    imagem: "image/image/algodao.png", 
    solo: "Solos com mais de 1m de profundidade, boa umidade.", 
    manejo: "Cultura altamente tecnificada. Requer agricultura de precisão.",
    pragas: [
      { nome: "Bicudo-do-algodoeiro", id: "Botões caídos.", act: "Instalação de tubos mata-bicudo." }
    ]
  },
  "cana": { 
    nome: "Cana-de-açúcar", 
    ranking: "2º Maior VBP (R$ 105 Bi)",
    imagem: "image/image/cana.png", 
    solo: "Solos profundos (Latossolos), com boa aeração.", 
    manejo: "Colheita sem queima. Palhada protege contra estresse hídrico.",
    pragas: [
      { nome: "Broca-da-cana", id: "Furos nos colmos.", act: "Liberação preventiva de Cotesia flavipes." }
    ]
  }
};

let activeCrop = null;

function updateCropInsights(cropKey) {
  const data = agroDB[cropKey];
  if (!data) return;

  // Atualiza os dados na tela Holográfica
  document.getElementById('info-nome-cultura').innerText = data.nome;
  document.getElementById('info-ranking').innerText = data.ranking;
  document.getElementById('info-img-cultura').src = data.imagem;
  document.getElementById('info-solo-tipo').innerText = data.solo;
  document.getElementById('info-solo-manejo').innerText = data.manejo;
  
  const panel = document.getElementById('panel-plantacao');
  if (panel) panel.classList.add('visible');

  // Atualiza o painel de Pragas (Estágio 5)
  const listPragas = document.getElementById('lista-pragas');
  if (listPragas) {
    listPragas.innerHTML = `<h3 class="floating-title">Ameaças Biológicas: <span style="color:var(--primary);">${data.nome}</span></h3>`;
    data.pragas.forEach(p => {
      listPragas.innerHTML += `
        <div class="pest-item animate-fade-up">
          <strong>🐛 ${p.nome}</strong>
          <span>🔍 <b>Sintomas:</b> ${p.id}</span>
          <code>🛡️ <b>Manejo:</b> ${p.act}</code>
        </div>
      `;
    });
  }
}

// Lógica Otimizada: Se clicar no rádio selecionado, ele desmarca e oculta a tela.
document.querySelectorAll('.chip').forEach(chip => {
  const radio = chip.querySelector('input[type="radio"]');
  chip.addEventListener('click', function(e) {
    e.preventDefault(); 
    
    if (activeCrop === radio.value) {
      radio.checked = false; 
      activeCrop = null;
      document.getElementById('panel-plantacao').classList.remove('visible');
      document.getElementById('lista-pragas').innerHTML = `<h3 class="floating-title">Ameaças Biológicas: <span style="color:var(--muted);">Aguardando Seleção...</span></h3>`;
    } else {
      radio.checked = true; 
      activeCrop = radio.value;
      updateCropInsights(radio.value);
    }
  });
});

// Geolocalização e Dados Climáticos Inteligentes
function fetchWeatherTelemetrics() {
  const setMockData = (cidade) => {
    // Clima
    const temp = Math.floor(Math.random() * (35 - 18) + 18);
    document.getElementById('rt-temp').innerText = `${temp}°C`;
    document.getElementById('rt-location').innerText = `📍 ${cidade}`;
    
    // AQI
    const aqi = Math.floor(Math.random() * 120);
    let aqiText = "Boa"; let aqiColor = "#4caf50";
    if(aqi > 50) { aqiText = "Moderada"; aqiColor = "#ff9800"; }
    if(aqi > 100) { aqiText = "Ruim"; aqiColor = "#f44336"; }
    document.getElementById('rt-aqi').innerText = `${aqi} - ${aqiText}`;
    document.getElementById('rt-aqi').style.color = aqiColor;

    // Chuva
    const rain = Math.floor(Math.random() * 100);
    document.getElementById('rt-chuva').innerText = `${rain}%`;
    document.getElementById('rt-forecast').innerHTML = `
      <li><span>Amanhã</span> <span>${Math.random() > 0.5 ? '☀️' : '🌧️'} ${Math.floor(Math.random()*100)}%</span></li>
      <li><span>2 Dias</span> <span>${Math.random() > 0.5 ? '🌤️' : '⛈️'} ${Math.floor(Math.random()*100)}%</span></li>
      <li><span>3 Dias</span> <span>☀️ 0%</span></li>
    `;
    
    document.getElementById('hud-location').innerText = `SATÉLITE SINCRONIZADO // 📍 ${cidade.toUpperCase()}`;
  };

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => setMockData(`LAT ${pos.coords.latitude.toFixed(2)} | LON ${pos.coords.longitude.toFixed(2)}`),
      () => setMockData("SÃO PAULO, BR (Padrão)")
    );
  } else {
    setMockData("SISTEMA OFFLINE");
  }
}
setTimeout(fetchWeatherTelemetrics, 1000);

// Stepper Controle
const inputDias = document.getElementById('diasSeca');
document.getElementById('btnMinus')?.addEventListener('click', () => { let v = parseInt(inputDias.value)||0; if(v>0) inputDias.value = v-1; });
document.getElementById('btnPlus')?.addEventListener('click', () => { inputDias.value = (parseInt(inputDias.value)||0)+1; });

// Compilação Final (Gera o Centro e as 4 Caixas de Resultado)
document.getElementById('btnDiagnostico')?.addEventListener('click', () => {
  if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  
  // Exige que a cultura tenha sido escolhida antes de ir para o resultado
  if (!activeCrop) {
    alert("Inicie selecionando a Cultura Predominante da Lavoura.");
    document.querySelector('.journey-container').scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const culturaStr = activeCrop;
  const diasSeca = parseInt(inputDias.value) || 0;
  const calor = document.querySelector('input[name="calor"]:checked')?.value || "1";
  const soloObs = document.querySelector('input[name="soloObs"]:checked')?.value || "3";
  const pragas = document.querySelector('input[name="pragas"]:checked')?.value || "3";
  
  let ptsSeca = 0, ptsCalor = 0, ptsPraga = 0, ptsSolo = 0;
  if (diasSeca >= 10) ptsSeca = 3; else if (diasSeca >= 5) ptsSeca = 2; else if (diasSeca >= 3) ptsSeca = 1;
  if (calor === "2") ptsCalor = 1; else if (calor === "3") ptsCalor = 2;
  if (pragas === "1") ptsPraga = 3; else if (pragas === "2") ptsPraga = 1;
  if (soloObs === "1") ptsSolo = 2; else if (soloObs === "2") ptsSolo = 1;

  const pontos = ptsSeca + ptsCalor + ptsPraga + ptsSolo;

  let nivel = "NOMINAL", colorBadge = "#4caf50", glowBadge = "rgba(76, 175, 80, 0.4)";
  if (pontos > 2 && pontos <= 5) { nivel = "ATENÇÃO"; colorBadge = "#ff9800"; glowBadge = "rgba(255, 152, 0, 0.4)"; }
  else if (pontos > 5 && pontos <= 8) { nivel = "ALERTA"; colorBadge = "#f44336"; glowBadge = "rgba(244, 67, 54, 0.4)"; }
  else if (pontos > 8) { nivel = "CRÍTICO"; colorBadge = "#d32f2f"; glowBadge = "rgba(211, 47, 47, 0.4)"; }

  // 4 Cantos Telemetria
  const dbCultura = agroDB[culturaStr];
  document.getElementById('res-praga').innerText = pragas === "1" ? `Alerta vermelho para ${dbCultura.pragas[0].nome}. Pulverização corretiva necessária.` : `Índice biológico estável para ${dbCultura.nome}. Mantenha monitoramento.`;
  document.getElementById('res-solo').innerText = soloObs === "1" ? `Solo alagado. Suspenda maquinário pesado.` : `Condição aceitável. Mantenha os padrões de ${dbCultura.solo.split('.')[0]}.`;
  document.getElementById('res-chuva').innerText = diasSeca > 5 ? `Atenção: ${diasSeca} dias secos. Previsão de chuva: ${document.getElementById('rt-chuva').innerText}.` : `Regime hídrico satisfatório para a raiz da cultura.`;
  document.getElementById('res-clima').innerText = `Satélite registra ${document.getElementById('rt-temp').innerText} com AQI ${document.getElementById('rt-aqi').innerText.split('-')[0]}.`;

  // Atualiza Card Central
  document.getElementById('riskBadge').innerText = nivel;
  document.getElementById('riskBadge').style.color = colorBadge;

  const gaugeFill = document.getElementById('gaugeFill');
  if (gaugeFill) {
    const percent = Math.min(pontos / 10, 1);
    setTimeout(() => {
      gaugeFill.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 1s';
      gaugeFill.style.strokeDashoffset = 126 - (126 * percent);
      gaugeFill.style.stroke = colorBadge;
    }, 400);
  }

  const bars = [ { id: 'barSeca', val: ptsSeca, max: 3 }, { id: 'barCalor', val: ptsCalor, max: 2 }, { id: 'barPraga', val: ptsPraga, max: 3 }, { id: 'barSolo', val: ptsSolo, max: 2 } ];
  bars.forEach((b, i) => {
    const el = document.getElementById(b.id);
    if(el) {
      const p = (b.val / b.max) * 100;
      let cor = '#4caf50'; if(p > 33) cor = '#ff9800'; if(p > 66) cor = '#f44336';
      setTimeout(() => { el.style.width = p + '%'; el.style.background = cor; }, 600 + (i * 120));
    }
  });

  // Recomendações em Lista Central
  const recList = document.getElementById('recList');
  recList.innerHTML = '';
  if (pontos === 0) recList.innerHTML = "<li>Mantenha as práticas atuais. Lavoura sem estressores severos.</li>";
  if (diasSeca > 3) recList.innerHTML += `<li>Acionar plano de contingência hídrica para proteção de safra da ${dbCultura.nome}.</li>`;
  if (calor !== "1") recList.innerHTML += `<li>Suspender uso de herbicidas no período de pico térmico.</li>`;

  document.documentElement.style.setProperty('--primary', colorBadge);
  document.documentElement.style.setProperty('--glow', glowBadge);
  
  document.querySelector('.journey-container').scrollTo({ top: document.getElementById('stage-resultado').offsetTop, behavior: 'smooth' });
});

document.getElementById('btnRecomecar')?.addEventListener('click', () => {
  document.querySelector('.journey-container').scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('gaugeFill').style.strokeDashoffset = 126;
  document.querySelectorAll('.factor-fill').forEach(el => el.style.width = '0%');
  document.documentElement.style.setProperty('--primary', '#4caf50');
  
  // Reseta estado
  document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
  activeCrop = null;
  document.getElementById('panel-plantacao').classList.remove('visible');
  document.getElementById('lista-pragas').innerHTML = `<h3 class="floating-title">Ameaças Biológicas: <span style="color:var(--muted);">Aguardando Seleção...</span></h3>`;
});

// ==========================================
// 3. ENGINE WEBGL (MOTOR OTIMIZADO)
// ==========================================
(() => {
  const canvas = document.getElementById('particleCanvas');
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: false, preserveDrawingBuffer: false
  });

  if (!gl) return;

  const config = {
    maxDesktop: 28000, 
    maxMobile: 12000,
    sampleDesktop: 3, 
    sampleMobile: 4,
    pointDesktop: 2.3, 
    pointMobile: 2.6,
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
    homes: null, 
    scrollTarget: 0, scrollProgress: 0, 
    trail: [], pointer: { active: false, px: 0, py: 0, lastX: 0, lastY: 0, lastTime: 0 }, lastMove: 0
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
      
      float isPestBug = step(0.92, vSeed) * clamp(1.0 - abs(uProgress - 4.0), 0.0, 1.0);
      float mixFactor = fract(uProgress) + (isPestBug * 0.5);
      
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

      vec3 c0 = vec3(0.965, 0.955, 0.925); 
      vec3 c1 = vec3(0.58, 0.34, 0.18);    
      vec3 c2 = vec3(1.0, 0.65, 0.12);     
      vec3 c3 = vec3(0.45, 0.75, 0.98);    
      
      vec3 leafGreen = vec3(0.4, 0.55, 0.15); 
      vec3 bugWhite = vec3(0.95, 0.95, 0.95); 
      float isPestBug = step(0.92, vSeed) * clamp(1.0 - abs(uProgress - 4.0), 0.0, 1.0); 
      vec3 c4 = mix(leafGreen, bugWhite, isPestBug); 
      
      vec3 c5 = vec3(0.2, 0.9, 0.65);      

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
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);

  const locations = {
    position: gl.getAttribLocation(program, 'aPosition'),
    alpha: gl.getAttribLocation(program, 'aAlpha'),
    seed: gl.getAttribLocation(program, 'aSeed'),
    pointSize: gl.getUniformLocation(program, 'uPointSize'),
    dpr: gl.getUniformLocation(program, 'uDpr'),
    progress: gl.getUniformLocation(program, 'uProgress')
  };

  const bufs = { pos: gl.createBuffer(), alpha: gl.createBuffer(), seed: gl.createBuffer() };

  function readMaskCandidates(mask, sample) {
    const ctx = mask.getContext('2d', { willReadFrequently: true });
    const data = ctx.getImageData(0, 0, mask.width, mask.height).data;
    const candidates = [];
    for (let y = 0; y < mask.height; y += sample) {
      for (let x = 0; x < mask.width; x += sample) {
        if (data[(y * mask.width + x) * 4 + 3] > 24) candidates.push([pxToClipX(x), pxToClipY(y)]);
      }
    }
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

  function createTextMask() {
    const { c, ctx, w, h } = getCanvas();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    
    const fs = clamp(w * (state.mobile ? 0.18 : 0.14), 50, state.mobile ? 100 : 180);
    ctx.font = `900 ${fs}px "SF Pro Display", Inter, sans-serif`; 
    ctx.lineWidth = Math.max(1.5, fs * 0.02);
    const lh = fs * 0.85; 
    
    ['OrbitAgro', 'Copilot'].forEach((line, i) => {
      ctx.strokeText(line, w/2, h/2 + (i - 0.5) * lh); 
      ctx.fillText(line, w/2, h/2 + (i - 0.5) * lh);
    });
    return c;
  }

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
        ctx.globalAlpha = 0.26 + t * 0.68;
        ctx.beginPath(); 
        ctx.arc(cx - spread + u * spread * 2.0 + (Math.random()-0.5)*(2.5+t*7), y + wave + (Math.random()-0.5)*(1.5+t*5), 1.1 + t * 3.2, 0, Math.PI * 2); 
        ctx.fill();
      }
    }
    return c;
  }

  function createSunMask() {
    const { c, ctx, w, h } = getCanvas();
    const cx = 0; const cy = h * 0.20; const r = Math.min(w, h) * (state.mobile ? 0.25 : 0.35); 
    const sunGlow = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1)'); sunGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)'); sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGlow; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    const numRays = 26; 
    for(let i = 0; i < numRays; i++) {
       const baseAngle = -Math.PI * 0.15 + (i / 26) * Math.PI * 0.75 + (Math.random() * 0.08); 
       const r1 = r * 0.2; const r2 = Math.max(w, h) * 1.5; 
       const rayGrad = ctx.createLinearGradient(cx + Math.cos(baseAngle)*r1, cy + Math.sin(baseAngle)*r1, cx + Math.cos(baseAngle)*r2, cy + Math.sin(baseAngle)*r2);
       rayGrad.addColorStop(0, `rgba(255, 255, 255, ${0.6 + Math.random() * 0.4})`); rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
       ctx.strokeStyle = rayGrad; ctx.lineWidth = Math.max(4, r * 0.01 + Math.random() * 20);
       
       ctx.beginPath();
       const waves = 1.5 + Math.random() * 2.5, amplitude = r * (0.05 + Math.random() * 0.08); 
       for (let t = 0; t <= 1; t += 0.01) {
           const curR = r1 + (r2 - r1) * t, wOffset = Math.sin(t * Math.PI * 2 * waves) * amplitude;
           const px = cx + Math.cos(baseAngle)*curR + Math.cos(baseAngle + Math.PI/2)*wOffset;
           const py = cy + Math.sin(baseAngle)*curR + Math.sin(baseAngle + Math.PI/2)*wOffset;
           if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
       }
       ctx.stroke();
    }
    return c;
  }

  function createRainMask() {
    const { c, ctx, w, h } = getCanvas();
    const numNuvens = 12;
    for(let i=0; i<numNuvens; i++) {
      const px = (i/numNuvens) * w + (Math.random()-0.5)*100, py = -h*0.05 + Math.random()*h*0.15, raio = h*0.15 + Math.random()*h*0.1;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, raio);
      grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(px, py, raio, 0, Math.PI*2); ctx.fill();
    }
    ctx.lineWidth = 2;
    for(let i=0; i<150; i++) {
      const px = Math.random() * w, py = Math.random() * h, comp = 20 + Math.random() * 60;
      ctx.strokeStyle = `rgba(255,255,255,${0.2 + Math.random()*0.5})`;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - comp*0.2, py + comp); ctx.stroke();
    }
    return c;
  }

  function createPestMask() {
    const { c, ctx, w, h } = getCanvas();
    function drawLeaf(lx, ly, s, angle) {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s*0.6, -s*0.5, s*0.6, s*0.5, 0, s);
      ctx.bezierCurveTo(-s*0.6, s*0.5, -s*0.6, -s*0.5, 0, -s);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0.2)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    const leaves = [];
    const numLeaves = state.mobile ? 18 : 35; 
    const baseS = Math.min(w, h) * (state.mobile ? 0.08 : 0.12);

    for(let i=0; i<numLeaves; i++) {
      const lx = w * 0.05 + Math.random() * (w * 0.9);
      const ly = h * 0.05 + Math.random() * (h * 0.9);
      const leafAngle = Math.random() * Math.PI * 2;
      const lSize = baseS * (0.6 + Math.random() * 0.8); 
      leaves.push({x: lx, y: ly, s: lSize});
      drawLeaf(lx, ly, lSize, leafAngle);
    }

    ctx.globalCompositeOperation = 'destination-out';
    const numHoles = state.mobile ? 120 : 250; 
    for(let i=0; i<numHoles; i++) {
      const leaf = leaves[Math.floor(Math.random() * leaves.length)];
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * leaf.s * 0.75; 
      const bX = leaf.x + Math.cos(ang) * dist;
      const bY = leaf.y + Math.sin(ang) * dist;
      const holeSize = leaf.s * 0.05 + Math.random() * leaf.s * 0.15;
      ctx.beginPath(); ctx.arc(bX, bY, holeSize, 0, Math.PI*2); ctx.fill();
    }
    return c;
  }

  function createResultMask() {
    const { c, ctx, w, h } = getCanvas();
    const cx = w/2; const cy = h/2; const rBase = Math.min(w,h) * 0.4;
    for(let i=0; i<5; i++) {
      ctx.lineWidth = 1 + Math.random()*4; ctx.strokeStyle = `rgba(255,255,255,${1.0 - i*0.2})`;
      if(i%2 === 0) ctx.setLineDash([10 + Math.random()*30, 10 + Math.random()*20]); else ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx, cy, rBase + (i * 25), 0, Math.PI*2); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rBase*1.5);
    glow.addColorStop(0, 'rgba(255,255,255,0.15)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, rBase*1.5, 0, Math.PI*2); ctx.fill();
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

    state.homes = [
      new Float32Array(count * 2), new Float32Array(count * 2), new Float32Array(count * 2),
      new Float32Array(count * 2), new Float32Array(count * 2), new Float32Array(count * 2)
    ];

    for (let i = 0; i < count; i++) {
      const o = i * 3, o2 = i * 2;
      const z = (Math.random() - 0.5) * 0.18;
      
      state.homes[0][o2] = m1[i][0]; state.homes[0][o2+1] = m1[i][1];
      state.homes[1][o2] = m2[i][0]; state.homes[1][o2+1] = m2[i][1];
      state.homes[2][o2] = m3[i][0]; state.homes[2][o2+1] = m3[i][1];
      state.homes[3][o2] = m4[i][0]; state.homes[3][o2+1] = m4[i][1];
      state.homes[4][o2] = m5[i][0]; state.homes[4][o2+1] = m5[i][1];
      state.homes[5][o2] = m6[i][0]; state.homes[5][o2+1] = m6[i][1];

      state.positions[o] = m1[i][0] + (Math.random()-0.5)*0.012;
      state.positions[o+1] = m1[i][1] + (Math.random()-0.5)*0.012;
      state.positions[o+2] = z;

      state.alphas[i] = 0.28 + Math.random() * 0.72; state.seeds[i] = Math.random();
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.alpha); gl.bufferData(gl.ARRAY_BUFFER, state.alphas, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.seed); gl.bufferData(gl.ARRAY_BUFFER, state.seeds, gl.STATIC_DRAW);
  }

  function updateScrollTarget() {
    const scroller = document.querySelector('.journey-container');
    let currentScroll = 0;
    let maxScroll = 1;

    if (scroller) {
      currentScroll = scroller.scrollTop;
      maxScroll = Math.max(scroller.scrollHeight - (window.innerHeight || 1), 1);
    } else {
      currentScroll = window.scrollY;
      maxScroll = Math.max(document.body.scrollHeight - (window.innerHeight || 1), 1);
    }
    
    const ratio = clamp(currentScroll / maxScroll, 0, 1);
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
    const scroller = document.querySelector('.journey-container') || window;
    scroller.addEventListener('scroll', updateScrollTarget, { passive: true });
    window.addEventListener('mousemove', e => pushPointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchstart', e => { if(e.touches[0]) pushPointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('touchmove', e => { if(e.touches[0]) pushPointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('mouseleave', () => { state.pointer.active = false; state.pointer.lastTime = 0; state.trail.length = 0; });
    window.addEventListener('touchend', () => { state.pointer.active = false; state.pointer.lastTime = 0; state.trail.length = 0; });
  }

  function updatePhysics(now) {
    state.scrollProgress += (state.scrollTarget - state.scrollProgress) * config.scrollEase;
    const p = state.scrollProgress;
    
    const stage = clamp(Math.floor(p), 0, 5);
    const nextStage = clamp(stage + 1, 0, 5);
    const fract = clamp(p - stage, 0, 1);

    const activelyMoving = now - state.lastMove < config.settleDelay;
    const recentlyTouched = now - state.lastMove < config.releaseDelay;
    const globalReturnForce = (recentlyTouched || Math.abs(state.scrollTarget - state.scrollProgress) > 0.006) ? config.returnActive : config.returnIdle;

    const invW = 2 / state.width, invH = 2 / state.height;

    for (let t = state.trail.length - 1; t >= 0; t--) {
      state.trail[t].life *= activelyMoving ? 0.965 : 0.88;
      if (state.trail[t].life < 0.028) state.trail.splice(t, 1);
    }

    const maskA = state.homes[stage];
    const maskB = state.homes[nextStage];

    for (let i = 0; i < state.count; i++) {
      const o = i * 3, o2 = i * 2;
      let x = state.positions[o], y = state.positions[o+1], z = state.positions[o+2];
      let vx = state.velocities[o], vy = state.velocities[o+1], vz = state.velocities[o+2];
      
      const hx = maskA[o2] + (maskB[o2] - maskA[o2]) * fract;
      const hy = maskA[o2+1] + (maskB[o2+1] - maskA[o2+1]) * fract;

      vx += (hx - x) * globalReturnForce;
      vy += (hy - y) * globalReturnForce;
      vz += (0 - z) * globalReturnForce * 0.55;

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

      const distRain = Math.max(0, 1.0 - Math.abs(p - 3.0));
      if (distRain > 0.8) {
          vy -= 0.004 * distRain * (1.0 + state.seeds[i]);
          if (y < -1.2) { x = hx; y = 1.2; vy = 0; }
      }

      const distResult = Math.max(0, 1.0 - Math.abs(p - 5.0));
      if (distResult > 0.1) {
          vx += Math.sin(Math.atan2(y, x)) * 0.004 * distResult;
          vy -= Math.cos(Math.atan2(y, x)) * 0.004 * distResult;
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

  let lastTime = 0;
  function render(now) {
    if (!state.positions || !state.count) { requestAnimationFrame(render); return; }
    
    const dt = now - lastTime;
    if (dt < 16) { requestAnimationFrame(render); return; }
    lastTime = now;

    updatePhysics(now);

    const bgColors = [
      [0.02, 0.03, 0.08], [0.07, 0.04, 0.02], [0.10, 0.03, 0.00], 
      [0.04, 0.07, 0.09], [0.03, 0.06, 0.04], [0.01, 0.07, 0.08]  
    ];

    const p = clamp(state.scrollProgress, 0, 5);
    const stage = Math.floor(p);
    const nextStage = Math.min(stage + 1, 5);
    const fract = p - stage;

    const r = bgColors[stage][0] + (bgColors[nextStage][0] - bgColors[stage][0]) * fract;
    const g = bgColors[stage][1] + (bgColors[nextStage][1] - bgColors[stage][1]) * fract;
    const b = bgColors[stage][2] + (bgColors[nextStage][2] - bgColors[stage][2]) * fract;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(r, g, b, 1); 
    gl.clear(gl.COLOR_BUFFER_BIT);
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
    buildParticles(); updateScrollTarget();
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 140); });

  resize(); bindEvents(); requestAnimationFrame(render);
})();