function getMediaRules() {
  let mediaRules = [];
  
  function formatRule(rule) {
    let formattedRule = rule.cssText;
  
    formattedRule = formattedRule
      .replace(/\s*{\s*/g, ' {\n    ')
      .replace(/;\s*/g, ';\n    ')
      .replace(/\s*}\s*/g, '\n  }\n')
      .replace(/\n\s+}\s*/g, '\n  }\n')
      .replace(/\n\s*\n/g, '\n')
      .replace(/^(?!\s|@)(?=.{4,}).*/gm, '  $&')
      .replace(/^ {4}(.*\{)$/gm, '  $1');
  
    return formattedRule.trim();
  }
  
  for (let stylesheet of document.styleSheets) {
    try {
      for (let rule of stylesheet.cssRules) {
        if (rule instanceof CSSMediaRule) {
          mediaRules.push(formatRule(rule));
        }
      }
    } catch (e) {
      console.warn(`Не вдалося отримати доступ до стилів через політику безпеки: ${stylesheet.href}`);
    }
  }

  return mediaRules.join('\n\n');
}

getMediaRules();