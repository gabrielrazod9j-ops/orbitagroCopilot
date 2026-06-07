/**
 * ORBITAGRO COPILOT - PÁGINAS INTERNAS
 * Lógica de interatividade para as sub-páginas
 */

document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // FAQ ACORDEÃO
    // =============================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');
        if (!question) return;

        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Fecha todos os itens
            faqItems.forEach(i => {
                i.classList.remove('is-open');
                const q = i.querySelector('.faq-item__question');
                if (q) q.setAttribute('aria-expanded', 'false');
            });

            // Abre o item clicado (se estava fechado)
            if (!isOpen) {
                item.classList.add('is-open');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // =============================================
    // ANIMAÇÃO DE ENTRADA (SCROLL OBSERVER)
    // =============================================
    const revealEls = document.querySelectorAll('.step-item, .solution-card, .tech-card, .impact-card, .data-card, .faq-item');

    if (revealEls.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 60 * i);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealEls.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            revealObserver.observe(el);
        });
    }

});
