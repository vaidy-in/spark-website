/**
 * Enterprise Pricing Calculator - Detailed Cost Breakdown
 *
 * Renders the detailed cost breakdown with explicit input sources and
 * step-by-step derivations. Vanilla and Premium shown side by side.
 * Workings are collapsible with tier switcher.
 * Uses DOM APIs and table layout for proper column alignment.
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
        day0Videos: 'Day 0 library (videos)',
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

    function el(tag, className, content) {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (content !== undefined) e.textContent = content;
        return e;
    }

    function stepEl(cls, text) {
        const d = el('div', 'ec-detail-step ec-detail-' + cls);
        d.textContent = text;
        return d;
    }

    function addStep(container, cls, text) {
        container.appendChild(stepEl(cls, text));
    }

    function buildTranscriptionWorkings(container, inp, d, fx) {
        addStep(container, 'workings', 'Inputs: ' + INPUT_LABELS.videoHoursSDPerMonth + ': ' + fmtNum(inp.videoHoursSDPerMonth) + ' hrs/mo, ' + INPUT_LABELS.videoHoursHDPerMonth + ': ' + fmtNum(inp.videoHoursHDPerMonth) + ' hrs/mo, ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo.');
        addStep(container, 'workings', 'Total video hrs = (SD + HD) × term = (' + fmtNum(inp.videoHoursSDPerMonth) + ' + ' + fmtNum(inp.videoHoursHDPerMonth) + ') × ' + d.termMonths + ' = ' + fmtNum(d.transcription.totalVideoHours) + ' video hrs.');
        addStep(container, 'formula', 'Cost: ' + INPUT_LABELS.costAssemblyAI + ': ₹' + fmtNum(d.transcription.unitCost) + ' / video hr.');
        addStep(container, 'formula', 'Amount = total video hrs × cost/video hr = ' + fmtNum(d.transcription.totalVideoHours) + ' × ' + fmtNum(d.transcription.unitCost) + ' = ' + fmtINR(d.transcription.amount) + '.');
    }

    function buildStorageWorkings(container, inp, d, fx) {
        if (d.storage.sd || d.storage.hd) {
            addStep(container, 'workings', 'Inputs: ' + INPUT_LABELS.gbPerVideoHr + ': ' + fmtNum(d.storage.gbPerVideoHr) + ' GB/hr, ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo, ' + INPUT_LABELS.costS3Storage + ': ₹' + fmtNum(d.storage.costPerGB) + ' / GB.');
            addStep(container, 'workings', 'Cost uses triangular sum (storage grows monthly).');
        }
        if (d.storage.sd) {
            addStep(container, 'workings', 'SD inputs: ' + INPUT_LABELS.videoHoursSDPerMonth + ': ' + fmtNum(d.storage.videoHoursSDPerMonth) + ' hrs/mo.');
            addStep(container, 'workings', 'Step 1 - End-state GB: SD hrs/mo × GB/hr × term = ' + fmtNum(d.storage.videoHoursSDPerMonth) + ' × ' + fmtNum(d.storage.gbPerVideoHr) + ' × ' + d.termMonths + ' = ' + fmtNum(Math.round(d.storage.sd.storageGB)) + ' GB.');
            addStep(container, 'workings', 'Step 2 - Monthly new GB: SD hrs/mo × GB/hr = ' + fmtNum(d.storage.videoHoursSDPerMonth) + ' × ' + fmtNum(d.storage.gbPerVideoHr) + ' = ' + fmtNum(d.storage.sd.monthlyNewGB) + ' GB/mo.');
            addStep(container, 'workings', 'Step 3 - Triangular sum: 1 + 2 + ... + ' + d.termMonths + ' = ' + d.storage.storageMonthSum + '.');
            addStep(container, 'formula', 'Step 4 - Cost: monthly new GB × sum × cost/GB = ' + fmtNum(d.storage.sd.monthlyNewGB) + ' × ' + d.storage.storageMonthSum + ' × ' + fmtNum(d.storage.costPerGB) + ' = ' + fmtINR(d.storage.sd.amount) + '.');
        }
        if (d.storage.hd) {
            addStep(container, 'workings', 'HD inputs: ' + INPUT_LABELS.videoHoursHDPerMonth + ': ' + fmtNum(d.storage.videoHoursHDPerMonth) + ' hrs/mo, ' + INPUT_LABELS.hdSdFactor + ': ' + fmtNum(d.storage.hdSdFactor) + '×.');
            addStep(container, 'workings', 'Step 1 - End-state GB: HD hrs/mo × GB/hr × ' + INPUT_LABELS.hdSdFactor + ' × term = ' + fmtNum(d.storage.videoHoursHDPerMonth) + ' × ' + fmtNum(d.storage.gbPerVideoHr) + ' × ' + fmtNum(d.storage.hdSdFactor) + ' × ' + d.termMonths + ' = ' + fmtNum(Math.round(d.storage.hd.storageGB)) + ' GB.');
            addStep(container, 'workings', 'Step 2 - Monthly new GB: HD hrs/mo × GB/hr × ' + INPUT_LABELS.hdSdFactor + ' = ' + fmtNum(d.storage.videoHoursHDPerMonth) + ' × ' + fmtNum(d.storage.gbPerVideoHr) + ' × ' + fmtNum(d.storage.hdSdFactor) + ' = ' + fmtNum(d.storage.hd.monthlyNewGB) + ' GB/mo.');
            addStep(container, 'workings', 'Step 3 - Triangular sum: 1 + 2 + ... + ' + d.termMonths + ' = ' + d.storage.storageMonthSum + '.');
            addStep(container, 'formula', 'Step 4 - Cost: monthly new GB × sum × cost/GB = ' + fmtNum(d.storage.hd.monthlyNewGB) + ' × ' + d.storage.storageMonthSum + ' × ' + fmtNum(d.storage.costPerGB) + ' = ' + fmtINR(d.storage.hd.amount) + '.');
        }
        if (!d.storage.sd && !d.storage.hd) {
            addStep(container, 'workings', 'No video storage (0 SD, 0 HD hrs).');
        }
    }

    function buildBatchWorkings(container, inp, d, fx) {
        if (d.batch.sd || d.batch.hd) {
            addStep(container, 'workings', 'Inputs: ' + INPUT_LABELS.batchHrsPerVideoHr + ': ' + fmtNum(d.batch.batchHrsPerVideoHr) + ' vCPU-hrs/video hr, ' + INPUT_LABELS.hdSdFactor + ': ' + fmtNum(d.batch.hdSdFactor) + '×, ' + INPUT_LABELS.costBatch + ': ₹' + fmtNum(d.batch.costPerVcpuHr) + ' / vCPU-hr.');
        }
        if (d.batch.sd) {
            addStep(container, 'workings', 'SD: ' + INPUT_LABELS.videoHoursSDPerMonth + ' × ' + INPUT_LABELS.term + ' = ' + fmtNum(d.batch.totalVideoHoursSD) + ' video hrs. vCPU-hrs = video hrs × ' + INPUT_LABELS.batchHrsPerVideoHr + ' = ' + fmtNum(d.batch.totalVideoHoursSD) + ' × ' + fmtNum(d.batch.batchHrsPerVideoHr) + ' = ' + fmtNum(d.batch.sd.batchHrs) + ' vCPU-hrs.');
            addStep(container, 'formula', 'SD cost = vCPU-hrs × cost/vCPU-hr = ' + fmtNum(d.batch.sd.batchHrs) + ' × ' + fmtNum(d.batch.costPerVcpuHr) + ' = ' + fmtINR(d.batch.sd.amount) + '.');
        }
        if (d.batch.hd) {
            addStep(container, 'workings', 'HD: ' + INPUT_LABELS.videoHoursHDPerMonth + ' × ' + INPUT_LABELS.term + ' = ' + fmtNum(d.batch.totalVideoHoursHD) + ' video hrs. vCPU-hrs = video hrs × ' + INPUT_LABELS.hdSdFactor + ' × ' + INPUT_LABELS.batchHrsPerVideoHr + ' = ' + fmtNum(d.batch.totalVideoHoursHD) + ' × ' + fmtNum(d.batch.hdSdFactor) + ' × ' + fmtNum(d.batch.batchHrsPerVideoHr) + ' = ' + fmtNum(d.batch.hd.batchHrs) + ' vCPU-hrs.');
            addStep(container, 'formula', 'HD cost = vCPU-hrs × cost/vCPU-hr = ' + fmtNum(d.batch.hd.batchHrs) + ' × ' + fmtNum(d.batch.costPerVcpuHr) + ' = ' + fmtINR(d.batch.hd.amount) + '.');
        }
        if (!d.batch.sd && !d.batch.hd) {
            addStep(container, 'workings', 'No video processing (0 SD, 0 HD hrs).');
        }
    }

    function buildPipelineWorkings(container, inp, d, fx) {
        addStep(container, 'workings', 'Inputs: total video hrs = ' + fmtNum(d.pipeline.totalVideoHours) + ' (from SD + HD × term). ' + INPUT_LABELS.pipelineTokensIn + ': ' + fmtNum(d.pipeline.tokensIn) + ', ' + INPUT_LABELS.pipelineTokensOut + ': ' + fmtNum(d.pipeline.tokensOut) + '. ' + INPUT_LABELS.costGeminiIn + ': ₹' + fmtNum(d.pipeline.costIn) + ' / 1M, ' + INPUT_LABELS.costGeminiOut + ': ₹' + fmtNum(d.pipeline.costOut) + ' / 1M.');
        addStep(container, 'workings', 'Tokens = video hrs × (in + out) = ' + fmtNum(d.pipeline.totalVideoHours) + ' × (' + fmtNum(d.pipeline.tokensIn) + ' + ' + fmtNum(d.pipeline.tokensOut) + ') = ' + fmtNum(d.pipeline.totalVideoHours * (d.pipeline.tokensIn + d.pipeline.tokensOut)) + ' tokens.');
        addStep(container, 'formula', 'Cost = (tokens in / 1M × cost in) + (tokens out / 1M × cost out) = ' + fmtINR(d.pipeline.amount) + '.');
    }

    function buildQuizWorkings(container, inp, d, fx) {
        addStep(container, 'workings', 'Inputs: video hrs/mo = ' + fmtNum(d.quiz.baseVideoHoursPerMonth) + ', ' + INPUT_LABELS.quizQuestionsPerHour + ': ' + fmtNum(d.quiz.quizQuestionsPerHour) + ', ' + INPUT_LABELS.term + ': ' + d.quiz.termMonths + ' mo.');
        addStep(container, 'workings', 'Questions/mo = video hrs/mo × questions/hr = ' + fmtNum(d.quiz.baseVideoHoursPerMonth) + ' × ' + fmtNum(d.quiz.quizQuestionsPerHour) + ' = ' + fmtNum(d.quiz.quizQueriesTotalPerMonth) + '. Total questions = ' + fmtNum(d.quiz.quizQueriesTotalPerMonth) + ' × ' + d.quiz.termMonths + ' = ' + fmtNum(d.quiz.quizQueriesTotalPerMonth * d.quiz.termMonths) + '.');
        addStep(container, 'workings', 'Token inputs: ' + INPUT_LABELS.quizTokensIn + ': ' + fmtNum(d.quiz.tokensIn) + ', ' + INPUT_LABELS.quizTokensOut + ': ' + fmtNum(d.quiz.tokensOut) + '. Costs from ' + INPUT_LABELS.costGeminiIn + ' and ' + INPUT_LABELS.costGeminiOut + '.');
        addStep(container, 'formula', 'Cost = ' + fmtINR(d.quiz.amount) + '.');
    }

    function buildEmbeddingsWorkings(container, inp, d, fx) {
        addStep(container, 'workings', 'Inputs: video hrs/mo = SD + HD = ' + fmtNum(d.embeddings.baseVideoHoursPerMonth) + ', ' + INPUT_LABELS.embeddingTokensPerVideoHr + ': ' + fmtNum(d.embeddings.embeddingTokensPerVideoHr) + ', ' + INPUT_LABELS.term + ': ' + d.embeddings.termMonths + ' mo, ' + INPUT_LABELS.costOpenAIEmbedding + ': ₹' + fmtNum(d.embeddings.costPer1MTokens) + ' / 1M tokens.');
        addStep(container, 'workings', 'Tokens/mo = video hrs/mo × tokens/hr = ' + fmtNum(d.embeddings.baseVideoHoursPerMonth) + ' × ' + fmtNum(d.embeddings.embeddingTokensPerVideoHr) + ' = ' + fmtNum(d.embeddings.embeddingTokensPerMonth) + '. Total tokens = ' + fmtNum(d.embeddings.embeddingTokensPerMonth) + ' × ' + d.embeddings.termMonths + ' = ' + fmtNum(d.embeddings.embeddingTokensPerMonth * d.embeddings.termMonths) + '.');
        addStep(container, 'formula', 'Cost = total tokens / 1M × cost per 1M = ' + fmtINR(d.embeddings.amount) + '.');
    }

    function buildDay0Workings(container, day0, fx) {
        if (!day0 || !day0.detail) return;
        const d = day0.detail;
        addStep(container, 'workings', 'One-time import at onboarding. Uses same avg video length and HD % as monthly videos.');
        addStep(container, 'workings', 'Inputs: ' + INPUT_LABELS.day0Videos + ' → SD hrs: ' + fmtNum(d.day0VideoHoursSD) + ', HD hrs: ' + fmtNum(d.day0VideoHoursHD) + ', total: ' + fmtNum(d.baseDay0VideoHours) + ' hrs. ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo.');
        addStep(container, 'workings', 'Transcription: ' + fmtNum(d.baseDay0VideoHours) + ' × cost/hr. Batch: SD + HD vCPU-hrs. Pipeline + Quiz: Gemini tokens. Embeddings: OpenAI. Storage: GB × term × cost/GB.');
        addStep(container, 'formula', 'Total (× ' + INPUT_LABELS.costMultiplier + ') = ' + fmtINR(day0.total) + '.');
    }

    function buildTutorWorkings(container, inp, d, fx) {
        addStep(container, 'workings', 'Inputs: ' + INPUT_LABELS.seats + ': ' + fmtNum(d.tutor.seats) + ', ' + INPUT_LABELS.tutorQueriesPerSeat + ': ' + fmtNum(d.tutor.queriesPerSeat) + ', ' + INPUT_LABELS.term + ': ' + d.tutor.termMonths + ' mo.' + (d.tutor.includeTutor ? '' : ' (N/A - not in tier)'));
        addStep(container, 'workings', 'Total queries = seats × queries/seat/mo × term = ' + fmtNum(d.tutor.seats) + ' × ' + fmtNum(d.tutor.queriesPerSeat) + ' × ' + d.tutor.termMonths + ' = ' + fmtNum(d.tutor.tutorQueriesTotalPerMonth * d.tutor.termMonths) + ' queries.');
        addStep(container, 'workings', 'Token inputs: ' + INPUT_LABELS.tutorTokensIn + ': ' + fmtNum(d.tutor.tokensIn) + ', ' + INPUT_LABELS.tutorTokensOut + ': ' + fmtNum(d.tutor.tokensOut) + '. Costs from ' + INPUT_LABELS.costGeminiIn + ' and ' + INPUT_LABELS.costGeminiOut + '.');
        addStep(container, 'formula', 'Cost = ' + fmtINR(d.tutor.amount) + '.');
    }

    function buildStreamingWorkings(container, inp, d, fx) {
        addStep(container, 'workings', 'Inputs: ' + INPUT_LABELS.seats + ': ' + fmtNum(d.streaming.seats) + ', ' + INPUT_LABELS.streamingHrsPerSeat + ': ' + fmtNum(d.streaming.streamingHrsPerSeat) + ' hrs/seat/mo, ' + INPUT_LABELS.term + ': ' + d.termMonths + ' mo, ' + INPUT_LABELS.costS3Transfer + ': ₹' + fmtNum(d.streaming.costPerGB) + ' / GB.');
        addStep(container, 'workings', 'Assumption: ' + fmtNum(d.streaming.gbPerHr) + ' GB per streamed hr (fixed).');
        addStep(container, 'workings', 'GB/mo = seats × hrs/seat/mo × GB/hr = ' + fmtNum(d.streaming.seats) + ' × ' + fmtNum(d.streaming.streamingHrsPerSeat) + ' × ' + fmtNum(d.streaming.gbPerHr) + ' = ' + fmtNum(d.streaming.seats * d.streaming.streamingHrsPerSeat * d.streaming.gbPerHr) + ' GB/mo.');
        addStep(container, 'workings', 'Total GB = GB/mo × term = ' + fmtNum(d.streaming.seats * d.streaming.streamingHrsPerSeat * d.streaming.gbPerHr) + ' × ' + d.termMonths + ' = ' + fmtNum(d.streaming.seats * d.streaming.streamingHrsPerSeat * d.streaming.gbPerHr * d.termMonths) + ' GB.');
        addStep(container, 'formula', 'Cost = total GB × cost/GB = ' + fmtNum(d.streaming.seats * d.streaming.streamingHrsPerSeat * d.streaming.gbPerHr * d.termMonths) + ' × ' + fmtNum(d.streaming.costPerGB) + ' = ' + fmtINR(d.streaming.amount) + '.');
    }

    function buildCostSeatWorkings(container, inp, costs, tier, fx) {
        const seatMonths = inp.seats * inp.term;
        const costPerSeat = seatMonths > 0 ? costs.total / seatMonths : 0;
        addStep(container, 'workings', 'Inputs: ' + INPUT_LABELS.seats + ': ' + fmtNum(inp.seats) + ', ' + INPUT_LABELS.term + ': ' + inp.term + ' mo. ' + tier + ' total cost (after ' + INPUT_LABELS.costMultiplier + '): ' + fmtINR(costs.total) + '.');
        addStep(container, 'workings', 'Total seat-months = seats × term = ' + fmtNum(inp.seats) + ' × ' + inp.term + ' = ' + fmtNum(seatMonths) + ' seat-months.');
        addStep(container, 'formula', tier + ' cost per seat per month = total cost ÷ seat-months = ' + fmtINR(costs.total) + ' ÷ ' + fmtNum(seatMonths) + ' = ' + fmtINR(costPerSeat) + '.');
    }

    function buildMinBaseWorkings(container, inp, costs, volDisc, termDisc, combinedDiscountFactor, effectiveAthiyaRate, athiyaDenom, minRevenue, minBasePrice, fx) {
        addStep(container, 'workings', 'Target: Spark net ≥ costs × ' + INPUT_LABELS.minMarginPct + ' (' + fmtNum(inp.minMarginPct * 100) + '%). Revenue share to Athiya: ' + (effectiveAthiyaRate * 100).toFixed(1) + '%.');
        addStep(container, 'workings', 'Inputs: total cost (after ' + INPUT_LABELS.costMultiplier + '): ' + fmtINR(costs.total) + ', ' + INPUT_LABELS.setupFeeINR + ': ' + fmtINR(inp.setupFeeINR) + ', ' + INPUT_LABELS.seats + ': ' + fmtNum(inp.seats) + ', ' + INPUT_LABELS.term + ': ' + inp.term + ' mo.');
        addStep(container, 'workings', 'Volume discount: ' + (volDisc * 100).toFixed(1) + '%, term discount: ' + (termDisc * 100).toFixed(1) + '%, early discount: ' + (inp.earlyDisc * 100).toFixed(1) + '%. Combined discount factor = 1 - (vol + term + early) = ' + fmtNum(combinedDiscountFactor) + '.');
        addStep(container, 'formula', 'Min revenue = (costs × (1 + markup) - setupFee) ÷ (1 - Athiya rate) = (' + fmtINR(costs.total) + ' × ' + fmtNum(1 + inp.minMarginPct) + ' - ' + fmtINR(inp.setupFeeINR) + ') ÷ ' + fmtNum(athiyaDenom) + ' = ' + fmtINR(minRevenue) + '.');
        addStep(container, 'formula', 'Min base price = min revenue ÷ (seats × term × discount factor) = ' + fmtINR(minRevenue) + ' ÷ (' + fmtNum(inp.seats) + ' × ' + inp.term + ' × ' + fmtNum(combinedDiscountFactor) + ') = ' + fmtINR(minBasePrice) + '.');
    }

    function createValueCell(content, classes) {
        const td = el('td', classes);
        td.textContent = content;
        return td;
    }

    function createDataRow(label, vInr, pInr, fx, rowClass, labelStrong) {
        const tr = el('tr', rowClass || '');
        const labelTd = el('td', 'ec-detail-label-cell');
        const labelDiv = el('div', labelStrong ? 'ec-detail-label ec-result-label--strong' : 'ec-detail-label', label);
        labelTd.appendChild(labelDiv);
        tr.appendChild(labelTd);
        tr.appendChild(createValueCell(fmtINR(vInr), 'ec-result-value ec-result-value--cost ec-result-inr'));
        tr.appendChild(createValueCell(fmtUSD(vInr, fx), 'ec-result-value-secondary'));
        tr.appendChild(createValueCell(fmtINR(pInr), 'ec-result-value ec-result-value--cost ec-result-inr'));
        tr.appendChild(createValueCell(fmtUSD(pInr, fx), 'ec-result-value-secondary'));
        return tr;
    }

    function createCostRow(tbody, label, vInr, pInr, fx, buildWorkingsV, buildWorkingsP) {
        const tr = el('tr');
        const labelTd = el('td', 'ec-detail-label-cell');
        const labelDiv = el('div', 'ec-detail-label', label);
        const btn = el('button', 'ec-detail-show-derivation cursor-pointer', 'Show derivation');
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-expanded', 'false');
        labelTd.appendChild(labelDiv);
        labelTd.appendChild(btn);
        tr.appendChild(labelTd);
        tr.appendChild(createValueCell(fmtINR(vInr), 'ec-result-value ec-result-value--cost ec-result-inr'));
        tr.appendChild(createValueCell(fmtUSD(vInr, fx), 'ec-result-value-secondary'));
        tr.appendChild(createValueCell(fmtINR(pInr), 'ec-result-value ec-result-value--cost ec-result-inr'));
        tr.appendChild(createValueCell(fmtUSD(pInr, fx), 'ec-result-value-secondary'));
        tbody.appendChild(tr);

        const panelTr = el('tr', 'ec-detail-workings-row');
        const panelTd = el('td', 'ec-detail-workings-cell');
        panelTd.colSpan = 5;
        const panel = el('div', 'ec-detail-workings-panel ec-detail-workings-panel--collapsed');
        panel.setAttribute('aria-hidden', 'true');
        const switcher = el('div', 'ec-detail-tier-switcher');
        switcher.setAttribute('role', 'group');
        switcher.setAttribute('aria-label', 'Select tier for derivation');
        const pillV = el('button', 'ec-detail-tier-pill ec-detail-tier-pill--active cursor-pointer', 'Vanilla');
        pillV.setAttribute('type', 'button');
        pillV.setAttribute('data-tier', 'vanilla');
        const pillP = el('button', 'ec-detail-tier-pill cursor-pointer', 'Premium');
        pillP.setAttribute('type', 'button');
        pillP.setAttribute('data-tier', 'premium');
        switcher.appendChild(pillV);
        switcher.appendChild(pillP);
        panel.appendChild(switcher);
        const workV = el('div', 'ec-detail-workings ec-detail-workings--vanilla');
        const workP = el('div', 'ec-detail-workings ec-detail-workings--premium hidden');
        buildWorkingsV(workV);
        buildWorkingsP(workP);
        panel.appendChild(workV);
        panel.appendChild(workP);
        panelTd.appendChild(panel);
        panelTr.appendChild(panelTd);
        tbody.appendChild(panelTr);
    }

    function createBackLink(href) {
        const a = el('a', 'ec-breakdown-back-link');
        a.href = href;
        a.textContent = 'Back to top';
        return a;
    }

    var breakdownEventsSetup = false;

    function setupBreakdownEvents(container) {
        if (!container || breakdownEventsSetup) return;
        breakdownEventsSetup = true;
        container.addEventListener('click', function (e) {
            const showBtn = e.target.closest('.ec-detail-show-derivation');
            if (showBtn) {
                e.preventDefault();
                e.stopPropagation();
                const tr = showBtn.closest('tr');
                const nextTr = tr ? tr.nextElementSibling : null;
                const panel = nextTr ? nextTr.querySelector('.ec-detail-workings-panel') : null;
                if (!panel) return;
                const expanded = showBtn.getAttribute('aria-expanded') === 'true';
                panel.classList.toggle('ec-detail-workings-panel--collapsed', expanded);
                panel.setAttribute('aria-hidden', String(expanded));
                showBtn.setAttribute('aria-expanded', String(!expanded));
                showBtn.textContent = expanded ? 'Show derivation' : 'Hide derivation';
                return;
            }
            const pill = e.target.closest('.ec-detail-tier-pill');
            if (pill) {
                e.preventDefault();
                e.stopPropagation();
                const panel = pill.closest('.ec-detail-workings-panel');
                if (!panel) return;
                const tier = pill.getAttribute('data-tier');
                if (!tier) return;
                panel.querySelectorAll('.ec-detail-tier-pill').forEach(function (p) {
                    p.classList.toggle('ec-detail-tier-pill--active', p.getAttribute('data-tier') === tier);
                });
                panel.querySelectorAll('.ec-detail-workings--vanilla').forEach(function (el) {
                    el.classList.toggle('hidden', tier !== 'vanilla');
                });
                panel.querySelectorAll('.ec-detail-workings--premium').forEach(function (el) {
                    el.classList.toggle('hidden', tier !== 'premium');
                });
            }
        });
    }

    function renderDetailedCostBreakdown(inpVanilla, costsVanilla, inpPremium, costsPremium) {
        const dV = costsVanilla.detail;
        const dP = costsPremium.detail;
        if (!dV || !dP) return;

        const blocksContainer = document.getElementById('ec-breakdown-blocks');
        const template = document.getElementById('ec-breakdown-table-template');
        const contentContainer = document.getElementById('ec-detailed-breakdown-content');
        if (!blocksContainer || !template || !contentContainer) return;

        const fx = inpVanilla.fxRate || 83;
        const multV = dV.costMultiplier;
        const multP = dP.costMultiplier;
        const videoSubtotalV = costsVanilla.assemblyAI + costsVanilla.s3Storage + costsVanilla.batch +
            (dV.pipeline.amount + dV.quiz.amount) * multV + costsVanilla.openAI;
        const videoSubtotalP = costsPremium.assemblyAI + costsPremium.s3Storage + costsPremium.batch +
            (dP.pipeline.amount + dP.quiz.amount) * multP + costsPremium.openAI;
        const studentSubtotalV = dV.tutor.amount * multV + costsVanilla.s3Streaming;
        const studentSubtotalP = dP.tutor.amount * multP + costsPremium.s3Streaming;

        blocksContainer.innerHTML = '';

        function addBlock(id, title, addRows) {
            const block = el('div', 'ec-detail-block');
            block.id = id;
            block.appendChild(el('p', 'ec-detail-block-title', title));
            const table = template.content.cloneNode(true).querySelector('table');
            const tbody = table.querySelector('tbody');
            addRows(tbody);
            block.appendChild(table);
            block.appendChild(createBackLink('#ec-breakdown-toc'));
            blocksContainer.appendChild(block);
        }

        addBlock('ec-breakdown-video', 'Video-based costs', function (tbody) {
            createCostRow(tbody, 'Transcription (AssemblyAI)', costsVanilla.assemblyAI, costsPremium.assemblyAI, fx,
                function (c) { buildTranscriptionWorkings(c, inpVanilla, dV, fx); },
                function (c) { buildTranscriptionWorkings(c, inpPremium, dP, fx); });
            createCostRow(tbody, 'Cloud storage (S3)', costsVanilla.s3Storage, costsPremium.s3Storage, fx,
                function (c) { buildStorageWorkings(c, inpVanilla, dV, fx); },
                function (c) { buildStorageWorkings(c, inpPremium, dP, fx); });
            createCostRow(tbody, 'Video processing (AWS Batch)', costsVanilla.batch, costsPremium.batch, fx,
                function (c) { buildBatchWorkings(c, inpVanilla, dV, fx); },
                function (c) { buildBatchWorkings(c, inpPremium, dP, fx); });
            createCostRow(tbody, 'LLM - course creation (Gemini)', dV.pipeline.amount * multV, dP.pipeline.amount * multP, fx,
                function (c) { buildPipelineWorkings(c, inpVanilla, dV, fx); },
                function (c) { buildPipelineWorkings(c, inpPremium, dP, fx); });
            createCostRow(tbody, 'LLM - quiz creation (Gemini)', dV.quiz.amount * multV, dP.quiz.amount * multP, fx,
                function (c) { buildQuizWorkings(c, inpVanilla, dV, fx); },
                function (c) { buildQuizWorkings(c, inpPremium, dP, fx); });
            createCostRow(tbody, 'Embeddings (OpenAI)', costsVanilla.openAI, costsPremium.openAI, fx,
                function (c) { buildEmbeddingsWorkings(c, inpVanilla, dV, fx); },
                function (c) { buildEmbeddingsWorkings(c, inpPremium, dP, fx); });
            if (costsVanilla.day0Costs && costsVanilla.day0Costs.total > 0) {
                const day0Total = costsVanilla.day0Costs.total;
                createCostRow(tbody, 'Day 0 library import', day0Total, day0Total, fx,
                    function (c) { buildDay0Workings(c, costsVanilla.day0Costs, fx); },
                    function (c) { buildDay0Workings(c, costsPremium.day0Costs, fx); });
            }
            tbody.appendChild(createDataRow('Video-based subtotal', videoSubtotalV, videoSubtotalP, fx, 'ec-detail-row--subtotal', true));
        });

        addBlock('ec-breakdown-student', 'Student-based costs', function (tbody) {
            createCostRow(tbody, 'LLM - AI Tutor (Gemini)', dV.tutor.amount * multV, dP.tutor.amount * multP, fx,
                function (c) { buildTutorWorkings(c, inpVanilla, dV, fx); },
                function (c) { buildTutorWorkings(c, inpPremium, dP, fx); });
            createCostRow(tbody, 'Video streaming (S3 data transfer)', costsVanilla.s3Streaming, costsPremium.s3Streaming, fx,
                function (c) { buildStreamingWorkings(c, inpVanilla, dV, fx); },
                function (c) { buildStreamingWorkings(c, inpPremium, dP, fx); });
            tbody.appendChild(createDataRow('Student-based subtotal', studentSubtotalV, studentSubtotalP, fx, 'ec-detail-row--subtotal', true));
        });

        addBlock('ec-breakdown-total', 'Total & multiplier', function (tbody) {
            tbody.appendChild(createDataRow('Total (before multiplier)', dV.totalPreMultiplier, dP.totalPreMultiplier, fx, 'ec-detail-row--total', true));
            tbody.appendChild(createDataRow('× ' + INPUT_LABELS.costMultiplier + ' (' + fmtNum(dV.costMultiplier) + ')', costsVanilla.total, costsPremium.total, fx, 'ec-detail-row--total', false));
        });

        const seatMonths = inpVanilla.seats * dV.termMonths;
        const costPerSeatPerMonthVanilla = seatMonths > 0 ? costsVanilla.total / seatMonths : 0;
        const costPerSeatPerMonthPremium = inpPremium.seats * dP.termMonths > 0 ? costsPremium.total / (inpPremium.seats * dP.termMonths) : 0;

        addBlock('ec-breakdown-cost-seat', 'Cost per seat per month', function (tbody) {
            createCostRow(tbody, 'Cost per seat per month', costPerSeatPerMonthVanilla, costPerSeatPerMonthPremium, fx,
                function (c) { buildCostSeatWorkings(c, inpVanilla, costsVanilla, 'Vanilla', fx); },
                function (c) { buildCostSeatWorkings(c, inpPremium, costsPremium, 'Premium', fx); });
        });

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
        const seatMonthsForBase = inpVanilla.seats * dV.termMonths;
        const denomVanilla = seatMonthsForBase * combinedDiscountFactor;
        const minBasePriceVanilla = denomVanilla > 0 ? minRevenueVanilla / denomVanilla : 0;
        const denomPremium = inpPremium.seats * dP.termMonths * combinedDiscountFactor;
        const minBasePricePremium = denomPremium > 0 ? minRevenuePremium / denomPremium : 0;

        addBlock('ec-breakdown-min-base', 'Minimum base price per seat per month', function (tbody) {
            createCostRow(tbody, 'Minimum base price per seat per month', minBasePriceVanilla, minBasePricePremium, fx,
                function (c) { buildMinBaseWorkings(c, inpVanilla, costsVanilla, volDisc, termDisc, combinedDiscountFactor, effectiveAthiyaRate, athiyaDenom, minRevenueVanilla, minBasePriceVanilla, fx); },
                function (c) { buildMinBaseWorkings(c, inpPremium, costsPremium, volDisc, termDisc, combinedDiscountFactor, effectiveAthiyaRate, athiyaDenom, minRevenuePremium, minBasePricePremium, fx); });
        });

        setupBreakdownEvents(contentContainer);
    }

    window.EC_BREAKDOWN = { renderDetailedCostBreakdown: renderDetailedCostBreakdown };
})();
