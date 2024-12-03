function getDeclaredStyles(selector = 'body') {
  const NO_RULES = chrome.i18n.getMessage('norules');
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
    }
  }

  return result ? result.trim() : `${NO_RULES} "${selector}"`;
}

getDeclaredStyles(data);