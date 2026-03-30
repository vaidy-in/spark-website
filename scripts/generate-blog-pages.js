#!/usr/bin/env node
/**
 * Static blog for GitHub Pages: same UI as the legacy blog (main post left, sidebar right,
 * mobile list + article). Post bodies are generated HTML files under blog/*.html (no runtime Beehiiv fetch).
 *
 * Env: BLOG_POSTS_URL, BLOG_POSTS_JSON_FILE, SITE_URL, BLOG_SITE_OUTPUT
 */

const fs = require('fs');
const path = require('path');
const { cleanPostHtml } = require('./lib/sanitize-post-html');

const SCRIPT_DIR = path.dirname(__filename);
const MARKETING_ROOT = path.resolve(SCRIPT_DIR, '..');
const OUT_DIR =
    process.env.BLOG_SITE_OUTPUT ||
    path.join(MARKETING_ROOT, '.site-output');

const DEFAULT_API =
    process.env.BLOG_POSTS_URL ||
    'https://getblogposts-eyyuwkjlza-uc.a.run.app';

const MARKER_HEAD_EXTRA = '<!-- GENERATED_BLOG_HEAD_EXTRA -->';
const BODY_START = '<!-- GENERATED_BLOG_BODY_START -->';
const BODY_END = '<!-- GENERATED_BLOG_BODY_END -->';

function normalizeSiteUrl(raw) {
    let u = (raw || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) {
        u = `https://${u}`;
    }
    if (!u.endsWith('/')) {
        u += '/';
    }
    return u;
}

function resolveSiteUrl() {
    const explicit = normalizeSiteUrl(process.env.SITE_URL);
    if (explicit) return explicit;
    const repo = process.env.GITHUB_REPOSITORY;
    if (repo) {
        const [owner, name] = repo.split('/');
        if (owner && name) {
            return normalizeSiteUrl(`https://${owner}.github.io/${name}/`);
        }
    }
    return '';
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function absoluteUrl(siteUrl, relPath) {
    const base = siteUrl || 'http://127.0.0.1:8080/';
    try {
        return new URL(relPath.replace(/^\//, ''), base).href;
    } catch {
        return `${base.replace(/\/?$/, '/')}${relPath.replace(/^\//, '')}`;
    }
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
}

function getElapsedTime(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
            }
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        }
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        }
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return months === 1 ? '1 month ago' : `${months} months ago`;
        }
        const years = Math.floor(diffDays / 365);
        return years === 1 ? '1 year ago' : `${years} years ago`;
    } catch {
        return '';
    }
}

function slugifyTitle(title) {
    return String(title || 'post')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function baseSlugFromPost(post, index) {
    try {
        const u = new URL(post.link);
        const parts = u.pathname.split('/').filter(Boolean);
        const pi = parts.indexOf('p');
        if (pi >= 0 && parts[pi + 1]) {
            return sanitizeSlugSegment(parts[pi + 1]);
        }
    } catch (_) {
        /* ignore */
    }
    return sanitizeSlugSegment(slugifyTitle(post.title || `post-${index}`));
}

function sanitizeSlugSegment(s) {
    const out = String(s)
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
    return out || 'post';
}

const AVATAR_SRC_HINT = /profile_picture|gravatar\.com\/avatar|\/avatars\/|user_content\/.*\/profile/i;

/**
 * Tag likely author headshots so CSS can render a small Stripe-style thumbnail.
 */
function markAuthorAvatarImgs(html) {
    if (!html) return html;
    return html.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
        if (/\bclass="[^"]*blog-post-author-avatar/.test(attrs)) {
            return full;
        }
        const srcM = attrs.match(/\bsrc="([^"]*)"/i);
        const altM = attrs.match(/\balt="([^"]*)"/i);
        const src = srcM ? srcM[1] : '';
        const alt = altM ? altM[1].trim() : '';
        if (!AVATAR_SRC_HINT.test(src) && alt.toLowerCase() !== 'author') {
            return full;
        }
        if (/\bclass="/i.test(attrs)) {
            return full.replace(
                /\bclass="([^"]*)"/i,
                (_, c) => `class="blog-post-author-avatar ${c}"`,
            );
        }
        return `<img class="blog-post-author-avatar"${attrs}>`;
    });
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function loadPostsDataFromFile(filePath) {
    const abs = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(abs)) {
        throw new Error(`BLOG_POSTS_JSON_FILE not found: ${abs}`);
    }
    const data = JSON.parse(fs.readFileSync(abs, 'utf8'));
    if (!data || !data.success || !Array.isArray(data.posts)) {
        throw new Error('Invalid JSON shape (expected success + posts[])');
    }
    if (data.posts.length === 0) {
        throw new Error('No posts in JSON file');
    }
    return data;
}

