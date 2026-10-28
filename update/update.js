document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const version = params.get('version') || '-';
  document.getElementById('version').textContent = version;
  
  const features = [
    '🌐 Use the interface in five new languages.',
    '🧩 See localized picker, status and CSS result messages.',
    '🛡️ Keep browser-specific protected-page guidance.',
    '✅ Validate every locale against the complete English message set.'
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
