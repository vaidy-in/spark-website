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
        if (Math.abs(n) >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
        if (Math.abs(n) >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
        return '₹' + n.toLocaleString('en-IN');
    }

    function fmtUSD(v) {
        const n = v / num('ec-fx-rate');
        if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
        if (Math.abs(n) >= 1000)    return '$' + (n / 1000).toFixed(1) + 'K';
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

    // ─────────────────────────────────────────────
    // 2. Read inputs
    // ─────────────────────────────────────────────

    function readInputs() {
        const tierEl = document.querySelector('.ec-tier-btn--active');
        const tier = tierEl ? tierEl.getAttribute('data-tier') : 'vanilla';

        const termEl = document.querySelector('.ec-chip--active[data-term]');
        const term = termEl ? parseInt(termEl.getAttribute('data-term'), 10) : 12;

        const revYearEl = document.querySelector('.ec-chip--active[data-revyear]');
        const revYear = revYearEl ? parseInt(revYearEl.getAttribute('data-revyear'), 10) : 1;

        return {
            // Deal
            tier,
            seats:          Math.max(100, num('ec-seats')),
            term,
            revYear,
            setupFeeINR:    num('ec-setup-fee'),
            fxRate:         Math.max(1, num('ec-fx-rate')),

            // Usage
            videoHoursSDPerMonth: num('ec-video-hours-sd'),
            videoHoursHDPerMonth: Math.max(0, num('ec-video-hours-hd')),
            hdSdFactor:         Math.max(1, num('ec-hd-sd-factor')),
            gbPerVideoHr:       Math.max(0, num('ec-gb-per-video-hr')),
            streamingHrsPerSeat: num('ec-streaming-hrs'),
            tutorQueriesPerSeat: num('ec-tutor-queries'),
            numVideosPerMonth:   num('ec-num-videos'),
            quizQuestionsPerVideoPerMonth: num('ec-quiz-queries'),
            batchHrsPerVideoHr:  num('ec-batch-hrs-per-video-hr'),
            tutorTokensIn:       num('ec-tutor-tokens-in'),
            tutorTokensOut:      num('ec-tutor-tokens-out'),
            quizTokensIn:        num('ec-quiz-tokens-in'),
            quizTokensOut:       num('ec-quiz-tokens-out'),
            pipelineTokensIn:    num('ec-pipeline-tokens-in'),
            pipelineTokensOut:   num('ec-pipeline-tokens-out'),

            // Unit costs (INR)
            costAssemblyAI:   num('ec-cost-assemblyai'),
            costS3Storage:    num('ec-cost-s3-storage'),
            costS3Transfer:   num('ec-cost-s3-transfer'),
            costBatch:        num('ec-cost-batch'),
            costGeminiIn:     num('ec-cost-gemini-in'),
            costGeminiOut:    num('ec-cost-gemini-out'),
            embeddingTokensPerVideoHr: num('ec-embedding-tokens'),
            costOpenAIEmbedding: num('ec-cost-openai-embedding'),
            costMultiplier:   Math.max(1, num('ec-cost-multiplier')),

            // Pricing config
            volDisc1:    num('ec-vol-disc-1') / 100,
            volDisc2:    num('ec-vol-disc-2') / 100,
            volDisc3:    num('ec-vol-disc-3') / 100,
            volDisc4:    num('ec-vol-disc-4') / 100,
            termDisc1:   num('ec-term-disc-1') / 100,
            termDisc3:   num('ec-term-disc-3') / 100,
            termDisc6:   num('ec-term-disc-6') / 100,
            termDisc12:  num('ec-term-disc-12') / 100,
            earlyDisc:   num('ec-early-disc') / 100,
            targetMargin: num('ec-target-margin') / 100,
            basePricePerSeatINR: num('ec-base-price-per-seat'),
        };
    }

    // ─────────────────────────────────────────────
    // 3. Compute costs (all in INR)
    // ─────────────────────────────────────────────

    function computeCosts(inp) {
        const termMonths = inp.term;
        const effectiveVideoHoursPerMonth = inp.videoHoursSDPerMonth + inp.videoHoursHDPerMonth * inp.hdSdFactor;
        const totalVideoHours = effectiveVideoHoursPerMonth * termMonths;

        // Processing cost: total over contract (video hours/month × months)
        const assemblyAI = totalVideoHours * inp.costAssemblyAI;
        const batch      = totalVideoHours * inp.batchHrsPerVideoHr * inp.costBatch;

        // Pipeline LLM (Gemini) for notes/chapters/slides - total over contract
        const geminiPipeline = (totalVideoHours * inp.pipelineTokensIn / 1e6) * inp.costGeminiIn
                             + (totalVideoHours * inp.pipelineTokensOut / 1e6) * inp.costGeminiOut;

        // Storage: calculated from video hours × contract × GB per video hour; cost uses triangular sum (storage grows monthly)
        const storageGB = effectiveVideoHoursPerMonth * termMonths * inp.gbPerVideoHr;
        const storageMonthSum = (termMonths * (termMonths + 1)) / 2; // 1+2+...+term
        const s3StorageCost   = effectiveVideoHoursPerMonth * inp.gbPerVideoHr * storageMonthSum * inp.costS3Storage;
        const gbPerHr             = 1; // ~1 GB per SD video hour streamed
        const s3StreamingPerMonth = inp.seats * inp.streamingHrsPerSeat * gbPerHr * inp.costS3Transfer;

        // AI Tutor (Gemini) - only for Premium
        const tutorQueriesTotal = inp.tier === 'premium' ? inp.seats * inp.tutorQueriesPerSeat : 0;
        const geminiTutorPerMonth = (tutorQueriesTotal * inp.tutorTokensIn / 1e6) * inp.costGeminiIn
                                  + (tutorQueriesTotal * inp.tutorTokensOut / 1e6) * inp.costGeminiOut;

        // Quiz generation (Gemini) - both tiers (trainers create quizzes per video, not per seat)
        const quizQueriesTotal   = inp.numVideosPerMonth * inp.quizQuestionsPerVideoPerMonth;
        const geminiQuizPerMonth = (quizQueriesTotal * inp.quizTokensIn / 1e6) * inp.costGeminiIn
                                 + (quizQueriesTotal * inp.quizTokensOut / 1e6) * inp.costGeminiOut;

        // OpenAI embeddings (semantic search) - text-embedding-3-small, input tokens only (per video hour)
        const embeddingTokensPerMonth = inp.embeddingTokensPerVideoHr * effectiveVideoHoursPerMonth;
        const openAIPerMonth = (embeddingTokensPerMonth / 1e6) * inp.costOpenAIEmbedding;

        // Total over contract term
        const rawCosts = {
            assemblyAI:  assemblyAI,
            batch:       batch,
            s3Storage:   s3StorageCost,
            s3Streaming: s3StreamingPerMonth * termMonths,
            gemini:      geminiPipeline + (geminiTutorPerMonth + geminiQuizPerMonth) * termMonths,
            openAI:      openAIPerMonth * termMonths,
        };

        // Apply multiplier to each category
        const costs = {};
        let total = 0;
        for (const k in rawCosts) {
            costs[k] = rawCosts[k] * inp.costMultiplier;
            total += costs[k];
        }
        costs.total = total;
        costs.storageGB = storageGB; // for display

        console.log(LOG, 'costs (INR)', costs);
        return costs;
    }

    // ─────────────────────────────────────────────
    // 4. Compute pricing
    // ─────────────────────────────────────────────

    const REV_SHARE = { 1: 0.30, 2: 0.20, 3: 0.10, 4: 0.05, 5: 0.05 };

    function getVolumeDiscount(inp) {
        const s = inp.seats;
        if (s >= 1000) return inp.volDisc4;
        if (s >= 500)  return inp.volDisc3;
        if (s >= 250)  return inp.volDisc2;
        return inp.volDisc1;
    }

    function getTermDiscount(inp) {
        if (inp.term >= 12) return inp.termDisc12;
        if (inp.term >= 6) return inp.termDisc6;
        if (inp.term >= 3) return inp.termDisc3;
        return inp.termDisc1;
    }

    function computePricing(inp, costs) {
        const termMonths = inp.term;

        // Cost per seat per month (INR)
        const costPerSeatPerMonth = costs.total / (inp.seats * termMonths);

        // List price: use base price if set, else derive from cost + target margin
        const targetMarginSafe = Math.min(inp.targetMargin, 0.99);
        const listPricePerSeatPerMonth = inp.basePricePerSeatINR > 0
            ? inp.basePricePerSeatINR
            : costPerSeatPerMonth / (1 - targetMarginSafe);

        // Discounts
        const volDisc  = getVolumeDiscount(inp);
        const termDisc = getTermDiscount(inp);
        const earlyDisc = inp.earlyDisc;
        // Compound discounts: apply sequentially
        const combinedDiscountFactor = (1 - volDisc) * (1 - termDisc) * (1 - earlyDisc);
        const totalDiscountPct = 1 - combinedDiscountFactor;

        const netPricePerSeatPerMonth = listPricePerSeatPerMonth * combinedDiscountFactor;

        // ACV = net price × seats × 12
        const acvINR = netPricePerSeatPerMonth * inp.seats * 12;

        const setupFeeINR = inp.setupFeeINR;

        // TCV = net price × seats × term + setup fee
        const tcvINR = netPricePerSeatPerMonth * inp.seats * termMonths + setupFeeINR;

        // Revenue (for margin calc) = TCV excluding setup fee
        const revenueINR = netPricePerSeatPerMonth * inp.seats * termMonths;

        // Athiya share
        const athiyaShareRate = REV_SHARE[inp.revYear] || 0.30;
        const athiyaAmountINR = revenueINR * athiyaShareRate;
        const sparkGrossINR   = revenueINR - athiyaAmountINR;

        // Net margin
        const sparkNetINR = sparkGrossINR - costs.total;
        const marginPct   = revenueINR > 0 ? (sparkNetINR / revenueINR) * 100 : 0;

        // Athiya Y1/Y2/Y3 on annual revenue
        const annualRevINR = acvINR;
        const athiyaY1 = annualRevINR * REV_SHARE[1];
        const athiyaY2 = annualRevINR * REV_SHARE[2];
        const athiyaY3 = annualRevINR * REV_SHARE[3];

        const result = {
            listPricePerSeatPerMonth,
            netPricePerSeatPerMonth,
            totalDiscountPct,
            volDisc, termDisc, earlyDisc,
            acvINR,
            setupFeeINR,
            tcvINR,
            revenueINR,
            athiyaShareRate,
            athiyaAmountINR,
            sparkGrossINR,
            sparkNetINR,
            marginPct,
            athiyaY1, athiyaY2, athiyaY3,
            costPerSeatPerMonth,
        };

        console.log(LOG, 'pricing (INR)', result);
        return result;
    }

    // ─────────────────────────────────────────────
    // 5. Render results
    // ─────────────────────────────────────────────

    function renderResults(inp, costs, pricing) {
        // Tier badge
        const badge = document.getElementById('ec-results-tier-badge');
        if (badge) {
            badge.textContent = inp.tier === 'premium' ? 'Premium' : 'Vanilla';
            badge.classList.toggle('ec-tier-badge--vanilla', inp.tier === 'vanilla');
            badge.classList.toggle('ec-tier-badge--premium', inp.tier === 'premium');
        }

        // Pricing rows
        const listMo = pricing.listPricePerSeatPerMonth;
        setDual('ec-out-list-seat-mo', listMo);
        setDual('ec-out-list-seat-yr', listMo * 12);

        set('ec-out-discounts-pct', pricing.totalDiscountPct > 0
            ? '-' + fmtPct(pricing.totalDiscountPct * 100)
            : '0%');

        // Discount breakdown
        const breakdownEl = document.getElementById('ec-discount-breakdown');
        if (breakdownEl) {
            const parts = [];
            if (pricing.volDisc > 0)  parts.push('Volume: -' + fmtPct(pricing.volDisc * 100));
            if (pricing.termDisc > 0) parts.push('Term: -' + fmtPct(pricing.termDisc * 100));
            if (pricing.earlyDisc > 0) parts.push('Early: -' + fmtPct(pricing.earlyDisc * 100));
            if (parts.length > 0) {
                breakdownEl.textContent = parts.join(' · ');
                breakdownEl.classList.remove('hidden');
            } else {
                breakdownEl.classList.add('hidden');
            }
        }

        setDual('ec-out-net-seat-mo', pricing.netPricePerSeatPerMonth);

        // Summary (sticky)
        setDual('ec-summary-net', pricing.netPricePerSeatPerMonth);
        setDual('ec-summary-tcv', pricing.tcvINR);
        set('ec-summary-margin-pct', fmtPct(pricing.marginPct));
        setDual('ec-summary-spark-net', pricing.sparkNetINR);

        // Contract value
        setDual('ec-out-acv', pricing.acvINR);
        setDual('ec-out-setup', pricing.setupFeeINR);
        set('ec-out-tcv-term', String(inp.term));
        setDual('ec-out-tcv', pricing.tcvINR);

        // Cost breakdown
        setDual('ec-cost-out-assemblyai', costs.assemblyAI);
        set('ec-storage-calculated', Math.round(costs.storageGB) + ' GB');
        set('ec-cost-out-storage-gb', Math.round(costs.storageGB));
        setDual('ec-cost-out-s3-storage', costs.s3Storage);
        setDual('ec-cost-out-s3-streaming', costs.s3Streaming);
        setDual('ec-cost-out-batch', costs.batch);
        setDual('ec-cost-out-gemini', costs.gemini);
        setDual('ec-cost-out-openai', costs.openAI);
        setDual('ec-cost-out-total', costs.total);

        // Margin
        setDual('ec-margin-out-revenue', pricing.revenueINR);

        const athiyaLabel = document.getElementById('ec-margin-athiya-label');
        if (athiyaLabel) {
            athiyaLabel.textContent = 'Athiya share (Y' + inp.revYear + ' · ' + Math.round(pricing.athiyaShareRate * 100) + '%)';
        }
        setDual('ec-margin-out-athiya', pricing.athiyaAmountINR);
        setDual('ec-margin-out-spark-gross', pricing.sparkGrossINR);
        setDual('ec-margin-out-cost', costs.total);
        setDual('ec-margin-out-net', pricing.sparkNetINR);
        set('ec-margin-out-pct', fmtPct(pricing.marginPct));

        // Margin health indicator
        const healthEl = document.getElementById('ec-margin-health');
        if (healthEl) {
            const targetPct = inp.targetMargin * 100;
            const actualPct = pricing.marginPct;
            const diff = actualPct - targetPct;
            healthEl.classList.remove('ec-margin-health--good', 'ec-margin-health--warn', 'ec-margin-health--bad');
            if (actualPct >= targetPct) {
                healthEl.classList.add('ec-margin-health--good');
                healthEl.textContent = '✓ Margin target met (' + fmtPct(actualPct) + ' vs target ' + fmtPct(targetPct) + ')';
            } else if (diff >= -10) {
                healthEl.classList.add('ec-margin-health--warn');
                healthEl.textContent = '⚠ Below target by ' + fmtPct(Math.abs(diff)) + ' (' + fmtPct(actualPct) + ' vs target ' + fmtPct(targetPct) + ')';
            } else {
                healthEl.classList.add('ec-margin-health--bad');
                healthEl.textContent = '✗ Significantly below target (' + fmtPct(actualPct) + ' vs target ' + fmtPct(targetPct) + ')';
            }
        }

        // Athiya Y1/Y2/Y3
        setDual('ec-athiya-y1', pricing.athiyaY1);
        setDual('ec-athiya-y2', pricing.athiyaY2);
        setDual('ec-athiya-y3', pricing.athiyaY3);

        console.log(LOG, 'render complete');
    }

    // ─────────────────────────────────────────────
    // 6. Export / Import / localStorage
    // ─────────────────────────────────────────────

    const STORAGE_KEY = 'spark-enterprise-pricing';

    const DEFAULTS = {
        'ec-fx-rate': '84',
        'ec-seats': '500',
        'ec-setup-fee': '0',
        'ec-base-price-per-seat': '0',
        'ec-video-hours-sd': '40',
        'ec-video-hours-hd': '0',
        'ec-hd-sd-factor': '5',
        'ec-gb-per-video-hr': '0.75',
        'ec-streaming-hrs': '2',
        'ec-num-videos': '40',
        'ec-tutor-queries': '20',
        'ec-quiz-queries': '5',
        'ec-embedding-tokens': '25000',
        'ec-batch-hrs-per-video-hr': '0.5',
        'ec-tutor-tokens-in': '2000',
        'ec-tutor-tokens-out': '500',
        'ec-quiz-tokens-in': '5000',
        'ec-quiz-tokens-out': '2000',
        'ec-pipeline-tokens-in': '500000',
        'ec-pipeline-tokens-out': '200000',
        'ec-cost-assemblyai': '55',
        'ec-cost-s3-storage': '1.93',
        'ec-cost-s3-transfer': '7.56',
        'ec-cost-batch': '4.03',
        'ec-cost-gemini-in': '6.30',
        'ec-cost-gemini-out': '25.20',
        'ec-cost-openai-embedding': '1.68',
        'ec-cost-multiplier': '1.3',
        'ec-vol-disc-1': '0',
        'ec-vol-disc-2': '5',
        'ec-vol-disc-3': '10',
        'ec-vol-disc-4': '15',
        'ec-term-disc-1': '0',
        'ec-term-disc-3': '2',
        'ec-term-disc-6': '5',
        'ec-term-disc-12': '10',
        'ec-early-disc': '0',
        'ec-target-margin': '60',
        _tier: 'vanilla',
        _term: '12',
        _revYear: '1'
    };

    const DEFAULTS_DEAL = {
        'ec-seats': '500', 'ec-setup-fee': '0',
        _tier: 'vanilla', _term: '12', _revYear: '1'
    };
    const DEFAULTS_USAGE = {
        'ec-video-hours-sd': '40', 'ec-video-hours-hd': '0',
        'ec-streaming-hrs': '2', 'ec-tutor-queries': '20',
        'ec-num-videos': '40', 'ec-quiz-queries': '5'
    };
    const DEFAULTS_PRICING = {
        'ec-base-price-per-seat': '0',
        'ec-vol-disc-1': '0', 'ec-vol-disc-2': '5', 'ec-vol-disc-3': '10', 'ec-vol-disc-4': '15',
        'ec-term-disc-1': '0', 'ec-term-disc-3': '2', 'ec-term-disc-6': '5', 'ec-term-disc-12': '10',
        'ec-early-disc': '0', 'ec-target-margin': '60'
    };
    const DEFAULTS_TECHNICAL = {
        'ec-hd-sd-factor': '5', 'ec-gb-per-video-hr': '0.75',
        'ec-embedding-tokens': '25000', 'ec-batch-hrs-per-video-hr': '0.5',
        'ec-tutor-tokens-in': '2000', 'ec-tutor-tokens-out': '500',
        'ec-quiz-tokens-in': '5000', 'ec-quiz-tokens-out': '2000',
        'ec-pipeline-tokens-in': '500000', 'ec-pipeline-tokens-out': '200000'
    };
    const DEFAULTS_COSTS = {
        'ec-cost-assemblyai': '55', 'ec-cost-s3-storage': '1.93', 'ec-cost-s3-transfer': '7.56',
        'ec-cost-batch': '4.03', 'ec-cost-gemini-in': '6.30', 'ec-cost-gemini-out': '25.20',
        'ec-cost-openai-embedding': '1.68', 'ec-cost-multiplier': '1.3'
    };

    function resetToDefaults() {
        applyImportedValues(DEFAULTS);
        console.log(LOG, 'reset to defaults');
    }

    function resetBySection(section) {
        const data = Object.assign({}, DEFAULTS);
        const sectionDefaults = {
            deal: DEFAULTS_DEAL,
            usage: DEFAULTS_USAGE,
            pricing: DEFAULTS_PRICING,
            technical: DEFAULTS_TECHNICAL,
            costs: DEFAULTS_COSTS
        }[section];
        if (!sectionDefaults) return;
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

    function gatherAllInputValues() {
        const ids = [
            'ec-fx-rate', 'ec-seats', 'ec-setup-fee', 'ec-base-price-per-seat',
            'ec-video-hours-sd', 'ec-video-hours-hd', 'ec-hd-sd-factor', 'ec-gb-per-video-hr',
            'ec-streaming-hrs', 'ec-num-videos', 'ec-tutor-queries', 'ec-quiz-queries',
            'ec-batch-hrs-per-video-hr',
            'ec-tutor-tokens-in', 'ec-tutor-tokens-out',
            'ec-quiz-tokens-in', 'ec-quiz-tokens-out',
            'ec-pipeline-tokens-in', 'ec-pipeline-tokens-out',
            'ec-cost-assemblyai', 'ec-cost-s3-storage', 'ec-cost-s3-transfer',
            'ec-cost-batch', 'ec-cost-gemini-in', 'ec-cost-gemini-out',
            'ec-embedding-tokens', 'ec-cost-openai-embedding', 'ec-cost-multiplier',
            'ec-vol-disc-1', 'ec-vol-disc-2', 'ec-vol-disc-3', 'ec-vol-disc-4',
            'ec-term-disc-1', 'ec-term-disc-3', 'ec-term-disc-6', 'ec-term-disc-12',
            'ec-early-disc', 'ec-target-margin',
        ];
        const data = { _version: 1, _ts: new Date().toISOString() };
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) data[id] = el.value;
        });
        // Capture toggle state
        const tierEl = document.querySelector('.ec-tier-btn--active');
        data['_tier'] = tierEl ? tierEl.getAttribute('data-tier') : 'vanilla';
        const termEl = document.querySelector('.ec-chip--active[data-term]');
        data['_term'] = termEl ? termEl.getAttribute('data-term') : '12';
        const revYearEl = document.querySelector('.ec-chip--active[data-revyear]');
        data['_revYear'] = revYearEl ? revYearEl.getAttribute('data-revyear') : '1';
        return data;
    }

    function applyImportedValues(data) {
        // Backward compat: map old OpenAI input cost to embedding cost
        if (data['ec-cost-openai-in'] && !data['ec-cost-openai-embedding']) {
            data['ec-cost-openai-embedding'] = data['ec-cost-openai-in'];
        }
        for (const key in data) {
            if (key.startsWith('_')) continue;
            const el = document.getElementById(key);
            if (el) el.value = data[key];
        }
        // Restore tier
        if (data['_tier']) {
            document.querySelectorAll('.ec-tier-btn').forEach(btn => {
                const active = btn.getAttribute('data-tier') === data['_tier'];
                btn.classList.toggle('ec-tier-btn--active', active);
            });
        }
        // Restore term (map legacy 24/36 to 12 for backward compatibility)
        if (data['_term']) {
            const termVal = ['24', '36'].includes(data['_term']) ? '12' : data['_term'];
            document.querySelectorAll('.ec-chip[data-term]').forEach(btn => {
                const active = btn.getAttribute('data-term') === termVal;
                btn.classList.toggle('ec-chip--active', active);
            });
        }
        // Restore revYear
        if (data['_revYear']) {
            document.querySelectorAll('.ec-chip[data-revyear]').forEach(btn => {
                const active = btn.getAttribute('data-revyear') === data['_revYear'];
                btn.classList.toggle('ec-chip--active', active);
            });
        }
        recalculate();
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
        const inp = readInputs();
        const costs = computeCosts(inp);
        const pricing = computePricing(inp, costs);
        const fx = inp.fxRate;

        const rows = [
            ['Spark Enterprise Pricing Calculator', '', ''],
            ['Generated', new Date().toISOString(), ''],
            ['', '', ''],
            ['DEAL PARAMETERS', '', ''],
            ['Tier', inp.tier, ''],
            ['Seats', inp.seats, ''],
            ['Contract term (months)', inp.term, ''],
            ['Athiya rev-share year', 'Y' + inp.revYear, ''],
            ['Setup fee (INR)', inp.setupFeeINR, ''],
            ['FX rate (INR/USD)', fx, ''],
            ['', '', ''],
            ['PRICING', 'INR', 'USD'],
            ['List price / seat / month', fmtINR(pricing.listPricePerSeatPerMonth), fmtUSD(pricing.listPricePerSeatPerMonth)],
            ['List price / seat / year', fmtINR(pricing.listPricePerSeatPerMonth * 12), fmtUSD(pricing.listPricePerSeatPerMonth * 12)],
            ['Total discount %', fmtPct(pricing.totalDiscountPct * 100), ''],
            ['Net price / seat / month', fmtINR(pricing.netPricePerSeatPerMonth), fmtUSD(pricing.netPricePerSeatPerMonth)],
            ['ACV (annual contract value)', fmtINR(pricing.acvINR), fmtUSD(pricing.acvINR)],
            ['Setup fee', fmtINR(pricing.setupFeeINR), fmtUSD(pricing.setupFeeINR)],
            ['TCV (' + inp.term + ' months + setup)', fmtINR(pricing.tcvINR), fmtUSD(pricing.tcvINR)],
            ['', '', ''],
            ['COST BREAKDOWN (total over contract term, after multiplier)', 'INR', 'USD'],
            ['AssemblyAI', fmtINR(costs.assemblyAI), fmtUSD(costs.assemblyAI)],
            ['AWS S3 storage (' + Math.round(costs.storageGB) + ' GB)', fmtINR(costs.s3Storage), fmtUSD(costs.s3Storage)],
            ['AWS S3 streaming', fmtINR(costs.s3Streaming), fmtUSD(costs.s3Streaming)],
            ['AWS Batch', fmtINR(costs.batch), fmtUSD(costs.batch)],
            ['Gemini API (pipeline + tutor + quiz)', fmtINR(costs.gemini), fmtUSD(costs.gemini)],
            ['OpenAI API (embeddings)', fmtINR(costs.openAI), fmtUSD(costs.openAI)],
            ['Total cost', fmtINR(costs.total), fmtUSD(costs.total)],
            ['', '', ''],
            ['MARGIN & REVENUE SHARE', 'INR', 'USD'],
            ['Total revenue (TCV excl. setup)', fmtINR(pricing.revenueINR), fmtUSD(pricing.revenueINR)],
            ['Athiya share (Y' + inp.revYear + ' · ' + Math.round(pricing.athiyaShareRate * 100) + '%)', fmtINR(pricing.athiyaAmountINR), fmtUSD(pricing.athiyaAmountINR)],
            ['Spark gross revenue (after Athiya)', fmtINR(pricing.sparkGrossINR), fmtUSD(pricing.sparkGrossINR)],
            ['Total cost', fmtINR(costs.total), fmtUSD(costs.total)],
            ['Spark net margin', fmtINR(pricing.sparkNetINR), fmtUSD(pricing.sparkNetINR)],
            ['Margin %', fmtPct(pricing.marginPct), ''],
            ['', '', ''],
            ['ATHIYA SHARE BY YEAR (based on ACV)', 'INR', 'USD'],
            ['Y1 (30%)', fmtINR(pricing.athiyaY1), fmtUSD(pricing.athiyaY1)],
            ['Y2 (20%)', fmtINR(pricing.athiyaY2), fmtUSD(pricing.athiyaY2)],
            ['Y3 (10%)', fmtINR(pricing.athiyaY3), fmtUSD(pricing.athiyaY3)],
        ];

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

    function recalculate() {
        const inp = readInputs();
        const costs = computeCosts(inp);
        const pricing = computePricing(inp, costs);
        renderResults(inp, costs, pricing);
        saveToLocalStorage();
    }

    // ─────────────────────────────────────────────
    // 7. Event wiring
    // ─────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', () => {
        console.log(LOG, 'DOMContentLoaded');

        // Restore from localStorage
        const saved = loadFromLocalStorage();
        if (saved) {
            applyImportedValues(saved);
            console.log(LOG, 'restored from localStorage');
        }

        // Tier toggle
        document.querySelectorAll('.ec-tier-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ec-tier-btn').forEach(b => b.classList.remove('ec-tier-btn--active'));
                btn.classList.add('ec-tier-btn--active');
                // Tutor queries: default 0 for Vanilla, 20 for Premium
                const tutorEl = document.getElementById('ec-tutor-queries');
                if (tutorEl && tutorEl.value === '0' && btn.getAttribute('data-tier') === 'premium') {
                    tutorEl.value = '20';
                }
                if (tutorEl && btn.getAttribute('data-tier') === 'vanilla') {
                    tutorEl.value = '0';
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

        // Rev-year chips
        document.querySelectorAll('.ec-chip[data-revyear]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ec-chip[data-revyear]').forEach(b => b.classList.remove('ec-chip--active'));
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
        const btnResetUsage = document.getElementById('ec-btn-reset-usage');
        if (btnResetUsage) btnResetUsage.addEventListener('click', () => resetBySection('usage'));
        const btnResetPricing = document.getElementById('ec-btn-reset-pricing');
        if (btnResetPricing) btnResetPricing.addEventListener('click', () => resetBySection('pricing'));
        const btnResetTechnical = document.getElementById('ec-btn-reset-technical');
        if (btnResetTechnical) btnResetTechnical.addEventListener('click', () => resetBySection('technical'));
        const btnResetCosts = document.getElementById('ec-btn-reset-costs');
        if (btnResetCosts) btnResetCosts.addEventListener('click', () => resetBySection('costs'));

        // Collapsible: all sections (entire header is clickable except Reset)
        function setupCollapsible(btnId, bodyId) {
            const btn = document.getElementById(btnId);
            const body = document.getElementById(bodyId);
            const header = btn ? btn.closest('.ec-card-header--collapsible') : null;
            if (!btn || !body || !header) return;
            header.addEventListener('click', (e) => {
                if (e.target.closest('.ec-btn-reset-section')) return;
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                body.classList.toggle('hidden', expanded);
                body.setAttribute('aria-hidden', String(expanded));
                btn.setAttribute('aria-expanded', String(!expanded));
            });
        }
        setupCollapsible('ec-btn-expand-deal', 'ec-deal-body');
        setupCollapsible('ec-btn-expand-usage', 'ec-usage-body');
        setupCollapsible('ec-btn-expand-pricing', 'ec-pricing-body');
        setupCollapsible('ec-btn-expand-technical', 'ec-technical-body');
        setupCollapsible('ec-btn-expand-costs', 'ec-costs-body');

        // Expand / collapse results
        const btnExpand   = document.getElementById('ec-btn-expand-results');
        const btnCollapse = document.getElementById('ec-btn-collapse-results');
        const resultsFull = document.getElementById('ec-results-full');
        const expandText  = btnExpand ? btnExpand.querySelector('.ec-btn-expand-text') : null;
        const expandIcon  = btnExpand ? btnExpand.querySelector('.ec-btn-expand-icon') : null;

        function setResultsExpanded(expanded) {
            if (!resultsFull || !btnExpand) return;
            resultsFull.classList.toggle('hidden', !expanded);
            resultsFull.setAttribute('aria-hidden', String(!expanded));
            btnExpand.setAttribute('aria-expanded', String(expanded));
            if (expandText) expandText.textContent = expanded ? 'Collapse' : 'Expand';
            if (expandIcon) {
                expandIcon.textContent = expanded ? 'expand_less' : 'expand_more';
            }
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

        // Initial calculation
        recalculate();
    });

})();
