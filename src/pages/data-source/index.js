import React, { useEffect, useState, useRef } from "react";
import { API_URL } from "../../const";
import { CircularProgress } from '@mui/material';
import { FaCloudUploadAlt, FaTrashAlt, FaPlus, FaCheck } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const thumbnail = require('../../assets/images/dataThumbnail.jpeg');

export default function DataSource() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [showFileExistsModal, setShowFileExistsModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [replaceLoading, setReplaceLoading] = useState(false);
const userObj = localStorage.getItem('user');
      const userId = userObj ? JSON.parse(userObj).id : null;
  // Fetch S3 files
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const userObj = localStorage.getItem('user');
      const userId = userObj ? JSON.parse(userObj).id : null;
      const res = await fetch(`${API_URL}/get_s3_files/`, {
        headers: { 'X-User-ID': userId },
      });
      const data = await res.json();
      setFiles(data.available_files || []);
    } catch (e) {
      toast.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  // Fetch currently selected file
  const fetchSelectedFile = async () => {
    try {
      const userObj = localStorage.getItem('user');
      const userId = userObj ? JSON.parse(userObj).id : null;
      const res = await fetch(`${API_URL}/get_file_name`, {
        headers: { 'X-User-ID': userId },
      });
      const data = await res.json();
      if (data && data.file_name) {
        setSelectedFile(data.file_name);
        localStorage.setItem('fileName', data.file_name);
      }
    } catch (error) {
      console.error('Error fetching selected file:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchSelectedFile();
  }, []);

  const checkFileExists = async (fileName) => {
    const formData = new FormData();
    formData.append('file_name', fileName);
    const response = await fetch(`${API_URL}/check_input_file_s3/`, {
      method: 'POST',
      headers: { 'X-User-ID': userId },
      body: formData,
    });
    const data = await response.json();
    return data.status; // true if exists, false otherwise
  };

  // Upload logic
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const exists = await checkFileExists(selectedFile.name);
      if (exists) {
        setPendingFile(selectedFile);
        setRenameValue(selectedFile.name);
        setShowFileExistsModal(true);
        setIsUploading(false);
        return;
      }
      await uploadFile(selectedFile);
    } catch (error) {
      toast.error('Failed to check file. Please try again.');
      setIsUploading(false);
    }
  };

  const uploadFile = async (file, overrideName = null) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file, overrideName || file.name);
    try {
      const response = await fetch(`${API_URL}/file_upload/`, {
        method: 'POST',
        headers: { 'X-User-ID': userId },
        body: formData,
      });
      if (!response.ok) throw new Error('File upload failed');
      toast.success('File uploaded successfully!');
      fetchFiles();
      setShowFileExistsModal(false);
      setPendingFile(null);
    } catch (error) {
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setReplaceLoading(false);
    }
  };

  const handleRenameAndUpload = async () => {
    if (!pendingFile) return;
    setReplaceLoading(true);
    await uploadFile(pendingFile, renameValue);
  };

  const handleReplace = async () => {
    if (!pendingFile) return;
    setReplaceLoading(true);
    await uploadFile(pendingFile);
  };

  const handleModalClose = () => {
    setShowFileExistsModal(false);
    setPendingFile(null);
    setReplaceLoading(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Select file and update user file name, then navigate
  const handleFileSelect = async (fileName) => {
    localStorage.setItem('fileName', fileName); // Store file name in localStorage
    try {
      const userObj = localStorage.getItem('user');
      const userId = userObj ? JSON.parse(userObj).id : null;
      const formData = new FormData();
      formData.append('file_name', fileName);
      const response = await fetch(`${API_URL}/update_user_file_name/`, {
        method: 'POST',
        headers: { 'X-User-ID': userId },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update file name');
      toast.success('File selected!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to select file. Please try again.');
    }
  };

  // Delete file (API endpoint needed)
  const handleDelete = async (fileName) => {
    // TODO: Implement delete API call if available
    toast.info('Delete functionality not implemented');
  };

  return (
    <div className="data-source-container">
      <ToastContainer />
      {/* File Exists Modal */}
      <Dialog open={showFileExistsModal} onClose={handleModalClose}>
        <DialogTitle>File Already Exists</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: 16 }}>
            A file with this name already exists. Would you like to rename your file or replace the existing one?
          </div>
          <TextField
            label="Rename File"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            fullWidth
            margin="dense"
            disabled={replaceLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} disabled={replaceLoading}>Cancel</Button>
          <Button onClick={handleRenameAndUpload} disabled={replaceLoading || !renameValue} variant="contained">Rename & Upload</Button>
          <Button onClick={handleReplace} disabled={replaceLoading} color="error" variant="contained">Replace</Button>
        </DialogActions>
      </Dialog>
      <h1 className="data-source-title">Data Source</h1>
      <div className="file-grid">
        {/* Upload Card */}
        <div className="file-card upload-card" onClick={handleUploadClick} tabIndex={0} role="button">
          <input
            type="file"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <div className="thumbnail-wrapper">
            <FaPlus className="plus-icon" />
          </div>
          <div className="file-name">Upload New</div>
          {isUploading && <CircularProgress size={24} style={{ marginTop: 8 }} />}
        </div>
        {/* File Cards */}
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
            <CircularProgress />
          </div>
        ) : files.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#888' }}>
            No files found.
          </div>
        ) : (
          files.map((file, idx) => (
            <div className="file-card" key={file} tabIndex={0} onClick={() => handleFileSelect(file)}>
              {selectedFile === file && (
                <div className="selected-indicator">
                  <FaCheck className="check-icon" />
                </div>
              )}
              <div className="thumbnail-wrapper">
                <img src={thumbnail} alt="thumbnail" className="file-thumbnail" />
              </div>
              <div className="file-name">{file}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 