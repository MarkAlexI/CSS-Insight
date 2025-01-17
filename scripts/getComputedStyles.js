function getComputedStyles(selector) {
  const NOT_FOUND = chrome.i18n.getMessage('notfound');
  const FOUND = chrome.i18n.getMessage('found');
  const element = document.querySelector(CSS.escape(selector));

  if (!element) {
    return `${NOT_FOUND} "${selector}"`;
  }

  const computedStyle = window.getComputedStyle(element);
  let result = `${FOUND} "${selector}": \n\n`;

  for (let property of computedStyle) {
    result += `${property}: ${computedStyle.getPropertyValue(property)};\n`;
  }

  return result.trim();
}

getComputedStyles(data);