function getComputedStyles(selector) {
  const element = document.querySelector(selector);

  if (!element) {
    return `No elements found for selector "${selector}"`;
  }

  const computedStyle = window.getComputedStyle(element);
  let result = '';

  for (let property of computedStyle) {
    result += `${property}: ${computedStyle.getPropertyValue(property)};\n`;
  }

  return result.trim();
}

getComputedStyles(data);