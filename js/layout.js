/**
 * Shared layout and configuration for Spark Marketing Site
 * Handles Header/Footer injection and marketing-only behaviors.
 *
 * NOTE: Tailwind is now compiled into a static CSS file for the marketing
 * pages (see marketing/css/tailwind.css) instead of being injected at
 * runtime via the CDN script. This avoids a flash of unstyled content.
 */

// Base path helper so the same code works locally and on GitHub Pages without env switches
function getBasePath() {
    const path = window.location.pathname || '/';
    const segments = path.split('/').filter(Boolean);

    // Root path (e.g., "/")
    if (segments.length === 0) {
        return '';
    }

    const first = segments[0];

    // When serving "marketing" as the root locally:
    // - "/product/..."           → first === "product"      → no base prefix
    // - "/about/..."             → first === "about"        → no base prefix
    // - "/for-teachers/..."      → first === "for-teachers" → no base prefix
    // - "/about.html" etc        → first endsWith ".html"   → no base prefix
    if (first === 'product' || first === 'about' || first === 'for-teachers' || first.endsWith('.html')) {
        return '';
    }

    // On GitHub Pages for a project site, the first segment is the repo name
    // e.g., "/spark-website/..." → base "/spark-website"
    return `/${first}`;
}

const BASE_PATH = getBasePath();
console.log('[spark-marketing] resolved BASE_PATH', {
    pathname: window.location.pathname,
    basePath: BASE_PATH
});

function getLogoThumbnailHref() {
    // Use an absolute-from-site-root path so it works from /product/* pages too.
    // When BASE_PATH is empty, this becomes "/images/..." (root of the marketing site).
    return `${BASE_PATH}/images/logos/logo-thumbnail.png`;
}

function ensureFavicon() {
    const href = getLogoThumbnailHref();

    const existing = document.querySelector('link[rel="icon"]');
    if (existing) {
        // Keep it idempotent: only update if it doesn't already match.
        if (existing.getAttribute('href') !== href) {
            existing.setAttribute('href', href);
            existing.setAttribute('type', 'image/png');
        }
        console.log('[spark-marketing] favicon ensured (updated existing)', { href });
        return;
    }

    const link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    link.setAttribute('type', 'image/png');
    link.setAttribute('href', href);
    document.head.appendChild(link);

    console.log('[spark-marketing] favicon ensured (created)', { href });
}

function ensureMaterialSymbols() {
    const existing = document.querySelector('link[href*="Material+Symbols+Rounded"]');
    if (existing) {
        console.log('[spark-marketing] Material Symbols font already loaded');
        return;
    }

    const link = document.createElement('link');
    link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0,0');
    link.setAttribute('rel', 'stylesheet');
    document.head.appendChild(link);

    console.log('[spark-marketing] Material Symbols font ensured (created)');
}

// Navigation Links
const navLinks = [
    {
        name: 'Home',
        href: BASE_PATH ? `${BASE_PATH}/` : '/'
    },
    {
        name: 'Product',
        href: `${BASE_PATH}/product/`
    },
    {
        name: 'For Teachers',
        href: `${BASE_PATH}/for-teachers.html`,
        hasDropdown: true
    },
    {
        name: 'Pricing',
        href: `${BASE_PATH}/pricing.html`
    },
    {
        name: 'About',
        href: `${BASE_PATH}/about/why-spark.html`
    },
    {
        name: 'Blog',
        href: `${BASE_PATH}/blog.html`
    },
];

// Product sub-pages for dropdown navigation
const productSubpages = [
    { name: 'Overview', href: `${BASE_PATH}/product/` },
    { name: 'Features', href: `${BASE_PATH}/product/features.html` },
    { name: 'Monetization', href: `${BASE_PATH}/product/monetization.html` },
    { name: 'Reporting', href: `${BASE_PATH}/product/reporting.html` },
    { name: 'Hallucinations & safety', href: `${BASE_PATH}/product/hallucinations.html` },
    { name: 'Content ownership', href: `${BASE_PATH}/product/content-ownership.html` },
];

// About sub-pages for dropdown navigation
const aboutSubpages = [
    { name: 'Why Spark', href: `${BASE_PATH}/about/why-spark.html` },
    { name: 'Team', href: `${BASE_PATH}/about/team.html` },
    { name: 'Our Story', href: `${BASE_PATH}/about/story.html` },
];

// For Teachers sub-pages for dropdown navigation
const forTeachersSubpages = [
    { name: 'Overview', href: `${BASE_PATH}/for-teachers.html` },
    { name: 'Types of Teachers', href: `${BASE_PATH}/for-teachers/types-of-teachers.html` },
    { name: 'Case Studies', href: `${BASE_PATH}/for-teachers/case-study-high-school-tutors.html` },
];

