/**
 * Enterprise Pricing Calculator - Compute module
 *
 * Pure cost and pricing computation. No DOM. Exposes via window.EC_COMPUTE.
 */

(function () {
    'use strict';

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
        const totalPct = volDisc + termDisc + earlyDisc;
        return Math.max(0, 1 - totalPct);
    }

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

        const assemblyAI = baseTotalVideoHours * inp.costAssemblyAI;

        const batchHrsSD = totalVideoHoursSD * inp.batchHrsPerVideoHr;
        const batchHrsHD = totalVideoHoursHD * inp.hdSdFactor * inp.batchHrsPerVideoHr;
        const batchSD = batchHrsSD * inp.costBatch;
        const batchHD = batchHrsHD * inp.costBatch;
        const batch = batchSD + batchHD;

        const geminiPipeline = (baseTotalVideoHours * inp.pipelineTokensIn / 1e6) * inp.costGeminiIn
            + (baseTotalVideoHours * inp.pipelineTokensOut / 1e6) * inp.costGeminiOut;

        const storageMonthSum = (termMonths * (termMonths + 1)) / 2;
        const monthlyNewGB_SD = videoHoursSDPerMonth * inp.gbPerVideoHr;
        const monthlyNewGB_HD = videoHoursHDPerMonth * inp.gbPerVideoHr * inp.hdSdFactor;
        const storageGB_SD = monthlyNewGB_SD * termMonths;
        const storageGB_HD = monthlyNewGB_HD * termMonths;
        const storageGB = storageGB_SD + storageGB_HD;
        const s3StorageCost_SD = monthlyNewGB_SD * storageMonthSum * inp.costS3Storage;
        const s3StorageCost_HD = monthlyNewGB_HD * storageMonthSum * inp.costS3Storage;
        const s3StorageCost = s3StorageCost_SD + s3StorageCost_HD;

        const gbPerHr = 1;
        const s3StreamingPerMonth = inp.seats * inp.streamingHrsPerSeat * gbPerHr * inp.costS3Transfer;
        const s3Streaming = s3StreamingPerMonth * termMonths;

        const includeTutor = inp.tier === 'premium' || inp.tutorInVanilla;
        const tutorQueriesTotal = includeTutor ? inp.seats * inp.tutorQueriesPerSeat : 0;
        const geminiTutorPerMonth = (tutorQueriesTotal * inp.tutorTokensIn / 1e6) * inp.costGeminiIn
            + (tutorQueriesTotal * inp.tutorTokensOut / 1e6) * inp.costGeminiOut;
        const geminiTutor = geminiTutorPerMonth * termMonths;

        const quizQueriesTotalPerMonth = baseVideoHoursPerMonth * inp.quizQuestionsPerHour;
        const geminiQuizPerMonth = (quizQueriesTotalPerMonth * inp.quizTokensIn / 1e6) * inp.costGeminiIn
            + (quizQueriesTotalPerMonth * inp.quizTokensOut / 1e6) * inp.costGeminiOut;
        const geminiQuiz = geminiQuizPerMonth * termMonths;

        const embeddingTokensPerMonth = inp.embeddingTokensPerVideoHr * baseVideoHoursPerMonth;
        const openAI = (embeddingTokensPerMonth / 1e6) * inp.costOpenAIEmbedding * termMonths;

        const gemini = geminiPipeline + geminiTutor + geminiQuiz;

        const rawCosts = {
            assemblyAI: assemblyAI,
            batch: batch,
            s3Storage: s3StorageCost,
            s3Streaming: s3Streaming,
            gemini: gemini,
            openAI: openAI,
        };

        const costs = {};
        let total = 0;
        for (const k in rawCosts) {
            costs[k] = rawCosts[k] * inp.costMultiplier;
            total += costs[k];
        }
        costs.total = total;
        costs.storageGB = storageGB;

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
                baseVideoHoursPerMonth,
                quizQuestionsPerHour: inp.quizQuestionsPerHour,
                quizQueriesTotalPerMonth: quizQueriesTotalPerMonth,
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

        return costs;
    }

    function computePricing(inp, costs) {
        const termMonths = inp.term;
        const costPerSeatPerMonth = costs.total / (inp.seats * termMonths);
        const listPricePerSeatPerMonth = inp.basePricePerSeatINR;
        const volDisc = getVolumeDiscount(inp);
        const termDisc = getTermDiscount(inp);
        const earlyDisc = inp.earlyDisc;
        const combinedDiscountFactor = getCombinedDiscountFactor(volDisc, termDisc, earlyDisc);
        const totalDiscountPct = 1 - combinedDiscountFactor;
        const totalDiscountPctDisplay = volDisc + termDisc + earlyDisc;
        const netPricePerSeatPerMonth = listPricePerSeatPerMonth * combinedDiscountFactor;
        const acvINR = netPricePerSeatPerMonth * inp.seats * 12;
        const setupFeeINR = inp.setupFeeINR;
        const tcvINR = netPricePerSeatPerMonth * inp.seats * termMonths + setupFeeINR;
        const revenueINR = netPricePerSeatPerMonth * inp.seats * termMonths;

        const yearData = [];
        let athiyaAmountINR = 0;
        let remainingMonths = termMonths;
        let currentYear = 1;

        while (remainingMonths > 0) {
            const monthsInThisYear = Math.min(12, remainingMonths);
            const revThisYear = netPricePerSeatPerMonth * inp.seats * monthsInThisYear;
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

        const sparkGrossINR = revenueINR - athiyaAmountINR;
        const sparkNetINR = sparkGrossINR + setupFeeINR - costs.total;
        const marginPct = costs.total > 0 ? (sparkNetINR / costs.total) * 100 : 0;

        return {
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
            numYears: yearData.length,
            costPerSeatPerMonth,
        };
    }

    window.EC_COMPUTE = {
        computeCosts: computeCosts,
        computePricing: computePricing,
        getVolumeDiscount: getVolumeDiscount,
        getTermDiscount: getTermDiscount,
        getCombinedDiscountFactor: getCombinedDiscountFactor,
    };
})();
