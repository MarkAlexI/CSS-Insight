import { getPageAccess } from './getPageAccess.js';

const GET_TRACKED_TARGET = 'cssInsight:getTrackedTarget';
const REMEMBER_TARGET = 'cssInsight:rememberTarget';

function queryTabs(queryInfo) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(queryInfo, tabs => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(tabs || []);
    });
  });
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, response => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(response);
    });
  });
}

export function isExtensionPageUrl(url, extensionRoot) {
  return typeof url === 'string' &&
    typeof extensionRoot === 'string' &&
    url.startsWith(extensionRoot);
}

export function getTabById(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabId, tab => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(tab || null);
    });
  });
}

export async function getCurrentWindowId() {
  const tabs = await queryTabs({ active: true, currentWindow: true });
  return Number.isInteger(tabs[0]?.windowId) ? tabs[0].windowId : null;
}

async function rememberTarget(tab) {
  try {
    await sendRuntimeMessage({
      action: REMEMBER_TARGET,
      tabId: tab.id,
      windowId: tab.windowId
    });
  } catch {
    // The current tab is still a valid target if the background wakes slowly.
  }
}

export async function getActiveTab() {
  const tabs = await queryTabs({ active: true, currentWindow: true });
  const activeTab = tabs[0] || null;

  if (!activeTab) return null;

  if (getPageAccess(activeTab).allowed) {
    await rememberTarget(activeTab);
    return activeTab;
  }

  const extensionRoot = chrome.runtime.getURL('');

  if (!isExtensionPageUrl(activeTab.url || activeTab.pendingUrl || '', extensionRoot)) {
    return activeTab;
  }

  try {
    const response = await sendRuntimeMessage({
      action: GET_TRACKED_TARGET,
      windowId: activeTab.windowId
    });

    return response?.ok ? response.tab || null : null;
  } catch {
    return null;
  }
}