async function fetchAllPostsJson() {
    const url = `${DEFAULT_API}?force_refresh=1`;
    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (!data || !data.success || !Array.isArray(data.posts)) {
                throw new Error('Invalid API response');
            }
            if (data.posts.length === 0) throw new Error('No posts returned');
            return data;
        } catch (e) {
            lastErr = e;
            await sleep(1000 * 2 ** attempt);
        }
    }
    throw lastErr;
}

async function loadPostsData() {
    const jsonFile = (process.env.BLOG_POSTS_JSON_FILE || '').trim();
    if (jsonFile) {
        console.log('[generate-blog-pages] Loading posts from file:', jsonFile);
        return loadPostsDataFromFile(jsonFile);
    }
    console.log('[generate-blog-pages] Fetching posts from API…');
    return fetchAllPostsJson();
}

function shouldSkipDir(name) {
    return (
        name === '.site-output' ||
        name === '.blog-cache' ||
        name === 'node_modules' ||
        name === '.git'
    );
}

function copyMarketingTree(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
        if (shouldSkipDir(ent.name)) continue;
        const from = path.join(src, ent.name);
        const to = path.join(dest, ent.name);
        if (ent.isDirectory()) {
            copyMarketingTree(from, to);
        } else if (ent.isFile()) {
            fs.copyFileSync(from, to);
        }
    }
}

function injectBlogIndexHeadExtra(blogHtmlPath, siteUrl) {
    let html = fs.readFileSync(blogHtmlPath, 'utf8');
    if (!html.includes(MARKER_HEAD_EXTRA)) return;
    const canonical = absoluteUrl(siteUrl, 'blog.html');
    const block = `
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Blog - Spark">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Blog - Spark">`.trim();
    html = html.replace(MARKER_HEAD_EXTRA, block);
    fs.writeFileSync(blogHtmlPath, html, 'utf8');
}

function replaceBlogBody(blogHtmlPath, innerHtml) {
    let html = fs.readFileSync(blogHtmlPath, 'utf8');
    const start = html.indexOf(BODY_START);
    const end = html.indexOf(BODY_END);
    if (start === -1 || end === -1 || end <= start) {
        throw new Error('blog.html missing GENERATED_BLOG_BODY markers');
    }
    const before = html.slice(0, start + BODY_START.length);
    const after = html.slice(end);
    html = `${before}\n${innerHtml}\n${after}`;
    fs.writeFileSync(blogHtmlPath, html, 'utf8');
}

/** Sidebar/post list href: from blog.html use blog/slug.html; from blog/slug.html use slug.html only. */
function postListHref(slug, fromBlogSubdirectory) {
    return fromBlogSubdirectory ? `${slug}.html` : `blog/${slug}.html`;
}

function adjacentPostLink(direction, post, slug, fromBlogSubdirectory) {
    const href = escapeHtml(postListHref(slug, fromBlogSubdirectory));
    const isNext = direction === 'next';
    const rel = isNext ? 'next' : 'prev';
    const icon = isNext ? 'chevron_right' : 'chevron_left';
    const label = isNext ? 'Next post' : 'Previous post';
    const dateRaw = post.date ? String(post.date) : '';
    const dateFormatted = dateRaw ? formatDate(dateRaw) : '';
    const dateBit =
        dateFormatted !== ''
            ? `<span class="text-slate-300" aria-hidden="true">·</span><time class="text-slate-500 tabular-nums" datetime="${escapeHtml(dateRaw)}">${escapeHtml(dateFormatted)}</time>`
            : '';
    const title = escapeHtml(post.title || 'Untitled');

    const anchorAlign = isNext
        ? 'w-full max-w-full sm:max-w-md sm:ml-auto'
        : 'w-full max-w-full sm:max-w-md';

    if (isNext) {
        return `<a href="${href}" rel="${rel}" class="group block ${anchorAlign} rounded-lg px-3 py-4 -mx-1 -my-1 hover:bg-slate-50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
        <div class="flex flex-col items-end gap-2.5 text-right">
            <div class="inline-flex flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5 text-sm text-slate-500 group-hover:text-slate-600">
                <span>${label}</span>
                ${dateBit}
                <span class="material-symbols-rounded text-[1.125rem] leading-none text-slate-400 group-hover:text-slate-500" aria-hidden="true">${icon}</span>
            </div>
            <span class="block w-full text-lg font-semibold leading-snug text-slate-900 group-hover:text-brand-600 line-clamp-2">${title}</span>
        </div>
    </a>`;
    }

    return `<a href="${href}" rel="${rel}" class="group block ${anchorAlign} rounded-lg px-3 py-4 -mx-1 -my-1 hover:bg-slate-50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
        <div class="flex flex-col items-start gap-2.5">
            <div class="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-slate-500 group-hover:text-slate-600">
                <span class="material-symbols-rounded text-[1.125rem] leading-none text-slate-400 group-hover:text-slate-500" aria-hidden="true">${icon}</span>
                <span>${label}</span>
                ${dateBit}
            </div>
            <span class="block w-full text-lg font-semibold leading-snug text-slate-900 group-hover:text-brand-600 line-clamp-2">${title}</span>
        </div>
    </a>`;
}

