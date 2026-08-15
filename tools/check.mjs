import { spawnSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (['.git', 'dist', 'node_modules'].includes(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walk(absolutePath));
    } else {
      files.push(absolutePath);
    }
  }

  return files;
}

function check(condition, message) {
  if (!condition) errors.push(message);
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

const allFiles = await walk(root);
const javascriptFiles = allFiles.filter(file => file.endsWith('.js') || file.endsWith('.mjs'));

for (const file of javascriptFiles) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: root,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    errors.push(`Invalid JavaScript in ${path.relative(root, file)}:\n${result.stderr.trim()}`);
  }
}

const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const messages = JSON.parse(await readFile(path.join(root, '_locales/en/messages.json'), 'utf8'));
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const readme = await readFile(path.join(root, 'README.md'), 'utf8');

check(manifest.manifest_version === 3, 'manifest_version must remain 3 for the Chromium build.');
check(manifest.version === packageJson.version, 'manifest.json and package.json versions differ.');
check(!packageJson.buildLabel,
  'Release packages must not carry an experimental build label.');
check(readme.includes(`v${manifest.version}`), 'README badges do not contain the manifest version.');
check(JSON.stringify(manifest.permissions) ===
  JSON.stringify(['storage', 'tabs', 'activeTab', 'scripting']),
  'Chromium permissions must preserve the Kiwi-compatible interaction model.');
check(JSON.stringify(manifest.host_permissions) === JSON.stringify(['<all_urls>']),
  'Chromium host permissions must keep the picker available across mobile tabs.');
check(Array.isArray(manifest.content_scripts) && manifest.content_scripts.length === 1,
  'The Chromium picker controller must be declared as a content script.');
check(manifest.content_scripts?.[0]?.matches?.includes('<all_urls>'),
  'The Chromium picker must be available on supported pages before the popup opens.');
check(!('web_accessible_resources' in manifest), 'Internal update resources must not be web-accessible.');
check([...messages.description.message].length <= 132, 'The localized manifest description exceeds 132 characters.');

for (const relativePath of [
  manifest.action?.default_popup,
  manifest.background?.service_worker,
  ...Object.values(manifest.icons || {})
].filter(Boolean)) {
  check(await exists(relativePath), `Manifest resource is missing: ${relativePath}`);
}

for (const forbiddenFile of ['1.html', '1.sql']) {
  check(!await exists(forbiddenFile), `Accidental file is still present: ${forbiddenFile}`);
}

const usedMessageKeys = new Set();

for (const file of allFiles.filter(file => file.endsWith('.html') || file.endsWith('.js'))) {
  const source = await readFile(file, 'utf8');

  for (const match of source.matchAll(/data-i18n(?:-placeholder|-aria-label)?=["']([^"']+)["']/g)) {
    usedMessageKeys.add(match[1]);
  }

  for (const match of source.matchAll(/(?:\bt|\.getMessage)\(\s*["']([^"']+)["']/g)) {
    usedMessageKeys.add(match[1]);
  }
}

for (const match of JSON.stringify(manifest).matchAll(/__MSG_([^_]+)__/g)) {
  usedMessageKeys.add(match[1]);
}

for (const key of usedMessageKeys) {
  check(Boolean(messages[key]?.message), `Missing English localization key: ${key}`);
}

const firstPartyTextFiles = allFiles.filter(file => {
  const relative = path.relative(root, file);
  return /\.(?:js|mjs|json|html|css|md)$/.test(file) &&
    !relative.startsWith(`scripts${path.sep}highlight.min.js`) &&
    !relative.startsWith(`styles${path.sep}atom-one-light.min.css`) &&
    !relative.startsWith(`third_party${path.sep}`);
});

for (const file of firstPartyTextFiles) {
  const source = await readFile(file, 'utf8');
  check(!/[\u2013\u2014]/.test(source), `Long dash found in ${path.relative(root, file)}.`);
}

const pickerSource = await readFile(path.join(root, 'scripts/getTagName.js'), 'utf8');
check(!/javascript\s*:/i.test(pickerSource), 'Picker must not create javascript: URLs.');
check(!/\.href\s*=/.test(pickerSource), 'Picker must not rewrite link destinations.');
check(!/storage\.local/.test(pickerSource),
  'Content tabs must submit selections to the background instead of racing on storage.');
check(/ACTIONS\.selectElement/.test(pickerSource),
  'The content picker must submit a tokenized selection to the background.');
const popupSource = await readFile(path.join(root, 'popup.js'), 'utf8');
check(!/window\.close\s*\(/.test(popupSource),
  'The popup must not close its own tab after starting the picker.');
check(!/activateTab\s*\(/.test(popupSource),
  'The popup must not force one target tab to become active.');
check(/cssInsight:armPicker/.test(popupSource) && /cssInsight:cancelPicker/.test(popupSource),
  'The popup must control the window-scoped picker session.');
const backgroundSource = await readFile(path.join(root, 'scripts/service_worker.js'), 'utf8');
check(/cssInsightPickerSessions/.test(backgroundSource),
  'The background must persist window-scoped picker sessions.');
check(/broadcastPicker/.test(backgroundSource) && /acceptSelection/.test(backgroundSource),
  'The background must arm all eligible tabs and accept only the winning selection.');

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Static checks passed: ${javascriptFiles.length} JavaScript files, ${usedMessageKeys.size} localization keys.`);
