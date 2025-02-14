console.log("[popup.js] noop")
let input1 = document.getElementById("terms-input-1");
let input2 = document.getElementById("terms-input-2");
let input3 = document.getElementById("terms-input-3");
let input4 = document.getElementById("terms-input-4");
let input5 = document.getElementById("terms-input-5");

document.addEventListener("DOMContentLoaded", () => {
  console.log("[popup.js] DOM Content Loaded");
  setSelectors();
  const button = document.getElementById("save-button");
  const inputs = document.querySelectorAll(".terms-input");

  button.addEventListener("click", () => {
    console.log("[popup.js] Submit form")
    let formatted = [];
    inputs.forEach((el, i) => formatted.push({ id: `terms-input-${i.toString()}`, value: el.value }));
    chrome.runtime.sendMessage({ type: "save-terms", payload: formatted });
  });
});

async function getData() {
  const result = await chrome.storage.local.get(["matchedElements"]);
  result.matchedElements.forEach((el) => {
    document.getElementById(el.id).style.backgroundColor = "green";
  });

  // Retrieving terms from DB
  chrome.runtime.sendMessage({ type: "get-terms" }, (res) => {
    res.payload.forEach((el) => {
      const _el = document.getElementById(el.id);
      if (_el) {
        _el.value = el.value;
      }
    });
  });
}

getData();

function setSelectors() {
  input1 = document.getElementById("terms-input-1");
  input2 = document.getElementById("terms-input-2");
  input3 = document.getElementById("terms-input-3");
  input4 = document.getElementById("terms-input-4");
  input5 = document.getElementById("terms-input-5");
}
