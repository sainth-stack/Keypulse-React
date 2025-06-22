import React, { useState } from 'react';
import './index.css';
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../const';
import { CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Bot = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(localStorage.getItem('fileName') || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        // Get user ID from localStorage
        const userObj = localStorage.getItem('user');
        const userId = userObj ? JSON.parse(userObj).id : null;
        
        const response = await fetch(`${API_URL}/file_upload/`, {
          method: 'POST',
          headers: {
            'X-User-ID': userId
          },
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('File upload failed');
        }
        
        const data = await response.json();
        console.log(data);
        setFileName(selectedFile?.name);
        // Store data in localStorage
        localStorage.setItem('fileData', JSON.stringify(data));
        localStorage.setItem('fileName', selectedFile.name);
        
        // Show success toast
        toast.success('File uploaded successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Navigate to data-analysis page
        // navigate('/data-analysis');
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload file. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px',
      margin: '8px 12px',
      borderRadius: '20px'
    }}>
      <ToastContainer />
      <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Welcome to DataPX1</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {(file|| fileName) && <span style={{ color: '#4b5563' }}>Selected file: {file?.name || fileName}</span>}
        <input
          type="file"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <button
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
            cursor: 'pointer', 
            border: 'none',
            minWidth: '120px',
            justifyContent: 'center'
          }}
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              <FaCloudUploadAlt style={{ fontSize: '1.25rem' }} /> 
              Upload File
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Bot;