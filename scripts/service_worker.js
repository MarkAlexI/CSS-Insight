const showUpdates = (details) => {
  if (details.reason === 'update') {
    const version = chrome.runtime.getManifest().version;
    chrome.tabs.create({
      url: chrome.runtime.getURL(`update/update.html?version=${version}`)
    });
  }
};

chrome.runtime.onInstalled.addListener(showUpdates);