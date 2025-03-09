import React from 'react'

const CentreContent=({parsedData,isLoading,file,handleFileChange,handleFileUpload})=> {
  return (
    <div className="center-content">
        <div>
          <img
            className="image-preview"
            src='/pdf.png'
            alt="File Preview"
          />
        </div>
        <h2>{parsedData? parsedData.fileName : (!file)? "Select File":"Confirm Upload"}</h2>
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
  )
}

export default CentreContent;