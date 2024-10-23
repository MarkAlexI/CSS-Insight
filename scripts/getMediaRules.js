function getMediaRules() {
  let mediaRules = [];
  
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