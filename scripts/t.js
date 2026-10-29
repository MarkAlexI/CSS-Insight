export function t(key, substitutions) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}
