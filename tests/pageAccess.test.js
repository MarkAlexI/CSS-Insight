import test from 'node:test';
import assert from 'node:assert/strict';

import { getPageAccess } from '../scripts/getPageAccess.js';

test('allows ordinary HTTP and HTTPS pages, including Google', () => {
  assert.equal(getPageAccess({ id: 1, url: 'https://www.google.com/search?q=css' }).allowed, true);
  assert.equal(getPageAccess({ id: 2, url: 'https://example.com/docs' }).allowed, true);
  assert.equal(getPageAccess({ id: 3, url: 'http://localhost:8080/' }).allowed, true);
});

test('allows file pages so Chrome can enforce the user-controlled file setting', () => {
  assert.equal(getPageAccess({ id: 4, url: 'file:///tmp/example.html' }).allowed, true);
});

test('blocks the current and legacy Chrome Web Store origins', () => {
  assert.deepEqual(
    getPageAccess({ id: 5, url: 'https://chromewebstore.google.com/detail/example/id' }),
    { allowed: false, messageKey: 'pageaccesswebstore' }
  );
  assert.deepEqual(
    getPageAccess({ id: 6, url: 'https://chrome.google.com/webstore/detail/example/id' }),
    { allowed: false, messageKey: 'pageaccesswebstore' }
  );
});

test('blocks browser-internal and unsupported schemes', () => {
  for (const url of [
    'chrome://extensions/',
    'chrome-extension://example/page.html',
    'devtools://devtools/bundled/inspector.html',
    'view-source:https://example.com/',
    'about:blank',
    'data:text/html,example'
  ]) {
    assert.deepEqual(
      getPageAccess({ id: 7, url }),
      { allowed: false, messageKey: 'pageaccessprotected' },
      url
    );
  }
});

test('reports a missing active page without throwing', () => {
  assert.deepEqual(getPageAccess(null), {
    allowed: false,
    messageKey: 'pageaccessmissing'
  });
  assert.deepEqual(getPageAccess({ id: 8, url: '' }), {
    allowed: false,
    messageKey: 'pageaccessmissing'
  });
});
