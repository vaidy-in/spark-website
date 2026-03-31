/**
 * Renumbers whitepaper inline citations by first appearance in the body,
 * reorders the Citations <p> block to match, and rewrites #whitepaper-cite-data.
 * Usage: node marketing/scripts/renumber-whitepaper-citations.js [path/to/indic-languages-white-paper.html]
 */
const fs = require('fs');
const path = require('path');

const defaultHtml = path.join(__dirname, '../resources/indic-languages-white-paper.html');
const htmlPath = path.resolve(process.argv[2] || defaultHtml);

const BUTTON_RE =
    /<button type="button" class="whitepaper-cite-ref" data-cite-id="(\d+)" aria-expanded="false" aria-haspopup="dialog" aria-label="Citation source \d+">\[\d+\]<\/button>/g;

const CITE_SCRIPT_RE =
    /<script type="application\/json" id="whitepaper-cite-data">[\s\S]*?<\/script>/;

function numericSortKeys(keys) {
    return keys.slice().sort(function (a, b) {
        return Number(a) - Number(b);
    });
}

function main() {
    var html = fs.readFileSync(htmlPath, 'utf8');

    var scriptMatch = html.match(CITE_SCRIPT_RE);
    if (!scriptMatch) {
        throw new Error('Could not find whitepaper-cite-data script');
    }
    var citeData = JSON.parse(
        scriptMatch[0]
            .replace(/^<script type="application\/json" id="whitepaper-cite-data">/, '')
            .replace(/<\/script>$/, ''),
    );

    var citeHeadingIdx = html.indexOf('<h2 id="citations">');
    if (citeHeadingIdx === -1) {
        throw new Error('Could not find citations heading');
    }
    var bodyForOrder = html.slice(0, citeHeadingIdx);

    var orderFromBody = [];
    var seen = Object.create(null);
    var m;
    var re = new RegExp(BUTTON_RE.source, 'g');
    while ((m = re.exec(bodyForOrder)) !== null) {
        var oldId = m[1];
        if (!seen[oldId]) {
            seen[oldId] = true;
            orderFromBody.push(oldId);
        }
    }

    var allKeys = Object.keys(citeData);
    var unused = allKeys.filter(function (k) {
        return !seen[k];
    });
    unused = numericSortKeys(unused);

    var fullOrder = orderFromBody.concat(unused);

    var oldToNew = Object.create(null);
    fullOrder.forEach(function (oldId, i) {
        oldToNew[oldId] = String(i + 1);
    });

    var h2End = html.indexOf('</h2>', citeHeadingIdx) + 5;
    var scriptIdx = html.indexOf('<script type="application/json" id="whitepaper-cite-data">');
    if (scriptIdx === -1 || scriptIdx < h2End) {
        throw new Error('Could not locate cite data script after citations');
    }
    var citationsInner = html.slice(h2End, scriptIdx);

    var paraRe = /<p>\[(\d+)\]([\s\S]*?)<\/p>/g;
    var oldIdToRest = Object.create(null);
    while ((m = paraRe.exec(citationsInner)) !== null) {
        var oid = m[1];
        if (oldIdToRest[oid] !== undefined) {
            throw new Error('Duplicate citation paragraph for id ' + oid);
        }
        oldIdToRest[oid] = m[2];
    }

    fullOrder.forEach(function (oid) {
        if (oldIdToRest[oid] === undefined) {
            throw new Error('No bibliography paragraph for cite id ' + oid);
        }
    });

    var newParas = fullOrder.map(function (oid, i) {
        return '<p>[' + String(i + 1) + ']' + oldIdToRest[oid] + '</p>';
    });
    var newCitationsBlock = '\n' + newParas.join('\n') + '\n';

    html = html.slice(0, h2End) + newCitationsBlock + html.slice(scriptIdx);

    html = html.replace(BUTTON_RE, function (_full, oldId) {
        var newId = oldToNew[oldId];
        if (!newId) {
            throw new Error('Unknown data-cite-id in button: ' + oldId);
        }
        return (
            '<button type="button" class="whitepaper-cite-ref" data-cite-id="' +
            newId +
            '" aria-expanded="false" aria-haspopup="dialog" aria-label="Citation source ' +
            newId +
            '">[' +
            newId +
            ']</button>'
        );
    });

    var newCiteData = {};
    fullOrder.forEach(function (oid, i) {
        newCiteData[String(i + 1)] = citeData[oid];
    });

    var newScript =
        '<script type="application/json" id="whitepaper-cite-data">' +
        JSON.stringify(newCiteData) +
        '</script>';

    if (!CITE_SCRIPT_RE.test(html)) {
        throw new Error('Lost cite script during rewrite');
    }
    html = html.replace(CITE_SCRIPT_RE, newScript);

    fs.writeFileSync(htmlPath, html, 'utf8');
    process.stdout.write(
        'Updated ' +
            htmlPath +
            ': ' +
            fullOrder.length +
            ' sources, ' +
            orderFromBody.length +
            ' first-seen in body, ' +
            unused.length +
            ' appendix (uncited in body).\n',
    );
}

main();
