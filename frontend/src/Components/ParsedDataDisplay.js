// ParsedDataDisplay.js
import React from 'react';

const ParsedDataDisplay = ({ parsedData, handleSaveToStorage, handleAutofill }) => {
  return (
    parsedData && (
      <div className='Content'>
        <div className="parsed-data">
          {/* <h3>Parsed Data</h3>
          <pre>{JSON.stringify(parsedData, null, 2)}</pre> */}
          <button onClick={handleSaveToStorage} className="choose-btn">
            Save for Autofill
          </button>
          <button onClick={handleAutofill} className="upload-btn">
            Autofill Forms
          </button>
        </div>
        <button className="dashboard">Go To Dashboard</button>
      </div>
    )
  );
};

export default ParsedDataDisplay;
