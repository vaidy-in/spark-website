/**
 * Pricing page behavior (marketing):
 * - Spark / Spark Live tabs
 * - Elastic pricing sliders
 * - FAQ snippet injection + accordion init
 *
 * No inline styles in JS (only text + class toggles).
 */

(function () {
    'use strict';
    window.APP_VERSION = '1.0.11';

    const LOG_PREFIX = '[spark-marketing][pricing]';

    function resolveBasePath() {
        // Prefer the shared helper if present (defined in layout.js)
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

    function formatUsd(amount) {
        const n = Math.round(Number(amount) || 0);
        return `$${n}`;
    }

    function computeElasticPrice({ baseFee, includedStudents, perExtraStudent }, studentsRaw) {
        const students = Math.max(0, Math.round(Number(studentsRaw) || 0));
        const extra = Math.max(0, students - includedStudents);
        return {
            students,
            extra,
            price: baseFee + extra * perExtraStudent
        };
    }

    function setChipSelected(chipEl, selected) {
        if (!chipEl) return;
        chipEl.classList.toggle('ring-2', selected);
        chipEl.classList.toggle('ring-brand-500', selected);
        chipEl.classList.toggle('bg-brand-100', selected);
        chipEl.classList.toggle('border-brand-200', selected);
        chipEl.classList.toggle('border-slate-200', !selected);
        chipEl.classList.toggle('text-brand-700', selected);
    }

    const ESTIMATE_NOTE_STATIC = 'Estimate only. Your projected bill is in your dashboard.';
    const MIN_STUDENTS = 0;
    const MAX_STUDENTS = 200;

    const SPARK_MODEL = { baseFee: 100, includedStudents: 10, perExtraStudent: 10 };
    const SPARK_FOUNDER_MODEL = { baseFee: 50, includedStudents: 10, perExtraStudent: 5 };

    /** Video processing limits (trial and post-trial). Change here to update copy across the page. */
    const VIDEO_LIMITS = {
        trialHoursSd: 5,
        monthlyHoursSd: 10,
        hdToSdRatio: 5
    };

    function getMonth2BreakdownLine(model, students) {
        const { baseFee, includedStudents, perExtraStudent } = model;
        const extra = Math.max(0, students - includedStudents);
        if (extra === 0) return `${formatUsd(baseFee)} for up to ${includedStudents} active students only.`;
        const additionalFee = extra * perExtraStudent;
        return `${formatUsd(baseFee)} for up to ${includedStudents} active students + ${formatUsd(additionalFee)} for ${extra} additional students.`;
    }

    function updateMonth2Section(isOverMax, students, model, founderModel) {
        const normalEl = document.getElementById('spark-month2-normal');
        const overMaxEl = document.getElementById('spark-month2-over-max');
        const regularWrapEl = document.getElementById('spark-month2-regular-wrap');
        const regularTotalEl = document.getElementById('spark-month2-regular-total');
        const priceEl = document.getElementById('spark-month2-price');
        if (!normalEl || !overMaxEl) return;

        if (isOverMax) {
            normalEl.classList.add('hidden');
            overMaxEl.classList.remove('hidden');
            const exampleModel = founderModel || model;
            const exampleLine = getMonth2BreakdownLine(exampleModel, MAX_STUDENTS);
            overMaxEl.textContent = `Example at ${MAX_STUDENTS} students: ${exampleLine}. Contact us for 200+.`;
            return;
        }

        normalEl.classList.remove('hidden');
        overMaxEl.classList.add('hidden');
        const reg = computeElasticPrice(model, students);
        const displayModel = founderModel || model;
        const founder = founderModel ? computeElasticPrice(founderModel, students) : null;

        if (founderModel && regularWrapEl && regularTotalEl) {
            regularWrapEl.classList.remove('hidden');
            regularTotalEl.textContent = formatUsd(reg.price);
            if (priceEl) priceEl.textContent = formatUsd(founder.price);
        } else {
            if (regularWrapEl) regularWrapEl.classList.add('hidden');
            if (priceEl) priceEl.textContent = formatUsd(reg.price);
        }
        const totalStudentsEl = document.getElementById('spark-month2-total-students');
        if (totalStudentsEl) totalStudentsEl.textContent = String(students);

        const breakdownOnlyEl = document.getElementById('spark-month2-breakdown-only');
        const breakdownExtraEl = document.getElementById('spark-month2-breakdown-extra');
        const onlyIncludedEl = document.getElementById('spark-month2-only-included');
        const onlyBaseEl = document.getElementById('spark-month2-only-base');
        const includedCountEl = document.getElementById('spark-month2-included-count');
        const baseAmountEl = document.getElementById('spark-month2-base-amount');
        const extraCountEl = document.getElementById('spark-month2-extra-count');
        const extraFeeEl = document.getElementById('spark-month2-extra-fee');
        const extra = Math.max(0, students - displayModel.includedStudents);
        const { includedStudents } = displayModel;

        if (extra === 0) {
            if (breakdownOnlyEl) breakdownOnlyEl.classList.remove('hidden');
            if (breakdownExtraEl) breakdownExtraEl.classList.add('hidden');
            if (onlyIncludedEl) onlyIncludedEl.textContent = String(includedStudents);
            if (onlyBaseEl) onlyBaseEl.textContent = formatUsd(displayModel.baseFee);
        } else {
            if (breakdownOnlyEl) breakdownOnlyEl.classList.add('hidden');
            if (breakdownExtraEl) breakdownExtraEl.classList.remove('hidden');
            if (includedCountEl) includedCountEl.textContent = String(includedStudents);
            if (baseAmountEl) baseAmountEl.textContent = formatUsd(displayModel.baseFee);
            if (extraCountEl) extraCountEl.textContent = String(extra);
            if (extraFeeEl) extraFeeEl.textContent = formatUsd(extra * displayModel.perExtraStudent);
        }
    }

    function fillHowYouAreCharged(model, founderModel) {
        const minFeeEl = document.getElementById('spark-min-fee');
        const founderMinFeeEl = document.getElementById('spark-founder-min-fee');
        if (minFeeEl) minFeeEl.textContent = formatUsd(model.baseFee);
        if (founderMinFeeEl) founderMinFeeEl.textContent = formatUsd(founderModel.baseFee);
    }

    function initSparkCalculator(cfg) {
        const inputEl = document.getElementById(cfg.inputId);
        const priceEl = document.getElementById(cfg.priceId);
        const regularPriceEl = document.getElementById(cfg.regularPriceId);
        const founderModel = cfg.founderModel || null;
        const comboEl = document.getElementById('spark-students-combo');
        const triggerEl = document.getElementById('spark-students-trigger');
        const listboxEl = document.getElementById('spark-students-listbox');
        const normalCopyEl = document.getElementById('spark-price-copy-normal');
        const overMaxCopyEl = document.getElementById('spark-price-copy-over-max');

        if (!inputEl || !priceEl || !regularPriceEl) return;

        console.log(LOG_PREFIX, 'initSparkCalculator', {
            found: {
                comboEl: !!comboEl,
                inputEl: !!inputEl,
                triggerEl: !!triggerEl,
                listboxEl: !!listboxEl,
                priceEl: !!priceEl,
                regularPriceEl: !!regularPriceEl
            }
        });

        function getValue() {
            const v = parseInt(inputEl.value, 10);
            const n = Number.isFinite(v) ? v : 0;
            return Math.min(MAX_STUDENTS, Math.max(MIN_STUDENTS, Math.round(n)));
        }

        function getRawValue() {
            const raw = inputEl.value.trim();
            if (raw === '200+') return MAX_STUDENTS + 1;
            const v = parseInt(inputEl.value, 10);
            return Number.isFinite(v) ? Math.round(v) : null;
        }

        function applyValue() {
            const raw = getRawValue();
            const isOverMax = raw !== null && raw > MAX_STUDENTS;

            if (isOverMax) {
                if (normalCopyEl) normalCopyEl.classList.add('hidden');
                if (overMaxCopyEl) overMaxCopyEl.classList.remove('hidden');
                updateMonth2Section(true, 0, cfg.model, founderModel);
                return;
            }

            const students = getValue();
            inputEl.value = String(students);

            if (normalCopyEl) normalCopyEl.classList.remove('hidden');
            if (overMaxCopyEl) overMaxCopyEl.classList.add('hidden');

            const { price: computed } = computeElasticPrice(cfg.model, students);
            if (founderModel) {
                const founder = computeElasticPrice(founderModel, students);
                regularPriceEl.textContent = formatUsd(computed);
                priceEl.textContent = formatUsd(founder.price);
            } else {
                regularPriceEl.textContent = '';
                priceEl.textContent = formatUsd(computed);
            }
            const priceStudentsEl = document.getElementById('spark-price-students');
            if (priceStudentsEl) priceStudentsEl.textContent = String(students);
            updateMonth2Section(false, students, cfg.model, founderModel);
        }

        inputEl.addEventListener('input', () => {
            const raw = getRawValue();
            console.log(LOG_PREFIX, 'spark students input event', { value: inputEl.value, raw });
            applyValue();
        });
        inputEl.addEventListener('change', () => {
            const raw = getRawValue();
            console.log(LOG_PREFIX, 'spark students change event', { value: inputEl.value, raw });
            applyValue();
        });

        // Vanilla combo: open/close dropdown; never overwrite input on close.
        (function initStudentComboBox() {
            if (!comboEl || !listboxEl) return;

            function isOpen() {
                return !listboxEl.classList.contains('hidden');
            }
            function open() {
                listboxEl.classList.remove('hidden');
                if (inputEl) inputEl.setAttribute('aria-expanded', 'true');
            }
            function close() {
                listboxEl.classList.add('hidden');
                if (inputEl) inputEl.setAttribute('aria-expanded', 'false');
            }

            triggerEl.addEventListener('click', (e) => {
                e.preventDefault();
                if (isOpen()) close();
                else {
                    open();
                    inputEl.focus();
                }
            });
            inputEl.addEventListener('focus', () => open());
            inputEl.addEventListener('blur', () => {
                setTimeout(() => close(), 0);
            });

            document.addEventListener('click', (e) => {
                if (!comboEl.contains(e.target) && !listboxEl.contains(e.target)) close();
            });

            const options = listboxEl.querySelectorAll('[data-student-value]');
            options.forEach((opt) => {
                opt.addEventListener('click', (e) => {
                    e.preventDefault();
                    const val = opt.getAttribute('data-student-value');
                    if (val != null) {
                        inputEl.value = val;
                        applyValue();
                    }
                    close();
                });
            });

            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') close();
                if (e.key === 'Enter') close();
            });
        })();

        const changeLinkEl = document.getElementById('spark-month2-change-link');
        const tabSparkEl = document.getElementById('pricing-tab-spark');
        if (changeLinkEl && tabSparkEl && comboEl) {
            changeLinkEl.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo(0, 0);
                tabSparkEl.focus();
                comboEl.classList.remove('pricing-student-combo--highlight');
                void comboEl.offsetWidth;
                comboEl.classList.add('pricing-student-combo--highlight');
                const onEnd = () => {
                    comboEl.removeEventListener('animationend', onEnd);
                    comboEl.classList.remove('pricing-student-combo--highlight');
                };
                comboEl.addEventListener('animationend', onEnd);
            });
        }

        applyValue();
    }

    function initCalculator(cfg) {
        const slider = document.getElementById(cfg.sliderId);
        const count = document.getElementById(cfg.countId);
        const price = document.getElementById(cfg.priceId);
        const note = document.getElementById(cfg.noteId);
        const regularPriceEl = cfg.regularPriceId ? document.getElementById(cfg.regularPriceId) : null;
        const presetButtons = Array.from(document.querySelectorAll(cfg.presetSelector));
        const founderModel = cfg.founderModel || null;

        console.log(LOG_PREFIX, 'initCalculator', {
            key: cfg.key,
            found: {
                slider: !!slider,
                count: !!count,
                price: !!price,
                note: !!note,
                regularPriceEl: !!regularPriceEl,
                presetButtons: presetButtons.length
            },
            model: cfg.model
        });

        if (!slider || !count || !price) return;

        function applyValue(nextValue, source) {
            const { students, price: computed } = computeElasticPrice(cfg.model, nextValue);

            slider.value = String(students);
            count.textContent = String(students);

            if (founderModel && regularPriceEl) {
                const founder = computeElasticPrice(founderModel, nextValue);
                regularPriceEl.textContent = formatUsd(computed);
                price.textContent = formatUsd(founder.price);
            } else {
                price.textContent = formatUsd(computed);
            }

            if (note) {
                note.textContent = ESTIMATE_NOTE_STATIC;
            }

            presetButtons.forEach(btn => {
                const raw = btn.getAttribute(cfg.presetAttr) || '';
                const v = Number(raw);
                setChipSelected(btn, Number.isFinite(v) && Math.round(v) === students);
            });

            console.log(LOG_PREFIX, 'calculator updated', {
                key: cfg.key,
                source,
                students,
                computed
            });
        }

        slider.addEventListener('input', (e) => {
            applyValue(e.target.value, 'slider');
        });

        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const raw = btn.getAttribute(cfg.presetAttr) || '';
                const v = Number(raw);
                if (!Number.isFinite(v)) return;
                applyValue(v, 'preset');
            });
        });

        applyValue(slider.value, 'init');
    }

    function initTabs() {
        const tabSpark = document.getElementById('pricing-tab-spark');
        const tabLive = document.getElementById('pricing-tab-live');
        const panelSpark = document.getElementById('pricing-panel-spark');
        const panelLive = document.getElementById('pricing-panel-live');
        const faqBillingWrapper = document.getElementById('pricing-faq-billing-wrapper');
        const faqWrapper = document.getElementById('pricing-faq-wrapper');
        const ctaSpark = document.getElementById('pricing-cta-spark');
        const ctaLive = document.getElementById('pricing-cta-live');

        console.log(LOG_PREFIX, 'initTabs', {
            found: {
                tabSpark: !!tabSpark,
                tabLive: !!tabLive,
                panelSpark: !!panelSpark,
                panelLive: !!panelLive,
                faqBillingWrapper: !!faqBillingWrapper,
                faqWrapper: !!faqWrapper,
                ctaSpark: !!ctaSpark,
                ctaLive: !!ctaLive
            }
        });

        if (!tabSpark || !tabLive || !panelSpark || !panelLive) return;

        function setActive(activeKey, source) {
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
            if (ctaLive) ctaLive.classList.toggle('hidden', isSpark);

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

            console.log(LOG_PREFIX, 'tab changed', { activeKey, source });
        }

        tabSpark.addEventListener('click', () => setActive('spark', 'click'));
        tabLive.addEventListener('click', () => setActive('live', 'click'));
    }

    const FAQ_BILLING_SNIPPET = 'pricing-faq-billing-only.html';
    const FAQ_SNIPPETS = ['pricing-faq-sections-0.html', 'pricing-faq-sections-1.html', 'pricing-faq-sections-2.html', 'pricing-faq-sections-3.html'];
    const FEATURES_SNIPPET = 'pricing-features-list.html';

    async function loadFeaturesSnippet() {
        const root = document.getElementById('pricing-features-root');
        if (!root) return;

        const basePath = resolveBasePath();
        const snippetPath = `${basePath}/snippets/${FEATURES_SNIPPET}`;

        console.log(LOG_PREFIX, 'loading features snippet', { basePath, snippet: FEATURES_SNIPPET });

        try {
            const res = await fetch(snippetPath);
            if (!res.ok) throw new Error(`Features snippet fetch failed: ${res.status} ${snippetPath}`);
            const html = await res.text();
            root.innerHTML = html;
            console.log(LOG_PREFIX, 'features snippet injected');
        } catch (e) {
            console.error(LOG_PREFIX, 'features snippet load failed', { error: String(e) });
            root.innerHTML = '';
        }
    }

    async function loadFaqBillingSnippet() {
        const root = document.getElementById('pricing-faq-billing-root');
        if (!root) return;

        const basePath = resolveBasePath();
        const snippetPath = `${basePath}/snippets/${FAQ_BILLING_SNIPPET}`;

        console.log(LOG_PREFIX, 'loading FAQ billing snippet', { basePath, snippet: FAQ_BILLING_SNIPPET });

        try {
            const res = await fetch(snippetPath);
            if (!res.ok) throw new Error(`FAQ billing snippet fetch failed: ${res.status} ${snippetPath}`);
            const html = await res.text();
            root.innerHTML = html;

            const accordions = Array.from(root.querySelectorAll('[data-accordion]'));
            if (typeof initAccordion === 'function') {
                accordions.forEach(initAccordion);
            }
            console.log(LOG_PREFIX, 'FAQ billing snippet injected', { accordionCount: accordions.length });
        } catch (e) {
            console.error(LOG_PREFIX, 'FAQ billing snippet load failed', { error: String(e) });
            root.innerHTML = '';
        }
    }

    async function loadFaqSnippet() {
        const root = document.getElementById('pricing-faq-root');
        if (!root) return;

        const basePath = resolveBasePath();

        console.log(LOG_PREFIX, 'loading FAQ snippets', { basePath, snippets: FAQ_SNIPPETS });

        try {
            root.innerHTML = '';
            for (const name of FAQ_SNIPPETS) {
                const snippetPath = `${basePath}/snippets/${name}`;
                const res = await fetch(snippetPath);
                if (!res.ok) throw new Error(`FAQ snippet fetch failed: ${res.status} ${snippetPath}`);
                const html = await res.text();
                root.insertAdjacentHTML('beforeend', html);
            }

            const accordions = Array.from(root.querySelectorAll('[data-accordion]'));
            console.log(LOG_PREFIX, 'FAQ snippets injected', { accordionCount: accordions.length });

            if (typeof initAccordion === 'function') {
                accordions.forEach(initAccordion);
            } else {
                console.warn(LOG_PREFIX, 'initAccordion not found - FAQ accordions may not work');
            }

            if (typeof initTooltips === 'function') {
                initTooltips();
            }
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

    document.addEventListener('DOMContentLoaded', () => {
        console.log(LOG_PREFIX, 'DOMContentLoaded', {
            timeMs: Math.round(performance.now()),
            path: window.location.pathname
        });

        initTabs();

        initSparkCalculator({
            inputId: 'spark-students-input',
            priceId: 'spark-price',
            regularPriceId: 'spark-regular-price',
            model: SPARK_MODEL,
            founderModel: SPARK_FOUNDER_MODEL
        });
        fillHowYouAreCharged(SPARK_MODEL, SPARK_FOUNDER_MODEL);

        (async function loadSnippets() {
            await loadFeaturesSnippet();
            await loadFaqBillingSnippet();
            await loadFaqSnippet();
        })();
    });
})();

