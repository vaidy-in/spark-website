'use strict';

function escapeHtmlNoQuotes(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeHtml(s) {
    return escapeHtmlNoQuotes(s).replace(/"/g, '&quot;');
}

function statusSpan(tag) {
    const t = tag.toUpperCase().replace(/\s+/g, ' ').trim();
    if (t === 'NOW') {
        return '<span class="thesis-status thesis-status--now">NOW</span>';
    }
    if (t === 'NEXT') {
        return '<span class="thesis-status thesis-status--next">NEXT</span>';
    }
    if (t === 'HORIZON') {
        return '<span class="thesis-status thesis-status--horizon">HORIZON</span>';
    }
    if (t === 'NOW → NEXT' || t === 'NOW / NEXT' || t === 'NOW->NEXT') {
        return (
            '<span class="thesis-status thesis-status--now">NOW</span> ' +
            '<span class="thesis-status thesis-status--next">NEXT</span>'
        );
    }
    return '';
}

function citeButton(key, citeMap) {
    const num = citeMap[key];
    if (!num) {
        return '';
    }
    return (
        '<button type="button" class="whitepaper-cite-ref" data-cite-id="' +
        num +
        '" aria-expanded="false" aria-haspopup="dialog" aria-label="Citation source ' +
        num +
        '">[' +
        num +
        ']</button>'
    );
}

function processInlineInner(text, citeMap) {
    let s = text;

    s = s.replace(/\[\[CITE:\s*([A-Za-z0-9-]+)\s*\]\]/g, function (_m, key) {
        return citeButton(key, citeMap);
    });

    s = s.replace(/\*\*\[(NOW → NEXT|NOW \/ NEXT|NOW|NEXT|HORIZON)\]\*\*/gi, function (_m, tag) {
        return statusSpan(tag);
    });

    s = s.replace(/\*\[(NOW → NEXT|NOW \/ NEXT|NOW|NEXT|HORIZON)\]\*/gi, function (_m, tag) {
        return statusSpan(tag);
    });

    s = s.replace(/\*\[FIRST-PARTY observation — Spark\/PracticeNow\]\*/g, function () {
        return '<em>[first-party observation, Spark / PracticeNow]</em>';
    });

    s = s.replace(/\[([^\]]+)\]\((#[a-z0-9-]+)\)/g, function (_m, label, hash) {
        return '<a href="' + hash + '">' + escapeHtml(label) + '</a>';
    });

    s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, function (_m, label, url) {
        const external = url.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
        return (
            '<a href="' +
            escapeHtml(url) +
            '"' +
            external +
            '>' +
            escapeHtml(label) +
            '</a>'
        );
    });

    s = s.replace(/\*\[([^\]]+)\]\*/g, function (_m, inner) {
        return '<em>[' + escapeHtml(inner) + ']</em>';
    });

    s = s.replace(/\*\*([^*]+)\*\*/g, function (_m, inner) {
        return '<strong>' + escapeHtml(inner) + '</strong>';
    });

    s = s.replace(/\*([^*]+)\*/g, function (_m, inner) {
        return '<em>' + escapeHtmlNoQuotes(inner) + '</em>';
    });

    return s;
}

function replaceEmParens(text, citeMap) {
    let out = '';
    let i = 0;
    while (i < text.length) {
        const start = text.indexOf('*(', i);
        if (start === -1) {
            out += text.slice(i);
            break;
        }
        out += text.slice(i, start);
        let j = start + 2;
        let depth = 1;
        while (j < text.length && depth > 0) {
            const ch = text[j];
            if (ch === '(') {
                depth++;
            } else if (ch === ')') {
                depth--;
            }
            j++;
        }
        if (depth === 0 && text[j] === '*') {
            const inner = text.slice(start + 2, j - 1);
            out += '<em>(' + processInlineInner(inner, citeMap) + ')</em>';
            j++;
        } else {
            out += text.slice(start, start + 2);
            j = start + 2;
        }
        i = j;
    }
    return out;
}

function processInline(text, citeMap) {
    return processInlineInner(replaceEmParens(text, citeMap), citeMap);
}

function figureFilenameFromMdPath(mdPath) {
    const parts = mdPath.split('/');
    return parts[parts.length - 1];
}

function formatFigureCaption(raw) {
    const cap = raw.replace(/^\*/, '').replace(/\*$/, '');
    let capProcessed = processInlineInner(cap, {});
    capProcessed = capProcessed.replace(/^(Figure \d+[^.]*\.)\s*/i, '<strong>$1</strong> ');
    capProcessed = capProcessed.replace(/<\/strong>\s*\.\s+/g, '</strong> ');
    return '<figcaption>' + capProcessed + '</figcaption>';
}

