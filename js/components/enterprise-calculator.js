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
    window.APP_VERSION = '1.0.11';

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
        if (Math.abs(n) >= 1000)    return '$' + (n / 1000).toFixed(2) + 'K';
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
        { id: 'ec-video-hours-sd', label: 'SD video hours / month', min: 0 },
        { id: 'ec-video-hours-hd', label: 'HD video hours / month', min: 0 },
        { id: 'ec-streaming-hrs', label: 'Avg streaming per seat / month', min: 0 },
        { id: 'ec-tutor-queries', label: 'AI Tutor queries / seat / month', min: 0 },
        { id: 'ec-num-videos', label: 'Number of videos per month', min: 0 },
        { id: 'ec-quiz-queries', label: 'Quiz questions per video / month', min: 0 },
        { id: 'ec-min-margin', label: 'Min. cost markup for Spark', min: 0 },
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
        const inp = readInputs();
        const costsVanilla = computeCosts(Object.assign({}, inp, { tier: 'vanilla' }));
        const volDisc = getVolumeDiscount(inp);
        const termDisc = getTermDiscount(inp);
        const combinedDiscountFactor = getCombinedDiscountFactor(volDisc, termDisc, inp.earlyDisc);
        
        let effectiveAthiyaRate = 0;
        let remainingMonths = inp.term;
        let currentYear = 1;
        while (remainingMonths > 0 && currentYear <= 5) {
            const monthsInThisYear = Math.min(12, remainingMonths);
            const shareRate = inp.revShare[currentYear] || 0;
            // weight by the fraction of the total term
            effectiveAthiyaRate += shareRate * (monthsInThisYear / inp.term);
            remainingMonths -= monthsInThisYear;
            currentYear++;
        }

        if (effectiveAthiyaRate >= 0.999) {
            errs.push({ id: 'ec-rev-share-y1', label: 'Revenue share', message: 'Athiya share cannot be 100% - minimum margin cannot be achieved' });
            return errs;
        }

        // Markup-on-cost: sparkNet >= costs × minMarginPct
        // sparkNet = revenue × (1 - effectiveAthiyaRate) + setupFee - costs
        // → minRevenue = (costs × (1 + minMarginPct) - setupFee) / (1 - effectiveAthiyaRate)
        const athiyaDenom = 1 - effectiveAthiyaRate;
        const minRevenue = athiyaDenom > 0.001
            ? Math.max(0, costsVanilla.total * (1 + inp.minMarginPct) - inp.setupFeeINR) / athiyaDenom
            : 0;
        const minBasePriceVanilla = (inp.seats * inp.term * combinedDiscountFactor) > 0
            ? minRevenue / (inp.seats * inp.term * combinedDiscountFactor)
            : 0;
        const baseVanilla = num('ec-base-price-vanilla');
        const basePremium = num('ec-base-price-premium');

        if (baseVanilla < minBasePriceVanilla) {
            errs.push({ id: 'ec-base-price-vanilla', label: 'Base price Vanilla', message: 'Base price Vanilla: the min value has to be at least INR ' + Math.round(minBasePriceVanilla).toLocaleString('en-IN') });
        }
        if (basePremium <= baseVanilla && (baseVanilla > 0 || basePremium > 0)) {
            errs.push({ id: 'ec-base-price-premium', label: 'Base price Premium', message: 'Base price Premium must be higher than Vanilla' });
        }
        return errs;
    }

    function updateBasePricesFromMinMargin() {
        const inp = readInputs();
        if (inp.seats < 1 || inp.term < 1) return;

        const costsVanilla = computeCosts(Object.assign({}, inp, { tier: 'vanilla' }));
        const volDisc = getVolumeDiscount(inp);
        const termDisc = getTermDiscount(inp);
        const combinedDiscountFactor = getCombinedDiscountFactor(volDisc, termDisc, inp.earlyDisc);
        
        let effectiveAthiyaRate = 0;
        let remainingMonths = inp.term;
        let currentYear = 1;
        while (remainingMonths > 0 && currentYear <= 5) {
            const monthsInThisYear = Math.min(12, remainingMonths);
            const shareRate = inp.revShare[currentYear] || 0;
            // weight by the fraction of the total term
            effectiveAthiyaRate += shareRate * (monthsInThisYear / inp.term);
            remainingMonths -= monthsInThisYear;
            currentYear++;
        }

        const athiyaDenom = 1 - effectiveAthiyaRate;
        if (athiyaDenom <= 0.001) return;

        const minRevenue = Math.max(0, costsVanilla.total * (1 + inp.minMarginPct) - inp.setupFeeINR) / athiyaDenom;
        const minBasePriceVanilla = (inp.seats * inp.term * combinedDiscountFactor) > 0
            ? minRevenue / (inp.seats * inp.term * combinedDiscountFactor)
            : 0;
        const baseVanilla = Math.ceil(minBasePriceVanilla);
        const basePremium = Math.round(baseVanilla * 1.5);

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

    // ─────────────────────────────────────────────
    // 2. Read inputs
    // ─────────────────────────────────────────────

    function readInputs() {
        const tierEl = document.querySelector('.ec-tier-btn--active');
        const tier = tierEl ? tierEl.getAttribute('data-tier') : 'vanilla';

        const termEl = document.querySelector('.ec-chip--active[data-term]');
        const term = termEl ? parseInt(termEl.getAttribute('data-term'), 10) : 12;

        const revShareY1 = num('ec-rev-share-y1') / 100;
        const revShareY2 = num('ec-rev-share-y2') / 100;
        const revShareY3 = num('ec-rev-share-y3') / 100;
        const revShareY4 = num('ec-rev-share-y4') / 100;
        const revShareY5 = num('ec-rev-share-y5') / 100;

        return {
            // Deal
            tier,
            seats:          num('ec-seats'),
            term,
            revShare:       { 1: revShareY1, 2: revShareY2, 3: revShareY3, 4: revShareY4, 5: revShareY5 },
            setupFeeINR:    num('ec-setup-fee'),
            fxRate:         num('ec-fx-rate'),

            // Usage
            tutorInVanilla:     document.querySelector('.ec-tier-btn--active[data-tutor-vanilla]')?.getAttribute('data-tutor-vanilla') === 'yes',
            videoHoursSDPerMonth: num('ec-video-hours-sd'),
            videoHoursHDPerMonth: num('ec-video-hours-hd'),
            hdSdFactor:         num('ec-hd-sd-factor'),
            gbPerVideoHr:       num('ec-gb-per-video-hr'),
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
            costMultiplier:   num('ec-cost-multiplier'),
            minMarginPct:     num('ec-min-margin') / 100,

            // Pricing config
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
            basePricePerSeatINR: tier === 'premium' ? num('ec-base-price-premium') : num('ec-base-price-vanilla'),
        };
    }

    // ─────────────────────────────────────────────
    // 3. Compute costs (all in INR)
    // ─────────────────────────────────────────────

    function computeCosts(inp) {
        const termMonths = inp.term;
        const videoHoursSDPerMonth = inp.videoHoursSDPerMonth;
        const videoHoursHDPerMonth = inp.videoHoursHDPerMonth;
        const effectiveVideoHoursPerMonth = videoHoursSDPerMonth + videoHoursHDPerMonth * inp.hdSdFactor;
        const totalVideoHours = effectiveVideoHoursPerMonth * termMonths;
        const baseVideoHoursPerMonth = videoHoursSDPerMonth + videoHoursHDPerMonth;
        const baseTotalVideoHours = baseVideoHoursPerMonth * termMonths;
        const totalVideoHoursSD = videoHoursSDPerMonth * termMonths;
        const totalVideoHoursHD = videoHoursHDPerMonth * termMonths;

        // Processing cost: total over contract (video hours/month x months)
        // Transcription, notes, embeddings use base hours (HD vs SD makes no difference for audio/transcript length)
        const assemblyAI = baseTotalVideoHours * inp.costAssemblyAI;

        // Batch: SD and HD split (HD uses hdSdFactor for compute hours)
        const batchHrsSD = totalVideoHoursSD * inp.batchHrsPerVideoHr;
        const batchHrsHD = totalVideoHoursHD * inp.hdSdFactor * inp.batchHrsPerVideoHr;
        const batchSD = batchHrsSD * inp.costBatch;
        const batchHD = batchHrsHD * inp.costBatch;
        const batch = batchSD + batchHD;

        // Pipeline LLM (Gemini) for notes/chapters/slides - total over contract (base hours, not HD-multiplied)
        const geminiPipeline = (baseTotalVideoHours * inp.pipelineTokensIn / 1e6) * inp.costGeminiIn
                             + (baseTotalVideoHours * inp.pipelineTokensOut / 1e6) * inp.costGeminiOut;

        // Storage: SD and HD split; triangular sum (storage grows monthly)
        const storageMonthSum = (termMonths * (termMonths + 1)) / 2; // 1+2+...+term
        const monthlyNewGB_SD = videoHoursSDPerMonth * inp.gbPerVideoHr;
        const monthlyNewGB_HD = videoHoursHDPerMonth * inp.gbPerVideoHr * inp.hdSdFactor;
        const storageGB_SD = monthlyNewGB_SD * termMonths;
        const storageGB_HD = monthlyNewGB_HD * termMonths;
        const storageGB = storageGB_SD + storageGB_HD;
        const s3StorageCost_SD = monthlyNewGB_SD * storageMonthSum * inp.costS3Storage;
        const s3StorageCost_HD = monthlyNewGB_HD * storageMonthSum * inp.costS3Storage;
        const s3StorageCost = s3StorageCost_SD + s3StorageCost_HD;

        const gbPerHr = 1; // ~1 GB per SD video hour streamed
        const s3StreamingPerMonth = inp.seats * inp.streamingHrsPerSeat * gbPerHr * inp.costS3Transfer;
        const s3Streaming = s3StreamingPerMonth * termMonths;

        // AI Tutor (Gemini) - Premium always; Vanilla when tutorInVanilla flag is set
        const includeTutor = inp.tier === 'premium' || inp.tutorInVanilla;
        const tutorQueriesTotal = includeTutor ? inp.seats * inp.tutorQueriesPerSeat : 0;
        const geminiTutorPerMonth = (tutorQueriesTotal * inp.tutorTokensIn / 1e6) * inp.costGeminiIn
                                  + (tutorQueriesTotal * inp.tutorTokensOut / 1e6) * inp.costGeminiOut;
        const geminiTutor = geminiTutorPerMonth * termMonths;

        // Quiz generation (Gemini) - both tiers
        const quizQueriesTotal = inp.numVideosPerMonth * inp.quizQuestionsPerVideoPerMonth;
        const geminiQuizPerMonth = (quizQueriesTotal * inp.quizTokensIn / 1e6) * inp.costGeminiIn
                                 + (quizQueriesTotal * inp.quizTokensOut / 1e6) * inp.costGeminiOut;
        const geminiQuiz = geminiQuizPerMonth * termMonths;

        // OpenAI embeddings (per video hour; base hours, not HD-multiplied)
        const embeddingTokensPerMonth = inp.embeddingTokensPerVideoHr * baseVideoHoursPerMonth;
        const openAI = (embeddingTokensPerMonth / 1e6) * inp.costOpenAIEmbedding * termMonths;

        const gemini = geminiPipeline + geminiTutor + geminiQuiz;

        // Total over contract term (pre-multiplier)
        const rawCosts = {
            assemblyAI:  assemblyAI,
            batch:       batch,
            s3Storage:   s3StorageCost,
            s3Streaming: s3Streaming,
            gemini:      gemini,
            openAI:      openAI,
        };

        // Apply multiplier to each category
        const costs = {};
        let total = 0;
        for (const k in rawCosts) {
            costs[k] = rawCosts[k] * inp.costMultiplier;
            total += costs[k];
        }
        costs.total = total;
        costs.storageGB = storageGB;

        // Detail for full breakdown (pre-multiplier values)
        costs.detail = {
            termMonths,
            transcription: { totalVideoHours: baseTotalVideoHours, unitCost: inp.costAssemblyAI, amount: assemblyAI },
            storage: {
                sd: storageGB_SD > 0 ? { storageGB: storageGB_SD, monthlyNewGB: monthlyNewGB_SD, amount: s3StorageCost_SD } : null,
                hd: storageGB_HD > 0 ? { storageGB: storageGB_HD, monthlyNewGB: monthlyNewGB_HD, amount: s3StorageCost_HD } : null,
                storageMonthSum,
                gbPerVideoHr: inp.gbPerVideoHr,
                hdSdFactor: inp.hdSdFactor,
                costPerGB: inp.costS3Storage,
                videoHoursSDPerMonth,
                videoHoursHDPerMonth,
                totalAmount: s3StorageCost,
            },
            batch: {
                sd: batchHrsSD > 0 ? { batchHrs: batchHrsSD, amount: batchSD } : null,
                hd: batchHrsHD > 0 ? { batchHrs: batchHrsHD, amount: batchHD } : null,
                batchHrsPerVideoHr: inp.batchHrsPerVideoHr,
                hdSdFactor: inp.hdSdFactor,
                costPerVcpuHr: inp.costBatch,
                totalVideoHoursSD,
                totalVideoHoursHD,
                totalAmount: batch,
            },
            pipeline: {
                totalVideoHours: baseTotalVideoHours,
                tokensIn: inp.pipelineTokensIn,
                tokensOut: inp.pipelineTokensOut,
                costIn: inp.costGeminiIn,
                costOut: inp.costGeminiOut,
                amount: geminiPipeline,
            },
            quiz: {
                numVideosPerMonth: inp.numVideosPerMonth,
                quizQuestionsPerVideoPerMonth: inp.quizQuestionsPerVideoPerMonth,
                quizQueriesTotalPerMonth: quizQueriesTotal,
                termMonths,
                tokensIn: inp.quizTokensIn,
                tokensOut: inp.quizTokensOut,
                costIn: inp.costGeminiIn,
                costOut: inp.costGeminiOut,
                amount: geminiQuiz,
            },
            tutor: {
                seats: inp.seats,
                queriesPerSeat: inp.tutorQueriesPerSeat,
                tutorQueriesTotalPerMonth: tutorQueriesTotal,
                termMonths,
                tokensIn: inp.tutorTokensIn,
                tokensOut: inp.tutorTokensOut,
                costIn: inp.costGeminiIn,
                costOut: inp.costGeminiOut,
                amount: geminiTutor,
                includeTutor,
            },
            streaming: {
                seats: inp.seats,
                streamingHrsPerSeat: inp.streamingHrsPerSeat,
                gbPerHr,
                costPerGB: inp.costS3Transfer,
                amount: s3Streaming,
            },
            embeddings: {
                baseVideoHoursPerMonth,
                embeddingTokensPerVideoHr: inp.embeddingTokensPerVideoHr,
                embeddingTokensPerMonth,
                termMonths,
                costPer1MTokens: inp.costOpenAIEmbedding,
                amount: openAI,
            },
            costMultiplier: inp.costMultiplier,
            totalPreMultiplier: assemblyAI + s3StorageCost + s3Streaming + batch + gemini + openAI,
        };

        console.log(LOG, 'costs (INR)', costs);
        return costs;
    }

    // ─────────────────────────────────────────────
    // 4. Compute pricing
    // ─────────────────────────────────────────────

    function getVolumeDiscount(inp) {
        const s = inp.seats;
        if (s >= 50000) return inp.volDisc7;
        if (s >= 10000) return inp.volDisc6;
        if (s >= 5000)  return inp.volDisc5;
        if (s >= 1000)  return inp.volDisc4;
        if (s >= 500)   return inp.volDisc3;
        if (s >= 250)   return inp.volDisc2;
        return inp.volDisc1;
    }

    function getTermDiscount(inp) {
        if (inp.term >= 12) return inp.termDisc12;
        if (inp.term >= 6) return inp.termDisc6;
        if (inp.term >= 3) return inp.termDisc3;
        return inp.termDisc1;
    }

    function getCombinedDiscountFactor(volDisc, termDisc, earlyDisc) {
        const totalPct = volDisc + termDisc + earlyDisc;
        return Math.max(0, 1 - totalPct);
    }

    function computePricing(inp, costs) {
        const termMonths = inp.term;

        // Cost per seat per month (INR)
        const costPerSeatPerMonth = costs.total / (inp.seats * termMonths);

        // List price: base price per seat per month
        const listPricePerSeatPerMonth = inp.basePricePerSeatINR;

        // Discounts
        const volDisc  = getVolumeDiscount(inp);
        const termDisc = getTermDiscount(inp);
        const earlyDisc = inp.earlyDisc;
        const combinedDiscountFactor = getCombinedDiscountFactor(volDisc, termDisc, earlyDisc);
        const totalDiscountPct = 1 - combinedDiscountFactor;
        const totalDiscountPctDisplay = volDisc + termDisc + earlyDisc;

        const netPricePerSeatPerMonth = listPricePerSeatPerMonth * combinedDiscountFactor;

        // ACV = net price × seats × 12
        const acvINR = netPricePerSeatPerMonth * inp.seats * 12;

        const setupFeeINR = inp.setupFeeINR;

        // TCV = net price × seats × term + setup fee
        const tcvINR = netPricePerSeatPerMonth * inp.seats * termMonths + setupFeeINR;

        // Revenue (for margin calc) = TCV excluding setup fee
        const revenueINR = netPricePerSeatPerMonth * inp.seats * termMonths;

        // Year-by-year split: annual revenue, Athiya % per year from config
        const yearData = [];
        let athiyaAmountINR = 0;
        let remainingMonths = termMonths;
        let currentYear = 1;

        while (remainingMonths > 0) {
            const monthsInThisYear = Math.min(12, remainingMonths);
            // Revenue for this specific block of months
            const revThisYear = netPricePerSeatPerMonth * inp.seats * monthsInThisYear;
            
            // Apply revenue share for up to 5 years (default to 0 if beyond 5)
            const shareRate = (currentYear <= 5) ? (inp.revShare[currentYear] || 0) : 0;
            
            const athiyaY = revThisYear * shareRate;
            const sparkY = revThisYear - athiyaY;
            athiyaAmountINR += athiyaY;
            
            yearData.push({ 
                year: currentYear, 
                months: monthsInThisYear,
                rev: revThisYear, 
                athiya: athiyaY, 
                spark: sparkY, 
                pct: shareRate * 100 
            });

            remainingMonths -= monthsInThisYear;
            currentYear++;
        }

        const numYears = yearData.length;
        const sparkGrossINR = revenueINR - athiyaAmountINR;

        // Setup fee is Spark only, Y1
        const sparkNetINR = sparkGrossINR + setupFeeINR - costs.total;
        // Margin expressed as markup on cost: 90% means Spark net = 0.9× costs (i.e. 9x return on cost)
        const marginPct   = costs.total > 0 ? (sparkNetINR / costs.total) * 100 : 0;

        const result = {
            listPricePerSeatPerMonth,
            netPricePerSeatPerMonth,
            totalDiscountPct,
            totalDiscountPctDisplay,
            volDisc, termDisc, earlyDisc,
            acvINR,
            setupFeeINR,
            tcvINR,
            revenueINR,
            athiyaAmountINR,
            sparkGrossINR,
            sparkNetINR,
            marginPct,
            yearData,
            numYears,
            costPerSeatPerMonth,
        };

        console.log(LOG, 'pricing (INR)', result);
        return result;
    }

    // ─────────────────────────────────────────────
    // 5. Render results
    // ─────────────────────────────────────────────

    function renderError(errors) {
        const errorHtml = '<p class="ec-results-error-title">Please correct the following:</p><ul class="ec-results-error-list">' +
            errors.map(function (e) { return '<li>' + e.message + '</li>'; }).join('') + '</ul>';
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

    function renderDetailedCostBreakdown(inp, costs) {
        if (window.EC_BREAKDOWN && window.EC_BREAKDOWN.renderDetailedCostBreakdown) {
            window.EC_BREAKDOWN.renderDetailedCostBreakdown(inp, costs);
        }
    }

    function renderResults(inp, costs, pricing) {
        hideErrorShowContent();
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

        set('ec-out-discounts-pct', pricing.totalDiscountPctDisplay > 0
            ? '-' + fmtPct(pricing.totalDiscountPctDisplay * 100)
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

        // Summary (sticky) - per-unit keeps decimals, aggregates rounded
        setDual('ec-summary-net', pricing.netPricePerSeatPerMonth);
        setDual('ec-summary-tcv', pricing.tcvINR);
        setDual('ec-summary-spark-rev', pricing.sparkGrossINR);
        setDual('ec-summary-athiya-rev', pricing.athiyaAmountINR);
        set('ec-summary-margin-pct', fmtPct(pricing.marginPct));
        setDual('ec-summary-spark-net', pricing.sparkNetINR);

        // Spark-internal visibility
        const showSparkInternal = hasSparkInternalParam();
        const summaryInternal = document.getElementById('ec-summary-spark-internal');
        const fullInternal = document.getElementById('ec-full-spark-internal');
        const sectionTechnical = document.getElementById('ec-section-technical');
        const sectionCosts = document.getElementById('ec-section-costs');
        const costBreakdownBlock = document.getElementById('ec-cost-breakdown-block');
        if (summaryInternal) summaryInternal.classList.toggle('hidden', !showSparkInternal);
        if (fullInternal) fullInternal.classList.toggle('hidden', !showSparkInternal);
        if (sectionTechnical) sectionTechnical.classList.toggle('hidden', !showSparkInternal);
        if (sectionCosts) sectionCosts.classList.toggle('hidden', !showSparkInternal);
        if (costBreakdownBlock) costBreakdownBlock.classList.toggle('hidden', !showSparkInternal);

        const linkDetailed = document.getElementById('ec-link-detailed-breakdown');
        const sectionDetailed = document.getElementById('ec-detailed-cost-breakdown');
        if (linkDetailed) linkDetailed.classList.toggle('hidden', !showSparkInternal);
        if (sectionDetailed) sectionDetailed.classList.toggle('hidden', !showSparkInternal);

        if (showSparkInternal && costs.detail) {
            renderDetailedCostBreakdown(inp, costs);
        }

        // Contract value - aggregates rounded
        setDual('ec-out-acv', pricing.acvINR);
        setDual('ec-out-setup', pricing.setupFeeINR);
        set('ec-out-tcv-term', String(inp.term));
        setDual('ec-out-tcv', pricing.tcvINR);

        // Cost breakdown - aggregates rounded
        setDual('ec-cost-out-assemblyai', costs.assemblyAI);
        set('ec-cost-out-storage-gb', Math.round(costs.storageGB));
        setDual('ec-cost-out-s3-storage', costs.s3Storage);
        setDual('ec-cost-out-s3-streaming', costs.s3Streaming);
        setDual('ec-cost-out-batch', costs.batch);
        setDual('ec-cost-out-gemini', costs.gemini);
        setDual('ec-cost-out-openai', costs.openAI);
        setDual('ec-cost-out-total', costs.total);

        // Revenue Share - aggregates rounded
        setDual('ec-margin-out-spark-gross', pricing.sparkGrossINR);
        setDual('ec-margin-out-athiya', pricing.athiyaAmountINR);
        setDual('ec-margin-out-cost', costs.total);
        setDual('ec-margin-out-net', pricing.sparkNetINR);
        set('ec-margin-out-pct', fmtPct(pricing.marginPct));

        // Year-by-year: one section per year, Total revenue / Spark / Athiya rows with INR and USD
        const yearContainer = document.getElementById('ec-year-by-year-container');
        const setupFeeINR = inp.setupFeeINR || 0;
        if (yearContainer && pricing.yearData && pricing.yearData.length > 0) {
            yearContainer.innerHTML = pricing.yearData.map(function (d) {
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

    const DEFAULTS = {
        'ec-fx-rate': '91',
        'ec-seats': '500',
        'ec-setup-fee': '0',
        'ec-base-price-vanilla': '450',
        'ec-base-price-premium': '900',
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
        'ec-min-margin': '80',
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
        _tier: 'vanilla',
        _term: '12',
        _tutorVanilla: 'no'
    };

    function pickFromDefaults(keys) {
        const out = {};
        keys.forEach(function (k) { if (DEFAULTS[k] !== undefined) out[k] = DEFAULTS[k]; });
        return out;
    }

    const SECTION_KEYS = {
        deal: ['ec-seats', 'ec-setup-fee', '_tier', '_term'],
        'revenue-share': ['ec-rev-share-y1', 'ec-rev-share-y2', 'ec-rev-share-y3', 'ec-rev-share-y4', 'ec-rev-share-y5'],
        usage: ['ec-video-hours-sd', 'ec-video-hours-hd', 'ec-streaming-hrs', 'ec-tutor-queries', 'ec-num-videos', 'ec-quiz-queries', '_tutorVanilla'],
        pricing: ['ec-base-price-vanilla', 'ec-base-price-premium', 'ec-vol-disc-1', 'ec-vol-disc-2', 'ec-vol-disc-3', 'ec-vol-disc-4', 'ec-vol-disc-5', 'ec-vol-disc-6', 'ec-vol-disc-7', 'ec-term-disc-1', 'ec-term-disc-3', 'ec-term-disc-6', 'ec-term-disc-12', 'ec-early-disc'],
        technical: ['ec-hd-sd-factor', 'ec-gb-per-video-hr', 'ec-embedding-tokens', 'ec-batch-hrs-per-video-hr', 'ec-tutor-tokens-in', 'ec-tutor-tokens-out', 'ec-quiz-tokens-in', 'ec-quiz-tokens-out', 'ec-pipeline-tokens-in', 'ec-pipeline-tokens-out'],
        costs: ['ec-cost-assemblyai', 'ec-cost-s3-storage', 'ec-cost-s3-transfer', 'ec-cost-batch', 'ec-cost-gemini-in', 'ec-cost-gemini-out', 'ec-cost-openai-embedding', 'ec-cost-multiplier', 'ec-min-margin']
    };

    const DEFAULTS_DEAL = pickFromDefaults(SECTION_KEYS.deal);
    const DEFAULTS_REVENUE_SHARE = pickFromDefaults(SECTION_KEYS['revenue-share']);
    const DEFAULTS_USAGE = pickFromDefaults(SECTION_KEYS.usage);
    const DEFAULTS_PRICING = pickFromDefaults(SECTION_KEYS.pricing);
    const DEFAULTS_TECHNICAL = pickFromDefaults(SECTION_KEYS.technical);
    const DEFAULTS_COSTS = pickFromDefaults(SECTION_KEYS.costs);

    function resetToDefaults() {
        applyImportedValues(DEFAULTS);
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

    function gatherAllInputValues() {
        const ids = [
            'ec-fx-rate', 'ec-seats', 'ec-setup-fee', 'ec-base-price-vanilla', 'ec-base-price-premium',
            'ec-rev-share-y1', 'ec-rev-share-y2', 'ec-rev-share-y3', 'ec-rev-share-y4', 'ec-rev-share-y5',
            'ec-video-hours-sd', 'ec-video-hours-hd', 'ec-hd-sd-factor', 'ec-gb-per-video-hr',
            'ec-streaming-hrs', 'ec-num-videos', 'ec-tutor-queries', 'ec-quiz-queries',
            'ec-batch-hrs-per-video-hr',
            'ec-tutor-tokens-in', 'ec-tutor-tokens-out',
            'ec-quiz-tokens-in', 'ec-quiz-tokens-out',
            'ec-pipeline-tokens-in', 'ec-pipeline-tokens-out',
            'ec-cost-assemblyai', 'ec-cost-s3-storage', 'ec-cost-s3-transfer',
            'ec-cost-batch', 'ec-cost-gemini-in', 'ec-cost-gemini-out',
            'ec-embedding-tokens', 'ec-cost-openai-embedding', 'ec-cost-multiplier', 'ec-min-margin',
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
        const tierEl = document.querySelector('.ec-tier-btn--active[data-tier]');
        data['_tier'] = tierEl ? tierEl.getAttribute('data-tier') : 'vanilla';
        const termEl = document.querySelector('.ec-chip--active[data-term]');
        data['_term'] = termEl ? termEl.getAttribute('data-term') : '12';
        const tutorVanillaEl = document.querySelector('.ec-tier-btn--active[data-tutor-vanilla]');
        data['_tutorVanilla'] = tutorVanillaEl ? tutorVanillaEl.getAttribute('data-tutor-vanilla') : 'no';
        return data;
    }

    function applyImportedValues(data) {
        // Backward compat: map old OpenAI input cost to embedding cost
        if (data['ec-cost-openai-in'] && !data['ec-cost-openai-embedding']) {
            data['ec-cost-openai-embedding'] = data['ec-cost-openai-in'];
        }
        // Backward compat: map old single base price to both tiers
        if (data['ec-base-price-per-seat'] !== undefined && data['ec-base-price-vanilla'] === undefined) {
            data['ec-base-price-vanilla'] = data['ec-base-price-per-seat'];
            data['ec-base-price-premium'] = data['ec-base-price-per-seat'];
        }
        for (const key in data) {
            if (key.startsWith('_')) continue;
            const el = document.getElementById(key);
            if (el) el.value = data[key];
        }
        // Restore tier
        if (data['_tier']) {
            document.querySelectorAll('.ec-tier-btn[data-tier]').forEach(btn => {
                const active = btn.getAttribute('data-tier') === data['_tier'];
                btn.classList.toggle('ec-tier-btn--active', active);
            });
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
        const validation = validateInputs();
        if (!validation.valid) {
            alert('Please correct all validation errors before exporting CSV.');
            return;
        }
        clearInputInvalidState();
        const inp = readInputs();
        const costs = computeCosts(inp);
        const pricing = computePricing(inp, costs);
        const fx = inp.fxRate;
        const showSparkInternal = hasSparkInternalParam();

        const rows = [
            ['Spark Enterprise Pricing Calculator', '', ''],
            ['Generated', new Date().toISOString(), ''],
            ['', '', ''],
            ['DEAL PARAMETERS', '', ''],
            ['Tier', inp.tier, ''],
            ['Seats', inp.seats, ''],
            ['Contract term (months)', inp.term, ''],
            ['Setup fee (INR, Spark only, Y1)', inp.setupFeeINR, ''],
            ['FX rate (INR/USD)', fx, ''],
            ['Revenue share Y1-Y5 (%)', [1,2,3,4,5].map(function(y){ return Math.round(inp.revShare[y] * 100); }).join('/'), ''],
            ['AI Tutor in Vanilla', inp.tutorInVanilla ? 'Yes' : 'No', ''],
            ['', '', ''],
            ['PRICING', 'INR', 'USD'],
            ['List price / seat / month', fmtINR(pricing.listPricePerSeatPerMonth), fmtUSD(pricing.listPricePerSeatPerMonth)],
            ['List price / seat / year', fmtINR(pricing.listPricePerSeatPerMonth * 12), fmtUSD(pricing.listPricePerSeatPerMonth * 12)],
            ['Total discount %', fmtPct(pricing.totalDiscountPctDisplay * 100), ''],
            ['Net price / seat / month', fmtINR(pricing.netPricePerSeatPerMonth), fmtUSD(pricing.netPricePerSeatPerMonth)],
            ['ACV (annual contract value)', fmtINR(pricing.acvINR), fmtUSD(pricing.acvINR)],
            ['Setup fee (one-time, Spark only)', fmtINR(pricing.setupFeeINR), fmtUSD(pricing.setupFeeINR)],
            ['TCV (' + inp.term + ' months + setup)', fmtINR(pricing.tcvINR), fmtUSD(pricing.tcvINR)],
            ['', '', ''],
            ['REVENUE SHARE', 'INR', 'USD'],
            ['Total revenue (TCV excl. setup)', fmtINR(pricing.revenueINR), fmtUSD(pricing.revenueINR)],
            ['Spark revenue', fmtINR(pricing.sparkGrossINR), fmtUSD(pricing.sparkGrossINR)],
            ['Athiya revenue', fmtINR(pricing.athiyaAmountINR), fmtUSD(pricing.athiyaAmountINR)],
        ];

        if (pricing.yearData && pricing.yearData.length > 0) {
            pricing.yearData.forEach(function (d) {
                const yearLabel = d.months < 12 ? 'Y' + d.year + ' (' + d.months + ' mo)' : 'Y' + d.year;
                rows.push([yearLabel + ' (Rev ' + fmtINR(d.rev) + ', Athiya ' + Math.round(d.pct) + '%)', 'Spark ' + fmtINR(d.spark) + ' / Athiya ' + fmtINR(d.athiya), '']);
            });
        }

        rows.push(
            ['', '', ''],
            ['COST BREAKDOWN (total over contract term, after multiplier)', 'INR', 'USD'],
            ['AssemblyAI', fmtINR(costs.assemblyAI), fmtUSD(costs.assemblyAI)],
            ['AWS S3 storage (' + Math.round(costs.storageGB) + ' GB)', fmtINR(costs.s3Storage), fmtUSD(costs.s3Storage)],
            ['AWS S3 streaming', fmtINR(costs.s3Streaming), fmtUSD(costs.s3Streaming)],
            ['AWS Batch', fmtINR(costs.batch), fmtUSD(costs.batch)],
            ['Gemini API (pipeline + tutor + quiz)', fmtINR(costs.gemini), fmtUSD(costs.gemini)],
            ['OpenAI API (embeddings)', fmtINR(costs.openAI), fmtUSD(costs.openAI)],
            ['Total cost', fmtINR(costs.total), fmtUSD(costs.total)]
        );

        if (showSparkInternal) {
            rows.push(
                ['', '', ''],
                ['SPARK MARGIN (internal)', 'INR', 'USD'],
                ['Spark net margin', fmtINR(pricing.sparkNetINR), fmtUSD(pricing.sparkNetINR)],
                ['Margin %', fmtPct(pricing.marginPct), '']
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
        const tierEl = document.querySelector('.ec-tier-btn--active[data-tier]');
        const tier = tierEl ? tierEl.getAttribute('data-tier') : 'vanilla';
        const tutorVanillaEl = document.querySelector('.ec-tier-btn--active[data-tutor-vanilla]');
        const tutorInVanilla = tutorVanillaEl ? tutorVanillaEl.getAttribute('data-tutor-vanilla') === 'yes' : false;

        const rowTutorVanilla = document.getElementById('ec-row-tutor-vanilla');
        const rowTutorQueries = document.getElementById('ec-row-tutor-queries');

        if (rowTutorVanilla) {
            rowTutorVanilla.classList.toggle('ec-hidden', tier === 'premium');
        }
        if (rowTutorQueries) {
            const showQueries = tier === 'premium' || (tier === 'vanilla' && tutorInVanilla);
            rowTutorQueries.classList.toggle('ec-hidden', !showQueries);
        }
    }

    function recalculate() {
        updateTutorFieldVisibility();

        const validation = validateInputs();

        if (!validation.valid) {
            renderError(validation.errors);
            saveToLocalStorage();
            return;
        }

        clearInputInvalidState();
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

        // Restore from localStorage or apply defaults
        const saved = loadFromLocalStorage();
        if (saved) {
            applyImportedValues(saved);
            console.log(LOG, 'restored from localStorage');
        } else {
            applyImportedValues(DEFAULTS);
        }

        // Tier toggle
        document.querySelectorAll('.ec-tier-btn[data-tier]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ec-tier-btn[data-tier]').forEach(b => b.classList.remove('ec-tier-btn--active'));
                btn.classList.add('ec-tier-btn--active');
                recalculate();
            });
        });

        // AI Tutor in Vanilla toggle: only auto-set tutor queries to 0 when user selects No
        document.querySelectorAll('.ec-tier-btn[data-tutor-vanilla]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ec-tier-btn[data-tutor-vanilla]').forEach(b => b.classList.remove('ec-tier-btn--active'));
                btn.classList.add('ec-tier-btn--active');
                if (btn.getAttribute('data-tutor-vanilla') === 'no') {
                    const tutorEl = document.getElementById('ec-tutor-queries');
                    if (tutorEl) tutorEl.value = '0';
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
        if (btnResetAll) btnResetAll.addEventListener('click', () => {
            if (confirm('Reset all inputs to defaults?')) resetToDefaults();
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
            });
        }
        setupCollapsible('ec-btn-expand-deal', 'ec-deal-body');
        setupCollapsible('ec-btn-expand-revenue-share', 'ec-revenue-share-body');
        setupCollapsible('ec-btn-expand-usage', 'ec-usage-body');
        setupCollapsible('ec-btn-expand-pricing', 'ec-pricing-body');
        setupCollapsible('ec-btn-expand-technical', 'ec-technical-body');
        setupCollapsible('ec-btn-expand-costs', 'ec-costs-body');
        setupCollapsible('ec-btn-expand-detailed-breakdown', 'ec-detailed-breakdown-body');

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

        // Initial calculation: validate and compute (do not auto-set base prices - allows validation errors to show)
        recalculate();
    });

})();
