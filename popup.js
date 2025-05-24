import { executeScript } from './scripts/common.js';
import { displayStyles } from './scripts/displayStyles.js';
import { formatTagName } from './scripts/formatTagName.js';
import { isBlockedURL } from './scripts/isBlockedURL.js';

const COPY = chrome.i18n.getMessage('copytext');
const COPIED = chrome.i18n.getMessage('copied');
const NO_DATA = chrome.i18n.getMessage('nodata');
const STOP = chrome.i18n.getMessage('tracktagstop');
const START = chrome.i18n.getMessage('tracktagstart');

document.getElementById('declaredStylesBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (isBlockedURL(tabs)) return undefined;
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
    if (isBlockedURL(tabs)) return undefined;
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
    if (isBlockedURL(tabs)) return undefined;
    const tabId = tabs[0].id;
    
    executeScript(tabId, './scripts/getMediaRules.js', (result) => {
      const styleData = result[0].result;
      
      displayStyles(styleData);
    }, '');
  });
});

document.getElementById('keyframesRulesBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (isBlockedURL(tabs)) return undefined;
    const tabId = tabs[0].id;
    
    executeScript(tabId, './scripts/getKeyframesRules.js', (result) => {
      const styleData = result[0].result;
      
      displayStyles(styleData);
    }, '');
  });
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const text = document.getElementById('styleData').innerText;
  navigator.clipboard.writeText(text).then(() => {
    document.getElementById('copyBtn').textContent = COPIED;
    setTimeout(() => {
      document.getElementById('copyBtn').textContent = COPY;
    }, 3000);
  });
});

document.getElementById('moreDetailsBtn').addEventListener('click', () => {
  chrome.storage.local.get('cssData', (result) => {
    const cssData = result.cssData || NO_DATA;
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (isBlockedURL(tabs)) return undefined;
      const tabId = tabs[0].id;
      
      executeScript(tabId, './scripts/showModalWithCSSData.js', (result) => {
        console.log(result, 'result');
      }, cssData);
    });
  });
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const cssCode = document.getElementById('styleData').textContent;
  const blob = new Blob([cssCode], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'styles.css';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

document.getElementById('applyRuleBtn').addEventListener('click', () => {
  setTimeout(function() {
    document.getElementById('newRule').classList.remove('hidden');
  }, 0);
});

document.getElementById('injectCSSBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (isBlockedURL(tabs)) return undefined;
    const tabId = tabs[0].id;
    const rule = document.getElementById('newRuleData').value;
    
    if (rule.length == 0) return;
    
    executeScript(tabId, './scripts/applyStyles.js', (result) => {
      console.log(result[0].result);
      document.getElementById('cssInfo').classList.add('hidden');
    }, rule);
  });
});

document.getElementById('hideCssInfo').addEventListener('click', () => {
  document.getElementById('cssInfo').classList.add('hidden');
});

document.getElementById('hideNewRule').addEventListener('click', () => {
  document.getElementById('newRule').classList.add('hidden');
});

const trackTagBtn = document.getElementById('trackTagBtn');
const tagInput = document.getElementById('tagInput');

chrome.storage.sync.get(['isTracking', 'tagInfo'], function(result) {
  trackTagBtn.textContent = result.isTracking ? STOP : START;
  tagInput.value = result.tagInfo ?
    formatTagName(result.tagInfo) :
    '';
});

trackTagBtn.addEventListener('click', function() {
  chrome.storage.sync.get(['isTracking', 'tagInfo'], function(result) {
    const isActive = result.isTracking;
    const tagInfo = result.tagInfo;
    
    if (isActive) {
      tagInput.value = tagInfo ?
        formatTagName(tagInfo) :
        '';
    }
    
    chrome.storage.sync.set({ isTracking: !isActive }, function() {
      trackTagBtn.textContent = !isActive ? STOP : START;
      
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (isBlockedURL(tabs)) return undefined;
        chrome.tabs.sendMessage(tabs[0].id, { action: !isActive ? 'start' : 'stop' });
      });
    });
  });
});