import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const buildSource = await readFile(new URL('../tools/build.mjs', import.meta.url), 'utf8');

test('source package places project files directly at the ZIP root', () => {
  assert.match(buildSource, /await createZip\(sourceFiles, sourceZip\);/);
  assert.doesNotMatch(
    buildSource,
    /await createZip\(sourceFiles, sourceZip,\s*['"]CSS-Insight['"]\);/
  );
});
