#!/usr/bin/env node
/**
 * Bump marketing app version in version.json and dependent HTML/JS.
 * Usage: node marketing/js/bump-marketing-version.js [version]
 *   - With version: sets to that value (e.g. 1.0.1)
 *   - Without: bumps patch (1.0.0 -> 1.0.1)
 */

const fs = require('fs');
const path = require('path');

const MARKETING_ROOT = path.resolve(__dirname, '..');
const VERSION_JSON = path.join(MARKETING_ROOT, 'version.json');
const HTML_FILES = [
  path.join(MARKETING_ROOT, 'enterprise-pricing-calculator.html'),
  path.join(MARKETING_ROOT, 'pricing.html'),
];
const JS_FILES = [
  path.join(MARKETING_ROOT, 'js', 'components', 'enterprise-calculator.js'),
  path.join(MARKETING_ROOT, 'js', 'components', 'pricing.js'),
];

function getCurrentVersion() {
  const data = JSON.parse(fs.readFileSync(VERSION_JSON, 'utf8'));
  return data.version;
}

function bumpPatch(v) {
  const parts = v.split('.').map(Number);
  parts[parts.length - 1] = (parts[parts.length - 1] || 0) + 1;
  return parts.join('.');
}

function setVersion(newVersion) {
  fs.writeFileSync(VERSION_JSON, JSON.stringify({ version: newVersion }, null, 0) + '\n');

  const metaRe = /<meta name="app-version" content="[^"]*">/g;
  const replacement = `<meta name="app-version" content="${newVersion}">`;

  for (const file of HTML_FILES) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(metaRe, replacement);
    fs.writeFileSync(file, content);
  }

  const jsRe = /window\.APP_VERSION\s*=\s*['"][^'"]*['"]/g;
  const jsReplacement = `window.APP_VERSION = '${newVersion}'`;

  for (const file of JS_FILES) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(jsRe, jsReplacement);
    fs.writeFileSync(file, content);
  }

  console.log('Updated to', newVersion);
}

const arg = process.argv[2];
const newVersion = arg || bumpPatch(getCurrentVersion());
setVersion(newVersion);
