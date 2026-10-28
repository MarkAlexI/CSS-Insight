# Manual Chromium test checklist

Run `npm run build`, then load `dist/chromium` as an unpacked extension through `chrome://extensions`.

## Popup stability

- Open the extension popup on desktop and leave it open for at least 30 seconds. Confirm its width remains fixed and no horizontal jumping occurs.
- Reload or navigate the active webpage while the popup is open. Confirm background tab tracking does not resize or visibly redraw the popup.
- Arm and cancel **Pick an Element** several times. Confirm the status message can change the popup height without changing its width.

## Page access

- Open a normal HTTPS page and confirm all page actions are enabled.
- Open Google Search and confirm element picking and computed styles work.
- Open Chrome Web Store and confirm CSS Insight displays a protected-page explanation.
- Open `chrome://extensions` and confirm a protected-page explanation.
- Open a local HTML file with **Allow access to file URLs** disabled and confirm the popup explains how to enable access.
- Enable file access, reopen the local file and confirm CSS inspection works.

## Element picker

- Select **Pick an Element**. Confirm the popup or Kiwi extension tab stays open and no webpage is activated automatically.
- Switch to any supported webpage in the same window, then click a normal element. Confirm the picker stops automatically in all tabs.
- Return to CSS Insight and confirm the generated selector appears without refreshing the popup.
- Pick a link. Confirm the selecting click does not navigate and the link works normally afterward.
- Pick an element whose class contains punctuation, such as a utility class with `:`. Confirm the generated selector is accepted by **Get Computed Styles**.
- Start the picker, cancel it from the popup, then start it again and complete a selection.
- Leave the picker armed for two minutes. Confirm it stops and the popup returns to **Pick an Element**.
- Click elements in two armed tabs as close together as practical. Confirm only the first accepted selector is retained.

## CSS tools

- Retrieve declared styles for `body` and for the selected element.
- Reload the extension over an existing test tab, retrieve declared styles and confirm the page console contains no `getSubSelectors` or `formatRule` reference error.
- Retrieve a rule declared inside a page `<style>` element. Confirm its source is labeled as inline instead of `null`.
- Apply a CSS Insight preview, retrieve the same rule and confirm its source is labeled **CSS Insight preview**.
- Retrieve computed styles for a valid selector.
- Enter an invalid selector and confirm a visible error is shown without breaking the popup.
- Retrieve media rules and keyframes on a page that contains them.
- Copy retrieved CSS and save it to `styles.css`.
- Open **View More Details**, copy from the page dialog, close it with Escape and close it by selecting the backdrop.
- Apply a CSS rule, then apply a different rule. Confirm the second preview replaces the first CSS Insight style element.

## Kiwi Android

- Load the unpacked extension in Kiwi Browser.
- Open pages A and B, invoke CSS Insight and start the picker. Confirm Kiwi does not choose a page for you.
- Switch to page B, pick an element, then return to the existing CSS Insight tab. Confirm the selector appears without a refresh.
- Retrieve styles, then arm the picker again and choose an element on page A. Confirm later CSS actions target page A.
- Repeat the page-to-extension cycle at least three times. Confirm there is no wrong-tab activation, permanent disabled state or manual refresh.
- Repeat **Pick an Element** immediately after returning from a successful selection. Confirm the next page receives the picker every time.
- Include an old, unloaded or discarded tab in the window. Confirm it cannot leave the interface permanently disabled.
- Confirm touch selection stops after one tap and protected pages do not fall back to an older target.

## Window isolation

- Open two browser windows and arm the picker in each.
- Pick an element in the second window. Confirm the first window remains armed and keeps its own selector.
- Cancel the picker in the first window. Confirm the second window result remains unchanged.

## Package and permissions

- Confirm the extension requests `storage`, `tabs`, `activeTab`, `scripting` and all-sites host access.
- Confirm the picker content controller remains idle until **Pick an Element** is selected.
- Confirm Chromium uses an MV3 service worker.
- Run `npm run check` and confirm all automated tests pass.
- Run `unzip -t dist/CSS-Insight-chromium-1.20.1-store.zip`.
- Run `unzip -t dist/CSS-Insight-chromium-1.20.1-source.zip` and confirm `manifest.json`, `package.json`, `scripts/` and `tests/` are at the ZIP root.
- Confirm the store archive contains no tests, build tools, `.gitignore` or obsolete scripts.
