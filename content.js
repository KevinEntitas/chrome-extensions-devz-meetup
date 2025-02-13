console.log("[content.js] noop")

chrome.runtime.sendMessage({ type: "get-terms" }, (res) => {
  console.log("[content.js] Received response for 'get-terms'", res)
  let foundElements = [];
  res.payload.forEach((el) => {
    const found = findAndHighlight(el.value);
    if (found) foundElements.push(el);
  });
  // Update local storage
  chrome.storage.local.set({ matchedElements: foundElements });
  chrome.runtime.sendMessage({ type: "matched", payload: { elements: foundElements, text: `${foundElements.length}/${res.payload.length}` } });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[content.js] Received message: ", message, sender)

  if (message.type === "ping") {
    sendResponse({ type: "ping-reply", payload: { value: "pong" } });
  }

  if (message.type === "get-matched") {
    sendResponse({ payload: { elements: matchedElements } });
  }

  return true;
});

function findAndHighlight(text) {
  let fullxPath = [];
  text.split(",").forEach((el) => {
    const xpath = `contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), '${el.toLowerCase().trim()}') `;
    fullxPath.push(xpath);
  });
  const matched = document.evaluate("//*[" + fullxPath.join(" or ") + "]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
  for (let i = 0; i < matched.snapshotLength; i++) {
    let element = matched.snapshotItem(i);
    element.classList.add("fme-highlighted");
  }

  if (matched.snapshotLength > 0) return true;
  return false;
}
