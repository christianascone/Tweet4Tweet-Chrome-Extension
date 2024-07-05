// Function to handle DOM content loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeExtension();
  fetchAndStoreCookies();
});

// Initialize the extension UI
function initializeExtension() {
  const contentDiv = document.getElementById("content");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentUrl = tabs[0].url;
    const isOnXCom =
      currentUrl.startsWith("https://x.com") ||
      currentUrl.startsWith("https://www.x.com");

    if (isOnXCom) {
      createButtons(contentDiv);
    } else {
      showErrorMessage(contentDiv);
    }
  });
}

// Create and append buttons to the content div
function createButtons(contentDiv) {
  const downloadBtn = createButton(
    "downloadBtn",
    "Download JSON 📥",
    handleDownload,
  );
  const clearBtn = createButton("clearBtn", "Clear 🧹", handleClear);

  contentDiv.appendChild(downloadBtn);
  contentDiv.appendChild(clearBtn);
}

// Create a button element
function createButton(id, text, clickHandler) {
  const button = document.createElement("button");
  button.id = id;
  button.textContent = text;
  button.addEventListener("click", clickHandler);
  return button;
}

// Handle download button click
function handleDownload() {
  chrome.storage.local.get(null, function (items) {
    const object = {
      license_key: "REPLACE_WITH_KEY",
      db_url: "booster.sqlite",
      cache_url: "cache.sqlite",
      bearer: items.bearer,
      xcsrftoken: items.xcsrftoken,
      user_id: items.user_id,
      cookies: items.cookies,
    };
    downloadJSON(object, "config.json");
  });
}

// Download JSON data
function downloadJSON(data, filename) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Handle clear button click
function handleClear() {
  chrome.storage.local.clear();
  window.location.reload();
  alert("Now reload this page!");
}

// Show error message when not on x.com
function showErrorMessage(contentDiv) {
  const errorMessage = document.createElement("p");
  errorMessage.id = "errorMessage";
  errorMessage.innerHTML =
    'Error: You must be on <a href="https://x.com" target="_blank">x.com</a> to download data.';
  contentDiv.appendChild(errorMessage);
}

// Fetch and store cookies
function fetchAndStoreCookies() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const url = new URL(tab.url);
    const domain = url.hostname;

    chrome.cookies.getAll({ domain: domain }, function (cookies) {
      if (cookies.length) {
        processCookies(cookies);
      }
    });
  });
}

// Process and store cookies
function processCookies(cookies) {
  let cookiesContent = "";
  cookies.forEach((cookie) => {
    cookiesContent += `${cookie.name}=${cookie.value}; `;
    if (cookie.name === "twid") {
      const userId = decodeURIComponent(cookie.value).split("=")[1];
      chrome.storage.local.set({ user_id: userId });
    }
  });
  chrome.storage.local.set({ cookies: cookiesContent });
}
