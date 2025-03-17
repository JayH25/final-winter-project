/* global chrome */
import React from 'react';

const CentreContent = ({ parsedData, isLoading, file, handleFileChange, handleFileUpload, userId,handleAutofill }) => {
  
  const handleGoToDashboard = () => {
    if (!userId) {
      alert("User ID is missing. Please log in again.");
      return;
    }

    console.log("Opening Dashboard via Chrome extension API...");
    chrome.tabs.create({ url: `http://localhost:5000/user/${userId}` });
  };
  
  
  return (
    <div className="center-content">
        <div>
          <img
            className="image-preview"
            src='/pdf.png'
            alt="File Preview"
          />
        </div>
        <h2>{parsedData ? parsedData.fileName : (!file) ? "Select File" : "Confirm Upload"}</h2>
        <div className="select-upload-buttons">
          <label className="choose-btn">
            Choose File
            <input
              type="file"
              onChange={handleFileChange}
              accept="application/pdf"
              disabled={isLoading}
            />
          </label>
          <button
            className="upload-btn"
            onClick={handleFileUpload}
            disabled={isLoading || !file}
          >
            {isLoading ? "Uploading..." : "Upload and Parse Resume"}
          </button>
          <button onClick={handleAutofill} className="upload-btn">
            Autofill Forms
          </button>

          <button onClick={handleGoToDashboard} className="dashboard">Go To Dashboard</button>
        </div>
      </div>
  );
};

export default CentreContent;
