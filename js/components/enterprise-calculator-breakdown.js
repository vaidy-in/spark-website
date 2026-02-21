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
        quizQuestionsPerVideoPerMonth: 'Quiz questions per video / month',
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
    };

    function fmtNum(v) {
        if (Number.isInteger(v)) return v.toLocaleString('en-IN');
        const s = v.toFixed(2);
        return s.replace(/\.?0+$/, '');
    }

    function fmtINR(v) {
        const n = Math.round(v);
        if (Math.abs(n) >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
        if (Math.abs(n) >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L';
        return '₹' + n.toLocaleString('en-IN');
    }

    function fmtUSD(v, fxRate) {
        if (!fxRate || fxRate <= 0) return '$0';
        const n = v / fxRate;
        if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
        if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(2) + 'K';
        return '$' + n.toFixed(2);
    }

    function step(cls, text) {
        return '<div class="ec-detail-step ec-detail-' + cls + '">' + text + '</div>';
    }

    function renderDetailedCostBreakdown(inp, costs) {
        const d = costs.detail;
        if (!d) return;

        const container = document.getElementById('ec-detailed-breakdown-content');
        if (!container) return;

        const fx = inp.fxRate || 83;
        const videoSubtotal = d.transcription.amount + d.storage.totalAmount + d.batch.totalAmount +
            d.pipeline.amount + d.quiz.amount + d.embeddings.amount;
        const studentSubtotal = d.tutor.amount + d.streaming.amount;

        let html = '';

        html += '<div class="ec-detail-block">';
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
        html += step('workings', 'Inputs: ' + INPUT_LABELS.numVideosPerMonth + ': ' + fmtNum(d.quiz.numVideosPerMonth) + ', ' + INPUT_LABELS.quizQuestionsPerVideoPerMonth + ': ' + fmtNum(d.quiz.quizQuestionsPerVideoPerMonth) + ', ' + INPUT_LABELS.term + ': ' + d.quiz.termMonths + ' mo.');
        html += step('workings', 'Questions/mo = videos/mo × questions/video = ' + fmtNum(d.quiz.numVideosPerMonth) + ' × ' + fmtNum(d.quiz.quizQuestionsPerVideoPerMonth) + ' = ' + fmtNum(d.quiz.quizQueriesTotalPerMonth) + '. Total questions = ' + fmtNum(d.quiz.quizQueriesTotalPerMonth) + ' × ' + d.quiz.termMonths + ' = ' + fmtNum(d.quiz.quizQueriesTotalPerMonth * d.quiz.termMonths) + '.');
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

        html += '</div>';

        html += '<div class="ec-detail-block">';
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

        html += '</div>';

        html += '<div class="ec-detail-block">';
        html += '<div class="ec-detail-row ec-detail-row--total">';
        html += '<div class="ec-detail-label ec-result-label--strong">Total (before multiplier)</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost">' + fmtINR(d.totalPreMultiplier) + '</span><span class="ec-result-value-secondary">' + fmtUSD(d.totalPreMultiplier, fx) + '</span></div>';
        html += '</div>';
        html += '<div class="ec-detail-row ec-detail-row--total">';
        html += '<div class="ec-detail-label">× ' + INPUT_LABELS.costMultiplier + ' (' + fmtNum(d.costMultiplier) + ')</div>';
        html += '<div class="ec-detail-amount"><span class="ec-result-value ec-result-value--cost-total">' + fmtINR(costs.total) + '</span><span class="ec-result-value-secondary">' + fmtUSD(costs.total, fx) + '</span></div>';
        html += '</div>';
        html += '</div>';

        container.innerHTML = html;
    }

    window.EC_BREAKDOWN = { renderDetailedCostBreakdown: renderDetailedCostBreakdown };
})();
