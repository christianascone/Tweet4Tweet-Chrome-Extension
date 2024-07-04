chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    let headers = details.requestHeaders;
    let targetHeader = headers.find(
      (header) => header.name.toLowerCase() === "authorization",
    );

    if (targetHeader) {
      chrome.storage.local.set({ bearer: targetHeader.value }, function () {
        console.log("Target request header saved:", targetHeader.value);
      });
    }

    return { requestHeaders: headers };
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"],
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    let headers = details.requestHeaders;
    console.log("HEADERS", headers);
    let targetHeader = headers.find(
      (header) => header.name.toLowerCase() === "x-csrf-token",
    );

    if (targetHeader) {
      chrome.storage.local.set({ xcsrftoken: targetHeader.value }, function () {
        console.log("Target request header saved:", targetHeader.value);
      });
    }

    return { requestHeaders: headers };
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"],
);
