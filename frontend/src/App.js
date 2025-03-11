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

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get('isLoggedIn', (data) => {
        setIsLoggedIn(data.isLoggedIn || false);
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
  };

  // Trigger autofill on current webpage by sending message to content script
  const handleAutofill = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "autofill" });
    });
  };

  // Add this to handle login success
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
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
        handleFileChange={handleFileChange} />

      <ParsedDataDisplay
        parsedData={parsedData}
        handleSaveToStorage={handleSaveToStorage}
        handleAutofill={handleAutofill} />
    </div>
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;