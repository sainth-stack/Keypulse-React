import React, { useEffect, useState, useRef } from "react";
import { API_URL } from "../../const";
import { CircularProgress } from '@mui/material';
import { FaCloudUploadAlt, FaTrashAlt, FaPlus, FaCheck } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const thumbnail = require('../../assets/images/dataThumbnail.jpeg');

export default function DataSource() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [showFileExistsModal, setShowFileExistsModal] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState([]); // Array of { file, action, newName, originalFile }
  const [replaceLoading, setReplaceLoading] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // New state for multi-selection
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

  // Fetch user's selected files
  const fetchUserSelectedFiles = async () => {
    try {
      const userObj = localStorage.getItem('user');
      const userId = userObj ? JSON.parse(userObj).id : null;
      const response = await fetch(`${API_URL}/get_user_selected_file_name`, {
        method: 'GET',
        headers: { 'X-User-ID': userId },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data && Array.isArray(data.file_name)) {
        setSelectedFiles(data.file_name);
      }
    } catch (error) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchUserSelectedFiles(); // Fetch and set selected files on mount
  }, []);

  // Update checkFilesExist to match API response
  const checkFilesExist = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file_name', file.name);
    });
    const response = await fetch(`${API_URL}/check_input_file_s3/`, {
      method: 'POST',
      headers: { 'X-User-ID': userId },
      body: formData,
    });
    const data = await response.json();
    // Return the files_status object directly
    return data.files_status || {};
  };

  // Update handleFileChange to use new structure
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    setIsUploading(true);

    const statuses = await checkFilesExist(selectedFiles);
    // Find all files that exist (status: true)
    const duplicates = selectedFiles.filter(file => statuses[file.name] && statuses[file.name].status);

    if (duplicates.length > 0) {
      setDuplicateFiles(
        duplicates.map(file => ({
          originalFile: file,
          action: 'replace',
          newName: file.name,
        }))
      );
      setShowFileExistsModal(true);
      setIsUploading(false);
      return;
    }

    // If no duplicates, upload all files in one request
    await uploadFiles(selectedFiles);
    setIsUploading(false);
  };

  // New: handle changes in duplicate modal
  const handleDuplicateActionChange = (idx, action) => {
    setDuplicateFiles(prev => prev.map((item, i) => i === idx ? { ...item, action } : item));
  };
  const handleDuplicateNameChange = (idx, newName) => {
    setDuplicateFiles(prev => prev.map((item, i) => i === idx ? { ...item, newName } : item));
  };

  // New: handle confirm for duplicates
  const handleConfirmDuplicates = async () => {
    setReplaceLoading(true);
    // Prepare files with correct names
    const filesToUpload = duplicateFiles.map(item => {
      if (item.action === 'rename' && item.newName !== item.originalFile.name) {
        return new File([item.originalFile], item.newName, { type: item.originalFile.type });
      }
      return item.originalFile;
    });
    await uploadFiles(filesToUpload);
    setShowFileExistsModal(false);
    setDuplicateFiles([]);
    setReplaceLoading(false);
  };

  const handleModalClose = () => {
    setShowFileExistsModal(false);
    setDuplicateFiles([]);
    setReplaceLoading(false);
  };

  // Upload multiple files at once
  const uploadFiles = async (files) => {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file); // Use 'file' for each file, matching backend
    });
    try {
      const response = await fetch(`${API_URL}/file_upload/`, {
        method: 'POST',
        headers: { 'X-User-ID': userId },
        body: formData,
      });
      if (!response.ok) throw new Error('File upload failed');
      toast.success('Files uploaded successfully!');
      fetchFiles();
      setShowFileExistsModal(false);
      setDuplicateFiles([]);
      setReplaceLoading(false);
    } catch (error) {
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      setReplaceLoading(false);
    }
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
  const handleDelete = async (fileName, e) => {
    e.stopPropagation(); // Prevent file select
    setDeletingFile(fileName);
    try {
      const userObj = localStorage.getItem('user');
      const userId = userObj ? JSON.parse(userObj).id : null;
      const formData = new FormData();
      formData.append('file_name', fileName);
      const response = await fetch(`${API_URL}/delete_file/`, {
        method: 'POST',
        headers: { 'X-User-ID': userId },
        body: formData,
      });
      const data = await response.json();
      if (data.status) {
        toast.success('File deleted successfully!');
        fetchFiles();
        if (selectedFile === fileName) {
          setSelectedFile(null);
          localStorage.removeItem('fileName');
        }
      } else {
        toast.error(data.message || 'Failed to delete file.');
      }
    } catch (error) {
      toast.error('Failed to delete file. Please try again.');
    } finally {
      setDeletingFile(null);
    }
  };

  // Handle file card click to toggle selection
  const handleFileCardClick = (fileName) => {
    setSelectedFiles(prev =>
      prev.includes(fileName)
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  // Submit selected files
  const handleSubmitSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file.');
      return;
    }
    try {
      const userObj = localStorage.getItem('user');
      const userId = userObj ? JSON.parse(userObj).id : null;
      const formData = new FormData();
      selectedFiles.forEach(fileName => {
        formData.append('file_name', fileName);
      });
      const response = await fetch(`${API_URL}/update_user_file_name`, {
        method: 'POST',
        headers: {
          'X-User-ID': userId,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update file name');
      toast.success('Files selected!');
      localStorage.setItem('fileName', JSON.stringify(selectedFiles));
      navigate('/');
    } catch (error) {
      toast.error('Failed to select files. Please try again.');
    }
  };

  return (
    <div className="data-source-container">
      <ToastContainer />
      {/* File Exists Modal */}
      <Dialog open={showFileExistsModal} onClose={handleModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningAmberIcon color="warning" />
            <span>Duplicate Files Detected</span>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            The following files already exist. For each, choose to <b>replace</b> the existing file or <b>rename</b> your upload.
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {duplicateFiles.map((item, idx) => (
              <Paper
                key={item.originalFile.name}
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: item.action === 'rename' ? '2px solid #1976d2' : '1px solid #eee',
                  background: item.action === 'rename' ? '#f0f7ff' : '#fafbfc',
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <FileCopyIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.originalFile.name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <ToggleButtonGroup
                    value={item.action}
                    exclusive
                    onChange={(_, value) => value && handleDuplicateActionChange(idx, value)}
                    size="small"
                    sx={{ mr: 2 }}
                  >
                    <ToggleButton value="replace" disabled={replaceLoading}>
                      Replace
                    </ToggleButton>
                    <ToggleButton value="rename" disabled={replaceLoading}>
                      <DriveFileRenameOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Rename
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    label="New file name"
                    value={item.newName}
                    onChange={e => handleDuplicateNameChange(idx, e.target.value)}
                    size="small"
                    margin="dense"
                    disabled={replaceLoading || item.action !== 'rename'}
                    sx={{ minWidth: 220 }}
                    error={item.action === 'rename' && !item.newName}
                    helperText={item.action === 'rename' && !item.newName ? 'Enter a new file name' : ' '}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} disabled={replaceLoading}>Cancel</Button>
          <Button
            onClick={handleConfirmDuplicates}
            disabled={replaceLoading || duplicateFiles.some(item => item.action === 'rename' && !item.newName)}
            variant="contained"
          >
            Confirm
          </Button>
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
            multiple // Allow multiple file selection
            accept=".csv" // Only allow CSV files
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
            <div
              className="file-card"
              key={file}
              tabIndex={0}
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => handleFileCardClick(file)}
            >
              {/* Show green check icon if selected */}
              {selectedFiles.includes(file) && (
                <div className="selected-indicator">
                  <FaCheck className="check-icon" />
                </div>
              )}
              <div className="thumbnail-wrapper">
                <img src={thumbnail} alt="thumbnail" className="file-thumbnail" />
              </div>
              <div className="file-name">{file}</div>
              {deletingFile === file ? (
                <CircularProgress size={22} style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  color: '#e74c3c',
                  background: 'white',
                  borderRadius: '50%',
                  padding: 4,
                  fontSize: 22,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
                }} />
              ) : (
                <FaTrashAlt
                  className="delete-icon"
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    color: '#e74c3c',
                    background: 'white',
                    borderRadius: '50%',
                    padding: 4,
                    fontSize: 22,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
                  }}
                  title="Delete file"
                  onClick={e => handleDelete(file, e)}
                />
              )}
            </div>
          ))
        )}
      </div>
      {/* Submit button for selected files */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitSelectedFiles}
          disabled={selectedFiles.length === 0}
        >
          Submit
        </Button>
      </div>
    </div>
  );
} 