// Header Component
function createHeader() {
    const header = document.createElement('header');
    // Added top-0 to ensure it's flush, and increased bg opacity to ensure content doesn't bleed through
    header.className = 'fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-slate-100';
    
    // Get current path to mark active state
    const currentPath = window.location.pathname || '/';

    const navItems = navLinks.map(link => {
        const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));

        if (link.name === 'Product') {
            const dropdownItems = productSubpages.map(sub => {
                const subActive = currentPath === sub.href;
                return `
                    <a href="${sub.href}" class="block px-4 py-2 text-sm ${subActive ? 'text-brand-600 bg-slate-50' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'}">
                        ${sub.name}
                    </a>
                `;
            }).join('');

            return `
                <div class="relative group">
                    <a href="${link.href}" class="flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-600'} hover:text-brand-600">
                        <span>${link.name}</span>
                        <span class="material-symbols-rounded text-[16px] leading-none">expand_more</span>
                    </a>
                    <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 top-full w-56 rounded-xl bg-white shadow-lg border border-slate-100 py-2 z-50">
                        ${dropdownItems}
                    </div>
                </div>
            `;
        }

        if (link.name === 'About') {
            const dropdownItems = aboutSubpages.map(sub => {
                const subActive = currentPath === sub.href;
                return `
                    <a href="${sub.href}" class="block px-4 py-2 text-sm ${subActive ? 'text-brand-600 bg-slate-50' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'}">
                        ${sub.name}
                    </a>
                `;
            }).join('');

            return `
                <div class="relative group">
                    <a href="${link.href}" class="flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-600'} hover:text-brand-600">
                        <span>${link.name}</span>
                        <span class="material-symbols-rounded text-[16px] leading-none">expand_more</span>
                    </a>
                    <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 top-full w-56 rounded-xl bg-white shadow-lg border border-slate-100 py-2 z-50">
                        ${dropdownItems}
                    </div>
                </div>
            `;
        }

        if (link.name === 'For Teachers') {
            const dropdownItems = forTeachersSubpages.map(sub => {
                const subActive = currentPath === sub.href;
                return `
                    <a href="${sub.href}" class="block px-4 py-2 text-sm ${subActive ? 'text-brand-600 bg-slate-50' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'}">
                        ${sub.name}
                    </a>
                `;
            }).join('');

            return `
                <div class="relative group">
                    <a href="${link.href}" class="flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-600'} hover:text-brand-600">
                        <span>${link.name}</span>
                        <span class="material-symbols-rounded text-[16px] leading-none">expand_more</span>
                    </a>
                    <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 top-full w-56 rounded-xl bg-white shadow-lg border border-slate-100 py-2 z-50">
                        ${dropdownItems}
                    </div>
                </div>
            `;
        }

        return `<a href="${link.href}" class="text-sm font-medium transition-colors hover:text-brand-600 ${isActive ? 'text-brand-600' : 'text-slate-600'}">${link.name}</a>`;
    }).join('');

    header.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <div class="flex-shrink-0 flex items-center">
                    <a href="${BASE_PATH || ''}/index.html" class="flex items-center gap-2">
                        <img
                            src="${getLogoThumbnailHref()}"
                            alt="Spark logo"
                            class="w-8 h-8 rounded-lg"
                            decoding="async">
                        <span class="font-bold text-xl tracking-tight text-slate-900">Spark</span>
                    </a>
                </div>

                <!-- Desktop Nav -->
                <nav class="hidden md:flex items-center space-x-8">
                    ${navItems}
                </nav>

                <!-- CTA -->
                <div class="flex items-center space-x-4">
                    <a href="${BASE_PATH || ''}/index.html#waitlist" class="hidden md:inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all">
                        Join Waitlist
                    </a>
                    <!-- Mobile menu button placeholder (simple implementation) -->
                    <button id="mobile-menu-btn" class="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none">
                        <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <!-- Mobile Menu (Hidden by default) -->
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-slate-100">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                ${navLinks.map(link => {
                    if (link.name === 'Product') {
                        const mobileSubLinks = productSubpages.map(sub => {
                            return `<a href="${sub.href}" class="block pl-6 pr-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-50">– ${sub.name}</a>`;
                        }).join('');

                        return `
                            <div class="mb-2">
                                <a href="${link.href}" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50">${link.name}</a>
                                ${mobileSubLinks}
                            </div>
                        `;
                    }
                    if (link.name === 'About') {
                        const mobileSubLinks = aboutSubpages.map(sub => {
                            return `<a href="${sub.href}" class="block pl-6 pr-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-50">– ${sub.name}</a>`;
                        }).join('');

                        return `
                            <div class="mb-2">
                                <a href="${link.href}" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50">${link.name}</a>
                                ${mobileSubLinks}
                            </div>
                        `;
                    }
                    if (link.name === 'For Teachers') {
                        const mobileSubLinks = forTeachersSubpages.map(sub => {
                            return `<a href="${sub.href}" class="block pl-6 pr-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-50">– ${sub.name}</a>`;
                        }).join('');

                        return `
                            <div class="mb-2">
                                <a href="${link.href}" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50">${link.name}</a>
                                ${mobileSubLinks}
                            </div>
                        `;
                    }
                    return `<a href="${link.href}" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50">${link.name}</a>`;
                }).join('')}
                 <a href="${BASE_PATH ? `${BASE_PATH}/#waitlist` : '/#waitlist'}" class="block w-full text-center px-4 py-2 mt-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700">
                    Join Waitlist
                </a>
            </div>
        </div>
    `;

    return header;
}

// Footer Component
function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'bg-slate-50 border-t border-slate-200';
    
    footer.innerHTML = `
        <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div class="col-span-2 md:col-span-1">
                    <a href="${BASE_PATH ? `${BASE_PATH}/` : '/'}" class="flex items-center gap-2 mb-4">
                        <img
                            src="${getLogoThumbnailHref()}"
                            alt="Spark logo"
                            class="w-6 h-6 rounded-md"
                            decoding="async">
                        <span class="font-bold text-lg text-slate-900">Spark</span>
                    </a>
                    <p class="text-sm text-slate-500 mb-4">
                        From video to a course - without the grind.
                    </p>
                    <div class="text-sm text-slate-400">
                        Built by a team obsessed with long-term learning, retention, and high-trust relationships with teachers.
                    </div>
                </div>
                
                <div>
                    <h3 class="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Product</h3>
                    <ul class="space-y-3">
                        <li><a href="product.html" class="text-sm text-slate-500 hover:text-brand-600">How it Works</a></li>
                        <li><a href="pricing.html" class="text-sm text-slate-500 hover:text-brand-600">Pricing</a></li>
                        <li><a href="case-study.html" class="text-sm text-slate-500 hover:text-brand-600">Case Study</a></li>
                    </ul>
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Company</h3>
                    <ul class="space-y-3">
                        <li><a href="about.html" class="text-sm text-slate-500 hover:text-brand-600">About / Philosophy</a></li>
                        <li><a href="for-teachers.html" class="text-sm text-slate-500 hover:text-brand-600">For Teachers</a></li>
                        <li><a href="blog.html" class="text-sm text-slate-500 hover:text-brand-600">Blog</a></li>
                    </ul>
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Legal</h3>
                    <ul class="space-y-3">
                        <li><a href="#" class="text-sm text-slate-500 hover:text-brand-600">Privacy</a></li>
                        <li><a href="#" class="text-sm text-slate-500 hover:text-brand-600">Terms</a></li>
                    </ul>
                </div>
            </div>
            <div class="mt-12 border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p class="text-base text-slate-400 text-center md:text-left">
                    &copy; ${new Date().getFullYear()} Spark. All rights reserved.
                </p>
            </div>
        </div>
    `;
    return footer;
}

// Wrap main content in container
function wrapMainContent() {
    const main = document.querySelector('main');
    if (!main) return;

    // Check if container already exists (backward compatibility)
    const existingContainer = main.querySelector('[class*="max-w-"]');
    if (existingContainer) {
        console.log('[spark-marketing] container already exists, skipping wrap');
        return;
    }

    // Get container width from data attribute, default to '5xl'
    const containerWidth = main.getAttribute('data-container-width') || '5xl';
    const containerId = main.hasAttribute('data-container-id') ? main.getAttribute('data-container-id') : 'top';

    // Create container div
    const container = document.createElement('div');
    container.id = containerId;
    container.className = `max-w-${containerWidth} mx-auto px-4 sm:px-6 lg:px-8`;

    // Move all child nodes into container
    while (main.firstChild) {
        container.appendChild(main.firstChild);
    }

    // Append container to main
    main.appendChild(container);

    console.log('[spark-marketing] wrapped main content in container', {
        containerWidth,
        containerId
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('[spark-marketing] DOMContentLoaded - init layout', {
        timeMs: Math.round(performance.now()),
        hasTailwindStylesheet: !!document.querySelector('link[href*="marketing/css/tailwind.css"],link[href*=\"/marketing/css/tailwind.css\"]'),
        bodyClasses: document.body.className
    });

    ensureFavicon();
    ensureMaterialSymbols();
    
    // Insert Header
    document.body.insertBefore(createHeader(), document.body.firstChild);
    
    // Wrap main content in container
    wrapMainContent();
    
    // Insert Footer
    document.body.appendChild(createFooter());

    console.log('[spark-marketing] header/footer injected', {
        timeMs: Math.round(performance.now())
    });

    // Mobile Menu Toggle Logic
    // Using a tiny timeout to ensure DOM is ready after insertion
    setTimeout(() => {
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        if (btn && menu) {
            btn.addEventListener('click', () => {
                menu.classList.toggle('hidden');
            });
        }

        // Scroll reveal for pipeline steps + progress ring
        const revealEls = document.querySelectorAll('.reveal');
        console.log('[spark-marketing] reveal elements count:', revealEls.length);

        const progressCircle = document.getElementById('pipeline-progress-ring-fill');
        const progressStepCount = document.getElementById('pipeline-progress-step-count');
        const progressLabel = document.getElementById('pipeline-progress-label');
        const totalSteps = 10;
        let currentStep = 0;

        function updatePipelineProgress(step) {
            if (!progressCircle || !progressStepCount || !progressLabel) {
                return;
            }

            const clampedStep = Math.min(Math.max(step, 0), totalSteps);
            const percent = totalSteps === 0 ? 0 : (clampedStep / totalSteps) * 100;
            const dashOffset = 100 - percent;

            progressCircle.style.strokeDashoffset = `${dashOffset}`;
            progressStepCount.textContent = String(clampedStep);
            progressLabel.textContent = `Step ${clampedStep} of ${totalSteps}`;

            console.log('[spark-marketing] progress update', {
                requestedStep: step,
                clampedStep,
                percent,
                dashOffset
            });
        }

        if ('IntersectionObserver' in window && revealEls.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const stepId = entry.target.getAttribute('data-step-id') || '';
                    console.log('[spark-marketing] reveal entry', {
                        stepId,
                        isIntersecting: entry.isIntersecting,
                        intersectionRatio: entry.intersectionRatio
                    });

                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                // Trigger reveal when the step intersects the middle band of the viewport
                root: null,
                rootMargin: '-35% 0px -35% 0px',
                threshold: 0.0
            });

            revealEls.forEach((el, index) => {
                if (!el.getAttribute('data-step-id')) {
                    el.setAttribute('data-step-id', `step-${index + 1}`);
                }
                observer.observe(el);
            });
        }

        // Visibility observer for sticky progress wrapper
        const progressWrapper = document.getElementById('pipeline-progress-wrapper');
        if ('IntersectionObserver' in window && progressWrapper && revealEls.length > 0) {
            const visibleSteps = new Set();

            const visibilityObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const stepId = entry.target.getAttribute('data-step-id') || '';
                    if (!stepId) return;

                    const stepNumber = stepId.startsWith('step-') ? parseInt(stepId.replace('step-', ''), 10) : NaN;
                    if (Number.isNaN(stepNumber)) return;

                    if (entry.isIntersecting) {
                        visibleSteps.add(stepNumber);
                    } else {
                        visibleSteps.delete(stepNumber);
                    }
                });

                const hasVisibleSteps = visibleSteps.size > 0;
                progressWrapper.classList.toggle('pipeline-progress-wrapper-visible', hasVisibleSteps);

                let nextStep = 0;
                if (visibleSteps.size > 0) {
                    nextStep = Math.max(...visibleSteps);
                }

                if (nextStep !== currentStep) {
                    currentStep = nextStep;
                    updatePipelineProgress(currentStep);
                }

                console.log('[spark-marketing] progress wrapper visibility', {
                    visibleSteps: Array.from(visibleSteps).sort((a, b) => a - b),
                    hasVisibleSteps,
                    currentStep
                });
            }, {
                // Use a centered band so steps only count when they overlap the middle of the viewport
                root: null,
                rootMargin: '-35% 0px -35% 0px',
                threshold: 0.0
            });

            revealEls.forEach(el => visibilityObserver.observe(el));
        }

        // Initialize progress ring once on load (in case some steps are above the fold)
        updatePipelineProgress(0);

        // Remove initial preload-hidden class so the page becomes visible
        // only after layout JS has finished basic setup.
        if (document.body.classList.contains('preload-hidden')) {
            document.body.classList.remove('preload-hidden');
            console.log('[spark-marketing] removed preload-hidden from body', {
                timeMs: Math.round(performance.now()),
                bodyClasses: document.body.className
            });
        }
    }, 100);
});

