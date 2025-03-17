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
  const handleAutofill = async () => {
    try {
      const userId = userID; // Replace with actual user ID, or fetch from storage
      console.log("Sending request to backend with userId:", userId);

      // Fetch parsed resume from backend
      const response = await fetch("http://localhost:5000/api/getparsedresume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }), // Send userId to get the resume data
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        console.error("Server returned error:", response.status);
        return;
      }

      const data = await response.json();
      console.log("Response data received:", data);

      if (!data || !data.parsedResume) {
        console.error("No parsed data received from backend");
        return;
      }

      console.log("Parsed resume data received:", data);
  
      // Get the active tab
      const tabs = await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs));
      });

      if (tabs.length === 0) {
        console.error("No active tab found");
        return;
      }

      // Send parsed resume data to content script
      const tabId = tabs[0].id;
      const message = { action: "autofill", data: data.parsedResume };

      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
        } else {
          console.log("Data sent to content script for autofill");
        }
      });
    } catch (error) {
      console.error("Error during autofill process:", error);
    }
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
        handleAutofill={handleAutofill}
        />

      <ParsedDataDisplay
        parsedData={parsedData}
       
        
        handleSaveToDashboard={handleSaveToDashboard}
         />
    </div>
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;