# CSS Insight

![GitHub license](https://img.shields.io/github/license/MarkAlexI/CSS-Insight)
![GitHub stars](https://img.shields.io/github/stars/MarkAlexI/CSS-Insight?style=social)
![GitHub forks](https://img.shields.io/github/forks/MarkAlexI/CSS-Insight?style=social)
![Last commit](https://img.shields.io/github/last-commit/MarkAlexI/CSS-Insight)
![Issues](https://img.shields.io/github/issues/MarkAlexI/CSS-Insight)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-v1.19.1-brightgreen?logo=google-chrome)](https://chromewebstore.google.com/detail/keejoflofbcbepjbbhnmiomgmjjihmnb)
![status](https://img.shields.io/badge/status-v1.22.4-blue)

CSS Insight is a lightweight browser extension for inspecting and testing CSS directly on a webpage. It is designed for quick checks when opening a full developer tools workflow is inconvenient.

## Features

- **Element picker**: Click or tap an element in a page, matching iframe or open shadow root to create a usable CSS selector.
- **Declared styles**: Find matching rules across nested CSS at-rules, native nesting and constructed stylesheets in the selected root.
- **Computed styles**: View the final computed property values of an element.
- **Computed-style filter**: Narrow large computed-style results by property name or resolved value.
- **Media rules and keyframes**: Explore responsive and animation rules recursively and see whether media conditions currently match.
- **CSS preview**: Apply a custom rule to the selected document or open shadow root without changing the website source.
- **Visible target context**: See whether actions use the page, an iframe or an open shadow root, and reset to the active page at any time.
- **Removable preview**: Undo the CSS Insight preview without reloading the page.
- **Copy and export**: Copy retrieved CSS or save it as a `.css` file.
- **On-page details**: Open long output in an isolated page dialog.
- **Localized interface**: Use CSS Insight in English, German, Spanish, Japanese, Brazilian Portuguese or Ukrainian.

CSS Insight does not collect analytics or send inspected page data to a server. It requests page and tab access so a picker started from a mobile popup tab can wait for a selection on any supported webpage in the same browser window. The content controller stays idle until the user starts the picker.

## Installation

### Google Chrome and Chromium browsers

1. Visit [CSS Insight in the Chrome Web Store](https://chromewebstore.google.com/detail/keejoflofbcbepjbbhnmiomgmjjihmnb).
2. Select **Add to Chrome**.
3. Confirm the installation.

### Mozilla Firefox

The Firefox version is published separately on [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/css-insight/) and is maintained in a separate browser target.

## How to use

1. Open a regular webpage and select the CSS Insight toolbar icon.
2. Select **Pick an Element**.
3. Switch to any supported webpage in the same browser window and click or tap an element. The first selection wins and picking stops in every tab.
4. Return to CSS Insight. The selector field updates without requiring a popup refresh.
5. Retrieve declared or computed styles, inspect page rules, or apply a CSS preview.

The picker waits for up to two minutes and can be cancelled from the popup. In browsers such as Kiwi, CSS Insight also remembers the page that supplied the selected element, so later CSS operations target that page.

Chrome does not allow extensions to run on browser-internal pages or Chrome Web Store pages. Local `file:` pages require the user-controlled **Allow access to file URLs** setting.

## CSSOM limitations

Browsers prevent scripts from reading the rules of some cross-origin stylesheets. CSS Insight reports these inaccessible stylesheets, but cannot inspect their declarations without broader network permissions. Declared styles, media rules and keyframes therefore represent the CSS rules exposed by the page CSSOM.

Document and open-shadow-root `adoptedStyleSheets` are included. Matching iframe documents are inspected in their own frame context. Closed shadow roots remain inaccessible because their contents are intentionally hidden from ordinary page scripts.

## Development

The project uses vanilla JavaScript and has no runtime or development dependencies beyond Node.js 18 or newer.

```bash
npm test
npm run check
npm run build
```

`npm run build` creates two reproducible release archives in `dist/`:

- a minimal Chromium store package built from an explicit allowlist;
- a complete source archive with tests and build tools.

## License

CSS Insight is licensed under the [MIT License](LICENSE).

## Third-party library

CSS Insight includes [highlight.js](https://highlightjs.org/) 11.10.0 under the BSD 3-Clause License. The packaged syntax theme is `atom-one-light`. See [third_party/LICENSE.highlightjs.txt](third_party/LICENSE.highlightjs.txt).
