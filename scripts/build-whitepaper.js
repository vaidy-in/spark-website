#!/usr/bin/env node
/**
 * Builds marketing/resources/indic-languages-white-paper.html from the canonical markdown source.
 * Run from repo root: node marketing/scripts/build-whitepaper.js
 *
 * Layout shell and TOC helpers live in ./lib/whitepaper-template.js for reuse by future papers.
 */

const fs = require('fs');
const path = require('path');
const { cleanPostHtml } = require('./lib/sanitize-post-html');
const {
    escapeHtml,
    injectHeadingIdsAndCollectToc,
    buildWhitepaperDocument,
} = require('./lib/whitepaper-template');

const SCRIPT_DIR = path.dirname(__filename);
const MARKETING_ROOT = path.resolve(SCRIPT_DIR, '..');
const REPO_ROOT = path.resolve(MARKETING_ROOT, '..');
const MD_SOURCE = path.join(
    REPO_ROOT,
    'docs/marketing/newsletters/indic-language-challenges.md',
);
const OUT_HTML = path.join(
    MARKETING_ROOT,
    'resources',
    'indic-languages-white-paper.html',
);

const PAGE_TITLE = 'Spoken by Billions, heard by few – Indic languages &amp; AI';
const META_DESC =
    'A deep dive into the real challenges of building AI for Indic languages, and what Spark is doing about it. Research, citations, and quality gates for ASR and LLMs.';

/** First # heading becomes the page H1; strip it from markdown so body has no duplicate. */
function stripLeadingH1(md) {
    const lines = md.split('\n');
    if (lines.length === 0) return md;
    if (/^#\s+/.test(lines[0].trimEnd())) {
        lines.shift();
        while (lines.length && lines[0].trim() === '') {
            lines.shift();
        }
        return lines.join('\n');
    }
    return md;
}

/** Remove the repeated tagline + first horizontal rule (already shown in the page hero). */
function stripHeroDuplicate(md) {
    const lines = md.split('\n');
    let i = 0;
    while (i < lines.length && lines[i].trim() === '') i++;
    if (i < lines.length && /^\*\*A deep dive/.test(lines[i].trim())) {
        while (i < lines.length && lines[i].trim() !== '---') i++;
        if (i < lines.length) i++;
        while (i < lines.length && lines[i].trim() === '') i++;
        return lines.slice(i).join('\n');
    }
    return md;
}

/** Whitepaper uses [[64]](url) style citation links; normalize to standard markdown. */
function normalizeCitationBrackets(md) {
    return md.replace(/\[\[(\d+)\]\]/g, '[$1]');
}

function wrapTables(html) {
    return html.replace(/<table>/g, '<div class="blog-longform-table-wrap"><table>').replace(
        /<\/table>/g,
        '</table></div>',
    );
}

/** Open external http(s) links in a new tab when they have no target yet. */
function addExternalLinkSafety(html) {
    return html.replace(
        /<a\s+([^>]*?)href="(https?:[^"]+)"([^>]*)>/gi,
        (full, before, href, after) => {
            if (/\btarget\s*=/i.test(before + after)) {
                return full;
            }
            return `<a ${before}href="${href}"${after} target="_blank" rel="noopener noreferrer">`;
        },
    );
}

async function main() {
    if (!fs.existsSync(MD_SOURCE)) {
        console.error('[build-whitepaper] Source not found:', MD_SOURCE);
        process.exit(1);
    }
    const { marked } = await import('marked');
    let md = fs.readFileSync(MD_SOURCE, 'utf8');
    md = stripLeadingH1(md);
    md = stripHeroDuplicate(md);
    md = normalizeCitationBrackets(md);

    marked.use({ gfm: true });
    let rawHtml = marked.parse(md);
    const { html: withIds, tocEntries } = injectHeadingIdsAndCollectToc(rawHtml);
    rawHtml = withIds;
    rawHtml = wrapTables(rawHtml);
    rawHtml = addExternalLinkSafety(rawHtml);
    const safe = cleanPostHtml(rawHtml);

    const doc = buildWhitepaperDocument({
        pageTitle: PAGE_TITLE,
        metaDescription: META_DESC,
        heroKicker: 'Whitepaper',
        heroTitle: escapeHtml('Spoken by Billions, heard by few'),
        heroSubHtml: escapeHtml(
            'A deep dive into the real challenges of building AI for Indic languages, and what we are doing about it at Spark.',
        ),
        tocEntries,
        articleHtml: safe,
        containerWidth: '7xl',
    });

    fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
    fs.writeFileSync(OUT_HTML, doc, 'utf8');
    console.log('[build-whitepaper] Wrote', OUT_HTML, `(${tocEntries.length} TOC entries)`);
}

main().catch((err) => {
    console.error('[build-whitepaper] Failed:', err);
    process.exit(1);
});
