function getKeyframes() {
  const keyframes = [];

  for (const sheet of document.styleSheets) {
    try {
      const rules = sheet.cssRules || sheet.rules;

      for (const rule of rules) {
        if (rule.type === CSSRule.KEYFRAMES_RULE) {
          keyframes.push(rule);
        }
      }
    } catch (e) {
      console.warn(e.cause);
    }
  }

  return keyframes;
}

getKeyframes();