function buildPrevNextNavHtml(
    focusIndex,
    posts,
    slugByIndex,
    fromBlogSubdirectory,
) {
    const prevIdx = focusIndex - 1;
    const nextIdx = focusIndex + 1;
    const hasPrev = prevIdx >= 0;
    const hasNext = nextIdx < posts.length;

    if (!hasPrev && !hasNext) {
        return '';
    }

    const prevPart = hasPrev
        ? adjacentPostLink(
            'prev',
            posts[prevIdx],
            slugByIndex[prevIdx],
            fromBlogSubdirectory,
        )
        : '';
    const nextPart = hasNext
        ? adjacentPostLink(
            'next',
            posts[nextIdx],
            slugByIndex[nextIdx],
            fromBlogSubdirectory,
        )
        : '';

    return `
            <nav class="mt-10 pt-8 border-t border-slate-200" aria-label="Adjacent posts">
                <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-10">
                    <div class="min-w-0 flex-1">${prevPart}</div>
                    <div class="min-w-0 flex-1 sm:flex sm:justify-end">${nextPart}</div>
                </div>
            </nav>`;
}

function articleCardBody(post, contentHtml, postNavHtml) {
    const elapsed = getElapsedTime(post.date);
    const dateStr = formatDate(post.date);
    const nav = postNavHtml || '';
    return `
        <div class="p-8 lg:p-12">
            <div class="text-base text-slate-500 mb-4">
                <div class="flex flex-wrap items-center gap-2">
                    <span>${escapeHtml(dateStr)}</span>
                    ${
    elapsed
        ? `<span class="text-slate-400">•</span><span>${escapeHtml(elapsed)}</span>`
        : ''
}
                </div>
                ${
    post.author
        ? `<div class="mt-1">${escapeHtml(post.author)}</div>`
        : ''
}
            </div>
            <h1 class="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6">
                ${escapeHtml(post.title || 'Untitled')}
            </h1>
            <div class="prose prose-lg max-w-none blog-post-content text-slate-700">
                ${contentHtml}
            </div>
            ${nav}
        </div>`;
}

function mobilePostCard(post, slug, isActive, fromBlogSubdirectory) {
    const elapsed = getElapsedTime(post.date);
    const dateStr = formatDate(post.date);
    const ring = isActive
        ? 'ring-2 ring-brand-500 border-brand-500'
        : 'border-slate-200';
    const href = postListHref(slug, fromBlogSubdirectory);
    return `
                    <div class="bg-white rounded-lg border ${ring} p-4 hover:shadow-md transition-shadow">
                        <a href="${escapeHtml(href)}" class="block cursor-pointer">
                            <div class="text-base text-slate-500 mb-2">
                                <div class="flex flex-wrap items-center gap-2">
                                    <span>${escapeHtml(dateStr)}</span>
                                    ${
    elapsed
        ? `<span class="text-slate-400">•</span><span>${escapeHtml(elapsed)}</span>`
        : ''
}
                                </div>
                                ${
    post.author
        ? `<div class="mt-1">${escapeHtml(post.author)}</div>`
        : ''
}
                            </div>
                            <h3 class="text-base font-bold text-slate-900 mb-2">
                                ${escapeHtml(post.title || 'Untitled')}
                            </h3>
                            <p class="text-base text-slate-600 line-clamp-3 mb-3">
                                ${escapeHtml(post.excerpt || '')}
                            </p>
                            <span class="text-base text-brand-600 font-medium">Read more →</span>
                        </a>
                    </div>`;
}

