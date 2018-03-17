chrome.browserAction.onClicked.addListener(tab => {
  getCurrentTab().then(tab => {
    chrome.tabs.sendMessage(tab.id, {
      type: 'anyppt-show'
    })
  })
})

function getCurrentTab() {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        resolve(tabs[0])
      })
    } catch (e) {
      reject()
    }
  })
}
