/* global chrome */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "autofill") {
    chrome.storage.local.get("parsedData", (result) => {
      if (result.parsedData) {
        const data = result.parsedData;
        console.log("Autofilling with parsed data:", data);

        // Field name variations mapping
        const fieldMappings = {
          name: ["name", "full_name", "first_name", "last_name"],
          email: ["email", "email_address"],
          phone: ["phone", "phone_number", "mobile"],
          linkedIn: ["linkedin", "linkedin_profile"],
          github: ["github", "github_profile"],
          skills: ["skills", "skillset"],
          company: ["company", "employer", "organization"],
          role: ["role", "job_title", "position"],
          duration: ["duration", "work_period", "experience_years"],
          degree: ["degree", "qualification"],
          university: ["university", "college", "institution"],
          graduationYear: ["grad_year", "graduation_year", "year_of_passing"]
        };

        // Process fields in a single loop
        document.querySelectorAll("input, textarea, select").forEach((input) => {
          const fieldIdentifier = (input.getAttribute("name") || input.getAttribute("id") || "").toLowerCase();
          if (!fieldIdentifier) return;

          for (const [key, variations] of Object.entries(fieldMappings)) {
            if (variations.some((name) => fieldIdentifier.includes(name))) {
              input.value = Array.isArray(data[key]) ? data[key].join(", ") : data[key] || "";
              break; // Stop checking once a match is found
            }
          }
        });

        alert("Autofill complete!");
      } else {
        alert("No parsed data found.");
      }
    });
  }
});
