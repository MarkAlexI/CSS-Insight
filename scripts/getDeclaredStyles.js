function getDeclaredStyles(selector = 'body') {
  const stylesheets = document.styleSheets;
  let result = '';

  function formatRule(rule) {
    const formattedRule = rule.cssText
      .replace(/\{/g, '{\n  ')
      .replace(/;/g, ';\n  ')
      .replace(/\n\s*\}/g, '\n}');
    return formattedRule.trim();
  }

  for (const sheet of stylesheets) {
    try {
      const rules = sheet.cssRules || sheet.rules;

      for (const rule of rules) {
        if (selector == '' || rule.selectorText === selector) {
          result += formatRule(rule) + '\n\n';
        }
      }
    } catch (e) {
      console.warn('Cannot access stylesheet:', sheet.href);
    }
  }

  return result ? result.trim() : `No rules for selector "${selector}"`;
}

getDeclaredStyles(data);