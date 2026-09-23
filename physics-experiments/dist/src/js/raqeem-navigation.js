/**
 * RAQEEM Physics Platform - Unified Global Navigation Engine
 * Automatically renders a consistent, mobile-optimized slide-out drawer across all experiments.
 */
(function () {
    const CHAPTERS = [
        {
            id: 'ch-1',
            title: 'الفصل الأول: المتسعات',
            icon: 'fa-solid fa-bolt',
            experiments: [
                {
                    title: 'ربط المتسعات على التوازي',
                    file: 'parallel.html',
                    icon: 'fa-solid fa-layer-group'
                },
                {
                    title: 'سلوك العازل غير القطبي',
                    file: 'nonpolar.html',
                    icon: 'fa-solid fa-cube'
                },
                {
                    title: 'تطبيقات المتسعة (لوحة المفاتيح)',
                    file: 'capacitor_application_keyboard.html',
                    icon: 'fa-solid fa-keyboard'
                }
            ]
        },
        {
            id: 'ch-2',
            title: 'الفصل الثاني: الحث الكهرومغناطيسي',
            icon: 'fa-solid fa-magnet',
            experiments: [
                {
                    title: 'تجربة حلقة فراداي',
                    file: 'faraday_experiment.html',
                    icon: 'fa-solid fa-ring'
                },
                {
                    title: 'حركة الجسيمات المشحونة',
                    file: 'fields_effect.html',
                    icon: 'fa-solid fa-atom'
                }
            ]
        },
        {
            id: 'ch-3',
            title: 'الفصل الثالث: دوائر التيار المتناوب',
            icon: 'fa-solid fa-wave-square',
            experiments: [
                {
                    title: 'مقارنة التيار المستمر والمتناوب',
                    file: 'intro_dc_vs_ac.html',
                    icon: 'fa-solid fa-sliders'
                },
                {
                    title: 'المقدار المؤثر والتأثير الحراري',
                    file: 'concept_rms_thermal_effect.html',
                    icon: 'fa-solid fa-fire-flame-curved'
                }
            ]
        }
    ];

    function initNavigation() {
        const currentPath = window.location.pathname.split('/').pop().toLowerCase() || '';

        // Check or create floating toggle button
        let toggleBtn = document.getElementById('menu-toggle-btn');
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.id = 'menu-toggle-btn';
            toggleBtn.className = 'drawer-toggle';
            toggleBtn.title = 'فتح القائمة';
            toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            document.body.prepend(toggleBtn);
        } else {
            toggleBtn.className = 'drawer-toggle';
            toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }

        // Check or create overlay
        let overlay = document.getElementById('drawer-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'drawer-overlay';
            overlay.className = 'drawer-overlay';
            document.body.appendChild(overlay);
        }

        // Build or replace drawer
        let drawer = document.getElementById('side-drawer');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'side-drawer';
            drawer.className = 'drawer';
            document.body.appendChild(drawer);
        } else {
            drawer.className = 'drawer';
        }

        // Generate Drawer Inner HTML
        let chaptersHtml = '';
        CHAPTERS.forEach(ch => {
            const hasCurrent = ch.experiments.some(ex => ex.file.toLowerCase() === currentPath);
            const isCollapsed = !hasCurrent;
            const arrowStyle = hasCurrent ? 'style="transform: rotate(180deg);"' : '';

            let exHtml = '';
            ch.experiments.forEach(ex => {
                const isCurrent = ex.file.toLowerCase() === currentPath;
                const currentClass = isCurrent ? ' class="current"' : '';
                exHtml += `
                    <a href="${ex.file}"${currentClass}>
                        <i class="${ex.icon}"></i>
                        <span>${ex.title}</span>
                    </a>
                `;
            });

            chaptersHtml += `
                <div class="drawer-chapter">
                    <div class="drawer-chapter-header">
                        <span class="drawer-chapter-label">
                            <i class="${ch.icon}"></i>
                            <span>${ch.title}</span>
                        </span>
                        <i class="fa-solid fa-chevron-down drawer-chapter-arrow" ${arrowStyle}></i>
                    </div>
                    <div class="drawer-submenu ${isCollapsed ? 'collapsed' : ''}">
                        ${exHtml}
                    </div>
                </div>
            `;
        });

        drawer.innerHTML = `
            <div class="drawer-header-bar">
                <a href="../index.html?showMenu=true" class="drawer-home-btn">
                    <i class="fa-solid fa-house"></i>
                    <span>الرئيسية</span>
                </a>
                <button id="drawer-close-btn" class="drawer-close-btn" title="إغلاق القائمة">
                    <i class="fa-solid fa-xmark"></i>
                    <span>إغلاق</span>
                </button>
            </div>
            <div class="drawer-scroll-area">
                ${chaptersHtml}
            </div>
        `;

        const closeBtn = document.getElementById('drawer-close-btn');

        function openDrawer(e) {
            if (e) e.stopPropagation();
            drawer.classList.add('open');
            overlay.classList.add('visible');
        }

        function closeDrawer(e) {
            if (e) e.stopPropagation();
            drawer.classList.remove('open');
            overlay.classList.remove('visible');
        }

        toggleBtn.onclick = openDrawer;
        if (closeBtn) closeBtn.onclick = closeDrawer;
        overlay.onclick = closeDrawer;

        // Dismiss when clicking outside
        document.addEventListener('click', (e) => {
            if (drawer.classList.contains('open')) {
                if (!drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
                    closeDrawer(e);
                }
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('open')) {
                closeDrawer(e);
            }
        });

        // Accordion functionality for chapters
        drawer.querySelectorAll('.drawer-chapter-header').forEach(header => {
            header.onclick = (e) => {
                e.stopPropagation();
                const submenu = header.nextElementSibling;
                const arrow = header.querySelector('.drawer-chapter-arrow');
                if (submenu) {
                    const isCollapsed = submenu.classList.toggle('collapsed');
                    if (arrow) {
                        arrow.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)';
                    }
                }
            };
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }

    window.RaqeemNavigation = {
        init: initNavigation
    };
})();
