# Changelog

## 1.20.0 - 2026-08-15

### Changed

- **Pick an Element** now arms every supported webpage in the current browser window without closing the popup or activating a tab.
- The first element selected in that window wins, stops the picker in the other tabs and becomes the target for later CSS operations.
- Picker sessions expire after two minutes and can be cancelled from the popup.
- Broad page and tab permissions are retained because they are required for the any-tab mobile workflow.

### Fixed

- Picker sessions and selected results are isolated by browser window.
- Token validation and serialized background updates ensure that simultaneous clicks cannot produce two winners.
- Picked selectors appear in an open or reopened popup without a manual refresh.
- Google pages remain inspectable while browser-internal and Chrome Web Store pages remain protected.
- Embedded and runtime-generated styles now show a descriptive source instead of the raw CSSOM value `null`.
- A tab that does not answer a content message can no longer block the picker queue permanently.
- Old token-scoped stop commands can no longer disable a newer picker session.
- The popup always leaves its disabled state when the background does not respond in time.
- Dynamically injected style collectors now load their helpers explicitly, preventing `getSubSelectors` and `formatRule` reference errors.

### Development

- Pure state-machine tests cover window isolation, cancellation, expiry and first-selection-wins behavior.
- Reproducible release archives separate the minimal store package from the complete source package.
