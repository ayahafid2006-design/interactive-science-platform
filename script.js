// Thematic Backgrounds
const chemistrySymbols = [
    '<i class="fa-solid fa-flask"></i>',
    '<i class="fa-solid fa-dna"></i>',
    '<i class="fa-solid fa-atom"></i>',
    '<i class="fa-solid fa-vial"></i>',
    '<i class="fa-solid fa-microscope"></i>',
    '<i class="fa-solid fa-circle-nodes"></i>',
    '<span style="font-family: sans-serif; font-weight: bold;">⌬</span>'
];

const physicsSymbols = [
    '<i class="fa-solid fa-magnet"></i>',
    '<i class="fa-solid fa-gear"></i>',
    '<i class="fa-solid fa-wave-square"></i>',
    '<i class="fa-solid fa-meteor"></i>',
    '<i class="fa-solid fa-satellite"></i>',
    '<i class="fa-solid fa-bolt"></i>',
    '<span style="font-family: serif; font-weight: bold; font-style: italic;">E=mc²</span>'
];

function initThematicBackgrounds() {
    const chemColors = ['rgba(59, 130, 246, 1)', 'rgba(168, 85, 247, 1)', 'rgba(139, 92, 246, 1)'];
    const physColors = ['rgba(249, 115, 22, 1)', 'rgba(6, 182, 212, 1)', 'rgba(245, 158, 11, 1)'];
    
    function createSymbols(containerSelector, symbols, colors) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        // Dashboards get 50 symbols for full-screen, index gets 25 per side
        const isDashboard = container.classList.contains('dashboard-bg');
        const numSymbols = isDashboard ? 50 : 25;
        
        for (let i = 0; i < numSymbols; i++) {
            const el = document.createElement('div');
            el.classList.add('floating-symbol');
            el.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
            
            const size = (Math.random() * 2) + 1.5; 
            const left = Math.random() * 90 + 5; 
            const duration = Math.random() * 30 + 25; 
            const delay = Math.random() * -55; 
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 360 + 180);
            const driftX = (Math.random() - 0.5) * 150; 
            
            el.style.fontSize = `${size}rem`;
            el.style.left = `${left}%`;
            el.style.color = color;
            el.style.top = `105%`; 
            
            const peakOpacity = Math.random() * 0.15 + 0.05;
            
            el.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 0 },
                { opacity: peakOpacity, offset: 0.2 },
                { opacity: peakOpacity, offset: 0.8 },
                { transform: `translate(${driftX}px, -120vh) rotate(${rotation}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                iterations: Infinity,
                delay: delay * 1000,
                easing: 'linear'
            });
            
            container.appendChild(el);
        }
    }
    
    createSymbols('.bg-chemistry', chemistrySymbols, chemColors);
    createSymbols('.bg-physics', physicsSymbols, physColors);
}

initThematicBackgrounds();

// Interaction Physics (Dive-in & Flashlight Glow)
// Target both main portals and dashboard experiment cards
const interactiveCards = document.querySelectorAll('.portal, .experiment-card');

interactiveCards.forEach(card => {
    // Advanced Mouse-Tracking Glow (Flashlight Effect)
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });

    // Dive-in effect ONLY applies to the large landing page portals
    if (card.classList.contains('portal')) {
        card.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            if (document.body.classList.contains('diving')) return;
            
            document.body.classList.add('diving');
            
            this.style.zIndex = '100';
            this.classList.add('dive-in');
            
            const targetUrl = this.getAttribute('data-target');
            
            setTimeout(() => {
                // Execute actual routing logic
                if (targetUrl === '/chemistry') {
                    window.location.href = './chemistry-experiments/index.html';
                } else if (targetUrl === '/physics') {
                    window.location.href = './Raqeem-demo-main/Raqeem-demo-main/index.html';
                }
            }, 800); // 800ms gives time for the exponential scale animation to finish
        });
    }
});

// ==========================================
// Translation Dictionary & Language Toggle
// ==========================================
const translations = {
    ar: {
        header_title: "المنصة العلمية التفاعلية",
        header_subtitle: "اختر مسارك العلمي للبدء",
        chem_main: "الكيمياء",
        chem_sub: "CHEMISTRY",
        phys_main: "الفيزياء",
        phys_sub: "PHYSICS"
    },
    en: {
        header_title: "Interactive Science Platform",
        header_subtitle: "Choose your scientific path to begin",
        chem_main: "CHEMISTRY",
        chem_sub: "الكيمياء",
        phys_main: "PHYSICS",
        phys_sub: "الفيزياء"
    }
};

const langToggleBtn = document.querySelector('.lang-toggle');
// Ensure it gracefully degrades if language toggle doesn't exist on dashboard pages
if (langToggleBtn) {
    let currentLang = localStorage.getItem('site_lang') || 'ar';

    function updateUI(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.classList.add('text-fade-out');
                
                setTimeout(() => {
                    el.innerText = translations[lang][key];
                    el.classList.remove('text-fade-out');
                }, 300);
            }
        });

        if (lang === 'ar') {
            langToggleBtn.innerHTML = `<strong>AR</strong> <span style="opacity: 0.5; font-weight: normal;">| EN</span>`;
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            langToggleBtn.innerHTML = `<span style="opacity: 0.5; font-weight: normal;">AR |</span> <strong>EN</strong>`;
            document.documentElement.setAttribute('lang', 'en');
        }
    }

    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        localStorage.setItem('site_lang', currentLang);
        updateUI(currentLang);
    });

    if (currentLang === 'en') {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations['en'][key]) {
                el.innerText = translations['en'][key];
            }
        });
        langToggleBtn.innerHTML = `<span style="opacity: 0.5; font-weight: normal;">AR |</span> <strong>EN</strong>`;
        document.documentElement.setAttribute('lang', 'en');
    } else {
        langToggleBtn.innerHTML = `<strong>AR</strong> <span style="opacity: 0.5; font-weight: normal;">| EN</span>`;
    }
}
