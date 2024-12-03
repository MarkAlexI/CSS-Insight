function getMediaRules() {
  const NO_MEDIA = chrome.i18n.getMessage('nomedia');
  let mediaRules = '';
  
  for (let stylesheet of document.styleSheets) {
    try {
      for (let rule of stylesheet.cssRules) {
        if (rule instanceof CSSMediaRule) {
          mediaRules += formatRule(rule) + '\n\n';
        }
      }
    } catch (e) {
      console.warn(e.message);
    }
  }

  return mediaRules ? mediaRules.trim() : NO_MEDIA;
}

getMediaRules();