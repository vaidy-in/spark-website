/**
 * Enterprise Pricing Calculator - Detailed Cost Breakdown
 *
 * Renders the detailed cost breakdown with explicit input sources and
 * step-by-step derivations. No gaps between steps.
 */

(function () {
    'use strict';

    const INPUT_LABELS = {
        videoHoursSDPerMonth: 'SD video hours / month',
        videoHoursHDPerMonth: 'HD video hours / month',
        term: 'Contract term',
        gbPerVideoHr: 'GB per SD video hour',
        hdSdFactor: 'HD cost multiplier',
        costS3Storage: 'AWS S3 storage',
        costBatch: 'AWS Batch',
        batchHrsPerVideoHr: 'AWS Batch hrs per SD video hour',
        costAssemblyAI: 'AssemblyAI',
        costS3Transfer: 'AWS S3 data transfer',
        seats: 'Seats',
        streamingHrsPerSeat: 'Avg streaming per seat / month',
        tutorQueriesPerSeat: 'AI Tutor queries / seat / month',
        numVideosPerMonth: 'Number of videos per month',
        quizQuestionsPerHour: 'Quiz questions per hour',
        pipelineTokensIn: 'Pipeline: input tokens / video hr',
        pipelineTokensOut: 'Pipeline: output tokens / video hr',
        tutorTokensIn: 'Tutor: input tokens / query',
        tutorTokensOut: 'Tutor: output tokens / query',
        quizTokensIn: 'Quiz gen: input tokens / question',
        quizTokensOut: 'Quiz gen: output tokens / question',
        embeddingTokensPerVideoHr: 'Embedding tokens per hour of video',
        costGeminiIn: 'Gemini API input',
        costGeminiOut: 'Gemini API output',
        costOpenAIEmbedding: 'OpenAI embedding',
        costMultiplier: 'Cost safety multiplier',
        minMarginPct: 'Min. cost markup for Spark',
        setupFeeINR: 'Setup fee (one-time)',
        revShare: 'Athiya revenue share',
    };

    function getVolumeDiscount(inp) {
        const s = inp.seats;
        if (s >= 50000) return inp.volDisc7;
        if (s >= 10000) return inp.volDisc6;
        if (s >= 5000) return inp.volDisc5;
        if (s >= 1000) return inp.volDisc4;
        if (s >= 500) return inp.volDisc3;
        if (s >= 250) return inp.volDisc2;
        return inp.volDisc1;
    }

    function getTermDiscount(inp) {
        if (inp.term >= 12) return inp.termDisc12;
        if (inp.term >= 6) return inp.termDisc6;
        if (inp.term >= 3) return inp.termDisc3;
        return inp.termDisc1;
    }

    function getCombinedDiscountFactor(volDisc, termDisc, earlyDisc) {
        return Math.max(0, 1 - (volDisc + termDisc + earlyDisc));
    }

    function fmtNum(v) {
        if (Number.isInteger(v)) return v.toLocaleString('en-IN');
        const s = v.toFixed(2);
        return s.replace(/\.?0+$/, '');
    }

    function fmtINR(v) {
        const n = Math.round(v);
        if (Math.abs(n) >= 10000000) return '₹' + (n / 10000000).toFixed(2) + '\u00A0Cr';
        if (Math.abs(n) >= 100000) return '₹' + (n / 100000).toFixed(2) + '\u00A0L';
        return '₹' + n.toLocaleString('en-IN');
    }

    function fmtUSD(v, fxRate) {
        if (!fxRate || fxRate <= 0) return '$0';
        const n = v / fxRate;
        if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + '\u00A0M';
        if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(2) + '\u00A0K';
        return '$' + n.toFixed(2);
    }

    function step(cls, text) {
        return '<div class="ec-detail-step ec-detail-' + cls + '">' + text + '</div>';
    }

    function renderDetailedCostBreakdown(inpVanilla, costsVanilla, inpPremium, costsPremium) {
        const inp = inpVanilla;
        const costs = costsVanilla;
        const d = costs.detail;
        if (!d) return;

        const container = document.getElementById('ec-detailed-breakdown-content');
        if (!container) return;

        const fx = inp.fxRate || 83;

        /* ToC - Stripe-style nav for detailed breakdown */
        const tocItems = [
            { id: 'ec-breakdown-video', label: 'Video-based costs' },
            { id: 'ec-breakdown-student', label: 'Student-based costs' },
            { id: 'ec-breakdown-total', label: 'Total & multiplier' },
            { id: 'ec-breakdown-cost-seat', label: 'Cost per seat per month' },
            { id: 'ec-breakdown-min-base', label: 'Minimum base price' },
        ];
        const videoSubtotal = d.transcription.amount + d.storage.totalAmount + d.batch.totalAmount +
            d.pipeline.amount + d.quiz.amount + d.embeddings.amount;
        const studentSubtotal = d.tutor.amount + d.streaming.amount;

        let html = '';

        html += '<nav id="ec-breakdown-toc" class="ec-breakdown-toc" aria-label="Breakdown contents">';
        html += '<p class="ec-breakdown-toc-title">On this page</p>';
        html += '<ol class="ec-breakdown-toc-list">';
        tocItems.forEach(function (item) {
            html += '<li><a class="ec-breakdown-toc-link" href="#' + item.id + '">' + item.label + '</a></li>';
        });
        html += '</ol></nav>';

        html += '<div id="ec-breakdown-video" class="ec-detail-block">';
        html += '<p class="ec-detail-block-title">Video-based costs</p>';

        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">Transcription (AssemblyAI)</div>';
        html += '<div class="ec-detail-workings">';
        html += step('workings', 'Inputs: ' + INPUT_LABELS.videoHoursSDPerMonth + ': ' + fmtNum(inp.videoHoursSDPerMonth) + ' hrs/mo, ' + INPUT_LABELS.videoHoursHDPerMonth + ': ' + fmtNum(inp.videoHoursHDPerMonth) + ' hrs/mo, ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo.');
        html += step('workings', 'Total video hrs = (SD + HD) × term = (' + fmtNum(inp.videoHoursSDPerMonth) + ' + ' + fmtNum(inp.videoHoursHDPerMonth) + ') × ' + d.termMonths + ' = ' + fmtNum(d.transcription.totalVideoHours) + ' video hrs.');
        html += step('formula', 'Cost: ' + INPUT_LABELS.costAssemblyAI + ': ₹' + fmtNum(d.transcription.unitCost) + ' / video hr.');
        html += step('formula', 'Amount = total video hrs × cost/video hr = ' + fmtNum(d.transcription.totalVideoHours) + ' × ' + fmtNum(d.transcription.unitCost) + ' = ' + fmtINR(d.transcription.amount) + '.');
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(d.transcription.amount) + '</span><span class="ec-result-value-secondary">' + fmtUSD(d.transcription.amount, fx) + '</span></div>';
        html += '</div>';

        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">Cloud storage (S3)</div>';
        html += '<div class="ec-detail-workings">';
        if (d.storage.sd || d.storage.hd) {
            html += step('workings', 'Inputs: ' + INPUT_LABELS.gbPerVideoHr + ': ' + fmtNum(d.storage.gbPerVideoHr) + ' GB/hr, ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo, ' + INPUT_LABELS.costS3Storage + ': ₹' + fmtNum(d.storage.costPerGB) + ' / GB.');
            html += step('workings', 'Cost uses triangular sum (storage grows monthly).');
        }
        if (d.storage.sd) {
            html += step('workings', 'SD inputs: ' + INPUT_LABELS.videoHoursSDPerMonth + ': ' + fmtNum(d.storage.videoHoursSDPerMonth) + ' hrs/mo.');
            html += step('workings', 'Step 1 - End-state GB: SD hrs/mo × GB/hr × term = ' + fmtNum(d.storage.videoHoursSDPerMonth) + ' × ' + fmtNum(d.storage.gbPerVideoHr) + ' × ' + d.termMonths + ' = ' + fmtNum(Math.round(d.storage.sd.storageGB)) + ' GB.');
            html += step('workings', 'Step 2 - Monthly new GB: SD hrs/mo × GB/hr = ' + fmtNum(d.storage.videoHoursSDPerMonth) + ' × ' + fmtNum(d.storage.gbPerVideoHr) + ' = ' + fmtNum(d.storage.sd.monthlyNewGB) + ' GB/mo. (Derived from: end-state GB ÷ term = ' + fmtNum(Math.round(d.storage.sd.storageGB)) + ' ÷ ' + d.termMonths + ' = ' + fmtNum(d.storage.sd.monthlyNewGB) + '.)');
            html += step('workings', 'Step 3 - Triangular sum: 1 + 2 + ... + ' + d.termMonths + ' = ' + d.storage.storageMonthSum + '.');
            html += step('formula', 'Step 4 - Cost: monthly new GB × sum × cost/GB = ' + fmtNum(d.storage.sd.monthlyNewGB) + ' × ' + d.storage.storageMonthSum + ' × ' + fmtNum(d.storage.costPerGB) + ' = ' + fmtINR(d.storage.sd.amount) + '.');
        }
        if (d.storage.hd) {
            html += step('workings', 'HD inputs: ' + INPUT_LABELS.videoHoursHDPerMonth + ': ' + fmtNum(d.storage.videoHoursHDPerMonth) + ' hrs/mo, ' + INPUT_LABELS.hdSdFactor + ': ' + fmtNum(d.storage.hdSdFactor) + '×.');
            html += step('workings', 'Step 1 - End-state GB: HD hrs/mo × GB/hr × ' + INPUT_LABELS.hdSdFactor + ' × term = ' + fmtNum(d.storage.videoHoursHDPerMonth) + ' × ' + fmtNum(d.storage.gbPerVideoHr) + ' × ' + fmtNum(d.storage.hdSdFactor) + ' × ' + d.termMonths + ' = ' + fmtNum(Math.round(d.storage.hd.storageGB)) + ' GB.');
            html += step('workings', 'Step 2 - Monthly new GB: HD hrs/mo × GB/hr × ' + INPUT_LABELS.hdSdFactor + ' = ' + fmtNum(d.storage.videoHoursHDPerMonth) + ' × ' + fmtNum(d.storage.gbPerVideoHr) + ' × ' + fmtNum(d.storage.hdSdFactor) + ' = ' + fmtNum(d.storage.hd.monthlyNewGB) + ' GB/mo.');
            html += step('workings', 'Step 3 - Triangular sum: 1 + 2 + ... + ' + d.termMonths + ' = ' + d.storage.storageMonthSum + '.');
            html += step('formula', 'Step 4 - Cost: monthly new GB × sum × cost/GB = ' + fmtNum(d.storage.hd.monthlyNewGB) + ' × ' + d.storage.storageMonthSum + ' × ' + fmtNum(d.storage.costPerGB) + ' = ' + fmtINR(d.storage.hd.amount) + '.');
        }
        if (!d.storage.sd && !d.storage.hd) {
            html += step('workings', 'No video storage (0 SD, 0 HD hrs).');
        }
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(d.storage.totalAmount) + '</span><span class="ec-result-value-secondary">' + fmtUSD(d.storage.totalAmount, fx) + '</span></div>';
        html += '</div>';

        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">Video processing (AWS Batch)</div>';
        html += '<div class="ec-detail-workings">';
        if (d.batch.sd || d.batch.hd) {
            html += step('workings', 'Inputs: ' + INPUT_LABELS.batchHrsPerVideoHr + ': ' + fmtNum(d.batch.batchHrsPerVideoHr) + ' vCPU-hrs/video hr, ' + INPUT_LABELS.hdSdFactor + ': ' + fmtNum(d.batch.hdSdFactor) + '×, ' + INPUT_LABELS.costBatch + ': ₹' + fmtNum(d.batch.costPerVcpuHr) + ' / vCPU-hr.');
        }
        if (d.batch.sd) {
            html += step('workings', 'SD: ' + INPUT_LABELS.videoHoursSDPerMonth + ' × ' + INPUT_LABELS.term + ' = ' + fmtNum(d.batch.totalVideoHoursSD) + ' video hrs. vCPU-hrs = video hrs × ' + INPUT_LABELS.batchHrsPerVideoHr + ' = ' + fmtNum(d.batch.totalVideoHoursSD) + ' × ' + fmtNum(d.batch.batchHrsPerVideoHr) + ' = ' + fmtNum(d.batch.sd.batchHrs) + ' vCPU-hrs.');
            html += step('formula', 'SD cost = vCPU-hrs × cost/vCPU-hr = ' + fmtNum(d.batch.sd.batchHrs) + ' × ' + fmtNum(d.batch.costPerVcpuHr) + ' = ' + fmtINR(d.batch.sd.amount) + '.');
        }
        if (d.batch.hd) {
            html += step('workings', 'HD: ' + INPUT_LABELS.videoHoursHDPerMonth + ' × ' + INPUT_LABELS.term + ' = ' + fmtNum(d.batch.totalVideoHoursHD) + ' video hrs. vCPU-hrs = video hrs × ' + INPUT_LABELS.hdSdFactor + ' × ' + INPUT_LABELS.batchHrsPerVideoHr + ' = ' + fmtNum(d.batch.totalVideoHoursHD) + ' × ' + fmtNum(d.batch.hdSdFactor) + ' × ' + fmtNum(d.batch.batchHrsPerVideoHr) + ' = ' + fmtNum(d.batch.hd.batchHrs) + ' vCPU-hrs.');
            html += step('formula', 'HD cost = vCPU-hrs × cost/vCPU-hr = ' + fmtNum(d.batch.hd.batchHrs) + ' × ' + fmtNum(d.batch.costPerVcpuHr) + ' = ' + fmtINR(d.batch.hd.amount) + '.');
        }
        if (!d.batch.sd && !d.batch.hd) {
            html += step('workings', 'No video processing (0 SD, 0 HD hrs).');
        }
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(d.batch.totalAmount) + '</span><span class="ec-result-value-secondary">' + fmtUSD(d.batch.totalAmount, fx) + '</span></div>';
        html += '</div>';

        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">LLM - course creation (Gemini)</div>';
        html += '<div class="ec-detail-workings">';
        html += step('workings', 'Inputs: total video hrs = ' + fmtNum(d.pipeline.totalVideoHours) + ' (from SD + HD × term). ' + INPUT_LABELS.pipelineTokensIn + ': ' + fmtNum(d.pipeline.tokensIn) + ', ' + INPUT_LABELS.pipelineTokensOut + ': ' + fmtNum(d.pipeline.tokensOut) + '. ' + INPUT_LABELS.costGeminiIn + ': ₹' + fmtNum(d.pipeline.costIn) + ' / 1M, ' + INPUT_LABELS.costGeminiOut + ': ₹' + fmtNum(d.pipeline.costOut) + ' / 1M.');
        html += step('workings', 'Tokens = video hrs × (in + out) = ' + fmtNum(d.pipeline.totalVideoHours) + ' × (' + fmtNum(d.pipeline.tokensIn) + ' + ' + fmtNum(d.pipeline.tokensOut) + ') = ' + fmtNum(d.pipeline.totalVideoHours * (d.pipeline.tokensIn + d.pipeline.tokensOut)) + ' tokens.');
        html += step('formula', 'Cost = (tokens in / 1M × cost in) + (tokens out / 1M × cost out) = ' + fmtINR(d.pipeline.amount) + '.');
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(d.pipeline.amount) + '</span><span class="ec-result-value-secondary">' + fmtUSD(d.pipeline.amount, fx) + '</span></div>';
        html += '</div>';

        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">LLM - quiz creation (Gemini)</div>';
        html += '<div class="ec-detail-workings">';
        html += step('workings', 'Inputs: video hrs/mo = ' + fmtNum(d.quiz.baseVideoHoursPerMonth) + ', ' + INPUT_LABELS.quizQuestionsPerHour + ': ' + fmtNum(d.quiz.quizQuestionsPerHour) + ', ' + INPUT_LABELS.term + ': ' + d.quiz.termMonths + ' mo.');
        html += step('workings', 'Questions/mo = video hrs/mo × questions/hr = ' + fmtNum(d.quiz.baseVideoHoursPerMonth) + ' × ' + fmtNum(d.quiz.quizQuestionsPerHour) + ' = ' + fmtNum(d.quiz.quizQueriesTotalPerMonth) + '. Total questions = ' + fmtNum(d.quiz.quizQueriesTotalPerMonth) + ' × ' + d.quiz.termMonths + ' = ' + fmtNum(d.quiz.quizQueriesTotalPerMonth * d.quiz.termMonths) + '.');
        html += step('workings', 'Token inputs: ' + INPUT_LABELS.quizTokensIn + ': ' + fmtNum(d.quiz.tokensIn) + ', ' + INPUT_LABELS.quizTokensOut + ': ' + fmtNum(d.quiz.tokensOut) + '. Costs from ' + INPUT_LABELS.costGeminiIn + ' and ' + INPUT_LABELS.costGeminiOut + '.');
        html += step('formula', 'Cost = ' + fmtINR(d.quiz.amount) + '.');
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(d.quiz.amount) + '</span><span class="ec-result-value-secondary">' + fmtUSD(d.quiz.amount, fx) + '</span></div>';
        html += '</div>';

        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">Embeddings (OpenAI)</div>';
        html += '<div class="ec-detail-workings">';
        html += step('workings', 'Inputs: video hrs/mo = SD + HD = ' + fmtNum(d.embeddings.baseVideoHoursPerMonth) + ', ' + INPUT_LABELS.embeddingTokensPerVideoHr + ': ' + fmtNum(d.embeddings.embeddingTokensPerVideoHr) + ', ' + INPUT_LABELS.term + ': ' + d.embeddings.termMonths + ' mo, ' + INPUT_LABELS.costOpenAIEmbedding + ': ₹' + fmtNum(d.embeddings.costPer1MTokens) + ' / 1M tokens.');
        html += step('workings', 'Tokens/mo = video hrs/mo × tokens/hr = ' + fmtNum(d.embeddings.baseVideoHoursPerMonth) + ' × ' + fmtNum(d.embeddings.embeddingTokensPerVideoHr) + ' = ' + fmtNum(d.embeddings.embeddingTokensPerMonth) + '. Total tokens = ' + fmtNum(d.embeddings.embeddingTokensPerMonth) + ' × ' + d.embeddings.termMonths + ' = ' + fmtNum(d.embeddings.embeddingTokensPerMonth * d.embeddings.termMonths) + '.');
        html += step('formula', 'Cost = total tokens / 1M × cost per 1M = ' + fmtINR(d.embeddings.amount) + '.');
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(d.embeddings.amount) + '</span><span class="ec-result-value-secondary">' + fmtUSD(d.embeddings.amount, fx) + '</span></div>';
        html += '</div>';

        html += '<div class="ec-detail-row ec-detail-row--subtotal">';
        html += '<div class="ec-detail-label ec-result-label--strong">Video-based subtotal</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(videoSubtotal) + '</span><span class="ec-result-value-secondary">' + fmtUSD(videoSubtotal, fx) + '</span></div>';
        html += '</div>';
        html += '<a href="#ec-breakdown-toc" class="ec-breakdown-back-link">Back to top</a>';

        html += '</div>';

        html += '<div id="ec-breakdown-student" class="ec-detail-block">';
        html += '<p class="ec-detail-block-title">Student-based costs</p>';

        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">LLM - AI Tutor (Gemini)</div>';
        html += '<div class="ec-detail-workings">';
        html += step('workings', 'Inputs: ' + INPUT_LABELS.seats + ': ' + fmtNum(d.tutor.seats) + ', ' + INPUT_LABELS.tutorQueriesPerSeat + ': ' + fmtNum(d.tutor.queriesPerSeat) + ', ' + INPUT_LABELS.term + ': ' + d.tutor.termMonths + ' mo.' + (d.tutor.includeTutor ? '' : ' (N/A - not in tier)'));
        html += step('workings', 'Total queries = seats × queries/seat/mo × term = ' + fmtNum(d.tutor.seats) + ' × ' + fmtNum(d.tutor.queriesPerSeat) + ' × ' + d.tutor.termMonths + ' = ' + fmtNum(d.tutor.tutorQueriesTotalPerMonth * d.tutor.termMonths) + ' queries.');
        html += step('workings', 'Token inputs: ' + INPUT_LABELS.tutorTokensIn + ': ' + fmtNum(d.tutor.tokensIn) + ', ' + INPUT_LABELS.tutorTokensOut + ': ' + fmtNum(d.tutor.tokensOut) + '. Costs from ' + INPUT_LABELS.costGeminiIn + ' and ' + INPUT_LABELS.costGeminiOut + '.');
        html += step('formula', 'Cost = ' + fmtINR(d.tutor.amount) + '.');
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(d.tutor.amount) + '</span><span class="ec-result-value-secondary">' + fmtUSD(d.tutor.amount, fx) + '</span></div>';
        html += '</div>';

        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">Video streaming (S3 data transfer)</div>';
        html += '<div class="ec-detail-workings">';
        html += step('workings', 'Inputs: ' + INPUT_LABELS.seats + ': ' + fmtNum(d.streaming.seats) + ', ' + INPUT_LABELS.streamingHrsPerSeat + ': ' + fmtNum(d.streaming.streamingHrsPerSeat) + ' hrs/seat/mo, ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo, ' + INPUT_LABELS.costS3Transfer + ': ₹' + fmtNum(d.streaming.costPerGB) + ' / GB.');
        html += step('workings', 'Assumption: ' + fmtNum(d.streaming.gbPerHr) + ' GB per streamed hr (fixed).');
        html += step('workings', 'GB/mo = seats × hrs/seat/mo × GB/hr = ' + fmtNum(d.streaming.seats) + ' × ' + fmtNum(d.streaming.streamingHrsPerSeat) + ' × ' + fmtNum(d.streaming.gbPerHr) + ' = ' + fmtNum(d.streaming.seats * d.streaming.streamingHrsPerSeat * d.streaming.gbPerHr) + ' GB/mo.');
        html += step('workings', 'Total GB = GB/mo × term = ' + fmtNum(d.streaming.seats * d.streaming.streamingHrsPerSeat * d.streaming.gbPerHr) + ' × ' + d.termMonths + ' = ' + fmtNum(d.streaming.seats * d.streaming.streamingHrsPerSeat * d.streaming.gbPerHr * d.termMonths) + ' GB.');
        html += step('formula', 'Cost = total GB × cost/GB = ' + fmtNum(d.streaming.seats * d.streaming.streamingHrsPerSeat * d.streaming.gbPerHr * d.termMonths) + ' × ' + fmtNum(d.streaming.costPerGB) + ' = ' + fmtINR(d.streaming.amount) + '.');
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(d.streaming.amount) + '</span><span class="ec-result-value-secondary">' + fmtUSD(d.streaming.amount, fx) + '</span></div>';
        html += '</div>';

        html += '<div class="ec-detail-row ec-detail-row--subtotal">';
        html += '<div class="ec-detail-label ec-result-label--strong">Student-based subtotal</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(studentSubtotal) + '</span><span class="ec-result-value-secondary">' + fmtUSD(studentSubtotal, fx) + '</span></div>';
        html += '</div>';
        html += '<a href="#ec-breakdown-toc" class="ec-breakdown-back-link">Back to top</a>';

        html += '</div>';

        html += '<div id="ec-breakdown-total" class="ec-detail-block">';
        html += '<div class="ec-detail-row ec-detail-row--total">';
        html += '<div class="ec-detail-label ec-result-label--strong">Total (before multiplier)</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(d.totalPreMultiplier) + '</span><span class="ec-result-value-secondary">' + fmtUSD(d.totalPreMultiplier, fx) + '</span></div>';
        html += '</div>';
        html += '<div class="ec-detail-row ec-detail-row--total">';
        html += '<div class="ec-detail-label">× ' + INPUT_LABELS.costMultiplier + ' (' + fmtNum(d.costMultiplier) + ')</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost-total">' + fmtINR(costs.total) + '</span><span class="ec-result-value-secondary">' + fmtUSD(costs.total, fx) + '</span></div>';
        html += '</div>';
        html += '<a href="#ec-breakdown-toc" class="ec-breakdown-back-link">Back to top</a>';
        html += '</div>';

        const seatMonths = inp.seats * d.termMonths;
        const costPerSeatPerMonthVanilla = seatMonths > 0 ? costsVanilla.total / seatMonths : 0;
        const costPerSeatPerMonthPremium = seatMonths > 0 ? costsPremium.total / seatMonths : 0;

        html += '<div id="ec-breakdown-cost-seat" class="ec-detail-block">';
        html += '<p class="ec-detail-block-title">Cost per seat per month</p>';
        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">Vanilla</div>';
        html += '<div class="ec-detail-workings">';
        html += step('workings', 'Inputs: ' + INPUT_LABELS.seats + ': ' + fmtNum(inp.seats) + ', ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo. Vanilla total cost (after ' + INPUT_LABELS.costMultiplier + '): ' + fmtINR(costsVanilla.total) + '.');
        html += step('workings', 'Total seat-months = seats × term = ' + fmtNum(inp.seats) + ' × ' + d.termMonths + ' = ' + fmtNum(seatMonths) + ' seat-months.');
        html += step('formula', 'Vanilla cost per seat per month = total cost ÷ seat-months = ' + fmtINR(costsVanilla.total) + ' ÷ ' + fmtNum(seatMonths) + ' = ' + fmtINR(costPerSeatPerMonthVanilla) + '.');
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost-total">' + fmtINR(costPerSeatPerMonthVanilla) + '</span><span class="ec-result-value-secondary">' + fmtUSD(costPerSeatPerMonthVanilla, fx) + '</span></div>';
        html += '</div>';
        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">Premium</div>';
        html += '<div class="ec-detail-workings">';
        html += step('workings', 'Inputs: ' + INPUT_LABELS.seats + ': ' + fmtNum(inp.seats) + ', ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo. Premium total cost (after ' + INPUT_LABELS.costMultiplier + '): ' + fmtINR(costsPremium.total) + '.');
        html += step('workings', 'Total seat-months = seats × term = ' + fmtNum(inp.seats) + ' × ' + d.termMonths + ' = ' + fmtNum(seatMonths) + ' seat-months.');
        html += step('formula', 'Premium cost per seat per month = total cost ÷ seat-months = ' + fmtINR(costsPremium.total) + ' ÷ ' + fmtNum(seatMonths) + ' = ' + fmtINR(costPerSeatPerMonthPremium) + '.');
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost-total">' + fmtINR(costPerSeatPerMonthPremium) + '</span><span class="ec-result-value-secondary">' + fmtUSD(costPerSeatPerMonthPremium, fx) + '</span></div>';
        html += '</div>';
        html += '<a href="#ec-breakdown-toc" class="ec-breakdown-back-link">Back to top</a>';
        html += '</div>';

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
        const minRevenueVanilla = athiyaDenom > 0.001
            ? Math.max(0, costsVanilla.total * (1 + inpVanilla.minMarginPct) - inpVanilla.setupFeeINR) / athiyaDenom
            : 0;
        const minRevenuePremium = athiyaDenom > 0.001
            ? Math.max(0, costsPremium.total * (1 + inpPremium.minMarginPct) - inpPremium.setupFeeINR) / athiyaDenom
            : 0;
        const seatMonthsForBase = inpVanilla.seats * d.termMonths;
        const denomVanilla = seatMonthsForBase * combinedDiscountFactor;
        const minBasePriceVanilla = denomVanilla > 0 ? minRevenueVanilla / denomVanilla : 0;
        const denomPremium = inpPremium.seats * d.termMonths * combinedDiscountFactor;
        const minBasePricePremium = denomPremium > 0 ? minRevenuePremium / denomPremium : 0;

        html += '<div id="ec-breakdown-min-base" class="ec-detail-block">';
        html += '<p class="ec-detail-block-title">Minimum base price per seat per month</p>';
        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">Vanilla</div>';
        html += '<div class="ec-detail-workings">';
        html += step('workings', 'Target: Spark net ≥ costs × ' + INPUT_LABELS.minMarginPct + ' (' + fmtNum(inpVanilla.minMarginPct * 100) + '%). Revenue share to Athiya: ' + (effectiveAthiyaRate * 100).toFixed(1) + '%.');
        html += step('workings', 'Inputs: total cost (after ' + INPUT_LABELS.costMultiplier + '): ' + fmtINR(costsVanilla.total) + ', ' + INPUT_LABELS.setupFeeINR + ': ' + fmtINR(inpVanilla.setupFeeINR) + ', ' + INPUT_LABELS.seats + ': ' + fmtNum(inpVanilla.seats) + ', ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo.');
        html += step('workings', 'Volume discount: ' + (volDisc * 100).toFixed(1) + '%, term discount: ' + (termDisc * 100).toFixed(1) + '%, early discount: ' + (inpVanilla.earlyDisc * 100).toFixed(1) + '%. Combined discount factor = 1 - (vol + term + early) = ' + fmtNum(combinedDiscountFactor) + '.');
        html += step('formula', 'Min revenue = (costs × (1 + markup) - setupFee) ÷ (1 - Athiya rate) = (' + fmtINR(costsVanilla.total) + ' × ' + fmtNum(1 + inpVanilla.minMarginPct) + ' - ' + fmtINR(inpVanilla.setupFeeINR) + ') ÷ ' + fmtNum(athiyaDenom) + ' = ' + fmtINR(minRevenueVanilla) + '.');
        html += step('formula', 'Min base price = min revenue ÷ (seats × term × discount factor) = ' + fmtINR(minRevenueVanilla) + ' ÷ (' + fmtNum(inpVanilla.seats) + ' × ' + d.termMonths + ' × ' + fmtNum(combinedDiscountFactor) + ') = ' + fmtINR(minBasePriceVanilla) + '.');
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost-total">' + fmtINR(minBasePriceVanilla) + '</span><span class="ec-result-value-secondary">' + fmtUSD(minBasePriceVanilla, fx) + '</span></div>';
        html += '</div>';
        html += '<div class="ec-detail-row">';
        html += '<div class="ec-detail-label">Premium</div>';
        html += '<div class="ec-detail-workings">';
        html += step('workings', 'Target: Spark net ≥ costs × ' + INPUT_LABELS.minMarginPct + ' (' + fmtNum(inpPremium.minMarginPct * 100) + '%). Revenue share to Athiya: ' + (effectiveAthiyaRate * 100).toFixed(1) + '%.');
        html += step('workings', 'Inputs: total cost (after ' + INPUT_LABELS.costMultiplier + '): ' + fmtINR(costsPremium.total) + ', ' + INPUT_LABELS.setupFeeINR + ': ' + fmtINR(inpPremium.setupFeeINR) + ', ' + INPUT_LABELS.seats + ': ' + fmtNum(inpPremium.seats) + ', ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo.');
        html += step('workings', 'Volume discount: ' + (volDisc * 100).toFixed(1) + '%, term discount: ' + (termDisc * 100).toFixed(1) + '%, early discount: ' + (inpPremium.earlyDisc * 100).toFixed(1) + '%. Combined discount factor = ' + fmtNum(combinedDiscountFactor) + '.');
        html += step('formula', 'Min revenue = (costs × (1 + markup) - setupFee) ÷ (1 - Athiya rate) = (' + fmtINR(costsPremium.total) + ' × ' + fmtNum(1 + inpPremium.minMarginPct) + ' - ' + fmtINR(inpPremium.setupFeeINR) + ') ÷ ' + fmtNum(athiyaDenom) + ' = ' + fmtINR(minRevenuePremium) + '.');
        html += step('formula', 'Min base price = min revenue ÷ (seats × term × discount factor) = ' + fmtINR(minRevenuePremium) + ' ÷ (' + fmtNum(inpPremium.seats) + ' × ' + d.termMonths + ' × ' + fmtNum(combinedDiscountFactor) + ') = ' + fmtINR(minBasePricePremium) + '.');
        html += '</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost-total">' + fmtINR(minBasePricePremium) + '</span><span class="ec-result-value-secondary">' + fmtUSD(minBasePricePremium, fx) + '</span></div>';
        html += '</div>';
        html += '<a href="#ec-breakdown-toc" class="ec-breakdown-back-link">Back to top</a>';
        html += '</div>';

        container.innerHTML = html;
    }

    window.EC_BREAKDOWN = { renderDetailedCostBreakdown: renderDetailedCostBreakdown };
})();
