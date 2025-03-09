/* global chrome */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "autofill") {
      chrome.storage.local.get("parsedData", (result) => {
        if (result.parsedData) {
          const data = result.parsedData;
          console.log("Autofilling with parsed data:", data);
  
          document.querySelectorAll("input").forEach((input) => {
            const fieldName = input.getAttribute("name")?.toLowerCase();
            if (fieldName?.includes("name")) input.value = data.name;
            if (fieldName?.includes("email")) input.value = data.email;
            if (fieldName?.includes("phone")) input.value = data.phone;
          });
  
          alert("Autofill complete!");
        } else {
          alert("No parsed data found.");
        }
      });
    }
  });