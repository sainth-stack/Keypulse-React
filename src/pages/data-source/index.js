import React, { useEffect, useState, useRef } from "react";
import { API_URL } from "../../const";
import { CircularProgress } from '@mui/material';
import { FaCloudUploadAlt, FaTrashAlt, FaPlus, FaCheck, FaSearch, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { logAmplitudeEvent } from '../../utils';

const thumbnail = require('../../assets/images/dataThumbnail.jpeg');

export default function DataSource() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [showFileExistsModal, setShowFileExistsModal] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState([]);
  const [replaceLoading, setReplaceLoading] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  // const [fileDescriptions, setFileDescriptions] = useState({}); // { fileName: desc }
  // const [showDescModal, setShowDescModal] = useState(false);
  // const [pendingUploadFiles, setPendingUploadFiles] = useState([]); // Files waiting for desc
  
  // New states for pagination and view all modal
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  
  // Stable sorted files - sorted once on load, doesn't change during selection
  const [stableSortedFiles, setStableSortedFiles] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [selectedFilesLoaded, setSelectedFilesLoaded] = useState(false);
  
  const ITEMS_PER_PAGE = 5;
  
  const userObj = localStorage.getItem('user');
  const userId = userObj ? JSON.parse(userObj).id : null;

  // Create initial sorted list when both files and selectedFiles are loaded
  useEffect(() => {
    console.log('Sorting effect triggered with:', {
      filesLength: files.length,
      selectedFilesLoaded,
      initialLoadComplete,
      selectedFilesLength: selectedFiles.length
    });
    
    // Only run this once when both API calls have completed
    if (files.length > 0 && selectedFilesLoaded && !initialLoadComplete) {
      console.log('✅ CONDITIONS MET - Creating initial sorted files with:');
      console.log('Files:', files);
      console.log('Selected files:', selectedFiles);
      console.log('selectedFilesLoaded:', selectedFilesLoaded);
      
      const sortedFiles = [...files].sort((a, b) => {
        const aSelected = selectedFiles.includes(a);
        const bSelected = selectedFiles.includes(b);
        
        // Selected files come first
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        
        // Within same selection status, maintain original order
        return files.indexOf(a) - files.indexOf(b);
      });
      
      console.log('✅ Initial sorted files:', sortedFiles);
      setStableSortedFiles(sortedFiles);
      setInitialLoadComplete(true);
    } else {
      console.log('❌ CONDITIONS NOT MET - Skipping sort');
    }
  }, [files, selectedFiles, selectedFilesLoaded, initialLoadComplete]);
  
  // Reset when files are refreshed
  useEffect(() => {
    if (files.length === 0) {
      setInitialLoadComplete(false);
      setSelectedFilesLoaded(false);
      setStableSortedFiles([]);
    }
  }, [files]);

  // Filter files based on search term - use stable sorted files
  useEffect(() => {
    if (searchTerm) {
      setFilteredFiles(stableSortedFiles.filter(file => 
        file.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredFiles(stableSortedFiles);
    }
  }, [stableSortedFiles, searchTerm]);

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
      console.log('Loaded files from API:', data.available_files);
      setFiles(data.available_files || []);
      // Reset the initial load flag so files get re-sorted with current selections
      setInitialLoadComplete(false);
    } catch (e) {
      // toast.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's selected files
  const fetchUserSelectedFiles = async () => {
    try {
      const userObj = localStorage.getItem('user');
      const userId = userObj ? JSON.parse(userObj).id : null;
      console.log('Fetching user selected files for userId:', userId);
      const response = await fetch(`${API_URL}/get_user_selected_file_name`, {
        method: 'GET',
        headers: { 'X-User-ID': userId },
      });
      console.log('Response status:', response.status, response.ok);
      if (!response.ok) {
        console.log('Response not ok, setting empty selected files');
        setSelectedFiles([]);
        setSelectedFilesLoaded(true);
        return;
      }
      const data = await response.json();
      console.log('Raw response data:', data);
      if (data && Array.isArray(data.file_name)) {
        console.log('Setting selected files to:', data.file_name);
        setSelectedFiles(data.file_name);
      } else {
        console.log('No selected files data or invalid format:', data);
        setSelectedFiles([]);
      }
      setSelectedFilesLoaded(true);
      console.log('selectedFilesLoaded set to true');
    } catch (error) {
      console.log('Error fetching selected files:', error);
      setSelectedFiles([]);
      setSelectedFilesLoaded(true);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchUserSelectedFiles();
  }, []);

  // Debug: Log when selectedFiles changes
  useEffect(() => {
    console.log('selectedFiles state changed to:', selectedFiles);
  }, [selectedFiles]);

  // Debug: Log when selectedFilesLoaded changes
  useEffect(() => {
    console.log('selectedFilesLoaded changed to:', selectedFilesLoaded);
  }, [selectedFilesLoaded]);

  // Fire Data Source Opened event with all file names when files are loaded
  useEffect(() => {
    if (stableSortedFiles.length > 0 && window && window.amplitude) {
      logAmplitudeEvent('Data Source Opened', { data: stableSortedFiles });
      console.log('[Amplitude] Data Source Opened event sent', stableSortedFiles);
    }
  }, [stableSortedFiles]);

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
    return data.files_status || {};
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    setIsUploading(true);

    const statuses = await checkFilesExist(selectedFiles);
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

    // Instead of uploading directly, show description modal
    // setPendingUploadFiles(selectedFiles);
    // setShowDescModal(true);
    // setIsUploading(false);
    
    // Direct upload without description modal
    await uploadFiles(selectedFiles);
    setIsUploading(false);
  };

  const handleDuplicateActionChange = (idx, action) => {
    setDuplicateFiles(prev => prev.map((item, i) => i === idx ? { ...item, action } : item));
  };
  
  const handleDuplicateNameChange = (idx, newName) => {
    setDuplicateFiles(prev => prev.map((item, i) => i === idx ? { ...item, newName } : item));
  };

  const handleConfirmDuplicates = async () => {
    setReplaceLoading(true);
    const filesToUpload = duplicateFiles.map(item => {
      if (item.action === 'rename' && item.newName !== item.originalFile.name) {
        return new File([item.originalFile], item.newName, { type: item.originalFile.type });
      }
      return item.originalFile;
    });
    // Instead of uploading directly, show description modal for these files
    // setPendingUploadFiles(filesToUpload);
    // setShowFileExistsModal(false);
    // setShowDescModal(true);
    // setReplaceLoading(false);
    
    // Direct upload without description modal
    await uploadFiles(filesToUpload);
    setShowFileExistsModal(false);
    setReplaceLoading(false);
  };

  const handleModalClose = () => {
    setShowFileExistsModal(false);
    setDuplicateFiles([]);
    setReplaceLoading(false);
  };

  // Mark that CEO graphs should be shown (using static data in home page)
  const markCEOGraphsReady = (fileName) => {
    // Just set a flag in localStorage to indicate CEO graphs should be shown
    localStorage.setItem('showCeoGraphs', JSON.stringify({
      fileName: fileName,
      timestamp: new Date().toISOString()
    }));
  };

  const uploadFiles = async (files, fileDescriptions = {}) => {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });
    // Add file_name_desc as JSON string - COMMENTED OUT
    // if (Object.keys(fileDescriptions).length > 0) {
    //   formData.append('file_name_desc', JSON.stringify(
    //     Object.fromEntries(files.map(f => [f.name, fileDescriptions[f.name] || '']))
    //   ));
    // }
    try {
      const response = await fetch(`${API_URL}/file_upload/`, {
        method: 'POST',
        headers: { 'X-User-ID': userId },
        body: formData,
      });
      if (!response.ok) throw new Error('File upload failed');
      toast.success('Files uploaded successfully!');
      logAmplitudeEvent('File Upload', { userId, fileCount: files.length, fileNames: files.map(f => f.name) });
      console.log('[Amplitude] File Upload event sent', files.map(f => f.name));
      
      // Mark that CEO graphs should be shown for the first uploaded file
      if (files.length > 0) {
        markCEOGraphsReady(files[0].name);
      }
      
      fetchFiles();
      setShowFileExistsModal(false);
      setDuplicateFiles([]);
      setReplaceLoading(false);
    } catch (error) {
      toast.error('Failed to upload files. Please try again.');
      logAmplitudeEvent('File Upload Failure', { userId, error: error?.message });
      console.warn('[Amplitude] File Upload Failure event sent', error?.message);
    } finally {
      setIsUploading(false);
      setReplaceLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = async (fileName) => {
    localStorage.setItem('fileName', fileName);
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
      logAmplitudeEvent('File Selected', { userId, fileName });
      console.log('[Amplitude] File Selected event sent', fileName);
      navigate('/');
    } catch (error) {
      toast.error('Failed to select file. Please try again.');
      logAmplitudeEvent('File Select Failure', { userId, fileName, error: error?.message });
      console.warn('[Amplitude] File Select Failure event sent', fileName, error?.message);
    }
  };

  const handleDelete = async (fileName, e) => {
    e.stopPropagation();
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
        logAmplitudeEvent('File Delete', { userId, fileName });
        console.log('[Amplitude] File Delete event sent', fileName);
        fetchFiles();
        if (selectedFile === fileName) {
          setSelectedFile(null);
          localStorage.removeItem('fileName');
        }
        // Remove from selected files if it was selected
        setSelectedFiles(prev => prev.filter(f => f !== fileName));
      } else {
        toast.error(data.message || 'Failed to delete file.');
        logAmplitudeEvent('File Delete Failure', { userId, fileName, error: data.message });
        console.warn('[Amplitude] File Delete Failure event sent', fileName, data.message);
      }
    } catch (error) {
      toast.error('Failed to delete file. Please try again.');
      logAmplitudeEvent('File Delete Failure', { userId, fileName, error: error?.message });
      console.warn('[Amplitude] File Delete Failure event sent', fileName, error?.message);
    } finally {
      setDeletingFile(null);
    }
  };

  const handleFileCardClick = (fileName) => {
    setSelectedFiles(prev =>
      prev.includes(fileName)
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  const handleSubmitSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file.');
      return;
    }
    try {
      const validSelectedFiles = selectedFiles.filter(fileName => stableSortedFiles.includes(fileName));
      
      if (validSelectedFiles.length === 0) {
        toast.error('None of the selected files exist anymore. Please select available files.');
        return;
      }
      
      // Log Amplitude event for submit
      if (window && window.amplitude) {
        logAmplitudeEvent('Data Source Submit', { data: validSelectedFiles });
        console.log('[Amplitude] Data Source Submit event sent', validSelectedFiles);
      }
      const userObj = localStorage.getItem('user');
      const userId = userObj ? JSON.parse(userObj).id : null;
      const formData = new FormData();
      validSelectedFiles.forEach(fileName => {
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
      
      // Mark that CEO graphs should be shown for the selected files
      if (validSelectedFiles.length > 0) {
        markCEOGraphsReady(validSelectedFiles[0]);
      }
      
      toast.success('Files selected!');
      localStorage.setItem('fileName', JSON.stringify(validSelectedFiles));
      navigate('/');
    } catch (error) {
      toast.error('Failed to select files. Please try again.');
    }
  };

  // Get displayed files (first 5 for main view) - use stable sorted files
  const displayedFiles = stableSortedFiles.slice(0, ITEMS_PER_PAGE);
  const hasMoreFiles = stableSortedFiles.length > ITEMS_PER_PAGE;
  
  // Debug: Log what's being displayed
  console.log('📊 RENDER STATE:', {
    stableSortedFiles: stableSortedFiles.slice(0, 3), // First 3 only to avoid spam
    displayedFiles: displayedFiles.slice(0, 3),
    selectedFiles: selectedFiles.slice(0, 3)
  });

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Handle view all modal close
  const handleViewAllClose = () => {
    setShowViewAllModal(false);
    setSearchTerm('');
  };

  // Description Modal Handlers - COMMENTED OUT
  // const handleDescChange = (fileName, value) => {
  //   setFileDescriptions(prev => ({ ...prev, [fileName]: value }));
  // };

  // const handleDescModalClose = () => {
  //   setShowDescModal(false);
  //   setPendingUploadFiles([]);
  //   setFileDescriptions({});
  // };

  // const handleDescModalSubmit = async () => {
  //   // Validate all descriptions are filled
  //   const missing = pendingUploadFiles.some(f => !fileDescriptions[f.name]?.trim());
  //   if (missing) {
  //     toast.error('Please enter a description for all files.');
  //     return;
  //   }
  //   await uploadFiles(pendingUploadFiles, fileDescriptions);
  //   setShowDescModal(false);
  //   setPendingUploadFiles([]);
  //   setFileDescriptions({});
  // };

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

      {/* View All Modal */}
      <Dialog 
        open={showViewAllModal} 
        onClose={handleViewAllClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          py: 3
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={600}>
              All Files ({stableSortedFiles.length})
            </Typography>
            <Button
              onClick={handleViewAllClose}
              sx={{ 
                color: 'white',
                minWidth: 'auto',
                p: 1,
                borderRadius: '50%',
                '&:hover': { background: 'rgba(255,255,255,0.1)' }
              }}
            >
              <FaTimes />
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Search Bar */}
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e0e0e0',
            background: '#fafafa'
          }}>
            <Box position="relative">
              <TextField
                fullWidth
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="medium"
                InputProps={{
                  startAdornment: <FaSearch style={{ marginRight: 12, color: '#666' }} />,
                  endAdornment: searchTerm && (
                    <Button
                      onClick={clearSearch}
                      sx={{ 
                        minWidth: 'auto',
                        p: 0.5,
                        color: '#666',
                        '&:hover': { background: 'rgba(0,0,0,0.04)' }
                      }}
                    >
                      <FaTimes />
                    </Button>
                  ),
                  sx: {
                    borderRadius: 2,
                    background: 'white',
                    '& fieldset': { borderColor: '#e0e0e0' },
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                  }
                }}
              />
            </Box>
            {selectedFiles.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="primary" fontWeight={500}>
                  {selectedFiles.length} file(s) selected
                </Typography>
              </Box>
            )}
          </Box>

          {/* Files Grid in Modal */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 3,
            background: '#f8f9fa'
          }}>
            {filteredFiles.length === 0 ? (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                height="300px"
                sx={{ color: '#666' }}
              >
                <FaSearch style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }} />
                <Typography variant="h6" gutterBottom>
                  {searchTerm ? 'No files found' : 'No files available'}
                </Typography>
                <Typography variant="body2">
                  {searchTerm ? 'Try adjusting your search terms' : 'Upload some files to get started'}
                </Typography>
              </Box>
            ) : (
              <div className="modal-file-grid">
                {filteredFiles.map((file, idx) => (
                  <div
                    className={`modal-file-card ${selectedFiles.includes(file) ? 'selected' : ''}`}
                    key={file}
                    onClick={() => handleFileCardClick(file)}
                  >
                    {selectedFiles.includes(file) && (
                      <div className="selected-indicator">
                        <FaCheck className="check-icon" />
                      </div>
                    )}
                    <div className="modal-thumbnail-wrapper">
                      <img src={thumbnail} alt="thumbnail" className="modal-file-thumbnail" />
                    </div>
                    <div className="modal-file-name" title={file}>{file}</div>
                    {deletingFile === file ? (
                      <CircularProgress size={20} className="modal-delete-icon loading" />
                    ) : (
                      <FaTrashAlt
                        className="modal-delete-icon"
                        title="Delete file"
                        onClick={e => handleDelete(file, e)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #e0e0e0',
          background: '#fafafa',
          gap: 2
        }}>
          <Button onClick={handleViewAllClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSubmitSelectedFiles();
              setShowViewAllModal(false);
            }}
            disabled={selectedFiles.length === 0}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Submit Selected ({selectedFiles.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Description Modal - COMMENTED OUT */}
      {/* <Dialog open={showDescModal} onClose={handleDescModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>File Descriptions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please enter a description for each file you are uploading:
          </Typography>
          {pendingUploadFiles.map(file => (
            <Box key={file.name} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{file.name}</Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={fileDescriptions[file.name] || ''}
                onChange={e => handleDescChange(file.name, e.target.value)}
                placeholder="Enter description"
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDescModalClose}>Cancel</Button>
          <Button onClick={handleDescModalSubmit} variant="contained">Upload</Button>
        </DialogActions>
      </Dialog> */}

      {/* Main Content */}
      <div className="header-section">
        <h1 className="data-source-title">Data Source</h1>
        <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{stableSortedFiles.length}</span>
          <span className="stat-label">Total Files</span>
        </div>
          <div className="stat-item">
            <span className="stat-number">{selectedFiles.length}</span>
            <span className="stat-label">Selected</span>
          </div>
        </div>
      </div>

      <div className="file-grid">
        {/* Upload Card */}
        <div className="file-card upload-card" onClick={handleUploadClick} tabIndex={0} role="button">
          <input
            type="file"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isUploading}
            multiple 
            accept=".csv,.xml,.pdf" 
          />
          <div className="thumbnail-wrapper">
            <FaPlus className="plus-icon" />
          </div>
          <div className="file-name">Upload New</div>
          {isUploading && <CircularProgress size={24} style={{ marginTop: 8 }} />}
        </div>

        {/* File Cards */}
        {loading ? (
          <div className="loading-container">
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
              Loading files...
            </Typography>
          </div>
        ) : displayedFiles.length === 0 && stableSortedFiles.length === 0 ? (
          <div className="empty-state">
            <FaCloudUploadAlt className="empty-icon" />
            <Typography variant="h6" gutterBottom>
              No files found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Upload your first file to get started
            </Typography>
          </div>
        ) : (
          displayedFiles.map((file, idx) => (
            <div
              className={`file-card ${selectedFiles.includes(file) ? 'selected' : ''}`}
              key={file}
              tabIndex={0}
              onClick={() => handleFileCardClick(file)}
            >
              {selectedFiles.includes(file) && (
                <div className="selected-indicator">
                  <FaCheck className="check-icon" />
                </div>
              )}
              <div className="thumbnail-wrapper">
                <img src={thumbnail} alt="thumbnail" className="file-thumbnail" />
              </div>
              <div className="file-name" title={file}>{file}</div>
              {deletingFile === file ? (
                <CircularProgress size={22} className="delete-icon loading" />
              ) : (
                <FaTrashAlt
                  className="delete-icon"
                  title="Delete file"
                  onClick={e => handleDelete(file, e)}
                />
              )}
            </div>
          ))
        )}

        {/* View All Card */}
        {hasMoreFiles && (
          <div 
            className="file-card view-all-card" 
            onClick={() => {
              if (window && window.amplitude) {
                logAmplitudeEvent('Data Source View All', { data: stableSortedFiles });
                console.log('[Amplitude] Data Source View All event sent', stableSortedFiles);
              }
              setShowViewAllModal(true);
            }}
            tabIndex={0} 
            role="button"
          >
            <div className="view-all-content">
              <div className="view-all-icon">
                <span className="more-count">+{stableSortedFiles.length - ITEMS_PER_PAGE}</span>
              </div>
              <div className="view-all-text">View All Files</div>
              <div className="view-all-subtitle">
                {stableSortedFiles.length} total files
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit button for selected files */}
      {selectedFiles.length > 0 && (
        <div className="submit-section">
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmitSelectedFiles}
            disabled={selectedFiles.length === 0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Submit ({selectedFiles.length})
          </Button>
        </div>
      )}
    </div>
  );
}