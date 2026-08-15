const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'file:']);

function isChromeWebStore(url) {
  return url.protocol === 'https:' && (
    url.hostname === 'chromewebstore.google.com' ||
    (url.hostname === 'chrome.google.com' && url.pathname.startsWith('/webstore'))
  );
}

export function getPageAccess(tab) {
  if (!tab || !Number.isInteger(tab.id)) {
    return { allowed: false, messageKey: 'pageaccessmissing' };
  }

  const rawUrl = tab.url || tab.pendingUrl || '';

  if (!rawUrl) {
    return { allowed: false, messageKey: 'pageaccessmissing' };
  }

  let url;

  try {
    url = new URL(rawUrl);
  } catch {
    return { allowed: false, messageKey: 'pageaccessprotected' };
  }

  if (isChromeWebStore(url)) {
    return { allowed: false, messageKey: 'pageaccesswebstore' };
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return { allowed: false, messageKey: 'pageaccessprotected' };
  }

  return { allowed: true, messageKey: null };
}
