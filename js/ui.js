// ============================================
// ui.js — ResQ Animations & Interactions
// ============================================

// ---- PARTICLE SYSTEM ----
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(true); }

        reset(initial = false) {
            this.x = Math.random() * W;
            this.y = initial ? Math.random() * H : H + 10;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedY = -(Math.random() * 0.4 + 0.1);
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.6
                ? `rgba(224, 123, 57, ${this.opacity})`
                : `rgba(245, 239, 230, ${this.opacity * 0.4})`;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.y < -10) this.reset();
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    for (let i = 0; i < 75; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }

    animate();
})();

// ---- SCROLL EFFECTS ----
window.addEventListener('scroll', () => {
    const header = document.getElementById('mainHeader');
    if (header) {
        header.classList.toggle('scrolled', window.scrollY > 40);
    }

    // Animate elements on scroll
    document.querySelectorAll('.contact-card, .quick-btn').forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) {
            el.style.animationPlayState = 'running';
        }
    });
});

// ---- LANGUAGE SWITCHER ----
let langMenuOpen = false;

function toggleLangMenu() {
    langMenuOpen = !langMenuOpen;
    const menu = document.getElementById('langMenu');
    const arrow = document.getElementById('langArrow');
    menu.classList.toggle('open', langMenuOpen);
    arrow.classList.toggle('open', langMenuOpen);
}

function selectLang(lang, flag, label) {
    // Update button display
    document.getElementById('currentFlag').textContent = flag;
    document.getElementById('currentLangLabel').textContent = label;

    // Update active state
    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Close menu
    langMenuOpen = false;
    document.getElementById('langMenu').classList.remove('open');
    document.getElementById('langArrow').classList.remove('open');

    // Trigger language change in app
    if (typeof setLang === 'function') setLang(lang);
}

// Close lang menu when clicking outside
document.addEventListener('click', (e) => {
    const switcher = document.getElementById('langSwitcher');
    if (switcher && !switcher.contains(e.target) && langMenuOpen) {
        langMenuOpen = false;
        document.getElementById('langMenu').classList.remove('open');
        document.getElementById('langArrow').classList.remove('open');
    }
});

// ---- QUICK BTN RIPPLE EFFECT ----
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top:  ${e.clientY - rect.top - size / 2}px;
      background: rgba(224,123,57,0.2);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleAnim 0.5s ease-out forwards;
      pointer-events: none;
    `;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    });
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleAnim {
    to { transform: scale(2.5); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ---- TYPING EFFECT for placeholder ----
(function typingPlaceholder() {
    const textarea = document.getElementById('emergencyInput');
    if (!textarea) return;

    const phrases = [
        'e.g. A person collapsed and is not breathing...',
        'e.g. Someone is choking on food, cannot speak...',
        'e.g. Deep wound with heavy bleeding, what do I do?',
        'e.g. Snake bite on the leg in rural area...',
        'e.g. Person having a seizure on the floor...',
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let paused = false;

    function type() {
        if (document.activeElement === textarea) {
            setTimeout(type, 200);
            return;
        }

        const phrase = phrases[phraseIdx];

        if (!deleting && !paused) {
            charIdx++;
            textarea.placeholder = phrase.slice(0, charIdx);
            if (charIdx === phrase.length) {
                paused = true;
                setTimeout(() => { paused = false; deleting = true; type(); }, 2200);
                return;
            }
        } else if (deleting && !paused) {
            charIdx--;
            textarea.placeholder = phrase.slice(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
            }
        }

        setTimeout(type, deleting ? 25 : 55);
    }

    setTimeout(type, 1000);
})();

// ---- COUNTER ANIMATION ----
(function animateStats() {
    const stats = [
        { el: null, target: 8, suffix: '+' },
        { el: null, target: 3, suffix: '' },
        { el: null, target: 4, suffix: '' },
    ];

    document.querySelectorAll('.stat-num').forEach((el, i) => {
        if (stats[i]) stats[i].el = el;
    });

    function countUp(stat) {
        let current = 0;
        const step = stat.target / 30;
        const timer = setInterval(() => {
            current = Math.min(current + step, stat.target);
            if (stat.el) stat.el.textContent = Math.round(current) + stat.suffix;
            if (current >= stat.target) clearInterval(timer);
        }, 40);
    }

    setTimeout(() => stats.forEach(s => s.el && countUp(s)), 600);
})();