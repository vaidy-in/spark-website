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

/** Whitepaper uses [[64]](url) style citation links; normalize to standard markdown links. */
function normalizeCitationBrackets(md) {
    return md.replace(/\[\[(\d+)\]\]\(([^)]+)\)/g, '[$1]($2)');
}

/**
 * Parse ## Citations block: lines like `[n] Title - https://...`
 * @returns {Record<string, { title: string, url: string }>}
 */
function parseCitationsMap(md) {
    const m = md.match(/^## Citations\s*$/m);
    if (!m || m.index == null) return {};
    const start = m.index + m[0].length;
    const rest = md.slice(start);
    const map = {};
    for (const line of rest.split('\n')) {
        const trimmed = line.trim();
        if (/^##\s+\S/.test(trimmed)) break;
        if (!/^\[\d+\]/.test(trimmed)) continue;
        const numM = trimmed.match(/^\[(\d+)\]\s+(.+)$/);
        if (!numM) continue;
        const urlM = numM[2].match(/\s+-\s+(https?:\/\/\S+)\s*$/);
        if (!urlM) continue;
        const num = numM[1];
        const title = numM[2].slice(0, urlM.index).trim();
        const url = urlM[1];
        map[num] = { title, url };
    }
    return map;
}

function normalizeUrlForCiteCompare(u) {
    try {
        let s = new URL(String(u).trim()).href;
        if (s.endsWith('/')) s = s.slice(0, -1);
        return s.toLowerCase();
    } catch {
        return String(u)
            .trim()
            .replace(/\/$/, '')
            .toLowerCase();
    }
}

/**
 * Turn marked output `<a href="url">64</a>` into `[64]` cite links when url matches bibliography.
 */
function decorateInlineCitationLinks(html, citeMap) {
    return html.replace(/<a\s+([^>]*)>(\d+)<\/a>/gi, (full, attrs, num) => {
        const hrefMatch = /\bhref\s*=\s*"([^"]+)"/i.exec(attrs);
        if (!hrefMatch) return full;
        const href = hrefMatch[1];
        if (!/^https?:\/\//i.test(href)) return full;
        const entry = citeMap[num];
        if (!entry) return full;
        if (normalizeUrlForCiteCompare(entry.url) !== normalizeUrlForCiteCompare(href)) {
            return full;
        }
        const hrefEsc = escapeHtml(href);
        const numEsc = escapeHtml(num);
        return `<a class="whitepaper-cite-ref" data-cite-id="${numEsc}" href="${hrefEsc}" target="_blank" rel="noopener noreferrer">[${numEsc}]</a>`;
    });
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
    const citeMap = parseCitationsMap(md);

    marked.use({ gfm: true });
    let rawHtml = marked.parse(md);
    const { html: withIds, tocEntries } = injectHeadingIdsAndCollectToc(rawHtml);
    rawHtml = withIds;
    rawHtml = wrapTables(rawHtml);
    rawHtml = decorateInlineCitationLinks(rawHtml, citeMap);
    rawHtml = addExternalLinkSafety(rawHtml);
    const safe = cleanPostHtml(rawHtml);

    const citeDataJson = JSON.stringify(citeMap);

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
        citeDataJson,
    });

    fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
    fs.writeFileSync(OUT_HTML, doc, 'utf8');
    console.log('[build-whitepaper] Wrote', OUT_HTML, `(${tocEntries.length} TOC entries)`);
}

main().catch((err) => {
    console.error('[build-whitepaper] Failed:', err);
    process.exit(1);
});