function desktopSidebarItem(post, slug, isActive, fromBlogSubdirectory) {
    const elapsed = getElapsedTime(post.date);
    const dateStr = formatDate(post.date);
    const borderClass = isActive
        ? 'pb-6 border-b-2 border-brand-500 last:border-0 last:pb-0'
        : 'pb-6 border-b border-slate-200 last:border-0 last:pb-0';
    const href = postListHref(slug, fromBlogSubdirectory);
    return `
                        <div class="${borderClass}">
                            <a href="${escapeHtml(href)}" class="block cursor-pointer">
                                <div class="text-base text-slate-500 mb-2">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <span>${escapeHtml(dateStr)}</span>
                                        ${
    elapsed
        ? `<span class="text-slate-400">•</span><span>${escapeHtml(elapsed)}</span>`
        : ''
}
                                    </div>
                                    ${
    post.author
        ? `<div class="mt-1">${escapeHtml(post.author)}</div>`
        : ''
}
                                </div>
                                <h3 class="text-base font-bold text-slate-900 mb-2 line-clamp-2">
                                    ${escapeHtml(post.title || 'Untitled')}
                                </h3>
                                <p class="text-base text-slate-600 line-clamp-2 mb-3">
                                    ${escapeHtml(post.excerpt || '')}
                                </p>
                                <span class="text-base text-brand-600 hover:text-brand-700 font-medium">Read more →</span>
                            </a>
                        </div>`;
}

function buildBlogMainHtml(posts, slugByIndex, focusIndex, fromBlogSubdirectory) {
    const post = posts[focusIndex];
    const contentHtml = markAuthorAvatarImgs(
        cleanPostHtml(post.fullContent || post.excerpt || ''),
    );
    const postNavHtml = buildPrevNextNavHtml(
        focusIndex,
        posts,
        slugByIndex,
        fromBlogSubdirectory,
    );
    const bodyInner = articleCardBody(post, contentHtml, postNavHtml);
    const articleShell = `<article class="bg-white rounded-xl border border-slate-200 overflow-hidden">${bodyInner}</article>`;

    const mobileCards = posts
        .map((p, i) =>
            mobilePostCard(p, slugByIndex[i], i === focusIndex, fromBlogSubdirectory),
        )
        .join('');

    const sidebarItems = posts
        .map((p, i) =>
            desktopSidebarItem(p, slugByIndex[i], i === focusIndex, fromBlogSubdirectory),
        )
        .join('');

    return `
            <div id="blog-content">
                <div class="lg:hidden mb-12">
                    <h2 class="text-xl font-bold text-slate-900 mb-6">Recent Posts</h2>
                    <div id="blog-mobile-posts" class="space-y-4">
                        ${mobileCards}
                    </div>
                </div>

                <div class="lg:hidden mb-12" id="blog-mobile-selected-post">
                    ${articleShell}
                </div>

                <div class="grid lg:grid-cols-3 gap-12">
                    <div class="hidden lg:block lg:col-span-2">
                        <article id="blog-latest-post" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            ${bodyInner}
                        </article>
                    </div>

                    <aside class="hidden lg:block lg:col-span-1">
                        <div class="sticky top-24">
                            <h2 class="text-lg font-bold text-slate-900 mb-6">Recent Posts</h2>
                            <div id="blog-sidebar-posts" class="space-y-6">
                                ${sidebarItems}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>`;
}

function buildJsonLdArticle({ title, canonical, dateISO, author }) {
    const obj = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    };
    if (dateISO) {
        obj.datePublished = dateISO;
        obj.dateModified = dateISO;
    }
    if (author) obj.author = { '@type': 'Person', name: author };
    return JSON.stringify(obj);
}

