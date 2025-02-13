console.log("[background.js] noop");

// DATABASE
let db;
const STORE_NAME = "terms";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("DemoDatabase", 1);
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      console.log("[background.js] Database connected");
      db = request.result;
      resolve(db);
    };
    request.onerror = () => reject(request.error);
  });
}

async function addItem(data) {
  console.log("[background.js] Adding item to DB: ", data)
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(data);
}

async function getTerms() {
  console.log("[background.js] Getting terms from DB")
  return new Promise(async (resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

// Context Menu
function onContextMenuClick(info) {
  console.log("[background.js] Content menu clicked", info);
}

chrome.contextMenus.onClicked.addListener(onContextMenuClick);

// Init on install event
chrome.runtime.onInstalled.addListener(() => {
  openDB();

  // Set badge text
  chrome.action.setBadgeText({
    text: "0",
  });

  chrome.contextMenus.create({
    title: "Add to terms",
    contexts: ["selection"],
    id: "add-to-terms",
  });

  chrome.contextMenus.create({
    title: "Demo - Page context",
    id: "demo-page",
  });
});

async function retrieveTerms(sendResponse) {
  const terms = await getTerms();
  sendResponse({ payload: terms });
  console.log("[background.js] Sent response with terms: ", terms)
}

// Messaging
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[background.js] Received message: ", message, sender);
  if (message.type === "matched") {
    // Notify to change badge text
    chrome.action.setBadgeText({
      text: message.payload.text,
    });
  }
  else if (message.type === "get-terms") {
    // Retrieve terms
    console.log("[background.js] Got message for terms retrieval")
    retrieveTerms(sendResponse);
  }
  else if (message.type === "save-terms") {
    console.log("[background.js] Saving terms...")
    message.payload.forEach((el) => {
      addItem({ ...el, id: `${el.id}` });
    });
    sendResponse({ type: "ack" });
  }
  return true;
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log("[background.js] onUpdate event: ", tabId, changeInfo, tab)
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { type: "ping", payload: { value: "ping" } }, (res) => {
      console.log("[background.js] Received ping reponse", res)
    });
  }
});
