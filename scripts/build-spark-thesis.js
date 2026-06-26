#!/usr/bin/env node
/**
 * Build marketing/resources/spark-thesis.html from docs/marketing/thesis/spark-thesis.md
 *
 * Usage: node marketing/scripts/build-spark-thesis.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const {
    parseMarkdownToBody,
    renderDesktopTocNav,
    renderMobileTocBlock,
} = require('./lib/spark-thesis-md');

const REPO_ROOT = path.resolve(__dirname, '../..');
const THESIS_DIR = path.join(REPO_ROOT, 'docs/marketing/thesis');
const MD_PATH = path.join(THESIS_DIR, 'spark-thesis.md');
const STRUCTURE_PATH = path.join(THESIS_DIR, 'thesis-structure.json');
const CITE_SEED_PATH = path.join(THESIS_DIR, 'citations-seed.json');
const CITE_MAP_PATH = path.join(THESIS_DIR, 'thesis-citation-map.json');
const TEMPLATE_PATH = path.join(REPO_ROOT, 'marketing/resources/spark-thesis.template.html');
const OUT_PATH = path.join(REPO_ROOT, 'marketing/resources/spark-thesis.html');
const REFERENCES_GOLDEN = path.join(
    REPO_ROOT,
    'marketing/resources/.golden/spark-thesis.references.html',
);
const CITE_DATA_GOLDEN = path.join(
    REPO_ROOT,
    'marketing/resources/.golden/spark-thesis.cite-data.json',
);
const { validateTocNesting } = require('./lib/validate-thesis-structure');

function readJson(p) {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function buildCiteDataScript(citeDataGolden) {
    return (
        '<script type="application/json" id="whitepaper-cite-data">' +
        citeDataGolden.trim() +
        '</script>'
    );
}

function main() {
    const structure = readJson(STRUCTURE_PATH);
    const tocErrors = validateTocNesting(structure);
    if (tocErrors.length) {
        tocErrors.forEach(function (msg) {
            process.stderr.write('thesis-structure.json: ' + msg + '\n');
        });
        process.exit(1);
    }

    const md = fs.readFileSync(MD_PATH, 'utf8');
    const citeMap = readJson(CITE_MAP_PATH);
    let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    const referencesHtml = fs.readFileSync(REFERENCES_GOLDEN, 'utf8');
    const citeDataJson = fs.readFileSync(CITE_DATA_GOLDEN, 'utf8');

    const bodyMain = parseMarkdownToBody(md, structure, citeMap);
    const bodyHtml = bodyMain + '\n\n                ' + referencesHtml.trim();

    const desktopToc = renderDesktopTocNav(structure.toc);
    const mobileToc = renderMobileTocBlock(structure.toc);

    template = template.replace('<!-- THESIS_TOC_DESKTOP -->', desktopToc);
    template = template.replace('<!-- THESIS_TOC_MOBILE -->', mobileToc);
    template = template.replace('<!-- THESIS_BODY -->', bodyHtml);
    template = template.replace(
        '<!-- THESIS_CITE_DATA -->',
        buildCiteDataScript(citeDataJson),
    );

    if (template.includes('<!-- THESIS_')) {
        throw new Error('Unresolved template marker in spark-thesis.template.html');
    }

    const builtAt = new Date().toISOString();
    const output = template.replace(
        '<html lang="en">',
        '<html lang="en">\n<!-- built from docs/marketing/thesis/spark-thesis.md via build-spark-thesis.js at ' +
            builtAt +
            ' -->',
    );
    fs.writeFileSync(OUT_PATH, output, 'utf8');
    process.stdout.write('Wrote ' + OUT_PATH + '\n');
}

main();
