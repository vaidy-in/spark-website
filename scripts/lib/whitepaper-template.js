/**
 * Shared whitepaper page shell, heading anchors, and table of contents HTML.
 * Used by build-whitepaper.js; extend for additional papers via the same helpers.
 */

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Plain text from a small HTML fragment (heading innerHTML). */
function stripInlineHtml(html) {
    return String(html)
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
        .trim();
}

/**
 * Add stable id attributes to h2/h3 and collect entries for the TOC.
 * @param {string} html
 * @returns {{ html: string, tocEntries: { depth: number, text: string, id: string }[] }}
 */
function injectHeadingIdsAndCollectToc(html) {
    const slugCounts = new Map();
    const tocEntries = [];

    function uniqueSlug(plain, index) {
        let base = plain
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\p{L}\p{N}-]+/gu, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        if (!base) {
            base = `section-${index}`;
        }
        let n = slugCounts.get(base) ?? 0;
        slugCounts.set(base, n + 1);
        const id = n === 0 ? base : `${base}-${n}`;
        return id;
    }

    let i = 0;
    const out = html.replace(
        /<h([23])>([\s\S]*?)<\/h\1>/g,
        (full, depthStr, inner) => {
            const depth = parseInt(depthStr, 10);
            const plain = stripInlineHtml(inner);
            const id = uniqueSlug(plain, i);
            tocEntries.push({ depth, text: plain, id });
            i++;
            return `<h${depth} id="${escapeHtml(id)}">${inner}</h${depth}>`;
        },
    );

    return { html: out, tocEntries };
}

/**
 * @param { { depth: number, text: string, id: string }[] } entries
 * @param {string} classSuffix modifier e.g. 'desktop' | 'mobile'
 */
function buildTocListHtml(entries, classSuffix) {
    if (!entries.length) {
        return '';
    }
    const ulClass =
        classSuffix === 'mobile'
            ? 'whitepaper-toc-list whitepaper-toc-list--mobile'
            : 'whitepaper-toc-list';

    let html = `<ul class="${ulClass}">`;
    let i = 0;
    while (i < entries.length) {
        const e = entries[i];
        if (e.depth === 2) {
            html += `<li class="whitepaper-toc-item whitepaper-toc-item--h2"><a class="whitepaper-toc-link" href="#${escapeHtml(e.id)}">${escapeHtml(e.text)}</a>`;
            i++;
            if (i < entries.length && entries[i].depth === 3) {
                html += '<ul class="whitepaper-toc-list whitepaper-toc-list--nested">';
                while (i < entries.length && entries[i].depth === 3) {
                    const s = entries[i];
                    html += `<li class="whitepaper-toc-item whitepaper-toc-item--h3"><a class="whitepaper-toc-link" href="#${escapeHtml(s.id)}">${escapeHtml(s.text)}</a></li>`;
                    i++;
                }
                html += '</ul>';
            }
            html += '</li>';
        } else {
            html += `<li class="whitepaper-toc-item whitepaper-toc-item--h3"><a class="whitepaper-toc-link" href="#${escapeHtml(e.id)}">${escapeHtml(e.text)}</a></li>`;
            i++;
        }
    }
    html += '</ul>';
    return html;
}

function buildTocNav(entries, variant) {
    const isMobile = variant === 'mobile';
    const list = buildTocListHtml(entries, isMobile ? 'mobile' : 'desktop');
    if (!list) {
        return '';
    }
    if (isMobile) {
        return `
<details class="whitepaper-toc-mobile lg:hidden mb-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <summary class="whitepaper-toc-mobile-summary text-base font-medium text-slate-900 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg py-2">On this page</summary>
    <nav class="whitepaper-toc whitepaper-toc--mobile mt-3 pb-1" data-whitepaper-toc="mobile" aria-label="On this page">${list}</nav>
</details>`.trim();
    }
    return `
<nav class="whitepaper-toc whitepaper-toc--desktop hidden lg:block" data-whitepaper-toc="desktop" aria-label="On this page">
    <p class="whitepaper-toc-title">On this page</p>
    ${list}
</nav>`.trim();
}

/**
 * Full HTML document for a whitepaper (shell only; article body injected).
 */
function buildWhitepaperDocument({
    pageTitle,
    metaDescription,
    heroKicker,
    heroTitle,
    heroSubHtml,
    tocEntries,
    articleHtml,
    /** Wider than default articles so TOC + column fit */
    containerWidth = '7xl',
    /** JSON string for inline citation hover previews (see whitepaper-citations.js) */
    citeDataJson = null,
}) {
    const citeScripts =
        citeDataJson != null && citeDataJson !== ''
            ? `
<script type="application/json" id="whitepaper-cite-data">${citeDataJson}</script>
<script src="../js/whitepaper-citations.js" defer></script>`
            : '';
    const tocDesktop = buildTocNav(tocEntries, 'desktop');
    const tocMobile = buildTocNav(tocEntries, 'mobile');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}">
    <link rel="stylesheet" href="../css/tailwind.css">
    <link rel="stylesheet" href="../css/components/blog.css">
    <link rel="stylesheet" href="../css/components/whitepaper.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0,0" rel="stylesheet" />
    <script src="../js/layout.js"></script>
    <script src="../js/whitepaper-toc.js" defer></script>
</head>
<body class="preload-hidden bg-white text-slate-900 antialiased pt-16">

<main class="pt-20 pb-24 whitepaper-main" data-container-width="${containerWidth}">
    <div class="whitepaper-layout">
        <aside class="whitepaper-toc-aside" aria-label="Document outline">
            ${tocDesktop}
        </aside>
        <div class="whitepaper-article-column">
            <p class="text-base font-semibold tracking-[0.18em] uppercase text-brand-600 mb-3">${escapeHtml(heroKicker)}</p>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                ${heroTitle}
            </h1>
            <p class="text-lg text-slate-600 leading-relaxed mb-6 max-w-3xl">
                ${heroSubHtml}
            </p>
            ${tocMobile}
            <div class="prose prose-lg max-w-none blog-post-content text-slate-700 whitepaper-body">
                ${articleHtml}
            </div>
        </div>
    </div>
</main>
${citeScripts}
</body>
</html>
`;
}

module.exports = {
    escapeHtml,
    injectHeadingIdsAndCollectToc,
    buildTocNav,
    buildWhitepaperDocument,
};
