function getKeyframes() {
  const NO_KEYFRAMES = chrome.i18n.getMessage('nokeyframes');
  let keyframes = '';

  for (const sheet of document.styleSheets) {
    try {
      const rules = sheet.cssRules || sheet.rules;

      for (const rule of rules) {
        if (rule.type === CSSRule.KEYFRAMES_RULE) {
        keyframes += formatRule(rule) + '\n\n';
        }
      }
    } catch (e) {
      console.warn(e.message);
    }
  }

  return keyframes ? keyframes.trim() : NO_KEYFRAMES;
}

getKeyframes();