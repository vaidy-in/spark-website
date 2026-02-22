/**
 * Enterprise Pricing Calculator
 *
 * Reads all input fields, computes costs and pricing, and updates the
 * results panel. No inline styles - all visual state via CSS classes.
 *
 * Sections:
 *   1. Helpers
 *   2. Read inputs
 *   3. Compute costs
 *   4. Compute pricing
 *   5. Render results
 *   6. Export / Import
 *   7. Event wiring
 */

(function () {
    'use strict';
    window.APP_VERSION = '1.0.15';

    const LOG = '[ec]';

    // ─────────────────────────────────────────────
    // 1. Helpers
    // ─────────────────────────────────────────────

    function num(id) {
        const el = document.getElementById(id);
        if (!el) { console.warn(LOG, 'missing element', id); return 0; }
        const v = parseFloat(el.value);
        return Number.isFinite(v) ? v : 0;
    }

    function fmtINR(v) {
        const n = Math.round(v);
        if (Math.abs(n) >= 10000000) return '₹' + (n / 10000000).toFixed(2) + '\u00A0Cr';
        if (Math.abs(n) >= 100000)   return '₹' + (n / 100000).toFixed(2) + '\u00A0L';
        return '₹' + n.toLocaleString('en-IN');
    }

    function fmtUSD(v) {
        const rate = num('ec-fx-rate');
        if (!rate || !Number.isFinite(rate)) return '$0';
        const n = v / rate;
        if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + '\u00A0M';
        if (Math.abs(n) >= 1000)    return '$' + (n / 1000).toFixed(2) + '\u00A0K';
        return '$' + n.toFixed(2);
    }

    function fmtPct(v) {
        return (Math.round(v * 10) / 10).toFixed(1) + '%';
    }

    function set(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function setDual(baseId, inrVal, usdNote) {
        set(baseId + '-inr', fmtINR(inrVal));
        set(baseId + '-usd', usdNote !== undefined ? usdNote : fmtUSD(inrVal));
    }

    function setQuad(vInrId, vUsdId, pInrId, pUsdId, vInrVal, pInrVal) {
        set(vInrId, fmtINR(vInrVal));
        set(vUsdId, fmtUSD(vInrVal));
        set(pInrId, fmtINR(pInrVal));
        set(pUsdId, fmtUSD(pInrVal));
    }

    function hasSparkInternalParam() {
        const params = new URLSearchParams(window.location.search);
        return params.get('spark-internal') === '1';
    }

    // ─────────────────────────────────────────────
    // 1b. Validation
    // ─────────────────────────────────────────────

    const VALIDATION_CONFIG = [
        { id: 'ec-fx-rate', label: 'USD/INR rate', min: 1 },
        { id: 'ec-seats', label: 'Seats', min: 1 },
        { id: 'ec-setup-fee', label: 'Setup fee', min: 0 },
        { id: 'ec-avg-video-length', label: 'Avg video length', min: 0 },
        { id: 'ec-hd-pct', label: 'HD % (of videos)', min: 0, max: 100 },
        { id: 'ec-streaming-hrs-vanilla', label: 'Avg streaming per seat / month (Vanilla)', min: 0 },
        { id: 'ec-streaming-hrs-premium', label: 'Avg streaming per seat / month (Premium)', min: 0 },
        { id: 'ec-tutor-queries-vanilla', label: 'AI Tutor queries / seat / month (Vanilla)', min: 0 },
        { id: 'ec-tutor-queries-premium', label: 'AI Tutor queries / seat / month (Premium)', min: 0 },
        { id: 'ec-num-videos-vanilla', label: 'Number of videos per month (Vanilla)', min: 0 },
        { id: 'ec-num-videos-premium', label: 'Number of videos per month (Premium)', min: 0 },
        { id: 'ec-quiz-queries-vanilla', label: 'Quiz questions per hour (Vanilla)', min: 0 },
        { id: 'ec-quiz-queries-premium', label: 'Quiz questions per hour (Premium)', min: 0 },
        { id: 'ec-min-margin-vanilla', label: 'Min. cost markup for Spark (Vanilla)', min: 0 },
        { id: 'ec-min-margin-premium', label: 'Min. cost markup for Spark (Premium)', min: 0 },
        { id: 'ec-base-price-vanilla', label: 'Base price Vanilla', min: 0 },
        { id: 'ec-base-price-premium', label: 'Base price Premium', min: 0 },
        { id: 'ec-vol-disc-1', label: 'Volume discount (1 - 249 seats)', min: 0, max: 100 },
        { id: 'ec-vol-disc-2', label: 'Volume discount (250 - 499 seats)', min: 0, max: 100 },
        { id: 'ec-vol-disc-3', label: 'Volume discount (500 - 999 seats)', min: 0, max: 100 },
        { id: 'ec-vol-disc-4', label: 'Volume discount (1000+ seats)', min: 0, max: 100 },
        { id: 'ec-vol-disc-5', label: 'Volume discount (5000+ seats)', min: 0, max: 100 },
        { id: 'ec-vol-disc-6', label: 'Volume discount (10000+ seats)', min: 0, max: 100 },
        { id: 'ec-vol-disc-7', label: 'Volume discount (50000+ seats)', min: 0, max: 100 },
        { id: 'ec-term-disc-1', label: 'Term discount (1 month)', min: 0, max: 100 },
        { id: 'ec-term-disc-3', label: 'Term discount (3 months)', min: 0, max: 100 },
        { id: 'ec-term-disc-6', label: 'Term discount (6 months)', min: 0, max: 100 },
        { id: 'ec-term-disc-12', label: 'Term discount (12 months)', min: 0, max: 100 },
        { id: 'ec-early-disc', label: 'Early customer discount', min: 0, max: 100 },
        { id: 'ec-rev-share-y1', label: 'Revenue share Y1', min: 0, max: 100 },
        { id: 'ec-rev-share-y2', label: 'Revenue share Y2', min: 0, max: 100 },
        { id: 'ec-rev-share-y3', label: 'Revenue share Y3', min: 0, max: 100 },
        { id: 'ec-rev-share-y4', label: 'Revenue share Y4', min: 0, max: 100 },
        { id: 'ec-rev-share-y5', label: 'Revenue share Y5', min: 0, max: 100 },
        { id: 'ec-hd-sd-factor', label: 'HD cost multiplier', min: 1 },
        { id: 'ec-gb-per-video-hr', label: 'GB per video hour', min: 0 },
        { id: 'ec-embedding-tokens', label: 'Embedding tokens per hour', min: 0 },
        { id: 'ec-batch-hrs-per-video-hr', label: 'AWS Batch hrs per video hour', min: 0 },
        { id: 'ec-tutor-tokens-in', label: 'Tutor input tokens / query', min: 0 },
        { id: 'ec-tutor-tokens-out', label: 'Tutor output tokens / query', min: 0 },
        { id: 'ec-quiz-tokens-in', label: 'Quiz input tokens / query', min: 0 },
        { id: 'ec-quiz-tokens-out', label: 'Quiz output tokens / query', min: 0 },
        { id: 'ec-pipeline-tokens-in', label: 'Pipeline input tokens / video hr', min: 0 },
        { id: 'ec-pipeline-tokens-out', label: 'Pipeline output tokens / video hr', min: 0 },
        { id: 'ec-cost-assemblyai', label: 'AssemblyAI cost', min: 0 },
        { id: 'ec-cost-s3-storage', label: 'S3 storage cost', min: 0 },
        { id: 'ec-cost-s3-transfer', label: 'S3 transfer cost', min: 0 },
        { id: 'ec-cost-batch', label: 'AWS Batch cost', min: 0 },
        { id: 'ec-cost-gemini-in', label: 'Gemini input cost', min: 0 },
        { id: 'ec-cost-gemini-out', label: 'Gemini output cost', min: 0 },
        { id: 'ec-cost-openai-embedding', label: 'OpenAI embedding cost', min: 0 },
        { id: 'ec-cost-multiplier', label: 'Cost safety multiplier', min: 1 }
    ];

    function getInputValue(el) {
        const raw = (el && el.value) ? String(el.value).trim() : '';
        if (raw === '') return null;
        const v = parseFloat(raw);
        return Number.isFinite(v) ? v : null;
    }

    function validateInputs() {
        const errors = [];
        const invalidIds = new Set();

        VALIDATION_CONFIG.forEach(function (cfg) {
            const el = document.getElementById(cfg.id);
            if (!el) return;

            const val = getInputValue(el);
            let msg = null;

            if (val === null) {
                msg = cfg.label + ' is required';
            } else if (cfg.min !== undefined && val < cfg.min) {
                msg = cfg.label + ' must be at least ' + cfg.min;
            } else if (cfg.max !== undefined && val > cfg.max) {
                msg = cfg.label + ' must be at most ' + cfg.max;
            }

            if (msg) {
                errors.push({ id: cfg.id, label: cfg.label, message: msg });
                invalidIds.add(cfg.id);
            }
        });

        if (errors.length === 0) {
            const basePriceErrors = validateBasePrices();
            basePriceErrors.forEach(function (e) {
                errors.push(e);
                invalidIds.add(e.id);
            });
        }

        document.querySelectorAll('input[type="number"]').forEach(function (el) {
            el.classList.toggle('ec-input--invalid', invalidIds.has(el.id));
        });

        return { valid: errors.length === 0, errors: errors };
    }

    function validateBasePrices() {
        const errs = [];
        const { inpVanilla, inpPremium } = readInputs();
        const costsVanilla = computeCosts(inpVanilla);
        const costsPremium = computeCosts(inpPremium);
        const volDisc = getVolumeDiscount(inpVanilla);
        const termDisc = getTermDiscount(inpVanilla);
        const combinedDiscountFactor = getCombinedDiscountFactor(volDisc, termDisc, inpVanilla.earlyDisc);

        console.log(LOG, '[validateBasePrices] discount inputs:', {
            volDisc, volDiscPct: (volDisc * 100).toFixed(1) + '%',
            termDisc, termDiscPct: (termDisc * 100).toFixed(1) + '%',
            earlyDisc: inpVanilla.earlyDisc, earlyDiscPct: (inpVanilla.earlyDisc * 100).toFixed(1) + '%',
            totalDiscountPct: ((volDisc + termDisc + inpVanilla.earlyDisc) * 100).toFixed(1) + '%',
            combinedDiscountFactor,
            seats: inpVanilla.seats,
            term: inpVanilla.term,
            seatMonths: inpVanilla.seats * inpVanilla.term,
            rawConfig: { volDisc1: inpVanilla.volDisc1, volDisc2: inpVanilla.volDisc2, volDisc3: inpVanilla.volDisc3, volDisc4: inpVanilla.volDisc4, termDisc1: inpVanilla.termDisc1, termDisc3: inpVanilla.termDisc3, termDisc6: inpVanilla.termDisc6, termDisc12: inpVanilla.termDisc12, earlyDisc: inpVanilla.earlyDisc }
        });

        let effectiveAthiyaRate = 0;
        let remainingMonths = inpVanilla.term;
        let currentYear = 1;
        while (remainingMonths > 0 && currentYear <= 5) {
            const monthsInThisYear = Math.min(12, remainingMonths);
            const shareRate = inpVanilla.revShare[currentYear] || 0;
            effectiveAthiyaRate += shareRate * (monthsInThisYear / inpVanilla.term);
            remainingMonths -= monthsInThisYear;
            currentYear++;
        }

        console.log(LOG, '[validateBasePrices] Athiya:', { effectiveAthiyaRate, athiyaDenom: 1 - effectiveAthiyaRate });

        if (effectiveAthiyaRate >= 0.999) {
            errs.push({ id: 'ec-rev-share-y1', label: 'Revenue share', message: 'Athiya share cannot be 100% - minimum margin cannot be achieved' });
            return errs;
        }

        // Markup-on-cost: sparkNet >= costs × minMarginPct
        // sparkNet = revenue × (1 - effectiveAthiyaRate) + setupFee - costs
        // → minRevenue = (costs × (1 + minMarginPct) - setupFee) / (1 - effectiveAthiyaRate)
        const athiyaDenom = 1 - effectiveAthiyaRate;
        const minRevenueVanilla = athiyaDenom > 0.001
            ? Math.max(0, costsVanilla.total * (1 + inpVanilla.minMarginPct) - inpVanilla.setupFeeINR) / athiyaDenom
            : 0;
        const minRevenuePremium = athiyaDenom > 0.001
            ? Math.max(0, costsPremium.total * (1 + inpPremium.minMarginPct) - inpPremium.setupFeeINR) / athiyaDenom
            : 0;
        const denomVanilla = inpVanilla.seats * inpVanilla.term * combinedDiscountFactor;
        const minBasePriceVanilla = denomVanilla > 0
            ? minRevenueVanilla / denomVanilla
            : 0;
        const denomPremium = inpPremium.seats * inpPremium.term * combinedDiscountFactor;
        const minBasePricePremium = denomPremium > 0
            ? minRevenuePremium / denomPremium
            : 0;

        const ecMinMarginVanillaEl = document.getElementById('ec-min-margin-vanilla');
        const ecMinMarginPremiumEl = document.getElementById('ec-min-margin-premium');
        console.log(LOG, '[validateBasePrices] min base price calc:', {
            ecMinMarginVanillaRaw: ecMinMarginVanillaEl ? ecMinMarginVanillaEl.value : '(el not found)',
            ecMinMarginPremiumRaw: ecMinMarginPremiumEl ? ecMinMarginPremiumEl.value : '(el not found)',
            minMarginPct: inpVanilla.minMarginPct,
            costsVanillaTotal: costsVanilla.total,
            setupFeeINR: inpVanilla.setupFeeINR,
            costsTimes1PlusMargin: costsVanilla.total * (1 + inpVanilla.minMarginPct),
            minRevenueVanilla,
            denomVanilla,
            minBasePriceVanilla,
            costPerSeatPerMonth: inpVanilla.seats * inpVanilla.term > 0 ? costsVanilla.total / (inpVanilla.seats * inpVanilla.term) : 0
        });

        const baseVanilla = num('ec-base-price-vanilla');
        const basePremium = num('ec-base-price-premium');

        if (baseVanilla < minBasePriceVanilla) {
            errs.push({
                id: 'ec-base-price-vanilla',
                label: 'Base price Vanilla',
                message: 'Base price Vanilla: the min value has to be at least INR ' + Math.round(minBasePriceVanilla).toLocaleString('en-IN'),
                fixable: true,
                minValue: Math.ceil(minBasePriceVanilla)
            });
        }
        if (basePremium < minBasePricePremium) {
            errs.push({
                id: 'ec-base-price-premium',
                label: 'Base price Premium',
                message: 'Base price Premium: the min value has to be at least INR ' + Math.round(minBasePricePremium).toLocaleString('en-IN'),
                fixable: true,
                minValue: Math.ceil(minBasePricePremium)
            });
        }
        if (basePremium <= baseVanilla && (baseVanilla > 0 || basePremium > 0)) {
            errs.push({ id: 'ec-base-price-premium', label: 'Base price Premium', message: 'Base price Premium must be higher than Vanilla' });
        }
        return errs;
    }

    function updateBasePricesFromMinMargin() {
        const { inpVanilla, inpPremium } = readInputs();
        if (inpVanilla.seats < 1 || inpVanilla.term < 1) return;

        const costsVanilla = computeCosts(inpVanilla);
        const costsPremium = computeCosts(inpPremium);
        const volDisc = getVolumeDiscount(inpVanilla);
        const termDisc = getTermDiscount(inpVanilla);
        const combinedDiscountFactor = getCombinedDiscountFactor(volDisc, termDisc, inpVanilla.earlyDisc);

        let effectiveAthiyaRate = 0;
        let remainingMonths = inpVanilla.term;
        let currentYear = 1;
        while (remainingMonths > 0 && currentYear <= 5) {
            const monthsInThisYear = Math.min(12, remainingMonths);
            const shareRate = inpVanilla.revShare[currentYear] || 0;
            effectiveAthiyaRate += shareRate * (monthsInThisYear / inpVanilla.term);
            remainingMonths -= monthsInThisYear;
            currentYear++;
        }

        const athiyaDenom = 1 - effectiveAthiyaRate;
        if (athiyaDenom <= 0.001) return;

        const minRevenueVanilla = Math.max(0, costsVanilla.total * (1 + inpVanilla.minMarginPct) - inpVanilla.setupFeeINR) / athiyaDenom;
        const minRevenuePremium = Math.max(0, costsPremium.total * (1 + inpPremium.minMarginPct) - inpPremium.setupFeeINR) / athiyaDenom;
        const minBasePriceVanilla = (inpVanilla.seats * inpVanilla.term * combinedDiscountFactor) > 0
            ? minRevenueVanilla / (inpVanilla.seats * inpVanilla.term * combinedDiscountFactor)
            : 0;
        const minBasePricePremium = (inpPremium.seats * inpPremium.term * combinedDiscountFactor) > 0
            ? minRevenuePremium / (inpPremium.seats * inpPremium.term * combinedDiscountFactor)
            : 0;
        const baseVanilla = Math.ceil(minBasePriceVanilla);
        const basePremium = Math.ceil(minBasePricePremium);

        const elVanilla = document.getElementById('ec-base-price-vanilla');
        const elPremium = document.getElementById('ec-base-price-premium');
        if (elVanilla) elVanilla.value = String(baseVanilla);
        if (elPremium) elPremium.value = String(basePremium);

        recalculate();
    }

    function clearInputInvalidState() {
        document.querySelectorAll('.ec-input--invalid').forEach(function (el) {
            el.classList.remove('ec-input--invalid');
        });
    }

    function expandPricingSection() {
        const body = document.getElementById('ec-pricing-body');
        const btn = document.getElementById('ec-btn-expand-pricing');
        if (!body || !btn) return;
        if (body.classList.contains('ec-accordion--collapsed')) {
            body.classList.remove('ec-accordion--collapsed');
            body.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
            saveSectionState();
        }
    }

    function handleFixItClick(fixId, fixValue) {
        const el = document.getElementById(fixId);
        if (!el) return;
        el.value = String(Math.ceil(parseFloat(fixValue)));
        expandPricingSection();
        setTimeout(function () {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
            el.classList.add('ec-input--highlight');
            setTimeout(function () {
                el.classList.remove('ec-input--highlight');
            }, 1200);
        }, 300);
        recalculate();
    }

    // ─────────────────────────────────────────────
    // 2. Read inputs
    // ─────────────────────────────────────────────

    function readInputs() {
        const termEl = document.querySelector('.ec-chip--active[data-term]');
        const term = termEl ? parseInt(termEl.getAttribute('data-term'), 10) : 12;

        const revShareY1 = num('ec-rev-share-y1') / 100;
        const revShareY2 = num('ec-rev-share-y2') / 100;
        const revShareY3 = num('ec-rev-share-y3') / 100;
        const revShareY4 = num('ec-rev-share-y4') / 100;
        const revShareY5 = num('ec-rev-share-y5') / 100;

        const tutorInVanilla = document.querySelector('.ec-tier-btn--active[data-tutor-vanilla]')?.getAttribute('data-tutor-vanilla') === 'yes';

        const avgVideoLength = Math.max(0, num('ec-avg-video-length'));
        const hdPct = Math.max(0, Math.min(100, num('ec-hd-pct'))) / 100;

        function deriveVideoHours(numVideos) {
            const hdVideos = numVideos * hdPct;
            const sdVideos = numVideos * (1 - hdPct);
            return {
                videoHoursSDPerMonth: sdVideos * avgVideoLength,
                videoHoursHDPerMonth: hdVideos * avgVideoLength
            };
        }

        const shared = {
            seats:          num('ec-seats'),
            term,
            revShare:       { 1: revShareY1, 2: revShareY2, 3: revShareY3, 4: revShareY4, 5: revShareY5 },
            setupFeeINR:    num('ec-setup-fee'),
            fxRate:         num('ec-fx-rate'),
            hdSdFactor:         num('ec-hd-sd-factor'),
            gbPerVideoHr:       num('ec-gb-per-video-hr'),
            batchHrsPerVideoHr:  num('ec-batch-hrs-per-video-hr'),
            tutorTokensIn:       num('ec-tutor-tokens-in'),
            tutorTokensOut:      num('ec-tutor-tokens-out'),
            quizTokensIn:        num('ec-quiz-tokens-in'),
            quizTokensOut:       num('ec-quiz-tokens-out'),
            pipelineTokensIn:    num('ec-pipeline-tokens-in'),
            pipelineTokensOut:   num('ec-pipeline-tokens-out'),
            costAssemblyAI:   num('ec-cost-assemblyai'),
            costS3Storage:    num('ec-cost-s3-storage'),
            costS3Transfer:   num('ec-cost-s3-transfer'),
            costBatch:        num('ec-cost-batch'),
            costGeminiIn:     num('ec-cost-gemini-in'),
            costGeminiOut:    num('ec-cost-gemini-out'),
            embeddingTokensPerVideoHr: num('ec-embedding-tokens'),
            costOpenAIEmbedding: num('ec-cost-openai-embedding'),
            costMultiplier:   num('ec-cost-multiplier'),
            volDisc1:    num('ec-vol-disc-1') / 100,
            volDisc2:    num('ec-vol-disc-2') / 100,
            volDisc3:    num('ec-vol-disc-3') / 100,
            volDisc4:    num('ec-vol-disc-4') / 100,
            volDisc5:    num('ec-vol-disc-5') / 100,
            volDisc6:    num('ec-vol-disc-6') / 100,
            volDisc7:    num('ec-vol-disc-7') / 100,
            termDisc1:   num('ec-term-disc-1') / 100,
            termDisc3:   num('ec-term-disc-3') / 100,
            termDisc6:   num('ec-term-disc-6') / 100,
            termDisc12:  num('ec-term-disc-12') / 100,
            earlyDisc:   num('ec-early-disc') / 100,
        };

        const derivedVanilla = deriveVideoHours(num('ec-num-videos-vanilla'));
        const derivedPremium = deriveVideoHours(num('ec-num-videos-premium'));

        const inpVanilla = Object.assign({}, shared, derivedVanilla, {
            tier: 'vanilla',
            minMarginPct: num('ec-min-margin-vanilla') / 100,
            tutorInVanilla,
            tutorQueriesPerSeat: tutorInVanilla ? num('ec-tutor-queries-vanilla') : 0,
            streamingHrsPerSeat: num('ec-streaming-hrs-vanilla'),
            numVideosPerMonth:   num('ec-num-videos-vanilla'),
            quizQuestionsPerHour: num('ec-quiz-queries-vanilla'),
            basePricePerSeatINR: num('ec-base-price-vanilla'),
        });

        const inpPremium = Object.assign({}, shared, derivedPremium, {
            tier: 'premium',
            minMarginPct: num('ec-min-margin-premium') / 100,
            tutorInVanilla: true,
            tutorQueriesPerSeat: num('ec-tutor-queries-premium'),
            streamingHrsPerSeat: num('ec-streaming-hrs-premium'),
            numVideosPerMonth:   num('ec-num-videos-premium'),
            quizQuestionsPerHour: num('ec-quiz-queries-premium'),
            basePricePerSeatINR: num('ec-base-price-premium'),
        });

        return { inpVanilla, inpPremium };
    }

    // ─────────────────────────────────────────────
    // 3. Compute (delegates to EC_COMPUTE)
    // ─────────────────────────────────────────────

    function computeCosts(inp) {
        return window.EC_COMPUTE.computeCosts(inp);
    }

    function computePricing(inp, costs) {
        const result = window.EC_COMPUTE.computePricing(inp, costs);
        console.log(LOG, 'pricing (INR)', result);
        return result;
    }

    function getVolumeDiscount(inp) {
        return window.EC_COMPUTE.getVolumeDiscount(inp);
    }

    function getTermDiscount(inp) {
        return window.EC_COMPUTE.getTermDiscount(inp);
    }

    function getCombinedDiscountFactor(volDisc, termDisc, earlyDisc) {
        return window.EC_COMPUTE.getCombinedDiscountFactor(volDisc, termDisc, earlyDisc);
    }

    // ─────────────────────────────────────────────
    // 5. Render results
    // ─────────────────────────────────────────────

    function renderError(errors) {
        const listItems = errors.map(function (e) {
            if (e.fixable && e.minValue !== undefined) {
                return '<li class="ec-results-error-item ec-results-error-item--fixable">' +
                    '<span class="ec-results-error-item-text">' + e.message + '</span>' +
                    '<button type="button" class="ec-btn-fix cursor-pointer" data-fix-id="' + e.id + '" data-fix-value="' + e.minValue + '">Fix it</button>' +
                    '</li>';
            }
            return '<li class="ec-results-error-item"><span class="ec-results-error-item-text">' + e.message + '</span></li>';
        }).join('');
        const errorHtml = '<p class="ec-results-error-title">Please correct the following:</p><ul class="ec-results-error-list">' + listItems + '</ul>';
        const errorEl = document.getElementById('ec-results-error');
        const contentEl = document.getElementById('ec-results-content');
        const fullErrorEl = document.getElementById('ec-results-full-error');
        const fullContentEl = document.getElementById('ec-results-full-content');

        if (errorEl) {
            errorEl.innerHTML = errorHtml;
            errorEl.classList.remove('hidden');
        }
        if (contentEl) contentEl.classList.add('hidden');
        if (fullErrorEl) {
            fullErrorEl.innerHTML = errorHtml;
            fullErrorEl.classList.remove('hidden');
        }
        if (fullContentEl) fullContentEl.classList.add('hidden');
    }

    function hideErrorShowContent() {
        const errorEl = document.getElementById('ec-results-error');
        const contentEl = document.getElementById('ec-results-content');
        const fullErrorEl = document.getElementById('ec-results-full-error');
        const fullContentEl = document.getElementById('ec-results-full-content');

        if (errorEl) {
            errorEl.innerHTML = '';
            errorEl.classList.add('hidden');
        }
        if (contentEl) contentEl.classList.remove('hidden');
        if (fullErrorEl) {
            fullErrorEl.innerHTML = '';
            fullErrorEl.classList.add('hidden');
        }
        if (fullContentEl) fullContentEl.classList.remove('hidden');
    }

    function fmtNum(v) {
        if (Number.isInteger(v)) return v.toLocaleString('en-IN');
        const s = v.toFixed(2);
        return s.replace(/\.?0+$/, '');
    }

    function renderDetailedCostBreakdown(inpVanilla, costsVanilla, inpPremium, costsPremium) {
        if (window.EC_BREAKDOWN && window.EC_BREAKDOWN.renderDetailedCostBreakdown) {
            window.EC_BREAKDOWN.renderDetailedCostBreakdown(inpVanilla, costsVanilla, inpPremium, costsPremium);
        }
    }

    function updateSparkInternalVisibility(show) {
        const summaryInternal = document.getElementById('ec-summary-spark-internal');
        const fullInternal = document.getElementById('ec-full-spark-internal');
        const sectionTechnical = document.getElementById('ec-section-technical');
        const sectionCosts = document.getElementById('ec-section-costs');
        const costBreakdownBlock = document.getElementById('ec-cost-breakdown-block');
        const linkDetailed = document.getElementById('ec-link-detailed-breakdown');
        const sectionDetailed = document.getElementById('ec-detailed-cost-breakdown');
        if (summaryInternal) summaryInternal.classList.toggle('hidden', !show);
        if (fullInternal) fullInternal.classList.toggle('hidden', !show);
        if (sectionTechnical) sectionTechnical.classList.toggle('hidden', !show);
        if (sectionCosts) sectionCosts.classList.toggle('hidden', !show);
        if (costBreakdownBlock) costBreakdownBlock.classList.toggle('hidden', !show);
        if (linkDetailed) linkDetailed.classList.toggle('hidden', !show);
        if (sectionDetailed) sectionDetailed.classList.toggle('hidden', !show);
    }

    function renderResults(inpVanilla, costsVanilla, pricingVanilla, inpPremium, costsPremium, pricingPremium) {
        hideErrorShowContent();

        // Pricing rows - both tiers
        setQuad('ec-out-list-seat-mo-v-inr', 'ec-out-list-seat-mo-v-usd', 'ec-out-list-seat-mo-p-inr', 'ec-out-list-seat-mo-p-usd',
            pricingVanilla.listPricePerSeatPerMonth, pricingPremium.listPricePerSeatPerMonth);
        setQuad('ec-out-list-seat-yr-v-inr', 'ec-out-list-seat-yr-v-usd', 'ec-out-list-seat-yr-p-inr', 'ec-out-list-seat-yr-p-usd',
            pricingVanilla.listPricePerSeatPerMonth * 12, pricingPremium.listPricePerSeatPerMonth * 12);

        set('ec-out-discounts-pct', pricingVanilla.totalDiscountPctDisplay > 0
            ? '-' + fmtPct(pricingVanilla.totalDiscountPctDisplay * 100)
            : '0%');

        // Discount breakdown (shared)
        const breakdownEl = document.getElementById('ec-discount-breakdown');
        if (breakdownEl) {
            const parts = [];
            if (pricingVanilla.volDisc > 0)  parts.push('Volume: -' + fmtPct(pricingVanilla.volDisc * 100));
            if (pricingVanilla.termDisc > 0) parts.push('Term: -' + fmtPct(pricingVanilla.termDisc * 100));
            if (pricingVanilla.earlyDisc > 0) parts.push('Early: -' + fmtPct(pricingVanilla.earlyDisc * 100));
            if (parts.length > 0) {
                breakdownEl.textContent = parts.join(' · ');
                breakdownEl.classList.remove('hidden');
            } else {
                breakdownEl.classList.add('hidden');
            }
        }

        setQuad('ec-out-net-seat-mo-v-inr', 'ec-out-net-seat-mo-v-usd', 'ec-out-net-seat-mo-p-inr', 'ec-out-net-seat-mo-p-usd',
            pricingVanilla.netPricePerSeatPerMonth, pricingPremium.netPricePerSeatPerMonth);

        // Summary (sticky)
        setQuad('ec-summary-net-v-inr', 'ec-summary-net-v-usd', 'ec-summary-net-p-inr', 'ec-summary-net-p-usd',
            pricingVanilla.netPricePerSeatPerMonth, pricingPremium.netPricePerSeatPerMonth);
        setQuad('ec-summary-tcv-v-inr', 'ec-summary-tcv-v-usd', 'ec-summary-tcv-p-inr', 'ec-summary-tcv-p-usd',
            pricingVanilla.tcvINR, pricingPremium.tcvINR);
        setQuad('ec-summary-spark-rev-v-inr', 'ec-summary-spark-rev-v-usd', 'ec-summary-spark-rev-p-inr', 'ec-summary-spark-rev-p-usd',
            pricingVanilla.sparkGrossINR, pricingPremium.sparkGrossINR);
        setQuad('ec-summary-athiya-rev-v-inr', 'ec-summary-athiya-rev-v-usd', 'ec-summary-athiya-rev-p-inr', 'ec-summary-athiya-rev-p-usd',
            pricingVanilla.athiyaAmountINR, pricingPremium.athiyaAmountINR);
        set('ec-summary-margin-pct-v-inr', fmtPct(pricingVanilla.marginPct));
        set('ec-summary-margin-pct-v-usd', fmtPct(pricingVanilla.marginPct));
        set('ec-summary-margin-pct-p-inr', fmtPct(pricingPremium.marginPct));
        set('ec-summary-margin-pct-p-usd', fmtPct(pricingPremium.marginPct));
        setQuad('ec-summary-spark-net-v-inr', 'ec-summary-spark-net-v-usd', 'ec-summary-spark-net-p-inr', 'ec-summary-spark-net-p-usd',
            pricingVanilla.sparkNetINR, pricingPremium.sparkNetINR);

        // Spark-internal visibility
        const showSparkInternal = hasSparkInternalParam();
        updateSparkInternalVisibility(showSparkInternal);

        if (showSparkInternal && costsVanilla.detail) {
            renderDetailedCostBreakdown(inpVanilla, costsVanilla, inpPremium, costsPremium);
        }

        // Contract value
        setQuad('ec-out-acv-v-inr', 'ec-out-acv-v-usd', 'ec-out-acv-p-inr', 'ec-out-acv-p-usd',
            pricingVanilla.acvINR, pricingPremium.acvINR);
        setQuad('ec-out-setup-v-inr', 'ec-out-setup-v-usd', 'ec-out-setup-p-inr', 'ec-out-setup-p-usd',
            pricingVanilla.setupFeeINR, pricingPremium.setupFeeINR);
        set('ec-out-tcv-term', String(inpVanilla.term));
        setQuad('ec-out-tcv-v-inr', 'ec-out-tcv-v-usd', 'ec-out-tcv-p-inr', 'ec-out-tcv-p-usd',
            pricingVanilla.tcvINR, pricingPremium.tcvINR);

        // Cost breakdown - Vanilla and Premium
        setQuad('ec-cost-out-assemblyai-v-inr', 'ec-cost-out-assemblyai-v-usd', 'ec-cost-out-assemblyai-p-inr', 'ec-cost-out-assemblyai-p-usd', costsVanilla.assemblyAI, costsPremium.assemblyAI);
        set('ec-cost-out-storage-gb-v', Math.round(costsVanilla.storageGB));
        set('ec-cost-out-storage-gb-p', Math.round(costsPremium.storageGB));
        setQuad('ec-cost-out-s3-storage-v-inr', 'ec-cost-out-s3-storage-v-usd', 'ec-cost-out-s3-storage-p-inr', 'ec-cost-out-s3-storage-p-usd', costsVanilla.s3Storage, costsPremium.s3Storage);
        setQuad('ec-cost-out-s3-streaming-v-inr', 'ec-cost-out-s3-streaming-v-usd', 'ec-cost-out-s3-streaming-p-inr', 'ec-cost-out-s3-streaming-p-usd', costsVanilla.s3Streaming, costsPremium.s3Streaming);
        setQuad('ec-cost-out-batch-v-inr', 'ec-cost-out-batch-v-usd', 'ec-cost-out-batch-p-inr', 'ec-cost-out-batch-p-usd', costsVanilla.batch, costsPremium.batch);
        setQuad('ec-cost-out-gemini-v-inr', 'ec-cost-out-gemini-v-usd', 'ec-cost-out-gemini-p-inr', 'ec-cost-out-gemini-p-usd', costsVanilla.gemini, costsPremium.gemini);
        setQuad('ec-cost-out-openai-v-inr', 'ec-cost-out-openai-v-usd', 'ec-cost-out-openai-p-inr', 'ec-cost-out-openai-p-usd', costsVanilla.openAI, costsPremium.openAI);
        setQuad('ec-cost-out-total-v-inr', 'ec-cost-out-total-v-usd', 'ec-cost-out-total-p-inr', 'ec-cost-out-total-p-usd', costsVanilla.total, costsPremium.total);

        // Revenue Share
        setQuad('ec-margin-out-spark-gross-v-inr', 'ec-margin-out-spark-gross-v-usd', 'ec-margin-out-spark-gross-p-inr', 'ec-margin-out-spark-gross-p-usd',
            pricingVanilla.sparkGrossINR, pricingPremium.sparkGrossINR);
        setQuad('ec-margin-out-athiya-v-inr', 'ec-margin-out-athiya-v-usd', 'ec-margin-out-athiya-p-inr', 'ec-margin-out-athiya-p-usd',
            pricingVanilla.athiyaAmountINR, pricingPremium.athiyaAmountINR);
        setQuad('ec-margin-out-cost-v-inr', 'ec-margin-out-cost-v-usd', 'ec-margin-out-cost-p-inr', 'ec-margin-out-cost-p-usd',
            costsVanilla.total, costsPremium.total);
        setQuad('ec-margin-out-net-v-inr', 'ec-margin-out-net-v-usd', 'ec-margin-out-net-p-inr', 'ec-margin-out-net-p-usd',
            pricingVanilla.sparkNetINR, pricingPremium.sparkNetINR);
        set('ec-margin-out-pct-v', fmtPct(pricingVanilla.marginPct));
        set('ec-margin-out-pct-p', fmtPct(pricingPremium.marginPct));

        // Year-by-year: Vanilla only (shared structure)
        const yearContainer = document.getElementById('ec-year-by-year-container');
        const setupFeeINR = inpVanilla.setupFeeINR || 0;
        if (yearContainer && pricingVanilla.yearData && pricingVanilla.yearData.length > 0) {
            yearContainer.innerHTML = pricingVanilla.yearData.map(function (d) {
                var rows = '<div class="ec-result-row">' +
                    '<span class="ec-result-label">Total revenue</span>' +
                    '<div class="ec-result-dual">' +
                    '<span class="ec-result-value">' + fmtINR(d.rev) + '</span>' +
                    '<span class="ec-result-value-secondary">' + fmtUSD(d.rev) + '</span>' +
                    '</div></div>' +
                    '<div class="ec-result-row">' +
                    '<span class="ec-result-label">Spark (recurring)</span>' +
                    '<div class="ec-result-dual">' +
                    '<span class="ec-result-value">' + fmtINR(d.spark) + '</span>' +
                    '<span class="ec-result-value-secondary">' + fmtUSD(d.spark) + '</span>' +
                    '</div></div>' +
                    '<div class="ec-result-row">' +
                    '<span class="ec-result-label">Athiya</span>' +
                    '<div class="ec-result-dual">' +
                    '<span class="ec-result-value">' + fmtINR(d.athiya) + '</span>' +
                    '<span class="ec-result-value-secondary">' + fmtUSD(d.athiya) + '</span>' +
                    '</div></div>';
                if (d.year === 1 && setupFeeINR > 0) {
                    rows += '<div class="ec-result-row ec-result-row--setup-fee">' +
                        '<span class="ec-result-label">Setup fee (one-time, Spark only)</span>' +
                        '<div class="ec-result-dual">' +
                        '<span class="ec-result-value">' + fmtINR(setupFeeINR) + '</span>' +
                        '<span class="ec-result-value-secondary">' + fmtUSD(setupFeeINR) + '</span>' +
                        '</div></div>';
                }
                const yearLabel = d.months < 12 ? 'Year ' + d.year + ' (' + d.months + ' months)' : 'Year ' + d.year;
                return '<div class="ec-year-section">' +
                    '<p class="ec-year-section-title">' + yearLabel + ' <span class="ec-year-section-note">(Athiya ' + Math.round(d.pct) + '%)</span></p>' +
                    '<div class="ec-year-section-header">' +
                    '<span class="ec-result-label"></span>' +
                    '<div class="ec-result-dual">' +
                    '<span class="ec-result-currency-label">INR</span>' +
                    '<span class="ec-result-currency-label">USD</span>' +
                    '</div></div>' +
                    '<div class="ec-year-section-rows">' + rows + '</div></div>';
            }).join('');
        } else if (yearContainer) {
            yearContainer.innerHTML = '';
        }

        console.log(LOG, 'render complete');
    }

    // ─────────────────────────────────────────────
    // 6. Export / Import / localStorage
    // ─────────────────────────────────────────────

    const STORAGE_KEY = 'spark-enterprise-pricing';
    const SECTIONS_STORAGE_KEY = 'spark-enterprise-pricing-sections';

    const DEFAULTS = {
        'ec-fx-rate': '91',
        'ec-seats': '500',
        'ec-setup-fee': '0',
        'ec-base-price-vanilla': '450',
        'ec-base-price-premium': '900',
        'ec-avg-video-length': '1',
        'ec-hd-pct': '10',
        'ec-hd-sd-factor': '5',
        'ec-gb-per-video-hr': '0.75',
        'ec-streaming-hrs-vanilla': '2',
        'ec-streaming-hrs-premium': '2',
        'ec-num-videos-vanilla': '40',
        'ec-num-videos-premium': '40',
        'ec-tutor-queries-vanilla': '0',
        'ec-tutor-queries-premium': '100',
        'ec-quiz-queries-vanilla': '8',
        'ec-quiz-queries-premium': '16',
        'ec-embedding-tokens': '15000',
        'ec-batch-hrs-per-video-hr': '3',
        'ec-tutor-tokens-in': '350',
        'ec-tutor-tokens-out': '500',
        'ec-quiz-tokens-in': '5000',
        'ec-quiz-tokens-out': '2000',
        'ec-pipeline-tokens-in': '200000',
        'ec-pipeline-tokens-out': '300000',
        'ec-cost-assemblyai': '20',
        'ec-cost-s3-storage': '1.93',
        'ec-cost-s3-transfer': '7.56',
        'ec-cost-batch': '4.03',
        'ec-cost-gemini-in': '27',
        'ec-cost-gemini-out': '225',
        'ec-cost-openai-embedding': '1.68',
        'ec-cost-multiplier': '1.3',
        'ec-min-margin-vanilla': '800',
        'ec-min-margin-premium': '800',
        'ec-vol-disc-1': '0',
        'ec-vol-disc-2': '5',
        'ec-vol-disc-3': '10',
        'ec-vol-disc-4': '15',
        'ec-vol-disc-5': '20',
        'ec-vol-disc-6': '25',
        'ec-vol-disc-7': '30',
        'ec-term-disc-1': '0',
        'ec-term-disc-3': '2',
        'ec-term-disc-6': '5',
        'ec-term-disc-12': '10',
        'ec-early-disc': '0',
        'ec-rev-share-y1': '30',
        'ec-rev-share-y2': '20',
        'ec-rev-share-y3': '10',
        'ec-rev-share-y4': '5',
        'ec-rev-share-y5': '5',
        _term: '12',
        _tutorVanilla: 'no'
    };

    function pickFromDefaults(keys) {
        const out = {};
        keys.forEach(function (k) { if (DEFAULTS[k] !== undefined) out[k] = DEFAULTS[k]; });
        return out;
    }

    const SECTION_KEYS = {
        deal: ['ec-seats', 'ec-setup-fee', '_term'],
        'revenue-share': ['ec-rev-share-y1', 'ec-rev-share-y2', 'ec-rev-share-y3', 'ec-rev-share-y4', 'ec-rev-share-y5'],
            usage: ['ec-num-videos-vanilla', 'ec-num-videos-premium', 'ec-avg-video-length', 'ec-hd-pct', 'ec-streaming-hrs-vanilla', 'ec-streaming-hrs-premium', 'ec-tutor-queries-vanilla', 'ec-tutor-queries-premium', 'ec-quiz-queries-vanilla', 'ec-quiz-queries-premium', '_tutorVanilla'],
        pricing: ['ec-base-price-vanilla', 'ec-base-price-premium', 'ec-vol-disc-1', 'ec-vol-disc-2', 'ec-vol-disc-3', 'ec-vol-disc-4', 'ec-vol-disc-5', 'ec-vol-disc-6', 'ec-vol-disc-7', 'ec-term-disc-1', 'ec-term-disc-3', 'ec-term-disc-6', 'ec-term-disc-12', 'ec-early-disc'],
        technical: ['ec-hd-sd-factor', 'ec-gb-per-video-hr', 'ec-embedding-tokens', 'ec-batch-hrs-per-video-hr', 'ec-tutor-tokens-in', 'ec-tutor-tokens-out', 'ec-quiz-tokens-in', 'ec-quiz-tokens-out', 'ec-pipeline-tokens-in', 'ec-pipeline-tokens-out'],
        costs: ['ec-cost-assemblyai', 'ec-cost-s3-storage', 'ec-cost-s3-transfer', 'ec-cost-batch', 'ec-cost-gemini-in', 'ec-cost-gemini-out', 'ec-cost-openai-embedding', 'ec-cost-multiplier', 'ec-min-margin-vanilla', 'ec-min-margin-premium']
    };

    const DEFAULTS_DEAL = pickFromDefaults(SECTION_KEYS.deal);
    const DEFAULTS_REVENUE_SHARE = pickFromDefaults(SECTION_KEYS['revenue-share']);
    const DEFAULTS_USAGE = pickFromDefaults(SECTION_KEYS.usage);
    const DEFAULTS_PRICING = pickFromDefaults(SECTION_KEYS.pricing);
    const DEFAULTS_TECHNICAL = pickFromDefaults(SECTION_KEYS.technical);
    const DEFAULTS_COSTS = pickFromDefaults(SECTION_KEYS.costs);

    function resetToDefaults() {
        applyImportedValues(DEFAULTS, { skipRecalc: true });
        updateBasePricesFromMinMargin();
        console.log(LOG, 'reset to defaults');
    }

    function resetBySection(section) {
        const sectionDefaults = {
            deal: DEFAULTS_DEAL,
            'revenue-share': DEFAULTS_REVENUE_SHARE,
            usage: DEFAULTS_USAGE,
            pricing: DEFAULTS_PRICING,
            technical: DEFAULTS_TECHNICAL,
            costs: DEFAULTS_COSTS
        }[section];
        if (!sectionDefaults) return;
        const data = gatherAllInputValues();
        Object.assign(data, sectionDefaults);
        applyImportedValues(data);
        console.log(LOG, 'reset section', section);
    }

    function saveToLocalStorage() {
        try {
            const data = gatherAllInputValues();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn(LOG, 'localStorage save failed', e);
        }
    }

    function loadFromLocalStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (data && typeof data === 'object') return data;
            }
        } catch (e) {
            console.warn(LOG, 'localStorage load failed', e);
        }
        return null;
    }

    const SECTION_CONFIG = [
        { key: 'deal', btnId: 'ec-btn-expand-deal', bodyId: 'ec-deal-body', bodyClass: 'ec-accordion--collapsed', defaultExpanded: true },
        { key: 'usage', btnId: 'ec-btn-expand-usage', bodyId: 'ec-usage-body', bodyClass: 'ec-accordion--collapsed', defaultExpanded: false },
        { key: 'pricing', btnId: 'ec-btn-expand-pricing', bodyId: 'ec-pricing-body', bodyClass: 'ec-accordion--collapsed', defaultExpanded: false },
        { key: 'revenue-share', btnId: 'ec-btn-expand-revenue-share', bodyId: 'ec-revenue-share-body', bodyClass: 'ec-accordion--collapsed', defaultExpanded: false },
        { key: 'technical', btnId: 'ec-btn-expand-technical', bodyId: 'ec-technical-body', bodyClass: 'ec-accordion--collapsed', defaultExpanded: false },
        { key: 'costs', btnId: 'ec-btn-expand-costs', bodyId: 'ec-costs-body', bodyClass: 'ec-accordion--collapsed', defaultExpanded: false },
        { key: 'detailed-breakdown', btnId: 'ec-btn-expand-detailed-breakdown', bodyId: 'ec-detailed-breakdown-body', bodyClass: 'ec-accordion--collapsed', defaultExpanded: false },
        { key: 'results', btnId: 'ec-btn-expand-results', bodyId: 'ec-results-full', bodyClass: 'ec-results-full--collapsed', defaultExpanded: false }
    ];

    function saveSectionState() {
        try {
            const state = {};
            SECTION_CONFIG.forEach(function (cfg) {
                const body = document.getElementById(cfg.bodyId);
                if (!body) return;
                const expanded = !body.classList.contains(cfg.bodyClass);
                state[cfg.key] = expanded;
            });
            localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn(LOG, 'section state save failed', e);
        }
    }

    function loadSectionState() {
        try {
            const raw = localStorage.getItem(SECTIONS_STORAGE_KEY);
            const state = raw ? JSON.parse(raw) : null;
            if (!state || typeof state !== 'object') return;
            SECTION_CONFIG.forEach(function (cfg) {
                const btn = document.getElementById(cfg.btnId);
                const body = document.getElementById(cfg.bodyId);
                if (!btn || !body) return;
                const expanded = state[cfg.key];
                if (typeof expanded !== 'boolean') return;
                if (cfg.bodyClass === 'ec-results-full--collapsed') {
                    body.classList.toggle(cfg.bodyClass, !expanded);
                    body.setAttribute('aria-hidden', String(!expanded));
                    btn.setAttribute('aria-expanded', String(expanded));
                    const expandText = btn.querySelector('.ec-btn-expand-text');
                    const expandIcon = btn.querySelector('.ec-btn-expand-icon');
                    if (expandText) expandText.textContent = expanded ? 'Collapse' : 'Expand';
                    if (expandIcon) expandIcon.textContent = expanded ? 'expand_less' : 'expand_more';
                } else {
                    body.classList.toggle(cfg.bodyClass, !expanded);
                    body.setAttribute('aria-hidden', String(!expanded));
                    btn.setAttribute('aria-expanded', String(expanded));
                }
            });
        } catch (e) {
            console.warn(LOG, 'section state load failed', e);
        }
    }

    function gatherAllInputValues() {
        const ids = [
            'ec-fx-rate', 'ec-seats', 'ec-setup-fee', 'ec-base-price-vanilla', 'ec-base-price-premium',
            'ec-rev-share-y1', 'ec-rev-share-y2', 'ec-rev-share-y3', 'ec-rev-share-y4', 'ec-rev-share-y5',
            'ec-avg-video-length', 'ec-hd-pct',
            'ec-hd-sd-factor', 'ec-gb-per-video-hr',
            'ec-streaming-hrs-vanilla', 'ec-streaming-hrs-premium', 'ec-num-videos-vanilla', 'ec-num-videos-premium',
            'ec-tutor-queries-vanilla', 'ec-tutor-queries-premium', 'ec-quiz-queries-vanilla', 'ec-quiz-queries-premium',
            'ec-batch-hrs-per-video-hr',
            'ec-tutor-tokens-in', 'ec-tutor-tokens-out',
            'ec-quiz-tokens-in', 'ec-quiz-tokens-out',
            'ec-pipeline-tokens-in', 'ec-pipeline-tokens-out',
            'ec-cost-assemblyai', 'ec-cost-s3-storage', 'ec-cost-s3-transfer',
            'ec-cost-batch', 'ec-cost-gemini-in', 'ec-cost-gemini-out',
            'ec-embedding-tokens', 'ec-cost-openai-embedding', 'ec-cost-multiplier', 'ec-min-margin-vanilla', 'ec-min-margin-premium',
            'ec-vol-disc-1', 'ec-vol-disc-2', 'ec-vol-disc-3', 'ec-vol-disc-4',
            'ec-vol-disc-5', 'ec-vol-disc-6', 'ec-vol-disc-7',
            'ec-term-disc-1', 'ec-term-disc-3', 'ec-term-disc-6', 'ec-term-disc-12',
            'ec-early-disc',
        ];
        const data = { _version: 1, _ts: new Date().toISOString() };
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) data[id] = el.value;
        });
        // Capture toggle state
        const termEl = document.querySelector('.ec-chip--active[data-term]');
        data['_term'] = termEl ? termEl.getAttribute('data-term') : '12';
        const tutorVanillaEl = document.querySelector('.ec-tier-btn--active[data-tutor-vanilla]');
        data['_tutorVanilla'] = tutorVanillaEl ? tutorVanillaEl.getAttribute('data-tutor-vanilla') : 'no';
        return data;
    }

    function applyImportedValues(data, options) {
        // Merge defaults for any missing keys (e.g. new fields not in old localStorage)
        for (const k in DEFAULTS) {
            if (k.startsWith('_')) continue;
            if (data[k] === undefined || data[k] === '') {
                data[k] = DEFAULTS[k];
            }
        }
        // Backward compat: map old OpenAI input cost to embedding cost
        if (data['ec-cost-openai-in'] && !data['ec-cost-openai-embedding']) {
            data['ec-cost-openai-embedding'] = data['ec-cost-openai-in'];
        }
        // Backward compat: map old single base price to both tiers
        if (data['ec-base-price-per-seat'] !== undefined && data['ec-base-price-vanilla'] === undefined) {
            data['ec-base-price-vanilla'] = data['ec-base-price-per-seat'];
            data['ec-base-price-premium'] = data['ec-base-price-per-seat'];
        }
        // Backward compat: map old single min margin to both tiers
        if (data['ec-min-margin'] !== undefined && data['ec-min-margin-vanilla'] === undefined) {
            data['ec-min-margin-vanilla'] = data['ec-min-margin'];
            data['ec-min-margin-premium'] = data['ec-min-margin'];
        }
        const usageMap = [
            ['ec-streaming-hrs', 'ec-streaming-hrs-vanilla', 'ec-streaming-hrs-premium'],
            ['ec-num-videos', 'ec-num-videos-vanilla', 'ec-num-videos-premium'],
            ['ec-quiz-queries', 'ec-quiz-queries-vanilla', 'ec-quiz-queries-premium'],
            ['ec-tutor-queries', 'ec-tutor-queries-vanilla', 'ec-tutor-queries-premium'],
        ];
        usageMap.forEach(function (m) {
            if (data[m[0]] !== undefined && data[m[1]] === undefined) {
                data[m[1]] = data[m[0]];
                data[m[2]] = data[m[0]];
            }
        });
        for (const key in data) {
            if (key.startsWith('_')) continue;
            const el = document.getElementById(key);
            if (el) el.value = data[key];
        }
        // Restore term
        if (data['_term']) {
            const termVal = data['_term'];
            document.querySelectorAll('.ec-chip[data-term]').forEach(btn => {
                const active = btn.getAttribute('data-term') === termVal;
                btn.classList.toggle('ec-chip--active', active);
            });
        }
        // Restore tutor-in-vanilla flag
        if (data['_tutorVanilla']) {
            document.querySelectorAll('.ec-tier-btn[data-tutor-vanilla]').forEach(btn => {
                const active = btn.getAttribute('data-tutor-vanilla') === data['_tutorVanilla'];
                btn.classList.toggle('ec-tier-btn--active', active);
            });
        }
        if (!(options && options.skipRecalc)) recalculate();
    }

    function exportJSON() {
        const data = gatherAllInputValues();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spark-enterprise-pricing-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        console.log(LOG, 'JSON exported');
    }

    function exportCSV() {
        const validation = validateInputs();
        if (!validation.valid) {
            alert('Please correct all validation errors before exporting CSV.');
            return;
        }
        clearInputInvalidState();
        const { inpVanilla, inpPremium } = readInputs();
        const costsVanilla = computeCosts(inpVanilla);
        const costsPremium = computeCosts(inpPremium);
        const pricingVanilla = computePricing(inpVanilla, costsVanilla);
        const pricingPremium = computePricing(inpPremium, costsPremium);
        const fx = inpVanilla.fxRate;
        const showSparkInternal = hasSparkInternalParam();

        const rows = [
            ['Spark Enterprise Pricing Calculator', '', '', '', ''],
            ['Generated', new Date().toISOString(), '', '', ''],
            ['', '', '', '', ''],
            ['DEAL PARAMETERS', '', '', '', ''],
            ['Seats', inpVanilla.seats, '', '', ''],
            ['Contract term (months)', inpVanilla.term, '', '', ''],
            ['Setup fee (INR, Spark only, Y1)', inpVanilla.setupFeeINR, '', '', ''],
            ['FX rate (INR/USD)', fx, '', '', ''],
            ['Revenue share Y1-Y5 (%)', [1,2,3,4,5].map(function(y){ return Math.round(inpVanilla.revShare[y] * 100); }).join('/'), '', '', ''],
            ['AI Tutor in Vanilla', inpVanilla.tutorInVanilla ? 'Yes' : 'No', '', '', ''],
            ['', '', '', '', ''],
            ['PRICING', 'Vanilla INR', 'Vanilla USD', 'Premium INR', 'Premium USD'],
            ['List price / seat / month', fmtINR(pricingVanilla.listPricePerSeatPerMonth), fmtUSD(pricingVanilla.listPricePerSeatPerMonth), fmtINR(pricingPremium.listPricePerSeatPerMonth), fmtUSD(pricingPremium.listPricePerSeatPerMonth)],
            ['List price / seat / year', fmtINR(pricingVanilla.listPricePerSeatPerMonth * 12), fmtUSD(pricingVanilla.listPricePerSeatPerMonth * 12), fmtINR(pricingPremium.listPricePerSeatPerMonth * 12), fmtUSD(pricingPremium.listPricePerSeatPerMonth * 12)],
            ['Total discount %', fmtPct(pricingVanilla.totalDiscountPctDisplay * 100), '', fmtPct(pricingPremium.totalDiscountPctDisplay * 100), ''],
            ['Net price / seat / month', fmtINR(pricingVanilla.netPricePerSeatPerMonth), fmtUSD(pricingVanilla.netPricePerSeatPerMonth), fmtINR(pricingPremium.netPricePerSeatPerMonth), fmtUSD(pricingPremium.netPricePerSeatPerMonth)],
            ['ACV (annual contract value)', fmtINR(pricingVanilla.acvINR), fmtUSD(pricingVanilla.acvINR), fmtINR(pricingPremium.acvINR), fmtUSD(pricingPremium.acvINR)],
            ['Setup fee (one-time, Spark only)', fmtINR(pricingVanilla.setupFeeINR), fmtUSD(pricingVanilla.setupFeeINR), fmtINR(pricingPremium.setupFeeINR), fmtUSD(pricingPremium.setupFeeINR)],
            ['TCV (' + inpVanilla.term + ' months + setup)', fmtINR(pricingVanilla.tcvINR), fmtUSD(pricingVanilla.tcvINR), fmtINR(pricingPremium.tcvINR), fmtUSD(pricingPremium.tcvINR)],
            ['', '', '', '', ''],
            ['REVENUE SHARE', 'Vanilla INR', 'Vanilla USD', 'Premium INR', 'Premium USD'],
            ['Total revenue (TCV excl. setup)', fmtINR(pricingVanilla.revenueINR), fmtUSD(pricingVanilla.revenueINR), fmtINR(pricingPremium.revenueINR), fmtUSD(pricingPremium.revenueINR)],
            ['Spark revenue', fmtINR(pricingVanilla.sparkGrossINR), fmtUSD(pricingVanilla.sparkGrossINR), fmtINR(pricingPremium.sparkGrossINR), fmtUSD(pricingPremium.sparkGrossINR)],
            ['Athiya revenue', fmtINR(pricingVanilla.athiyaAmountINR), fmtUSD(pricingVanilla.athiyaAmountINR), fmtINR(pricingPremium.athiyaAmountINR), fmtUSD(pricingPremium.athiyaAmountINR)],
        ];

        if (pricingVanilla.yearData && pricingVanilla.yearData.length > 0) {
            pricingVanilla.yearData.forEach(function (d) {
                const yearLabel = d.months < 12 ? 'Y' + d.year + ' (' + d.months + ' mo)' : 'Y' + d.year;
                rows.push([yearLabel + ' (Rev ' + fmtINR(d.rev) + ', Athiya ' + Math.round(d.pct) + '%)', 'Spark ' + fmtINR(d.spark) + ' / Athiya ' + fmtINR(d.athiya), '', '', '']);
            });
        }

        rows.push(
            ['', '', '', '', ''],
            ['COST BREAKDOWN (total over contract term, after multiplier)', 'Vanilla INR', 'Vanilla USD', 'Premium INR', 'Premium USD'],
            ['AssemblyAI', fmtINR(costsVanilla.assemblyAI), fmtUSD(costsVanilla.assemblyAI), fmtINR(costsPremium.assemblyAI), fmtUSD(costsPremium.assemblyAI)],
            ['AWS S3 storage (V: ' + Math.round(costsVanilla.storageGB) + ' / P: ' + Math.round(costsPremium.storageGB) + ' GB)', fmtINR(costsVanilla.s3Storage), fmtUSD(costsVanilla.s3Storage), fmtINR(costsPremium.s3Storage), fmtUSD(costsPremium.s3Storage)],
            ['AWS S3 streaming', fmtINR(costsVanilla.s3Streaming), fmtUSD(costsVanilla.s3Streaming), fmtINR(costsPremium.s3Streaming), fmtUSD(costsPremium.s3Streaming)],
            ['AWS Batch', fmtINR(costsVanilla.batch), fmtUSD(costsVanilla.batch), fmtINR(costsPremium.batch), fmtUSD(costsPremium.batch)],
            ['Gemini API (pipeline + tutor + quiz)', fmtINR(costsVanilla.gemini), fmtUSD(costsVanilla.gemini), fmtINR(costsPremium.gemini), fmtUSD(costsPremium.gemini)],
            ['OpenAI API (embeddings)', fmtINR(costsVanilla.openAI), fmtUSD(costsVanilla.openAI), fmtINR(costsPremium.openAI), fmtUSD(costsPremium.openAI)],
            ['Total cost', fmtINR(costsVanilla.total), fmtUSD(costsVanilla.total), fmtINR(costsPremium.total), fmtUSD(costsPremium.total)]
        );

        if (showSparkInternal) {
            rows.push(
                ['', '', '', '', ''],
                ['SPARK MARGIN (internal)', 'Vanilla INR', 'Vanilla USD', 'Premium INR', 'Premium USD'],
                ['Spark net margin', fmtINR(pricingVanilla.sparkNetINR), fmtUSD(pricingVanilla.sparkNetINR), fmtINR(pricingPremium.sparkNetINR), fmtUSD(pricingPremium.sparkNetINR)],
                ['Margin %', fmtPct(pricingVanilla.marginPct), '', fmtPct(pricingPremium.marginPct), '']
            );
        }

        const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spark-enterprise-pricing-' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        console.log(LOG, 'CSV exported');
    }

    // ─────────────────────────────────────────────
    // Main recalculate
    // ─────────────────────────────────────────────

    function updateTutorFieldVisibility() {
        const tutorInVanilla = document.querySelector('.ec-tier-btn--active[data-tutor-vanilla]')?.getAttribute('data-tutor-vanilla') === 'yes';
        const vanillaEl = document.getElementById('ec-tutor-queries-vanilla');
        if (vanillaEl) {
            if (tutorInVanilla) {
                vanillaEl.disabled = false;
            } else {
                vanillaEl.value = '0';
                vanillaEl.disabled = true;
            }
        }
    }

    function recalculate() {
        updateTutorFieldVisibility();

        const validation = validateInputs();

        /* Always compute costs and update detailed breakdown - cost derivation is independent of base-price validation */
        const { inpVanilla, inpPremium } = readInputs();
        const costsVanilla = computeCosts(inpVanilla);
        const costsPremium = computeCosts(inpPremium);

        if (!validation.valid) {
            renderError(validation.errors);
            updateSparkInternalVisibility(hasSparkInternalParam());
            if (hasSparkInternalParam() && costsVanilla.detail) {
                renderDetailedCostBreakdown(inpVanilla, costsVanilla, inpPremium, costsPremium);
            }
            saveToLocalStorage();
            return;
        }

        clearInputInvalidState();
        const pricingVanilla = computePricing(inpVanilla, costsVanilla);
        const pricingPremium = computePricing(inpPremium, costsPremium);
        renderResults(inpVanilla, costsVanilla, pricingVanilla, inpPremium, costsPremium, pricingPremium);
        saveToLocalStorage();
    }

    // ─────────────────────────────────────────────
    // 7. Event wiring
    // ─────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', () => {
        console.log(LOG, 'DOMContentLoaded');

        // Fix it button - event delegation (error list is dynamically built)
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.ec-btn-fix');
            if (!btn) return;
            e.preventDefault();
            const fixId = btn.getAttribute('data-fix-id');
            const fixValue = btn.getAttribute('data-fix-value');
            if (fixId && fixValue) handleFixItClick(fixId, fixValue);
        });

        // Restore from localStorage or apply defaults
        const saved = loadFromLocalStorage();
        if (saved) {
            applyImportedValues(saved);
            console.log(LOG, 'restored from localStorage');
        } else {
            applyImportedValues(DEFAULTS);
        }

        // AI Tutor in Vanilla toggle: only auto-set tutor queries to 0 when user selects No
        document.querySelectorAll('.ec-tier-btn[data-tutor-vanilla]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ec-tier-btn[data-tutor-vanilla]').forEach(b => b.classList.remove('ec-tier-btn--active'));
                btn.classList.add('ec-tier-btn--active');
                if (btn.getAttribute('data-tutor-vanilla') === 'no') {
                    const vanillaEl = document.getElementById('ec-tutor-queries-vanilla');
                    if (vanillaEl) {
                        vanillaEl.value = '0';
                        vanillaEl.disabled = true;
                    }
                } else {
                    const vanillaEl = document.getElementById('ec-tutor-queries-vanilla');
                    if (vanillaEl) vanillaEl.disabled = false;
                }
                recalculate();
            });
        });

        // Term chips
        document.querySelectorAll('.ec-chip[data-term]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ec-chip[data-term]').forEach(b => b.classList.remove('ec-chip--active'));
                btn.classList.add('ec-chip--active');
                recalculate();
            });
        });

        // All number inputs
        document.querySelectorAll('input[type="number"]').forEach(el => {
            el.addEventListener('input', recalculate);
            el.addEventListener('change', recalculate);
        });

        // Export / Import
        const btnExportJSON = document.getElementById('ec-btn-export-json');
        if (btnExportJSON) btnExportJSON.addEventListener('click', exportJSON);

        const btnExportCSV = document.getElementById('ec-btn-export-csv');
        if (btnExportCSV) btnExportCSV.addEventListener('click', exportCSV);

        // Per-section reset
        const btnResetDeal = document.getElementById('ec-btn-reset-deal');
        if (btnResetDeal) btnResetDeal.addEventListener('click', () => resetBySection('deal'));
        const btnResetRevenueShare = document.getElementById('ec-btn-reset-revenue-share');
        if (btnResetRevenueShare) btnResetRevenueShare.addEventListener('click', () => resetBySection('revenue-share'));
        const btnResetUsage = document.getElementById('ec-btn-reset-usage');
        if (btnResetUsage) btnResetUsage.addEventListener('click', () => resetBySection('usage'));
        const btnResetPricing = document.getElementById('ec-btn-reset-pricing');
        if (btnResetPricing) btnResetPricing.addEventListener('click', () => resetBySection('pricing'));
        const btnResetTechnical = document.getElementById('ec-btn-reset-technical');
        if (btnResetTechnical) btnResetTechnical.addEventListener('click', () => resetBySection('technical'));
        const btnResetCosts = document.getElementById('ec-btn-reset-costs');
        if (btnResetCosts) btnResetCosts.addEventListener('click', () => resetBySection('costs'));

        const btnResetAll = document.getElementById('ec-btn-reset-all');
        const resetModal = document.getElementById('ec-reset-modal');
        const resetModalCancel = document.getElementById('ec-reset-modal-cancel');
        const resetModalConfirm = document.getElementById('ec-reset-modal-confirm');
        const resetModalBackdrop = document.getElementById('ec-reset-modal-backdrop');

        function closeResetModal() {
            if (resetModal) resetModal.classList.add('hidden');
        }
        function openResetModal() {
            if (resetModal) resetModal.classList.remove('hidden');
        }

        if (btnResetAll) btnResetAll.addEventListener('click', openResetModal);
        if (resetModalCancel) resetModalCancel.addEventListener('click', closeResetModal);
        if (resetModalBackdrop) resetModalBackdrop.addEventListener('click', closeResetModal);
        if (resetModalConfirm) resetModalConfirm.addEventListener('click', function () {
            resetToDefaults();
            closeResetModal();
        });

        // Collapsible: all sections (entire header is clickable except Reset)
        function setupCollapsible(btnId, bodyId) {
            const btn = document.getElementById(btnId);
            const body = document.getElementById(bodyId);
            const header = btn ? btn.closest('.ec-card-header--collapsible') : null;
            if (!btn || !body || !header) return;
            header.addEventListener('click', (e) => {
                if (e.target.closest('.ec-btn-reset-section')) return;
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                body.classList.toggle('ec-accordion--collapsed', expanded);
                body.setAttribute('aria-hidden', String(expanded));
                btn.setAttribute('aria-expanded', String(!expanded));
                saveSectionState();
            });
        }
        setupCollapsible('ec-btn-expand-deal', 'ec-deal-body');
        setupCollapsible('ec-btn-expand-revenue-share', 'ec-revenue-share-body');
        setupCollapsible('ec-btn-expand-usage', 'ec-usage-body');
        setupCollapsible('ec-btn-expand-pricing', 'ec-pricing-body');
        setupCollapsible('ec-btn-expand-technical', 'ec-technical-body');
        setupCollapsible('ec-btn-expand-costs', 'ec-costs-body');
        setupCollapsible('ec-btn-expand-detailed-breakdown', 'ec-detailed-breakdown-body');

        loadSectionState();

        const linkDetailed = document.getElementById('ec-link-detailed-breakdown');
        const sectionDetailed = document.getElementById('ec-detailed-cost-breakdown');
        const btnExpandDetailed = document.getElementById('ec-btn-expand-detailed-breakdown');
        const bodyDetailed = document.getElementById('ec-detailed-breakdown-body');
        if (linkDetailed && sectionDetailed && btnExpandDetailed && bodyDetailed) {
            linkDetailed.addEventListener('click', function (e) {
                e.preventDefault();
                sectionDetailed.scrollIntoView({ behavior: 'smooth', block: 'start' });
                const expanded = btnExpandDetailed.getAttribute('aria-expanded') === 'true';
                if (!expanded) {
                    bodyDetailed.classList.remove('ec-accordion--collapsed');
                    bodyDetailed.setAttribute('aria-hidden', 'false');
                    btnExpandDetailed.setAttribute('aria-expanded', 'true');
                    saveSectionState();
                }
            });
        }

        // Expand / collapse results
        const btnExpand   = document.getElementById('ec-btn-expand-results');
        const btnCollapse = document.getElementById('ec-btn-collapse-results');
        const resultsFull = document.getElementById('ec-results-full');
        const expandText  = btnExpand ? btnExpand.querySelector('.ec-btn-expand-text') : null;
        const expandIcon  = btnExpand ? btnExpand.querySelector('.ec-btn-expand-icon') : null;

        function setResultsExpanded(expanded) {
            if (!resultsFull || !btnExpand) return;
            resultsFull.classList.toggle('ec-results-full--collapsed', !expanded);
            resultsFull.setAttribute('aria-hidden', String(!expanded));
            btnExpand.setAttribute('aria-expanded', String(expanded));
            if (expandText) expandText.textContent = expanded ? 'Collapse' : 'Expand';
            if (expandIcon) {
                expandIcon.textContent = expanded ? 'expand_less' : 'expand_more';
            }
            saveSectionState();
        }

        if (btnExpand && resultsFull) {
            btnExpand.addEventListener('click', () => {
                const expanded = btnExpand.getAttribute('aria-expanded') === 'true';
                setResultsExpanded(!expanded);
            });
        }
        if (btnCollapse && resultsFull) {
            btnCollapse.addEventListener('click', () => setResultsExpanded(false));
        }

        // Currency toggle: USD only vs USD + INR
        const wrapper = document.getElementById('ec-results-sticky-wrapper');
        const btnUsdOnly = document.getElementById('ec-btn-usd-only');
        const btnWithInr = document.getElementById('ec-btn-with-inr');
        if (wrapper && btnUsdOnly && btnWithInr) {
            function setCurrencyMode(usdOnly) {
                wrapper.classList.toggle('ec-results-usd-only', usdOnly);
                btnUsdOnly.classList.toggle('ec-currency-toggle-btn--active', usdOnly);
                btnUsdOnly.setAttribute('aria-pressed', usdOnly ? 'true' : 'false');
                btnWithInr.classList.toggle('ec-currency-toggle-btn--active', !usdOnly);
                btnWithInr.setAttribute('aria-pressed', !usdOnly ? 'true' : 'false');
            }
            btnUsdOnly.addEventListener('click', () => setCurrencyMode(true));
            btnWithInr.addEventListener('click', () => setCurrencyMode(false));
        }

        const btnImportJSON = document.getElementById('ec-btn-import-json');
        const importFile    = document.getElementById('ec-import-file');
        if (btnImportJSON && importFile) {
            btnImportJSON.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', () => {
                const file = importFile.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        applyImportedValues(data);
                        console.log(LOG, 'JSON imported');
                    } catch (err) {
                        console.error(LOG, 'JSON import failed', err);
                        alert('Could not parse the JSON file. Please check the file and try again.');
                    }
                };
                reader.readAsText(file);
                importFile.value = '';
            });
        }

        // Initial calculation: validate and compute (do not auto-set base prices - allows validation errors to show)
        recalculate();
    });

})();
