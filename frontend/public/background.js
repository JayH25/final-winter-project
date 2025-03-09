/* global chrome */
// chrome.action.onClicked.addListener((tab) => {
//     chrome.windows.create({
//       url: chrome.runtime.getURL("index.html"),
//       type: "popup",
//       width: 320,
//       height: 450,
//       left: 500,
//       top: 200,
//     });
//   });
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: fillForm
    });
});

function fillForm() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "autofill" });
    });
}