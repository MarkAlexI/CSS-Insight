function getKeyframes() {
  const NO_KEYFRAMES = chrome.i18n.getMessage('nokeyframes');
  const WAS_ERROR = chrome.i18n.getMessage('waserror');
  const utilities = globalThis.__CSS_INSIGHT_STYLE_UTILS__;
  let keyframes = '';

  utilities.walkStyleSheets(
    document,
    (rule, ancestors) => {
      if (utilities.isKeyframesRule(rule)) {
        keyframes += `${utilities.formatRuleWithAncestors(rule, ancestors)}\n\n`;
      }
    },
    error => {
      console.warn(error?.message || error);
      keyframes += `/* ${utilities.sanitizeCssComment(WAS_ERROR)} */\n\n`;
    }
  );

  return keyframes ? keyframes.trim() : `/* ${NO_KEYFRAMES} */`;
}

getKeyframes();
