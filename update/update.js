document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const version = params.get('version') || '-';
  document.getElementById('version').textContent = version;
  
  const features = [
    '🧩 Inspect matching rules inside modern CSS at-rules and native nesting.',
    '📚 Include constructed stylesheets adopted by the document.',
    '🎯 Match complete selector branches without unrelated comma-list results.',
    '✅ Get a clear result when a CSS selector is invalid.'
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
