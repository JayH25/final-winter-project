// FileUpload.js
import React from 'react';

const FileUpload = ({ handleFileChange, handleFileUpload, isLoading, file }) => {
  return (
    <div className="center-content">
      <div>
        <img className="image-preview" src='/pdf.png' alt="" />
      </div>
      <h2>{file ? "Confirm Upload" : "Select File"}</h2>
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
      </div>
    </div>
  );
};

export default FileUpload;