function renderFigure(imageLine, captionLine, figures) {
    const m = imageLine.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (!m) {
        return '';
    }
    const filename = figureFilenameFromMdPath(m[2]);
    const meta = figures[filename] || { alt: m[1] || '', width: 1536, height: 1024 };
    const mdAlt = (m[1] || '').trim();
    const alt = mdAlt.length > 50 ? mdAlt : meta.alt || mdAlt;
    let captionHtml = '';
    if (captionLine) {
        captionHtml = formatFigureCaption(captionLine);
    } else if (meta.caption) {
        captionHtml = formatFigureCaption(meta.caption);
    }
    return (
        '<figure class="thesis-figure"><img src="images/thesis/' +
        escapeHtml(filename) +
        '" alt="' +
        escapeHtml(alt) +
        '" loading="lazy" decoding="async" width="' +
        meta.width +
        '" height="' +
        meta.height +
        '" />' +
        captionHtml +
        '</figure>'
    );
}

function findSectionId(titleText, sections) {
    const t = titleText.trim();
    for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (new RegExp(sec.match, 'i').test(t)) {
            return sec.id;
        }
    }
    return null;
}

function renderTocItem(item) {
    const cls =
        'whitepaper-toc-item whitepaper-toc-item--h' + (item.level === 3 ? '3' : '2');
    let html =
        '<li class="' +
        cls +
        '"><a class="whitepaper-toc-link" href="#' +
        item.id +
        '">' +
        escapeHtml(item.label) +
        '</a>';
    if (item.children && item.children.length) {
        html += '<ul class="whitepaper-toc-list whitepaper-toc-list--nested">';
        item.children.forEach(function (child) {
            html += renderTocItem(child);
        });
        html += '</ul>';
    }
    html += '</li>';
    return html;
}

function renderToc(toc, mobile) {
    const listClass = mobile
        ? 'whitepaper-toc-list whitepaper-toc-list--mobile'
        : 'whitepaper-toc-list';
    let html = '';
    if (!mobile) {
        html += '<p class="whitepaper-toc-title">Table of Contents</p>\n    ';
    }
    html += '<ul class="' + listClass + '">';
    toc.forEach(function (item) {
        if (mobile && item.children) {
            html += renderTocItem({ id: item.id, label: item.label, level: item.level });
        } else {
            html += renderTocItem(item);
        }
    });
    html += '</ul>';
    return html;
}

function renderDesktopTocNav(toc) {
    return (
        '<nav class="whitepaper-toc whitepaper-toc--desktop hidden lg:block" data-whitepaper-toc="desktop" aria-label="Table of contents">\n    ' +
        renderToc(toc, false) +
        '\n</nav>'
    );
}

function renderMobileTocBlock(toc) {
    return (
        '<nav class="whitepaper-toc whitepaper-toc--mobile mt-3 pb-1" data-whitepaper-toc="mobile" aria-label="Table of contents">' +
        renderToc(toc, true) +
        '</nav>'
    );
}

