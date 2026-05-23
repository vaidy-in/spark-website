/**
 * Pricing page behavior (marketing):
 * - Spark / Spark Lite tabs
 * - Feature + FAQ snippet injection
 * - Spark Lite interest checkbox for Apply for Spark submissions
 */

(function () {
    'use strict';
    window.APP_VERSION = '1.0.34';

    const LOG_PREFIX = '[spark-marketing][pricing]';

    const FEATURES_SNIPPET_SPARK = 'pricing-features-spark.html';
    const FEATURES_SNIPPET_LITE = 'pricing-features-lite.html';
    const FAQ_BILLING_SNIPPET = 'pricing-faq-billing-only.html';
    const FAQ_SNIPPETS = [
        'pricing-faq-sections-0.html',
        'pricing-faq-sections-1.html',
        'pricing-faq-sections-2.html',
        'pricing-faq-lite-live.html',
        'pricing-faq-sections-3.html'
    ];

    function resolveBasePath() {
        try {
            if (typeof getBasePath === 'function') {
                return getBasePath();
            }
        } catch (_) {}

        const path = window.location.pathname || '/';
        const segments = path.split('/').filter(Boolean);
        if (segments.length === 0) return '';

        const first = segments[0];
        if (first === 'product' || first === 'about' || first === 'for-teachers' || first.endsWith('.html')) {
            return '';
        }
        return `/${first}`;
    }

    function initAccordionsIn(root) {
        if (!root) return;
        const accordions = Array.from(root.querySelectorAll('[data-accordion]'));
        if (typeof initAccordion === 'function') {
            accordions.forEach(initAccordion);
        }
    }

    async function loadSnippet(snippetName) {
        const basePath = resolveBasePath();
        const snippetPath = `${basePath}/snippets/${snippetName}`;
        const res = await fetch(snippetPath);
        if (!res.ok) throw new Error(`Snippet fetch failed: ${res.status} ${snippetPath}`);
        return res.text();
    }

    async function loadFeaturesSnippet(rootId, snippetName) {
        const root = document.getElementById(rootId);
        if (!root) return;

        try {
            root.innerHTML = await loadSnippet(snippetName);
            initAccordionsIn(root);
            if (typeof initTooltips === 'function') {
                initTooltips();
            }
            console.log(LOG_PREFIX, 'features snippet injected', { rootId, snippetName });
        } catch (e) {
            console.error(LOG_PREFIX, 'features snippet load failed', { rootId, snippetName, error: String(e) });
            root.innerHTML = '';
        }
    }

    async function loadFaqBillingSnippet() {
        const root = document.getElementById('pricing-faq-billing-root');
        if (!root) return;

        try {
            root.innerHTML = await loadSnippet(FAQ_BILLING_SNIPPET);
            initAccordionsIn(root);
            console.log(LOG_PREFIX, 'FAQ billing snippet injected');
        } catch (e) {
            console.error(LOG_PREFIX, 'FAQ billing snippet load failed', { error: String(e) });
            root.innerHTML = '';
        }
    }

    async function loadFaqSnippet() {
        const root = document.getElementById('pricing-faq-root');
        if (!root) return;

        try {
            root.innerHTML = '';
            for (const name of FAQ_SNIPPETS) {
                root.insertAdjacentHTML('beforeend', await loadSnippet(name));
            }
            initAccordionsIn(root);
            if (typeof initTooltips === 'function') {
                initTooltips();
            }
            console.log(LOG_PREFIX, 'FAQ snippets injected');
        } catch (e) {
            console.error(LOG_PREFIX, 'FAQ snippet load failed', { error: String(e) });
            root.innerHTML = `
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <p class="text-base text-slate-700 font-semibold">Frequently Asked Questions</p>
                    <p class="mt-2 text-base text-slate-600">We could not load the FAQ right now. Please try again.</p>
                </div>
            `;
        }
    }

    function initTabs() {
        const tabSpark = document.getElementById('pricing-tab-spark');
        const tabLive = document.getElementById('pricing-tab-live');
        const panelSpark = document.getElementById('pricing-panel-spark');
        const panelLive = document.getElementById('pricing-panel-live');
        const faqBillingWrapper = document.getElementById('pricing-faq-billing-wrapper');
        const faqWrapper = document.getElementById('pricing-faq-wrapper');
        const ctaSpark = document.getElementById('pricing-cta-spark');
        const sparkTabLead = document.getElementById('pricing-spark-tab-lead');

        if (!tabSpark || !tabLive || !panelSpark || !panelLive) return;

        function setActive(activeKey) {
            const isSpark = activeKey === 'spark';

            tabSpark.setAttribute('aria-selected', String(isSpark));
            tabLive.setAttribute('aria-selected', String(!isSpark));

            tabSpark.classList.toggle('bg-brand-600', isSpark);
            tabSpark.classList.toggle('text-white', isSpark);
            tabSpark.classList.toggle('bg-white', !isSpark);
            tabSpark.classList.toggle('text-slate-700', !isSpark);
            tabSpark.classList.toggle('border', !isSpark);
            tabSpark.classList.toggle('border-slate-200', !isSpark);
            tabSpark.classList.toggle('hover:bg-slate-50', !isSpark);

            tabLive.classList.toggle('bg-brand-600', !isSpark);
            tabLive.classList.toggle('text-white', !isSpark);
            tabLive.classList.toggle('bg-white', isSpark);
            tabLive.classList.toggle('text-slate-700', isSpark);
            tabLive.classList.toggle('border', isSpark);
            tabLive.classList.toggle('border-slate-200', isSpark);
            tabLive.classList.toggle('hover:bg-slate-50', isSpark);

            if (faqBillingWrapper) faqBillingWrapper.classList.toggle('hidden', !isSpark);
            if (faqWrapper) faqWrapper.classList.toggle('hidden', !isSpark);
            if (ctaSpark) ctaSpark.classList.toggle('hidden', !isSpark);
            if (sparkTabLead) {
                sparkTabLead.classList.toggle('hidden', !isSpark);
                sparkTabLead.setAttribute('aria-hidden', String(!isSpark));
            }

            const showPanel = isSpark ? panelSpark : panelLive;
            const hidePanel = isSpark ? panelLive : panelSpark;

            hidePanel.classList.add('opacity-0');
            setTimeout(() => {
                hidePanel.classList.add('hidden');
                showPanel.classList.remove('hidden');
                showPanel.classList.add('opacity-0');
                requestAnimationFrame(() => {
                    showPanel.classList.remove('opacity-0');
                });
            }, 120);
        }

        tabSpark.addEventListener('click', () => setActive('spark'));
        tabLive.addEventListener('click', () => setActive('live'));
    }

    /** Exposed for waitlist.js on the pricing page */
    function isSparkLiteInterestChecked() {
        const el = document.getElementById('spark-lite-interest');
        return !!(el && el.checked);
    }

    function initSparkLiteInterestForWaitlist() {
        window.sparkPricingGetLiteInterest = isSparkLiteInterestChecked;

        document.querySelectorAll('[data-open-waitlist]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const submitBtn = document.getElementById('waitlist-submit-btn');
                if (submitBtn) submitBtn.textContent = 'Submit application';
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initTabs();
        initSparkLiteInterestForWaitlist();

        (async function loadSnippets() {
            await loadFeaturesSnippet('pricing-features-root', FEATURES_SNIPPET_SPARK);
            await loadFeaturesSnippet('pricing-lite-features-root', FEATURES_SNIPPET_LITE);
            await loadFaqBillingSnippet();
            await loadFaqSnippet();
        })();
    });
})();
