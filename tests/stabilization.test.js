import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
const pickerSource = await readFile(new URL('../scripts/getTagName.js', import.meta.url), 'utf8');
const commonSource = await readFile(new URL('../scripts/common.js', import.meta.url), 'utf8');
const popupSource = await readFile(new URL('../popup.js', import.meta.url), 'utf8');
const backgroundSource = await readFile(
  new URL('../scripts/service_worker.js', import.meta.url),
  'utf8'
);

test('preserves the permissions required by the Kiwi tab-based popup flow', () => {
  assert.deepEqual(manifest.permissions, ['storage', 'tabs', 'activeTab', 'scripting']);
  assert.deepEqual(manifest.host_permissions, ['<all_urls>']);
  assert.equal(manifest.content_scripts.length, 1);
  assert.deepEqual(manifest.content_scripts[0].matches, ['<all_urls>']);
  assert.deepEqual(manifest.content_scripts[0].js, [
    'scripts/formatRule.js',
    'scripts/getSubSelectors.js',
    'scripts/getTagName.js'
  ]);
});

test('picker submits a tokenized result without rewriting links', () => {
  assert.match(pickerSource, /action: ACTIONS\.selectElement/);
  assert.match(pickerSource, /activeToken/);
  assert.doesNotMatch(pickerSource, /storage\.local/);
  assert.doesNotMatch(pickerSource, /\.href\s*=/);
  assert.doesNotMatch(pickerSource, /javascript\s*:/i);
});

test('picker supports one-step selection and cleanup', () => {
  assert.match(pickerSource, /stopTracking\(\{ keepTooltip: true \}\)/);
  assert.match(pickerSource, /removeEventListener\('click', onElementClick, true\)/);
  assert.match(pickerSource, /retiredTokens/);
  assert.match(pickerSource, /stopTracking\(\{ token: request\.token \}\)/);
  assert.match(pickerSource, /CSS_INSIGHT_PICKER/);
});

test('dynamic style collectors receive their helper scripts explicitly', () => {
  assert.match(commonSource, /'scripts\/getDeclaredStyles\.js': \[/);
  assert.match(commonSource, /'scripts\/getKeyframesRules\.js': \['scripts\/formatRule\.js'\]/);
  assert.match(commonSource, /'scripts\/getMediaRules\.js': \['scripts\/formatRule\.js'\]/);
  assert.match(commonSource, /files: \[\.\.\.dependencies, scriptFile\]/);
});

test('popup arms the current window without forcing a tab', () => {
  assert.match(popupSource, /let targetTab = null/);
  assert.match(popupSource, /getTabById\(targetTab\.id\)/);
  assert.match(popupSource, /cssInsight:armPicker/);
  assert.match(popupSource, /cssInsight:cancelPicker/);
  assert.match(popupSource, /PICKER_MESSAGE_TIMEOUT_MS/);
  assert.doesNotMatch(popupSource, /activateTab\s*\(/);
  assert.doesNotMatch(popupSource, /window\.close\s*\(/);
  assert.doesNotMatch(popupSource, /isPageAvailable/);
});

test('background coordinates one winner across eligible tabs in each window', () => {
  assert.match(backgroundSource, /cssInsightLastEligibleTabs/);
  assert.match(backgroundSource, /cssInsightPickerSessions/);
  assert.match(backgroundSource, /chrome\.tabs\.onActivated\.addListener/);
  assert.match(backgroundSource, /cssInsight:getTrackedTarget/);
  assert.match(backgroundSource, /acceptSelection/);
  assert.match(backgroundSource, /broadcastPicker/);
  assert.match(backgroundSource, /TAB_MESSAGE_TIMEOUT_MS/);
  assert.match(backgroundSource, /selection\.session/);
  assert.match(backgroundSource, /isEligibleTab/);
});
