import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getActiveTab,
  getCurrentWindowId,
  isExtensionPageUrl
} from '../scripts/getActiveTab.js';

test('recognizes only pages owned by the current extension', () => {
  const root = 'chrome-extension://extension-id/';

  assert.equal(isExtensionPageUrl(`${root}popup.html`, root), true);
  assert.equal(isExtensionPageUrl(`${root}update/update.html`, root), true);
  assert.equal(isExtensionPageUrl('https://example.com/', root), false);
  assert.equal(isExtensionPageUrl('chrome://extensions/', root), false);
  assert.equal(isExtensionPageUrl('', root), false);
});

function installChromeMock({ activeTab, trackedTab = null }) {
  const messages = [];

  globalThis.chrome = {
    runtime: {
      lastError: null,
      getURL: () => 'chrome-extension://extension-id/',
      sendMessage(message, callback) {
        messages.push(message);
        callback(message.action === 'cssInsight:getTrackedTarget'
          ? { ok: true, tab: trackedTab }
          : { ok: true });
      }
    },
    tabs: {
      query(queryInfo, callback) {
        callback([activeTab]);
      }
    }
  };

  return messages;
}

test('uses the visible regular page directly and remembers it', async t => {
  t.after(() => { delete globalThis.chrome; });
  const page = {
    id: 7,
    windowId: 2,
    url: 'https://example.com/'
  };
  const messages = installChromeMock({ activeTab: page });

  assert.equal(await getActiveTab(), page);
  assert.deepEqual(messages, [{
    action: 'cssInsight:rememberTarget',
    tabId: 7,
    windowId: 2
  }]);
});

test('reads the current window without changing its active tab', async t => {
  t.after(() => { delete globalThis.chrome; });
  const page = { id: 7, windowId: 12, url: 'https://example.com/' };
  const messages = installChromeMock({ activeTab: page });

  assert.equal(await getCurrentWindowId(), 12);
  assert.deepEqual(messages, []);
});

test('falls back to the tracked page only when the popup itself is active', async t => {
  t.after(() => { delete globalThis.chrome; });
  const popup = {
    id: 9,
    windowId: 2,
    url: 'chrome-extension://extension-id/popup.html'
  };
  const page = {
    id: 7,
    windowId: 2,
    url: 'https://example.com/'
  };
  const messages = installChromeMock({ activeTab: popup, trackedTab: page });

  assert.equal(await getActiveTab(), page);
  assert.deepEqual(messages, [{
    action: 'cssInsight:getTrackedTarget',
    windowId: 2
  }]);
});

test('does not silently replace a protected active page with an older target', async t => {
  t.after(() => { delete globalThis.chrome; });
  const protectedPage = {
    id: 11,
    windowId: 2,
    url: 'chrome://extensions/'
  };
  const messages = installChromeMock({
    activeTab: protectedPage,
    trackedTab: { id: 7, windowId: 2, url: 'https://example.com/' }
  });

  assert.equal(await getActiveTab(), protectedPage);
  assert.deepEqual(messages, []);
});
