# Anyppt

Anyppt is a simple implementation of converting article to ppt

## Usage

```js
// create a ppt, not showing yet
const ppt = window.anyppt.create()

// show ppt
ppt.show()

// hide ppt
ppt.hide()

// refresh ppt if article updated asynchronously, e.g. in SPA
ppt.refresh().show()

// chained calls
window.anyppt.create().show().hide().refresh().show()
```

## Chrome plugin

Drag `extension/anyppt.crx` to `chrome://extensions/`

## Features

* Assign each ppt page according to the words number of article paragraphs
* Chrome extension v0.0.1 in `extension/anyppt.crx`, drag it to `chrome://extensions/` in chrome
* Keyboard ← → to control
* ESC to exit ppt modal
* UMD support

## Example
Run example in `example/index.html`