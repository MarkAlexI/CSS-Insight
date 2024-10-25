function applyStyles(cssText) {
  const styleElement = document.createElement('style');

  styleElement.textContent = cssText;

  document.head.appendChild(styleElement);
}

const cssRules = `
          ul {
            list-style: none;
            padding: 0px;
            margin: 0px;
          }
          `;

applyStyles(cssRules);