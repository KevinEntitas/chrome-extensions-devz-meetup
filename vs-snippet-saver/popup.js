document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("selectedText", (data) => {
    console.log('Selected text from storage: ', data)
    document.getElementById("snippetText").value = data.selectedText || "";
  });

  document.getElementById("save").addEventListener("click", () => {
    const title = document.getElementById("title").value;
    const snippetText = document.getElementById("snippetText").value;
    const desc = document.getElementById("desc").value;
    const prefix = document.getElementById("prefix").value;

    const snippet = {
      title,
      desc,
      prefix,
      content: snippetText,
    };

    sendToNativeHost(snippet);
  });
});

function sendToNativeHost(snippet) {
  try {
    console.log("Sending message - saving")
    chrome.runtime.sendNativeMessage('com.snippetsaver.host', { snippet }, (res) => console.log("Response from saving action: ", res));
  } catch (e) {
    console.error('Connection error:', e);
  }
}

