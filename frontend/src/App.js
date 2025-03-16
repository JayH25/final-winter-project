/* global chrome */

import './App.css';
import React, { useState, useEffect } from "react";
import axios from "axios";
import ParsedDataDisplay from './Components/ParsedDataDisplay';
import Navbar from './Components/Navbar';
import CentreContent from './Components/CentreContent';
import Login from './Components/Login/Login';

function App() {
  
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const[userID,setUserId] = useState(null);
 

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['isLoggedIn', 'userData'], (data) => {
        setIsLoggedIn(data.isLoggedIn || false);
        if (data.userData) {
          console.log("Retrieved userData from storage:", data.userData);
          setUserId(data.userData.user?._id || null);
        }
      });
    }
  }, []);
  


  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload and resume parsing
  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a resume to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setIsLoading(true);

    try {
      // Send the file to the backend for parsing
      const response = await axios.post("http://localhost:5000/api/parse-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setParsedData(response.data);
      alert("Resume parsed successfully!");
    } catch (error) {
      console.error("Error parsing resume:", error);
      alert("Failed to parse the resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save parsed data to Chrome storage for autofill
  const handleSaveToStorage = () => {
    if (!parsedData) {
      alert("No parsed data to save.");
      return;
    }

    chrome.storage.local.set({ parsedData }, () => {
      console.log("Parsed data saved to storage:", parsedData); // For debugging
      alert("Parsed data saved for autofill!");
    });
    console.log(parsedData);
  };

  const handleSaveToDashboard = async () => {
    if (!isLoggedIn) {
      alert("Please log in to save to your dashboard.");
      return;
    }
  
    if (!parsedData) {
      alert("No parsed data to save.");
      return;
    }
  
    try {
      // Get user data from Chrome storage to get the user ID
      const data = await new Promise((resolve) => {
        chrome.storage.local.get("userData", resolve);
      });
  
      const userId = data.userData?.user?._id;
    
      if (!userId) {
        alert("User ID is missing. Please log in again.");
        return;
      }
  
      // Send parsed data and user ID to the backend to save it
      const response = await axios.post("http://localhost:5000/api/save-parsed-resume", {
        userId,
        parsedData,
      });
  
      alert("Parsed resume saved successfully!");
      console.log("Updated parsed resumes:", response.data.parsedResumes);
    } catch (error) {
      console.error("Error saving parsed resume:", error);
      alert("Failed to save parsed resume.");
    }
  };


 
  

  
  // Trigger autofill on current webpage by sending message to content script
  const handleAutofill = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Ensure the active tab exists
      if (tabs.length > 0) {
        console.log(tabs);  // Log the tabs array to check if the active tab is found

        chrome.tabs.sendMessage(tabs[0].id, { action: "autofill" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
          } else {
            console.log("Message sent successfully to content script");
          }
        });
      } else {
        console.error("No active tab found");
      }
    });
  };
  

  // Add this to handle login success
  const handleLoginSuccess = () => {
    chrome.storage.local.get(['isLoggedIn', 'userData'], (data) => {
      if (data.isLoggedIn && data.userData) {
        console.log("User logged in, retrieved from storage:", data.userData);
        setIsLoggedIn(true);
        setUserId(data.userData.user?._id || null);
      } else {
        console.warn("Login data missing in Chrome storage.");
      }
    });
  };
  
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    // Update Chrome Storage so it persists across extension reloads
    chrome.storage.local.set({ isLoggedIn: false }, () => {
      console.log("User logged out, state updated in storage");
    });
  };

  // Return statement with the correct ternary operator
  return isLoggedIn ? (
    <div className="app-container">
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        handleSignout={handleLogout} />

      {/* Center Content */}
      <CentreContent
        parsedData={parsedData}
        file={file}
        isLoading={isLoading}
        handleFileUpload={handleFileUpload}
        handleFileChange={handleFileChange}
        userId={userID}
        />

      <ParsedDataDisplay
        parsedData={parsedData}
        handleSaveToStorage={handleSaveToStorage}
        handleAutofill={handleAutofill} 
        handleSaveToDashboard={handleSaveToDashboard}
         />
    </div>
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;