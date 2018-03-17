let anyppt = Symbol('anyppt')

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.type) {
    case 'anyppt-show':
      console.log(window[anyppt])
      if (!window[anyppt]) {
        window[anyppt] = window.anyppt.create().show()
      } else {
        window[anyppt].refresh().show()
      }
      break
  }
})
