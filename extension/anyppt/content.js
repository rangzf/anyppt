chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if(message.type === 'anyppt-init') {
    window.anyppt.create().show()
  }  
})