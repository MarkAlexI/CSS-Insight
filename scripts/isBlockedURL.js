export function isBlockedURL(tabs) {
  const url = tabs[0]?.url || '';
  
  const blockedPatterns = [
    /^chrome:\/\//,
    /^chrome-extension:\/\//,
    /^https:\/\/chrome\.google\.com\/webstore/,
    /^https:\/\/chromewebstore\.google\.com/,
    /^edge:\/\//,
    /^kiwi:\/\//,
    /^moz-extension:\/\//,
  ];
  
  return blockedPatterns.some(pattern => pattern.test(url));
}