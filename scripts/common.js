export function executeScript(tabId, scriptFile, callback, data) {
  chrome.scripting.executeScript({
    target: { tabId },
    args: [{ data }],
    func: vars => Object.assign(self, vars),
  }, () => {
    chrome.scripting.executeScript({ target: { tabId }, files: [scriptFile] },
      (x) => {
        alert(JSON.stringify(x));
        callback(x);
      });
  });
}