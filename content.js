let tooltip;

//chrome.storage.sync.get('getTagName', function(data) {
 // if (data.getTagName) {
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      tooltip.style.border = '1px solid #ccc';
      tooltip.style.padding = '5px';
      tooltip.style.borderRadius = '3px';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.display = 'none';
      document.body.appendChild(tooltip);
    }

    document.addEventListener('mousemove', function(event) {
      const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);

      if (elementUnderCursor) {
        const tagName = elementUnderCursor.tagName.toLowerCase();
        const className = elementUnderCursor.className ? `.${elementUnderCursor.className}` : '';
        const id = elementUnderCursor.id ? `#${elementUnderCursor.id}` : '';
        const info = `Tag: ${tagName}${id}${className}`;

        tooltip.textContent = info;
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
      } else {
        tooltip.style.display = 'none';
      }
    });

    document.addEventListener('mouseleave', function() {
      tooltip.style.display = 'none';
    });
//  }
//});