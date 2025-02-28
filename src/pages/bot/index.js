import React, { useState } from 'react';
import './index.css'; // Importing the CSS file
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../const';

const Bot = () => {
  const [file, setFile] = useState(null);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await fetch(`${API_URL}/file_upload/`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        console.log(data);
        
        // Store data in localStorage instead of state
        localStorage.setItem('fileData', JSON.stringify(data));
        localStorage.setItem('fileName', selectedFile.name);
        
        // Navigate to data-analysis page without state
        // navigate('/data-analysis');
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    // <div className="chat-container">
    //   <div className="welcome-container">
    //     <h1 className="welcome-title">Welcome to DataPX1</h1>
    //     <p className="welcome-subtitle">
    //       Upload your data file to get started with our advanced analytics platform
    //     </p>
        
    //     <div className="upload-container">
    //       <input
    //         type="file"
    //         className="hidden"
    //         ref={fileInputRef}
    //         onChange={handleFileChange}
    //       />
    //       <button 
    //         className="upload-button"
    //         onClick={handleUploadClick}
    //       >
    //         <FaCloudUploadAlt className="upload-icon" />
    //         Upload File
    //       </button>
    //       {file && (
    //         <div className="file-name">
    //           Selected file: {file.name}
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' ,margin:'8px 12px',borderRadius:'20px'}}>
    <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Welcome to DataPX1</h1>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {file && <span style={{ color: '#4b5563' }}>Selected file: {file.name}</span>}
      <input
        type="file"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', cursor: 'pointer', border: 'none' }}
        onClick={handleUploadClick}
      >
        <FaCloudUploadAlt style={{ fontSize: '1.25rem' }} /> Upload File
      </button>
    </div>
  </div>
  );
};

export default Bot;
