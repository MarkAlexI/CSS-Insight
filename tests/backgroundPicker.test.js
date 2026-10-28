import test from 'node:test';
import assert from 'node:assert/strict';

function createEvent() {
  return {
    listener: null,
    addListener(listener) {
      this.listener = listener;
    }
  };
}

function installChromeMock({ silentMessage = () => false } = {}) {
  const stored = {};
  const messages = [];
  const tabs = [
    { id: 1, windowId: 7, active: true, url: 'https://one.example/' },
    { id: 2, windowId: 7, active: false, url: 'https://two.example/' },
    { id: 3, windowId: 8, active: true, url: 'https://other.example/' }
  ];
  const events = {
    activated: createEvent(),
    updated: createEvent(),
    removed: createEvent(),
    message: createEvent(),
    startup: createEvent(),
    installed: createEvent()
  };

  globalThis.chrome = {
    storage: {
      local: {
        get(keys, callback) {
          const requested = Array.isArray(keys) ? keys : [keys];
          callback(Object.fromEntries(requested
            .filter(key => key in stored)
            .map(key => [key, stored[key]])));
        },
        set(value, callback) {
          Object.assign(stored, structuredClone(value));
          callback?.();
        }
      }
    },
    tabs: {
      query(queryInfo, callback) {
        callback(tabs.filter(tab =>
          (!Number.isInteger(queryInfo.windowId) || tab.windowId === queryInfo.windowId) &&
          (!queryInfo.active || tab.active)
        ));
      },
      get(tabId, callback) {
        callback(tabs.find(tab => tab.id === tabId) || null);
      },
      sendMessage(tabId, message, callback) {
        messages.push({ tabId, message: structuredClone(message) });

        if (silentMessage(tabId, message)) return;

        callback({ source: 'css-insight-picker', ok: true });
      },
      create() {},
      onActivated: events.activated,
      onUpdated: events.updated,
      onRemoved: events.removed
    },
    scripting: {
      executeScript(options, callback) {
        callback([]);
      }
    },
    runtime: {
      lastError: null,
      getManifest: () => ({ version: '1.21.0' }),
      getURL: path => `chrome-extension://test/${path}`,
      onMessage: events.message,
      onStartup: events.startup,
      onInstalled: events.installed
    }
  };

  return { events, messages, stored, tabs };
}

function settleWithin(promise, timeoutMs = 1_500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve({ timedOut: true }), timeoutMs);

    promise.then(value => {
      clearTimeout(timer);
      resolve(value);
    }, error => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function sendMessage(listener, message, sender = {}) {
  return new Promise(resolve => {
    const keepsChannelOpen = listener(message, sender, resolve);

    if (keepsChannelOpen !== true) resolve(undefined);
  });
}

test('arms every eligible tab in one window and accepts only its first selection', async t => {
  const mock = installChromeMock();
  t.after(() => { delete globalThis.chrome; });

  const moduleUrl = new URL('../scripts/service_worker.js', import.meta.url);
  moduleUrl.searchParams.set('test', String(Date.now()));
  await import(moduleUrl);

  const armResponse = await sendMessage(mock.events.message.listener, {
    action: 'cssInsight:armPicker',
    windowId: 7
  });

  assert.equal(armResponse.ok, true);
  assert.equal(typeof armResponse.session.token, 'string');
  assert.deepEqual(
    mock.messages
      .filter(entry => entry.message.action === 'cssInsight:startPicker')
      .map(entry => entry.tabId)
      .sort(),
    [1, 2]
  );

  const selection = {
    action: 'cssInsight:selectElement',
    token: armResponse.session.token,
    selector: 'main > article'
  };
  const winner = await sendMessage(mock.events.message.listener, selection, {
    tab: mock.tabs[1]
  });
  const lateClick = await sendMessage(mock.events.message.listener, selection, {
    tab: mock.tabs[0]
  });

  assert.equal(winner.accepted, true);
  assert.equal(lateClick.accepted, false);
  assert.equal(mock.stored.cssInsightPickerState['7'].tabId, 2);
  assert.equal(mock.stored.cssInsightPickerState['7'].selector, 'main > article');
  assert.equal('8' in mock.stored.cssInsightPickerState, false);
  assert.deepEqual(
    mock.messages
      .filter(entry => entry.message.action === 'cssInsight:stopPicker')
      .map(entry => entry.tabId)
      .sort(),
    [1, 2]
  );
});

test('a silent tab cannot permanently block a later picker session', async t => {
  const mock = installChromeMock({
    silentMessage(tabId, message) {
      return tabId === 2 && message.action === 'cssInsight:stopPicker';
    }
  });
  t.after(() => { delete globalThis.chrome; });

  const moduleUrl = new URL('../scripts/service_worker.js', import.meta.url);
  moduleUrl.searchParams.set('silent-tab-test', `${Date.now()}-${Math.random()}`);
  await import(moduleUrl);

  const firstArm = await sendMessage(mock.events.message.listener, {
    action: 'cssInsight:armPicker',
    windowId: 7
  });
  const selection = {
    action: 'cssInsight:selectElement',
    token: firstArm.session.token,
    selector: 'main'
  };
  const winnerPromise = sendMessage(mock.events.message.listener, selection, {
    tab: mock.tabs[0]
  });
  const nextArmPromise = sendMessage(mock.events.message.listener, {
    action: 'cssInsight:armPicker',
    windowId: 7
  });
  const [winner, nextArm] = await Promise.all([
    settleWithin(winnerPromise),
    settleWithin(nextArmPromise)
  ]);

  assert.equal(winner.timedOut, undefined);
  assert.equal(winner.accepted, true);
  assert.equal(nextArm.timedOut, undefined);
  assert.equal(nextArm.ok, true);
  assert.notEqual(nextArm.session.token, firstArm.session.token);

  const firstStopMessages = mock.messages.filter(entry =>
    entry.message.action === 'cssInsight:stopPicker'
  );

  assert.equal(firstStopMessages.length, 2);
  assert.ok(firstStopMessages.every(entry =>
    entry.message.token === firstArm.session.token
  ));
});
