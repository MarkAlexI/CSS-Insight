let tooltip, tagInfo;

function copyTagName(event) {
  event.preventDefault();
  chrome.storage.sync.set({ 'tagInfo': tagInfo }, () => {
    console.log('Tag info updated:', tagInfo);
  });
}

function createTooltip() {
  tooltip = document.createElement('div');
  tooltip.id = 'tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  tooltip.style.color = 'black';
  tooltip.style.border = '1px solid black';
  tooltip.style.padding = '5px';
  tooltip.style.borderRadius = '3px';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.display = 'none';
  tooltip.style.zIndex = '9999';
  document.body.appendChild(tooltip);
}

function removeTooltip() {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}

function onMouseMove(event) {
  const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);

  if (elementUnderCursor) {
    const tagName = elementUnderCursor.tagName.toLowerCase();
    const className = elementUnderCursor.className ? `.${elementUnderCursor.className}` : '';
    const id = elementUnderCursor.id ? `#${elementUnderCursor.id}` : '';
    tagInfo = `${tagName}${id}${className}`;
    
    const info = `Tag: ${tagInfo}`;

    tooltip.textContent = info;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
  } else {
    tooltip.style.display = 'none';
  }
}

function onMouseLeave() {
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'start') {
    if (!tooltip) createTooltip();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('click', copyTagName, { passive: false });
  } else if (request.action === 'stop') {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
    document.removeEventListener('click', copyTagName);
    removeTooltip();
  }
});