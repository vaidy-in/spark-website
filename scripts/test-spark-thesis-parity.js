#!/usr/bin/env node
/**
 * Parity test: generated spark-thesis.html body vs golden snapshot.
 *
 * Usage:
 *   node marketing/scripts/test-spark-thesis-parity.js
 *   node marketing/scripts/test-spark-thesis-parity.js --update-golden
 */
'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const HTML_PATH = path.join(REPO_ROOT, 'marketing/resources/spark-thesis.html');
const GOLDEN_MAIN = path.join(
    REPO_ROOT,
    'marketing/resources/.golden/spark-thesis.body-main.html',
);
const GOLDEN_REFS = path.join(
    REPO_ROOT,
    'marketing/resources/.golden/spark-thesis.references.html',
);
const GOLDEN_CITE = path.join(
    REPO_ROOT,
    'marketing/resources/.golden/spark-thesis.cite-data.json',
);

function normalize(html) {
    return html
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/  +/g, ' ')
        .split('\n')
        .map(function (line) {
            return line.trim();
        })
        .filter(function (line) {
            return line.length > 0;
        })
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function extractBody(html) {
    const start = html.indexOf(
        '<div class="prose prose-lg max-w-none blog-post-content text-slate-700 whitepaper-body">',
    );
    const bodyStart = html.indexOf('>', start) + 1;
    const end = html.indexOf('</div>', html.lastIndexOf('<h2 id="references">'));
    return html.slice(bodyStart, end).trim();
}

function extractCiteData(html) {
    const m = html.match(
        /<script type="application\/json" id="whitepaper-cite-data">([\s\S]*?)<\/script>/,
    );
    if (!m) {
        throw new Error('Missing whitepaper-cite-data');
    }
    return JSON.stringify(JSON.parse(m[1]), null, 0);
}

function inventory(html) {
    const body = extractBody(html);
    return {
        h2: (body.match(/<h2 id="/g) || []).length,
        h3: (body.match(/<h3 id="/g) || []).length,
        figures: (body.match(/<figure class="thesis-figure"/g) || []).length,
        citeButtons: (body.match(/class="whitepaper-cite-ref"/g) || []).length,
    };
}

function main() {
    const update = process.argv.includes('--update-golden');
    const html = fs.readFileSync(HTML_PATH, 'utf8');
    const body = extractBody(html);
    const refsIdx = body.indexOf('<h2 id="references">');
    const mainPart = body.slice(0, refsIdx).trim();
    const refsPart = body.slice(refsIdx).trim();
    const citeData = extractCiteData(html);

    if (update) {
        fs.writeFileSync(GOLDEN_MAIN, mainPart + '\n');
        fs.writeFileSync(GOLDEN_REFS, refsPart + '\n');
        fs.writeFileSync(GOLDEN_CITE, citeData + '\n');
        const fullBody = mainPart + '\n\n                ' + refsPart;
        fs.writeFileSync(
            path.join(REPO_ROOT, 'marketing/resources/.golden/spark-thesis.body.html'),
            fullBody + '\n',
        );
        process.stdout.write('Updated golden snapshots.\n');
        return;
    }

    const goldenMain = fs.readFileSync(GOLDEN_MAIN, 'utf8').trim();
    const goldenRefs = fs.readFileSync(GOLDEN_REFS, 'utf8').trim();
    const goldenCite = fs.readFileSync(GOLDEN_CITE, 'utf8').trim();

    let failed = false;

    if (normalize(mainPart) !== normalize(goldenMain)) {
        failed = true;
        process.stderr.write('FAIL: main body differs from golden (spark-thesis.body-main.html)\n');
        fs.writeFileSync('/tmp/spark-thesis-built-main.html', mainPart);
        process.stderr.write('Wrote /tmp/spark-thesis-built-main.html for diff\n');
    }

    if (normalize(refsPart) !== normalize(goldenRefs)) {
        failed = true;
        process.stderr.write('FAIL: references differ from golden\n');
    }

    if (normalize(citeData) !== normalize(goldenCite)) {
        failed = true;
        process.stderr.write('FAIL: cite-data JSON differs from golden\n');
    }

    const inv = inventory(html);
    const expected = { h2: 11, h3: 8, figures: 20, citeButtons: 35 };
    Object.keys(expected).forEach(function (key) {
        if (inv[key] !== expected[key]) {
            failed = true;
            process.stderr.write(
                'FAIL: inventory ' + key + ' expected ' + expected[key] + ' got ' + inv[key] + '\n',
            );
        }
    });

    if (failed) {
        process.exit(1);
    }
    process.stdout.write(
        'Parity OK — h2=' +
            inv.h2 +
            ' h3=' +
            inv.h3 +
            ' figures=' +
            inv.figures +
            ' cites=' +
            inv.citeButtons +
            '\n',
    );
}

main();
