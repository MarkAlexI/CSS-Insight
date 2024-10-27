import { executeScript } from './scripts/common.js';
import { displayStyles } from './scripts/displayStyles.js';

const COPIED = chrome.i18n.getMessage('copied');
const NO_DATA = chrome.i18n.getMessage('nodata');

document.getElementById('declaredStylesBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].url?.startsWith("chrome://")) return undefined;
    const tabId = tabs[0].id;
    const selector = document.getElementById('tagInput').value || 'body';

    executeScript(tabId, './scripts/getDeclaredStyles.js', (result) => {
      const styleData = result[0].result;

      displayStyles(styleData);
    }, selector);
  });
});

document.getElementById('computedStylesBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].url?.startsWith("chrome://")) return undefined;
    const tabId = tabs[0].id;
    const selector = document.getElementById('tagInput').value || 'body';

    executeScript(tabId, './scripts/getComputedStyles.js', (result) => {
      const styleData = result[0].result;

      displayStyles(styleData);
    }, selector);
  });
});

document.getElementById('mediaRulesBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].url?.startsWith("chrome://")) return undefined;
    const tabId = tabs[0].id;

    executeScript(tabId, './scripts/getMediaRules.js', (result) => {
      const styleData = result[0].result;

      displayStyles(styleData);
    }, '');
  });
});

document.getElementById('keyframesRulesBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].url?.startsWith("chrome://")) return undefined;
    const tabId = tabs[0].id;

    executeScript(tabId, './scripts/getKeyframesRules.js', (result) => {
      const styleData = result[0].result;

      displayStyles(styleData);
    }, '');
  });
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const text = document.getElementById('styleData').value;
  navigator.clipboard.writeText(text).then(() => {
    alert(COPIED);
  });
});

document.getElementById('moreDetailsBtn').addEventListener('click', () => {
  chrome.storage.local.get('cssData', (result) => {
    const cssData = result.cssData || NO_DATA;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url?.startsWith("chrome://")) return undefined;
      const tabId = tabs[0].id;

      executeScript(tabId, './scripts/showModalWithCSSData.js', (result) => {
        console.log(result, 'result');
      }, cssData);
    });
  });
});

document.getElementById('applyRuleBtn').addEventListener('click', () => {
  document.getElementById('newRule').classList.remove('hidden');
});

document.getElementById('injectCSSBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].url?.startsWith("chrome://")) return undefined;
    const tabId = tabs[0].id;

    executeScript(tabId, './scripts/applyStyles.js', (result) => {
      console.log(result[0].result);
      document.getElementById('cssInfo').classList.add('hidden');
    }, '');
  });
});

/*document.getElementById('getTagName').addEventListener('change', function() {
  const isChecked = this.checked;
  chrome.storage.sync.set({ getTagName: isChecked }, function() {
    console.log('Checkbox state saved:', isChecked);
  });
});

chrome.storage.sync.get('getTagName', function(data) {
  document.getElementById('getTagName').checked = data.getTagName || false;
});*/