function showModalWithCSSData(cssData) {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '9999';

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '5px';
  modalContent.style.width = '80%';
  modalContent.style.maxHeight = '80%';
  modalContent.style.overflowY = 'auto';

  const textArea = document.createElement('textarea');
  textArea.style.width = '100%';
  textArea.style.height = '300px';
  textArea.textContent = cssData;

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Закрити';
  closeButton.style.marginTop = '10px';
  closeButton.style.padding = '10px';
  closeButton.style.backgroundColor = '#007bff';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';

  closeButton.addEventListener('click', () => {
    modal.remove();
  });

  modalContent.appendChild(textArea);
  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  console.log(cssData, 'cssData');
  console.log(modal, 'modal');
  
  return null;
}

showModalWithCSSData(data);