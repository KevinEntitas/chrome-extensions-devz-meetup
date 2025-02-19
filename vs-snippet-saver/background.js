chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: "Save as snippet",
    contexts: ["selection"],
    id: "save-as-snippet"
  })
})

function onContextMenuClick(info) {
  if (info.menuItemId === "save-as-snippet") {
    console.log("Context menu clicked with selection: ", info.selectionText)
    chrome.storage.local.set({ selectedText: info.selectionText });
    chrome.windows.create({
      url: "save.html",
      type: "popup",
      width: 400,
      height: 300
    });
  }
}

chrome.contextMenus.onClicked.addListener(onContextMenuClick);