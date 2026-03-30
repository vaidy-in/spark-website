/**
 * Shared HTML sanitization for marketing long-form content (blog posts, whitepapers).
 */

const sanitizeHtml = require('sanitize-html');

const SANITIZE_OPTIONS = {
    allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
        'blockquote', 'ul', 'ol', 'li', 'a', 'em', 'strong', 'i', 'b',
        'img', 'div', 'span', 'pre', 'code', 'table', 'thead', 'tbody',
        'tr', 'td', 'th', 'small', 'sup', 'sub', 'mark', 'del', 'strike',
        'abbr', 'kbd', 'cite', 'q', 'ins', 'u', 's',
    ],
    allowedAttributes: {
        a: ['href', 'target', 'rel', 'title'],
        img: ['src', 'alt', 'title', 'class'],
        h2: ['id', 'class'],
        h3: ['id', 'class'],
        h4: ['id', 'class'],
        h5: ['id', 'class'],
        h6: ['id', 'class'],
        '*': ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
    exclusiveFilter(frame) {
        return frame.tag === 'h1';
    },
};

/**
 * Beehiiv uses empty divs with inline border-top (dashed/dotted); we strip `style` in sanitize,
 * so convert those dividers to <hr> before sanitizing.
 */
function beehiivDividerDivsToHr(html) {
    if (!html || typeof html !== 'string') return html;
    const toHr = (styleContent) => {
        if (!/border-top\s*:/i.test(styleContent)) return null;
        if (!/dashed|dotted/i.test(styleContent)) return null;
        return '<hr class="blog-post-divider-beehiiv">';
    };
    const reDouble =
        /<div\b[^>]*?\bstyle\s*=\s*"([^"]*)"\s*[^>]*>\s*(?:<br\s*\/?>\s*)*<\/div>/gi;
    const reSingle =
        /<div\b[^>]*?\bstyle\s*=\s*'([^']*)'\s*[^>]*>\s*(?:<br\s*\/?>\s*)*<\/div>/gi;
    let out = html.replace(reDouble, (full, style) => toHr(style) ?? full);
    out = out.replace(reSingle, (full, style) => toHr(style) ?? full);
    return out;
}

function cleanPostHtml(html) {
    if (!html || typeof html !== 'string') return '';
    return sanitizeHtml(beehiivDividerDivsToHr(html), SANITIZE_OPTIONS).trim();
}

module.exports = {
    SANITIZE_OPTIONS,
    beehiivDividerDivsToHr,
    cleanPostHtml,
};
