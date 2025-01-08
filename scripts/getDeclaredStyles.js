function getDeclaredStyles(selector = 'body') {
  const NO_RULES = chrome.i18n.getMessage('norules');
  const WAS_ERROR = chrome.i18n.getMessage('waserror');
  const FOUND = chrome.i18n.getMessage('found');
  const stylesheets = document.styleSheets;
  let result = '';

  for (const sheet of stylesheets) {
    try {
      const rules = sheet.cssRules || sheet.rules;

      for (const rule of rules) {
        if (selector == '' || rule.selectorText === selector) {
          result += formatRule(rule) + '\n\n';
        }
      }
    } catch (e) {
      console.warn(e.message);
      result += WAS_ERROR;
    }
  }

  return result ?
           `${FOUND} "${selector}": \n\n${result.trim()}` :
           `${NO_RULES} "${selector}"`;
}

getDeclaredStyles(data);