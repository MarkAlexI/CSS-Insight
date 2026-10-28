const SUPPORT_SCRIPT_FILES = [
  'scripts/formatRule.js',
  'scripts/getSubSelectors.js',
  'scripts/getTagName.js'
];

const SCRIPT_DEPENDENCIES = Object.freeze({
  'scripts/getDeclaredStyles.js': [
    'scripts/formatRule.js',
    'scripts/cssRuleWalker.js'
  ],
  'scripts/getKeyframesRules.js': [
    'scripts/formatRule.js',
    'scripts/cssRuleWalker.js'
  ],
  'scripts/getMediaRules.js': [
    'scripts/formatRule.js',
    'scripts/cssRuleWalker.js'
  ]
});

const GET_PICKER_STATE = 'cssInsight:getPickerState';

function executeInjection(options) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(options, (results) => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(results || []);
    });
  });
}

export function sendTabMessage(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(response);
    });
  });
}

function isPickerResponse(response) {
  return response?.source === 'css-insight-picker' && response.ok === true;
}

export async function ensureContentScripts(tabId) {
  try {
    const response = await sendTabMessage(tabId, { action: GET_PICKER_STATE });

    if (isPickerResponse(response)) {
      return response;
    }
  } catch {
    // The content controller has not been injected into this document yet.
  }

  await executeInjection({
    target: { tabId },
    files: SUPPORT_SCRIPT_FILES
  });

  const response = await sendTabMessage(tabId, { action: GET_PICKER_STATE });

  if (!isPickerResponse(response)) {
    throw new Error('The CSS Insight content controller did not respond.');
  }

  return response;
}

export async function executeScript(tabId, scriptFile, data = null) {
  await executeInjection({
    target: { tabId },
    args: [data],
    func: value => {
      globalThis.__CSS_INSIGHT_DATA__ = value;
    }
  });

  try {
    const dependencies = SCRIPT_DEPENDENCIES[scriptFile] || [];
    const results = await executeInjection({
      target: { tabId },
      files: [...dependencies, scriptFile]
    });

    if (!results.length) {
      throw new Error('The injected script returned no result.');
    }

    return results[0].result;
  } finally {
    try {
      await executeInjection({
        target: { tabId },
        func: () => {
          delete globalThis.__CSS_INSIGHT_DATA__;
        }
      });
    } catch {
      // Navigation may destroy the document before cleanup runs.
    }
  }
}
