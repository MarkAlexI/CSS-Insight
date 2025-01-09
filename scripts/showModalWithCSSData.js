function showModalWithCSSData(cssData) {
  const CLOSE = chrome.i18n.getMessage('close');
  const COPY = chrome.i18n.getMessage('copytext');
  const COPIED = chrome.i18n.getMessage('copied');

  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100vh';
  modal.style.height = '100dvh';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '99999';

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '5px';
  modalContent.style.width = '76%';
  modalContent.style.maxWidth = '400px';
  modalContent.style.height = '80%';
  modalContent.style.maxHeight = '900px';
  modalContent.style.overflowY = 'auto';

  const textArea = document.createElement('textarea');
  textArea.style.color = 'rgb(255, 0, 255)';
  textArea.style.textShadow = 'rgba(0, 255, 0, 0.25) 2px 2px 4px';
  textArea.style.width = '99%';
  textArea.style.maxWidth = '380px';
  textArea.style.height = '88%';
  textArea.style.maxHeight = '800px';
  textArea.textContent = cssData;

  const closeButton = document.createElement('button');
  closeButton.textContent = CLOSE;
  closeButton.style.marginTop = '10px';
  closeButton.style.padding = '10px';
  closeButton.style.backgroundColor = '#007bff';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';

  closeButton.addEventListener('click', () => {
    modal.remove();
  });

  const copyButton = document.createElement('button');
  copyButton.textContent = COPY;
  copyButton.style.marginTop = '10px';
  copyButton.style.marginLeft = '16px';
  copyButton.style.padding = '10px';
  copyButton.style.backgroundColor = '#007bff';
  copyButton.style.color = 'white';
  copyButton.style.border = 'none';
  copyButton.style.cursor = 'pointer';

  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(cssData).then(() => {
      document.getElementById('copyBtn').textContent = COPIED;
      setTimeout(() => {
        document.getElementById('copyBtn').textContent = COPY;
      }, 3000);
    });
  });

  modalContent.appendChild(textArea);
  modalContent.appendChild(closeButton);
  modalContent.appendChild(copyButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  return null;
}

showModalWithCSSData(data);