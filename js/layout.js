/**
 * Shared layout and configuration for Spark Marketing Site
 * Handles Tailwind config and Header/Footer injection
 */

// Tailwind Configuration
const tailwindConfig = {
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    500: '#6366f1', // Indigo-500
                    600: '#4f46e5', // Indigo-600 (Primary)
                    700: '#4338ca', // Indigo-700
                    900: '#312e81', // Indigo-900
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            }
        }
    }
};

// Inject Tailwind script and config
function loadTailwind() {
    const script = document.createElement('script');
    script.src = "https://cdn.tailwindcss.com";
    script.onload = () => {
        tailwind.config = tailwindConfig;
    };
    document.head.appendChild(script);
}

// Navigation Links
const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Product', href: '/product/' },
    { name: 'For Teachers', href: '/for-teachers.html' },
    { name: 'Pricing', href: '/pricing.html' },
    { name: 'About', href: '/about.html' },
];

// Product sub-pages for dropdown navigation
const productSubpages = [
    { name: 'Overview', href: '/product/' },
    { name: 'Origin story', href: '/product/origin.html' },
    { name: 'Features', href: '/product/features.html' },
    { name: 'Monetization', href: '/product/monetization.html' },
    { name: 'Reporting', href: '/product/reporting.html' },
    { name: 'Hallucinations & safety', href: '/product/hallucinations.html' },
    { name: 'Content ownership', href: '/product/content-ownership.html' },
    { name: 'FAQ', href: '/product/faq.html' },
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
                    <a href="${link.href}" class="inline-flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-600'} hover:text-brand-600">
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
                    <a href="index.html" class="flex items-center gap-2">
                        <!-- Placeholder Logo Icon -->
                        <div class="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
                        <span class="font-bold text-xl tracking-tight text-slate-900">Spark</span>
                    </a>
                </div>

                <!-- Desktop Nav -->
                <nav class="hidden md:flex space-x-8">
                    ${navItems}
                </nav>

                <!-- CTA -->
                <div class="flex items-center space-x-4">
                    <a href="index.html#waitlist" class="hidden md:inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all">
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
                    return `<a href="${link.href}" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50">${link.name}</a>`;
                }).join('')}
                 <a href="/#waitlist" class="block w-full text-center px-4 py-2 mt-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700">
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
                    <a href="/" class="flex items-center gap-2 mb-4">
                        <div class="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-xs">S</div>
                        <span class="font-bold text-lg text-slate-900">Spark</span>
                    </a>
                    <p class="text-sm text-slate-500 mb-4">
                        From video to a course — without the grind.
                    </p>
                    <div class="text-xs text-slate-400">
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTailwind();
    
    // Insert Header
    document.body.insertBefore(createHeader(), document.body.firstChild);
    
    // Insert Footer
    document.body.appendChild(createFooter());

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
    }, 100);
});