function buildPostPageHtml({
    post,
    posts,
    slugByIndex,
    focusIndex,
    siteUrl,
    slug,
}) {
    const rel = `blog/${slug}.html`;
    const canonicalHref = absoluteUrl(siteUrl, rel);
    const title = escapeHtml(post.title || 'Blog post');
    const desc = escapeHtml(
        (post.excerpt || '').replace(/\s+/g, ' ').trim().slice(0, 160) ||
            'Spark blog post',
    );
    const jsonLd = buildJsonLdArticle({
        title: post.title || 'Blog post',
        canonical: canonicalHref,
        dateISO: post.date || '',
        author: post.author || '',
    });

    const mainInner = buildBlogMainHtml(
        posts,
        slugByIndex,
        focusIndex,
        true,
    );
    const hero = `
            <div class="text-center mb-16">
                <h1 class="text-4xl font-extrabold text-slate-900 mb-6">The Spark Dispatch</h1>
                <p class="text-xl text-slate-600">
                    Updates, insights, and stories about Spark and the world of online teaching.
                </p>
            </div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Spark</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${escapeHtml(canonicalHref)}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${escapeHtml(canonicalHref)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <script type="application/ld+json">${jsonLd}</script>
    <link rel="stylesheet" href="../css/tailwind.css">
    <link rel="stylesheet" href="../css/components/blog.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0,0" rel="stylesheet" />
    <script src="../js/layout.js"></script>
    <script src="../js/blog-mobile-scroll.js"></script>
</head>
<body class="preload-hidden bg-white text-slate-900 antialiased pt-16">

<main class="pt-20 pb-24">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        ${hero}
        ${mainInner}
    </div>
</main>

</body>
</html>
`;
}

function collectHtmlRelPaths(dir, relBase = '') {
    const out = [];
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (ent.name.startsWith('.')) continue;
        const rel = relBase ? `${relBase}/${ent.name}` : ent.name;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            out.push(...collectHtmlRelPaths(full, rel));
        } else if (ent.name.endsWith('.html')) {
            out.push(rel.split(path.sep).join('/'));
        }
    }
    return out.sort();
}

function buildSitemapXml(siteUrl, relPaths) {
    const lines = relPaths.map((p) => {
        const loc = escapeHtml(absoluteUrl(siteUrl, p));
        return `  <url><loc>${loc}</loc></url>`;
    });
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join('\n')}
</urlset>
`;
}

function buildRobotsTxt(siteUrl) {
    const base = (siteUrl || '').trim();
    if (!base || base.startsWith('http://127.0.0.1')) {
        return `User-agent: *
Allow: /
`;
    }
    const sitemapUrl = escapeHtml(absoluteUrl(siteUrl, 'sitemap.xml'));
    return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}

async function main() {
    const data = await loadPostsData();
    const posts = data.posts;

    const usedSlugs = new Map();
    const slugByIndex = posts.map((post, i) => {
        let base = baseSlugFromPost(post, i);
        let slug = base;
        let n = 2;
        while (usedSlugs.has(slug)) {
            slug = `${base}-${n++}`;
        }
        usedSlugs.set(slug, true);
        return slug;
    });

    const siteUrl = resolveSiteUrl();
    console.log(
        '[generate-blog-pages] SITE_URL:',
        siteUrl || '(localhost fallback)',
    );

    fs.rmSync(OUT_DIR, { recursive: true, force: true });
    copyMarketingTree(MARKETING_ROOT, OUT_DIR);

    const blogOut = path.join(OUT_DIR, 'blog');
    fs.mkdirSync(blogOut, { recursive: true });

    const blogMainHtml = buildBlogMainHtml(posts, slugByIndex, 0, false);
    replaceBlogBody(path.join(OUT_DIR, 'blog.html'), blogMainHtml);
    injectBlogIndexHeadExtra(path.join(OUT_DIR, 'blog.html'), siteUrl);

    for (let i = 0; i < posts.length; i++) {
        const slug = slugByIndex[i];
        const html = buildPostPageHtml({
            post: posts[i],
            posts,
            slugByIndex,
            focusIndex: i,
            siteUrl,
            slug,
        });
        fs.writeFileSync(path.join(blogOut, `${slug}.html`), html, 'utf8');
    }

    const htmlPaths = collectHtmlRelPaths(OUT_DIR);
    fs.writeFileSync(
        path.join(OUT_DIR, 'sitemap.xml'),
        buildSitemapXml(siteUrl, htmlPaths),
        'utf8',
    );
    fs.writeFileSync(
        path.join(OUT_DIR, 'robots.txt'),
        buildRobotsTxt(siteUrl),
        'utf8',
    );

    console.log(
        '[generate-blog-pages] Done.',
        posts.length,
        'posts,',
        htmlPaths.length,
        'HTML URLs in sitemap',
    );
}

main().catch((err) => {
    console.error('[generate-blog-pages] Failed:', err.message || err);
    process.exit(1);
});
