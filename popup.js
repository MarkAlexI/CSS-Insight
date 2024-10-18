import { executeScript } from './scripts/common.js';
import { displayStyles } from './scripts/displayStyles.js';

document.getElementById('declaredStylesBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    const selector = document.getElementById('tagInput').value;

    executeScript(tabId, './scripts/getDeclaredStyles.js', (result) => {
      const styleData = result[0].result;

      displayStyles(styleData);
    }, selector);
  });
});

document.getElementById('mediaRulesBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    executeScript(tabId, './scripts/getMediaRules.js', (result) => {
      const styleData = result[0].result;

      displayStyles(styleData);
    }, '');
  });
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const text = document.getElementById('styleData').value;
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard');
  });
});

document.getElementById('moreDetailsBtn').addEventListener('click', () => {
  chrome.storage.local.get('cssData', (result) => {
    const cssData = result.cssData || 'Немає даних';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      executeScript(tabId, './scripts/showModalWithCSSData.js', (result) => {
        console.log(result, 'result');
      }, cssData);
    });
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