export function displayStyles(styleData) {
  document.getElementById('styleData').value = styleData;
  document.getElementById('cssInfo').classList.remove('hidden');
  document.getElementById('moreDetailsBtn').classList.remove('hidden');

  chrome.storage.local.set({ cssData: styleData }, () => {
    console.log('CSS data saved');
  });
}