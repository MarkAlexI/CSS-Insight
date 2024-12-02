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
      console.warn(e.cause);
    }
  }

  return mediaRules.join('\n\n');
}

getMediaRules();