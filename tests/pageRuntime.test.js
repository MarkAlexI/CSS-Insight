import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ensureContentScripts,
  executeScript,
  sendTabMessage
} from '../scripts/common.js';

function installChromeMock(handler) {
  const messages = [];
  const injections = [];

  globalThis.chrome = {
    runtime: { lastError: null },
    tabs: {
      sendMessage(tabId, message, options, callback) {
        messages.push({ tabId, message: structuredClone(message), options: { ...options } });
        handler({ tabId, message, options, callback, runtime: globalThis.chrome.runtime });
      }
    },
    scripting: {
      executeScript(options, callback) {
        injections.push(options);
        callback([]);
      }
    }
  };

  return { injections, messages };
}

test('page operations travel through the resident content runtime', async t => {
  const mock = installChromeMock(({ message, callback }) => {
    const responses = {
      'cssInsight:getPickerState': {
        source: 'css-insight-picker',
        ok: true
      },
      'cssInsight:getInspectionRuntimeState': {
        source: 'css-insight-inspection',
        ok: true,
        state: { instanceId: 'runtime-document-3' }
      },
      'cssInsight:runPageOperation': {
        source: 'css-insight-inspection',
        ok: true,
        result: 'matched media rules'
      }
    };
    callback(responses[message.action]);
  });
  t.after(() => { delete globalThis.chrome; });

  const controllers = await ensureContentScripts(7, 3, 'document-3');
  const result = await executeScript(
    7,
    'scripts/getMediaRules.js',
    { shadowPath: [] },
    3,
    'document-3',
    controllers.runtimeInstanceId
  );

  assert.equal(result, 'matched media rules');
  assert.equal(mock.injections.length, 0);
  assert.equal(mock.messages.at(-1).message.operation, 'getMediaRules');
  assert.equal(mock.messages.at(-1).message.instanceId, 'runtime-document-3');
  assert.deepEqual(mock.messages.at(-1).options, { documentId: 'document-3' });
});

test('navigation between the runtime probe and operation cannot retarget the frame', async t => {
  let navigated = false;
  const mock = installChromeMock(({ message, options, callback, runtime }) => {
    if (message.action === 'cssInsight:getPickerState') {
      callback({ source: 'css-insight-picker', ok: true });
      return;
    }

    if (message.action === 'cssInsight:getInspectionRuntimeState') {
      callback({
        source: 'css-insight-inspection',
        ok: true,
        state: { instanceId: navigated ? 'runtime-new' : 'runtime-old' }
      });
      return;
    }

    if ('documentId' in options && navigated) {
      runtime.lastError = { message: 'The document was unloaded.' };
      callback(undefined);
      runtime.lastError = null;
      return;
    }

    callback(message.instanceId === 'runtime-new'
      ? { source: 'css-insight-inspection', ok: true, result: 'wrong document' }
      : {
          source: 'css-insight-inspection',
          ok: false,
          errorCode: 'runtime_changed'
        });
  });
  t.after(() => { delete globalThis.chrome; });

  const controllers = await ensureContentScripts(7, 3, 'document-old');
  navigated = true;

  await assert.rejects(
    executeScript(
      7,
      'scripts/getMediaRules.js',
      {},
      3,
      'document-old',
      controllers.runtimeInstanceId
    ),
    error => error?.code === 'CSS_INSIGHT_RUNTIME_CHANGED'
  );

  const operationMessages = mock.messages.filter(entry =>
    entry.message.action === 'cssInsight:runPageOperation'
  );
  assert.deepEqual(operationMessages.map(entry => entry.options), [
    { documentId: 'document-old' },
    { frameId: 3 }
  ]);
});

test('message routing falls back from documentId to frameId for older Chromium forks', async t => {
  let calls = 0;
  const mock = installChromeMock(({ options, callback, runtime }) => {
    calls += 1;

    if ('documentId' in options) {
      runtime.lastError = { message: 'documentId routing is unavailable' };
      callback(undefined);
      runtime.lastError = null;
      return;
    }

    callback({ ok: true });
  });
  t.after(() => { delete globalThis.chrome; });

  const response = await sendTabMessage(9, { action: 'probe' }, 5, 'document-5');

  assert.deepEqual(response, { ok: true });
  assert.equal(calls, 2);
  assert.deepEqual(mock.messages.map(entry => entry.options), [
    { documentId: 'document-5' },
    { frameId: 5 }
  ]);
});