function parseMarkdownToBody(md, structure, citeMap) {
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    const sections = structure.sections;
    const figures = structure.figures || {};
    const out = [];
    let i = 0;
    let inReferences = false;
    let appendixIntroPending = false;
    let thematicHrCount = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (/^##\s+References\s*$/i.test(trimmed)) {
            inReferences = true;
            break;
        }

        if (!trimmed && i > 0 && out.length && out[out.length - 1] === '') {
            i++;
            continue;
        }

        if (trimmed === '---') {
            let j = i + 1;
            while (j < lines.length && !lines[j].trim()) {
                j++;
            }
            const nextLine = j < lines.length ? lines[j].trim() : '';
            const emitHr =
                thematicHrCount === 0 ||
                /^# Appendix/i.test(nextLine) ||
                /^##\s+References\s*$/i.test(nextLine);
            if (emitHr) {
                out.push('<hr />');
                thematicHrCount++;
            }
            i++;
            continue;
        }

        if (trimmed.startsWith('<p>') || trimmed.startsWith('<em>')) {
            out.push(trimmed.startsWith('<p>') ? trimmed : '<p>' + trimmed + '</p>');
            i++;
            continue;
        }

        if (trimmed.startsWith('<div ') || trimmed === '</div>') {
            out.push(trimmed);
            i++;
            continue;
        }

        if (trimmed.includes('<a href')) {
            out.push('<p>' + trimmed + '</p>');
            i++;
            continue;
        }

        if (trimmed.startsWith('*Honesty note.')) {
            const body = trimmed.replace(/^\*Honesty note\.\*\s*/, '');
            out.push('<p><em>Honesty note.</em> ' + processInline(body, citeMap) + '</p>');
            i++;
            continue;
        }

        if (trimmed.startsWith('> ')) {
            const quoteLines = [];
            while (i < lines.length && lines[i].trim().startsWith('> ')) {
                quoteLines.push(lines[i].trim().slice(2));
                i++;
            }
            const quoteText = quoteLines.join(' ');
            out.push('<p>' + processInline(quoteText, citeMap) + '</p>');
            continue;
        }

        if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
            const title = trimmed.slice(2).trim();
            if (/^Appendix/i.test(title)) {
                out.push('<h2 id="appendix">' + escapeHtml(title) + '</h2>');
                appendixIntroPending = true;
            }
            i++;
            continue;
        }

        if (trimmed.startsWith('### ') && /^### Why the world/i.test(trimmed)) {
            i++;
            continue;
        }

        if (trimmed.startsWith('### ')) {
            const title = trimmed.slice(4).trim();
            const id = findSectionId(title, sections);
            const tag = id ? '<h3 id="' + id + '">' : '<h3>';
            let titleHtml = processInline(title.replace(/\s*\*\[HORIZON\]\*$/i, '').trim(), citeMap);
            if (/\*\[HORIZON\]\*$/i.test(title)) {
                titleHtml += ' <span class="thesis-status thesis-status--horizon">HORIZON</span>';
            }
            out.push(tag + titleHtml + '</h3>');
            i++;
            continue;
        }

        if (trimmed.startsWith('## ')) {
            const title = trimmed.slice(3).trim();
            const id = findSectionId(title, sections);
            if (/^A\d+\./.test(title)) {
                const tag = id ? '<h3 id="' + id + '">' : '<h3>';
                out.push(tag + escapeHtml(title) + '</h3>');
            } else {
                const tag = id ? '<h2 id="' + id + '">' : '<h2>';
                out.push(tag + escapeHtml(title) + '</h2>');
            }
            i++;
            continue;
        }

        if (trimmed.startsWith('![')) {
            let j = i + 1;
            while (j < lines.length && !lines[j].trim()) {
                j++;
            }
            const captionLine =
                j < lines.length && lines[j].trim().startsWith('*Figure')
                    ? lines[j].trim()
                    : null;
            out.push(renderFigure(trimmed, captionLine, figures));
            i = captionLine ? j + 1 : i + 1;
            continue;
        }

        if (trimmed.startsWith('*Figure') && trimmed.endsWith('*')) {
            i++;
            continue;
        }

        if (trimmed === '>' || trimmed.startsWith('>')) {
            i++;
            continue;
        }

        if (appendixIntroPending && trimmed.startsWith('*') && trimmed.endsWith('*')) {
            out.push(
                '<p class="thesis-appendix-intro"><em>' +
                    processInline(trimmed.slice(1, -1), citeMap) +
                    '</em></p>',
            );
            appendixIntroPending = false;
            i++;
            continue;
        }

        if (trimmed.startsWith('- ')) {
            const items = [];
            while (i < lines.length && lines[i].trim().startsWith('- ')) {
                items.push(lines[i].trim().slice(2));
                i++;
            }
            out.push('<ul>');
            items.forEach(function (item) {
                let html = item;
                const statusLead = html.match(/^\*\*(NOW|NEXT|HORIZON)\*\*\s*—\s*/i);
                if (statusLead) {
                    const tag = statusLead[1].toUpperCase();
                    html = html.slice(statusLead[0].length);
                    const periodIdx = html.indexOf('. ');
                    if (periodIdx !== -1) {
                        const lead = html.slice(0, periodIdx + 1);
                        const rest = html.slice(periodIdx + 2);
                        html =
                            '<strong>' +
                            statusSpan(tag) +
                            ' — ' +
                            lead.charAt(0).toLowerCase() +
                            lead.slice(1) +
                            '</strong> ' +
                            processInline(rest, citeMap);
                    } else {
                        html =
                            '<strong>' +
                            statusSpan(tag) +
                            ' — ' +
                            html.charAt(0).toLowerCase() +
                            html.slice(1) +
                            '</strong>';
                    }
                } else {
                    html = processInline(html, citeMap);
                }
                out.push('<li>' + html + '</li>');
            });
            out.push('</ul>');
            continue;
        }

        if (/^\d+\.\s/.test(trimmed)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
                i++;
            }
            out.push('<ol>');
            items.forEach(function (item) {
                let html = item;
                html = html.replace(/\*\[(NOW → NEXT|NOW \/ NEXT|NOW|NEXT|HORIZON)\]\*/gi, function (_m, tag) {
                    return ' ' + statusSpan(tag) + ' ';
                });
                html = processInline(html, citeMap);
                html = html.replace(/  +/g, ' ');
                out.push('<li>' + html + '</li>');
            });
            out.push('</ol>');
            continue;
        }

        if (
            trimmed.startsWith('# The Respect Gap') ||
            trimmed.startsWith('### Why the world') ||
            trimmed.startsWith('*A Spark vision') ||
            !trimmed
        ) {
            i++;
            continue;
        }

        if (trimmed) {
            out.push('<p>' + processInline(trimmed, citeMap) + '</p>');
        }
        i++;
    }

    return out.join('\n                ');
}

module.exports = {
    escapeHtml,
    processInline,
    parseMarkdownToBody,
    renderDesktopTocNav,
    renderMobileTocBlock,
    citeButton,
};
