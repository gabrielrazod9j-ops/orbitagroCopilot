document.addEventListener('DOMContentLoaded', () => {

    // =======================================================
    // 1. LÓGICA DO CARROSSEL DE DETALHES 
    // =======================================================
    const secaoDetalhes = document.querySelector('#integrante-detalhes');
    const imagemDetalhe = document.querySelector('#detalhe-imagem');
    const nomeDetalhe = document.querySelector('#detalhe-nome');
    const cargoDetalhe = document.querySelector('#detalhe-cargo');
    const rmDetalhe = document.querySelector('#detalhe-rm');
    const descricaoDetalhe = document.querySelector('#detalhe-descricao');
    const turmaDetalhe = document.querySelector('#detalhe-turma');
    const linksDetalhe = document.querySelector('#detalhe-links');

    const icones = {
        github: `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:100%;height:100%;fill:currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.01c-3.2.7-3.88-1.38-3.88-1.38-.53-1.33-1.29-1.68-1.29-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.11-.75.41-1.26.74-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .98-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.58.24 2.75.12 3.04.74.8 1.19 1.83 1.19 3.08 0 4.42-2.69 5.38-5.25 5.67.42.36.79 1.07.79 2.16v3.01c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>`,
        linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:100%;height:100%;fill:currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.4h3.96V21H3V9.4Zm6.24 0h3.79v1.58h.05c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.07V21h-3.95v-5.32c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9.24V9.4Z"/></svg>`
    };

    document.body.addEventListener('click', (event) => {
        const itemClicado = event.target.closest('.item');
        if (itemClicado) {
            const data = itemClicado.dataset;
            imagemDetalhe.src = data.imagem;
            nomeDetalhe.textContent = data.nome;
            cargoDetalhe.textContent = data.cargo;
            rmDetalhe.textContent = `RM: ${data.rm}`;
            turmaDetalhe.textContent = `Turma: ${data.turma}`;
            descricaoDetalhe.textContent = data.descricao;

            linksDetalhe.innerHTML = `
                <a class="social-link" href="${data.github}" target="_blank">
                    <span class="social-link__icon">${icones.github}</span>
                    <span>GitHub</span>
                </a>
                <a class="social-link" href="${data.linkedin}" target="_blank">
                    <span class="social-link__icon">${icones.linkedin}</span>
                    <span>LinkedIn</span>
                </a>
            `;

            secaoDetalhes.style.display = 'block';
            setTimeout(() => {
                secaoDetalhes.classList.add('ativo');
                secaoDetalhes.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        }
    });

    // =======================================================
    // 2. BURACO NEGRO DE PARTÍCULAS (Estética Interestelar)
    // =======================================================
    const canvas = document.getElementById('blackHoleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = 1000;
        canvas.height = 1000;
        
        const particles = [];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const eventHorizonRadius = 90; 

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.angle = Math.random() * Math.PI * 2;
                // Partículas ficam densamente empacotadas perto do centro
                this.radius = eventHorizonRadius + 5 + (Math.random() * 380); 
                // Física rotacional (Mais rápido no centro)
                this.speed = (1.5 / this.radius) + 0.001; 
                this.size = Math.random() * 1.8 + 0.5;
                
                // Tons quentes espaciais: Branco, Laranja, Dourado e Cobre Escuro
                const colorMix = Math.random();
                if (colorMix > 0.8) this.color = `rgba(255, 240, 220, ${Math.random() * 0.8 + 0.2})`;
                else if (colorMix > 0.4) this.color = `rgba(255, 160, 60, ${Math.random() * 0.8 + 0.2})`;
                else this.color = `rgba(150, 70, 20, ${Math.random() * 0.6 + 0.1})`;
            }
            update() {
                this.angle += this.speed;
                // Projeção 3D achatada
                this.x = centerX + Math.cos(this.angle) * this.radius;
                this.y = centerY + Math.sin(this.angle) * this.radius * 0.22;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 1300 partículas criando uma nuvem massiva!
        for (let i = 0; i < 1300; i++) particles.push(new Particle());

        function animateBlackHole() {
            // Fundo escuro com leve transparência para rastro
            ctx.fillStyle = 'rgba(1, 2, 5, 0.35)'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => p.update());

            // Ordena as partículas pelo eixo Y (Gera o efeito 3D real de frente e trás)
            particles.sort((a, b) => a.y - b.y);

            // Desenha as partículas que ficam por TRÁS do buraco negro
            particles.forEach(p => { if(p.y < centerY) p.draw(); });

            // A Esfera do Buraco Negro (Vazio absoluto absorvendo a luz)
            ctx.beginPath();
            ctx.arc(centerX, centerY, eventHorizonRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
            // Coroa de distorção de luz
            ctx.shadowColor = 'rgba(255, 180, 80, 0.4)';
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Desenha as partículas que passam pela FRENTE do buraco negro
            particles.forEach(p => { if(p.y >= centerY) p.draw(); });

            requestAnimationFrame(animateBlackHole);
        }
        animateBlackHole();
    }
});