document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    // 1. LÓGICA DO CARROSSEL (UX de Abrir e Fechar Intocada)
    // =======================================================
    const secaoDetalhes = document.querySelector('#integrante-detalhes');
    const imagemDetalhe = document.querySelector('#detalhe-imagem');
    const nomeDetalhe = document.querySelector('#detalhe-nome');
    const cargoDetalhe = document.querySelector('#detalhe-cargo');
    const rmDetalhe = document.querySelector('#detalhe-rm');
    const descricaoDetalhe = document.querySelector('#detalhe-descricao');
    const turmaDetalhe = document.querySelector('#detalhe-turma');
    const linksDetalhe = document.querySelector('#detalhe-links');
    
    let integranteAberto = null; 

    const icones = {
        github: `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:100%;height:100%;fill:currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.01c-3.2.7-3.88-1.38-3.88-1.38-.53-1.33-1.29-1.68-1.29-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.11-.75.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .98-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.58.24 2.75.12 3.04.74.8 1.19 1.83 1.19 3.08 0 4.42-2.69 5.38-5.25 5.67.42.36.79 1.07.79 2.16v3.01c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>`,
        linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:100%;height:100%;fill:currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.4h3.96V21H3V9.4Zm6.24 0h3.79v1.58h.05c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.07V21h-3.95v-5.32c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9.24V9.4Z"/></svg>`
    };

    function limparSelecao() {
        document.querySelectorAll('.slide .item').forEach(el => el.classList.remove('selecionado'));
    }

    document.body.addEventListener('click', (event) => {
        const itemClicado = event.target.closest('.item');
        
        if (itemClicado) {
            const data = itemClicado.dataset;

            if (integranteAberto === data.rm && secaoDetalhes.classList.contains('ativo')) {
                secaoDetalhes.classList.remove('ativo');
                limparSelecao();
                integranteAberto = null; 
                setTimeout(() => { secaoDetalhes.style.display = 'none'; }, 400); 
            } else {
                imagemDetalhe.src = data.imagem;
                nomeDetalhe.textContent = data.nome;
                cargoDetalhe.textContent = data.cargo;
                rmDetalhe.textContent = `RM: ${data.rm}`;
                turmaDetalhe.textContent = `Turma: ${data.turma}`;
                descricaoDetalhe.textContent = data.descricao;

                linksDetalhe.innerHTML = `
                    <a class="social-link" href="${data.github}" target="_blank">
                        <span class="social-link__icon">${icones.github}</span><span>GitHub</span>
                    </a>
                    <a class="social-link" href="${data.linkedin}" target="_blank">
                        <span class="social-link__icon">${icones.linkedin}</span><span>LinkedIn</span>
                    </a>
                `;

                limparSelecao();
                itemClicado.classList.add('selecionado');
                integranteAberto = data.rm;

                secaoDetalhes.style.display = 'block';
                setTimeout(() => {
                    secaoDetalhes.classList.add('ativo');
                    secaoDetalhes.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
            }
        }
    });

    // =======================================================
    // 2. MOTOR WEBGL (Mesma Lógica da Home, Foco Orbital)
    // =======================================================
    const canvas = document.getElementById('blackHoleCanvas');
    const gl = canvas ? canvas.getContext('webgl', { alpha: true, antialias: false, depth: false }) : null;

    if (gl) {
        // As mesmas constantes físicas da Home para o comportamento do rato
        const config = { 
            maxDesktop: 35000, maxMobile: 15000, 
            pointDesktop: 2.2, pointMobile: 2.6, 
            returnForce: 0.02, friction: 0.95, 
            maxSpeed: 0.07, 
            mouseFollowRadius: 180, mouseFollow: 0.0006, 
            pathFollow: 0.007, pathEdgePull: 0.008, 
            pathTube: 150, flow: 0.0015
        };

        const state = { 
            width: 1, height: 1, dpr: 1, mobile: false, count: 0, 
            positions: null, velocities: null, angles: null, radii: null, speeds: null, alphas: null, colors: null,
            trail: [], pointer: { active: false, px: 0, py: 0, lastX: 0, lastY: 0, lastTime: 0 } 
        };

        const clamp = (v, min, max) => Math.max(min, Math.min(max, v)); 
        const pxToClipX = px => (px / state.width) * 2 - 1; 
        const pxToClipY = py => 1 - (py / state.height) * 2; 
        const clipToPxX = x => (x + 1) * 0.5 * state.width; 
        const clipToPxY = y => (1 - y) * 0.5 * state.height;

        // SHADERS OTIMIZADOS
        const vertexSource = `
            attribute vec3 aPosition;
            attribute float aAlpha;
            attribute vec3 aColor;
            uniform float uPointSize;
            uniform float uDpr;
            varying float vAlpha;
            varying vec3 vColor;
            void main() {
                vAlpha = aAlpha;
                vColor = aColor;
                gl_Position = vec4(aPosition, 1.0);
                float depth = 1.0 + aPosition.z * 0.2;
                gl_PointSize = uPointSize * uDpr * depth;
            }
        `;

        const fragmentSource = `
            precision highp float;
            varying float vAlpha;
            varying vec3 vColor;
            void main() {
                vec2 uv = gl_PointCoord - 0.5;
                float d = length(uv);
                float dotMask = smoothstep(0.48, 0.1, d);
                float core = smoothstep(0.18, 0.0, d) * 0.5;
                gl_FragColor = vec4(vColor, (dotMask + core) * vAlpha);
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
            color: gl.getAttribLocation(program, 'aColor'), 
            pointSize: gl.getUniformLocation(program, 'uPointSize'), 
            dpr: gl.getUniformLocation(program, 'uDpr') 
        };
        
        const bufs = { pos: gl.createBuffer(), alpha: gl.createBuffer(), color: gl.createBuffer() };

        // CONSTRUÇÃO MATEMÁTICA DO BURACO NEGRO
        function buildParticles() { 
            state.mobile = window.innerWidth < 720; 
            state.width = window.innerWidth; state.height = window.innerHeight; 
            
            const count = state.mobile ? config.maxMobile : config.maxDesktop; 
            state.count = count; 

            state.positions = new Float32Array(count * 3); 
            state.velocities = new Float32Array(count * 3); 
            state.colors = new Float32Array(count * 3);
            state.alphas = new Float32Array(count); 
            
            // Fatores orbitais
            state.angles = new Float32Array(count); 
            state.radii = new Float32Array(count); 
            state.speeds = new Float32Array(count);

            const aspect = state.width / state.height;

            for (let i = 0; i < count; i++) { 
                const o = i * 3; 
                state.angles[i] = Math.random() * Math.PI * 2; 
                
                // Distribuição não-linear: densidade monstruosa no centro, esparso nas pontas
                const distribution = Math.pow(Math.random(), 4);
                state.radii[i] = 0.22 + distribution * 1.5; // O vazio no centro é garantido pelo 0.22!
                state.speeds[i] = (0.0015 / state.radii[i]) + 0.0002; 

                state.positions[o] = (Math.cos(state.angles[i]) * state.radii[i]) / aspect; 
                state.positions[o+1] = Math.sin(state.angles[i]) * state.radii[i] * 0.35; 
                state.positions[o+2] = (Math.random() - 0.5) * 0.1; 

                state.alphas[i] = 0.3 + Math.random() * 0.7; 

                // CORES DE INTERESTELAR (Quente para Frio)
                let colorMix = Math.random();
                if (colorMix > 0.8) {
                    state.colors[o] = 1.0; state.colors[o+1] = 0.95; state.colors[o+2] = 0.8; // Branco Core
                } else if (colorMix > 0.3) {
                    state.colors[o] = 1.0; state.colors[o+1] = 0.6; state.colors[o+2] = 0.1; // Dourado
                } else {
                    state.colors[o] = 0.8; state.colors[o+1] = 0.2; state.colors[o+2] = 0.05; // Vermelho Quente
                }
            } 

            gl.bindBuffer(gl.ARRAY_BUFFER, bufs.alpha); gl.bufferData(gl.ARRAY_BUFFER, state.alphas, gl.STATIC_DRAW); 
            gl.bindBuffer(gl.ARRAY_BUFFER, bufs.color); gl.bufferData(gl.ARRAY_BUFFER, state.colors, gl.STATIC_DRAW); 
        }

        // LÓGICA DO RASTRO DO RATO (Exatamente a mesma física da Home)
        function sampleTrail(px, py) { 
            let best = null; let bestScore = 0; 
            if (state.trail.length < 2) return null; 
            for (let i = 1; i < state.trail.length; i++) { 
                const a = state.trail[i - 1]; const b = state.trail[i]; 
                const abx = b.x - a.x; const aby = b.y - a.y; const len2 = abx * abx + aby * aby || 1; 
                const u = clamp(((px - a.x) * abx + (py - a.y) * aby) / len2, 0, 1); 
                const cx = a.x + abx * u; const cy = a.y + aby * u; 
                const dx = px - cx; const dy = py - cy; const d2 = dx * dx + dy * dy; 
                const trailAge = (state.trail.length - i) / Math.max(1, state.trail.length); 
                const r = config.pathTube * (1.08 - trailAge * 0.4); 

                if (d2 < r * r) { 
                    const d = Math.sqrt(d2) || 1; const len = Math.sqrt(len2) || 1; 
                    const score = Math.pow(1.0 - d / r, 1.25) * ((a.life * (1.0 - u) + b.life * u) * (1.0 - trailAge * 0.2)); 
                    if (score > bestScore) { 
                        bestScore = score; 
                        best = { 
                            x: cx, y: cy, d, tx: abx/len, ty: aby/len, 
                            nx: d > 1 ? dx/d : -aby/len, ny: d > 1 ? dy/d : abx/len, 
                            vx: a.vx*(1-u) + b.vx*u, vy: a.vy*(1-u) + b.vy*u, 
                            score, head: i > state.trail.length - 5 
                        }; 
                    } 
                } 
            } 
            return best; 
        }

        function pushPointer(x, y) { 
            const now = performance.now(); const dt = Math.max(16, now - (state.pointer.lastTime || now)); 
            const vx = state.pointer.lastTime ? (x - state.pointer.lastX) / dt * 16.67 : 0; 
            const vy = state.pointer.lastTime ? (y - state.pointer.lastY) / dt * 16.67 : 0; 
            
            state.pointer.active = true; state.pointer.px = x; state.pointer.py = y; 
            state.pointer.lastX = x; state.pointer.lastY = y; state.pointer.lastTime = now; 

            const prev = state.trail[state.trail.length - 1]; 
            if (!prev || Math.hypot(x - prev.x, y - prev.y) > 2.8) { 
                state.trail.push({ x, y, vx, vy, life: 1.0 }); 
                while (state.trail.length > 128) state.trail.shift(); 
            } 
        }

        window.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            pushPointer(e.clientX - rect.left, e.clientY - rect.top);
        }, { passive: true });
        
        window.addEventListener('mouseleave', () => { state.pointer.active = false; state.trail.length = 0; }); 

        // O MOTOR DE ATUALIZAÇÃO FÍSICA
        function updatePhysics() { 
            for (let t = state.trail.length - 1; t >= 0; t--) { 
                state.trail[t].life *= 0.94; 
                if (state.trail[t].life < 0.05) state.trail.splice(t, 1); 
            } 

            const invW = 2 / state.width; const invH = 2 / state.height; 
            const aspect = state.width / state.height;

            for (let i = 0; i < state.count; i++) { 
                const o = i * 3; 
                let x = state.positions[o], y = state.positions[o+1], z = state.positions[o+2]; 
                let vx = state.velocities[o], vy = state.velocities[o+1], vz = state.velocities[o+2]; 
                
                // Órbita
                state.angles[i] += state.speeds[i];
                const hx = (Math.cos(state.angles[i]) * state.radii[i]) / aspect;
                const hy = Math.sin(state.angles[i]) * state.radii[i] * 0.35; // Achata para o 3D

                vx += (hx - x) * config.returnForce; 
                vy += (hy - y) * config.returnForce; 
                vz += (0 - z) * config.returnForce; 

                // Interação com o Mouse (Magia da Home Page)
                if (state.trail.length) { 
                    const px = clipToPxX(x), py = clipToPxY(y); 
                    const mx = state.pointer.px, my = state.pointer.py; 
                    const mdx = mx - px, mdy = my - py; 
                    const md2 = mdx * mdx + mdy * mdy; 

                    if (md2 < config.mouseFollowRadius * config.mouseFollowRadius) { 
                        const md = Math.sqrt(md2) || 1.0; 
                        const ms = Math.pow(1.0 - md / config.mouseFollowRadius, 1.45); 
                        vx += (mdx / md) * config.mouseFollow * ms * invW * 260.0; 
                        vy += -(mdy / md) * config.mouseFollow * ms * invH * 260.0; 
                    } 

                    const hit = sampleTrail(px, py); 
                    if (hit) { 
                        const s = hit.score; const gesture = Math.hypot(hit.vx, hit.vy); 
                        let dirX = hit.tx, dirY = hit.ty; 
                        if (gesture > 0.01 && dirX * hit.vx + dirY * hit.vy < 0.0) { dirX *= -1; dirY *= -1; } 

                        const headBoost = hit.head ? 1.6 : 1.0; 
                        vx += (dirX * invW) * config.pathFollow * s * 400.0; 
                        vy += (-dirY * invH) * config.pathFollow * s * 400.0; 
                        vx += (hit.nx * invW) * config.pathEdgePull * s * 550.0 * headBoost; 
                        vy += (-hit.ny * invH) * config.pathEdgePull * s * 550.0 * headBoost; 
                    } 
                } 

                vx *= config.friction; vy *= config.friction; vz *= 0.94; 
                const speed = Math.hypot(vx, vy); 
                if (speed > config.maxSpeed) { vx *= config.maxSpeed / speed; vy *= config.maxSpeed / speed; } 

                x += vx; y += vy; z = clamp(z + vz, -0.4, 0.4); 

                state.positions[o] = x; state.positions[o+1] = y; state.positions[o+2] = z; 
                state.velocities[o] = vx; state.velocities[o+1] = vy; state.velocities[o+2] = vz; 
            } 
        }

        function render() { 
            if (!state.positions || !state.count) { requestAnimationFrame(render); return; } 
            updatePhysics(); 

            gl.viewport(0, 0, canvas.width, canvas.height); 
            // Fundo totalmente transparente para que a cor azul do CSS se veja
            gl.clearColor(0, 0, 0, 0); 
            gl.clear(gl.COLOR_BUFFER_BIT); 
            
            gl.useProgram(program); 
            gl.enable(gl.BLEND); 
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE); 

            gl.bindBuffer(gl.ARRAY_BUFFER, bufs.pos); gl.bufferData(gl.ARRAY_BUFFER, state.positions, gl.DYNAMIC_DRAW); 
            gl.enableVertexAttribArray(locations.position); gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0); 

            gl.bindBuffer(gl.ARRAY_BUFFER, bufs.alpha); gl.enableVertexAttribArray(locations.alpha); gl.vertexAttribPointer(locations.alpha, 1, gl.FLOAT, false, 0, 0); 
            gl.bindBuffer(gl.ARRAY_BUFFER, bufs.color); gl.enableVertexAttribArray(locations.color); gl.vertexAttribPointer(locations.color, 3, gl.FLOAT, false, 0, 0); 

            gl.uniform1f(locations.pointSize, state.mobile ? config.pointMobile : config.pointDesktop); 
            gl.uniform1f(locations.dpr, state.dpr); 

            gl.drawArrays(gl.POINTS, 0, state.count); 
            requestAnimationFrame(render); 
        }

        function resize() { 
            state.width = canvas.parentElement.offsetWidth || 1400; 
            state.height = canvas.parentElement.offsetHeight || 900; 
            state.mobile = window.innerWidth < 720; 
            state.dpr = Math.min(window.devicePixelRatio || 1, state.mobile ? 1.4 : 1.6); 
            
            canvas.width = Math.floor(state.width * state.dpr); 
            canvas.height = Math.floor(state.height * state.dpr); 
            
            buildParticles(); 
        }

        let resizeTimer = 0; 
        window.addEventListener('resize', () => { 
            clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); 
        }); 

        resize(); requestAnimationFrame(render); 
    }
});