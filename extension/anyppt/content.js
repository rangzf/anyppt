chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.type) {
    case 'anyppt-init':
      window.anyppt.create().show()
      break
  }
})
