function formatRule(rule) {
  const formattedRule = rule.cssText
    .replace(/\{/g, '{\n  ')
    .replace(/;/g, ';\n  ')
    .replace(/\n\s*\}/g, '\n}');
  return formattedRule.trim();
}