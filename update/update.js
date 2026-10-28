document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const version = params.get('version') || '-';
  document.getElementById('version').textContent = version;
  
  const features = [
    '🖼️ Pick and inspect elements inside matching iframe documents.',
    '🧩 Inspect elements and styles inside nested open shadow roots.',
    '🎯 Keep later CSS operations attached to the frame and root you selected.',
    '🎨 Apply independent preview rules to a document or open shadow root.'
  ];
  
  const ul = document.getElementById('features');
  features.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.append(li);
  });
  
  document.getElementById('close-btn')
    .addEventListener('click', () => window.close());
});
