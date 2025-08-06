import { useEffect, useState, useRef } from "react";
import { API_URL } from "../../const";
import Plot from "react-plotly.js";
import axios from "axios";
import {
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Fade,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon
} from "@mui/icons-material";
import { LoadingIndicator } from "../../components/loader";
import './index.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileKeys, setFileKeys] = useState([]);
  const hasFetched = useRef(false);

  // For initial mount check
  const isInitialMount = useRef(true);

  // Advanced dialog states
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [numOfPlots, setNumOfPlots] = useState(4);
  const [numOfRows, setNumOfRows] = useState(100);
  const [advancedLoading, setAdvancedLoading] = useState(false);

  // Cache keys
  const CACHE_KEY = 'dashboard_data';
  const CACHE_EXPIRY_KEY = 'dashboard_data_expiry';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Unified API call management
  const activeRequestRef = useRef(null);

  // On mount, clear cache and fetch data ONCE
  useEffect(() => {
    clearCache();
    fetchData(true);
    isInitialMount.current = false;
    
    // Cleanup on unmount
    return () => {
      cancelActiveRequest();
    };
    // eslint-disable-next-line
  }, []);

  // Watch fileName changes after mount
  useEffect(() => {
    if (isInitialMount.current) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentFileName = user.fileName || localStorage.getItem('fileName');
    if (currentFileName !== fileName) {
      setFileName(currentFileName);
      clearCache();
      fetchData(true);
    }
    // eslint-disable-next-line
  }, [fileName]);

  // Cancel any active request
  const cancelActiveRequest = () => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }
  };

  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      if (cached && expiry && Date.now() < parseInt(expiry)) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  };

  const setCachedData = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
  };

  // Parse API response for multi-file support
  const parseApiData = (apiData) => {
    if (!apiData) return { fileKeys: [], fileData: {} };
    if (apiData.data && typeof apiData.data === 'object') {
      const keys = Object.keys(apiData.data);
      return { fileKeys: keys, fileData: apiData.data };
    }
    // Fallback: treat as single file
    return { fileKeys: ["default"], fileData: { default: apiData } };
  };

  // Unified API call function
  const makeApiCall = async (config = null) => {
    // Cancel any existing request
    cancelActiveRequest();
    
    // Create new AbortController for this request
    const controller = new AbortController();
    activeRequestRef.current = controller;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    
    try {
      let response;
      
      if (config) {
        // POST request with custom config
        const formData = new FormData();
        formData.append('num_of_plots', config.numOfPlots || 4);
        formData.append('num_of_rows', config.numOfRows || 100);
        setLoading(true);
        response = await axios.post(
          `${API_URL}/get_plots`,
          formData,
          {
            headers: { 'X-User-ID': userId },
            signal: controller.signal,
          }
        );
        setLoading(false);
        return response.data;
      } else {
        // GET request with default config
        const formData = new FormData();
        formData.append('num_of_plots', 4);
        formData.append('num_of_rows', 100);
        setLoading(true);
        response = await axios.post(
          `${API_URL}/get_plots`,
          formData,
          {
            headers: { 'X-User-ID': userId },
            signal: controller.signal,
          }
        );
        setLoading(false);
        return response.data;
      }
    } catch (error) {
      setLoading(false);
      if (axios.isCancel(error) || error.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      throw error;
    } finally {
      // Clear the active request reference if this was the active request
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
    }
  };

  // Fetch data function with proper loading states
  const fetchData = async (forceRefresh = false, config = null) => {
    // Prevent multiple simultaneous calls
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      // Check cache only for GET requests without custom config
      if (!forceRefresh && !config) {
        const cachedData = getCachedData();
        if (cachedData) {
          const { fileKeys, fileData } = parseApiData(cachedData);
          setData(fileData);
          setFileKeys(fileKeys);
          setSelectedFile(fileKeys[0] || null);
          setLastRefresh(new Date(parseInt(localStorage.getItem(CACHE_EXPIRY_KEY)) - CACHE_DURATION));
          setLoading(false);
          return;
        }
      }

      // Make API call
      const result = await makeApiCall(config);
      const { fileKeys, fileData } = parseApiData(result);

      setData(fileData);
      setFileKeys(fileKeys);
      setSelectedFile(fileKeys[0] || null);
      
      // Only cache if it's a default GET request
      if (!config) {
        setCachedData(result);
      }
      
      setLastRefresh(new Date());
      setError(null);
      
    } catch (error) {
      if (error.message === 'Request cancelled') {
        // Request was cancelled, don't show error
        return;
      }
      
      console.error("Error fetching data:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch dashboard data");

      // Try to use cached data as fallback only for GET requests
      if (!config) {
        const cachedData = getCachedData();
        if (cachedData) {
          const { fileKeys, fileData } = parseApiData(cachedData);
          setData(fileData);
          setFileKeys(fileKeys);
          setSelectedFile(fileKeys[0] || null);
          setLastRefresh(new Date(parseInt(localStorage.getItem(CACHE_EXPIRY_KEY)) - CACHE_DURATION));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    clearCache();
    fetchData(true);
  };

  // Parse plots for the selected file
  const parsedData =
    data && selectedFile && data[selectedFile] && data[selectedFile].plots
      ? Object.entries(data[selectedFile].plots)
          .map(([title, plotObject]) => {
            try {
              if (plotObject && typeof plotObject === "object" && plotObject.plot_data) {
                return {
                  title,
                  description: plotObject.description,
                  graphData: JSON.parse(plotObject.plot_data),
                };
              } else {
                return {
                  title,
                  graphData: JSON.parse(plotObject),
                };
              }
            } catch (parseError) {
              console.error(`Error parsing plot data for ${title}:`, parseError);
              return {
                title,
                description: plotObject?.description,
                graphData: null,
                error: true,
              };
            }
          })
          .filter((item) => item.graphData !== null)
      : [];

  const getIconForChart = (title) => {
    if (title.toLowerCase().includes("trend") || title.toLowerCase().includes("time")) {
      return <TrendingUpIcon style={{ color: "#1976d2", marginRight: "8px" }} />;
    }
    return <VisibilityIcon style={{ color: "#1976d2", marginRight: "8px" }} />;
  };

  // Advanced Generate handler
  const handleAdvancedGenerate = async () => {
    setAdvancedLoading(true);
    
    try {
      const config = {
        numOfPlots: numOfPlots,
        numOfRows: numOfRows
      };
      
      await fetchData(true, config);
      setAdvancedOpen(false);
      
    } catch (error) {
      console.error("Error in advanced generate:", error);
      setError(error.message || "Failed to generate advanced plots");
    } finally {
      setAdvancedLoading(false);
    }
  };

  // Handle dialog close - cancel any ongoing advanced request
  const handleAdvancedClose = () => {
    if (advancedLoading) {
      cancelActiveRequest();
      setAdvancedLoading(false);
    }
    setAdvancedOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div
        style={{
          padding: "24px",
          margin: "20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <VisibilityIcon style={{ fontSize: "32px", marginRight: "16px" }} />
            <div>
              <Typography
                variant="h4"
                component="h1"
                style={{
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "4px",
                }}
              >
                Visualizations
              </Typography>
              <Typography variant="body1" style={{ opacity: 0.9 }}>
                Real-time insights and data visualization
              </Typography>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {lastRefresh && (
              <div className="status-indicator status-success">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
            {/* Generate Advanced Button */}
            <Button
              variant="contained"
              color="secondary"
              style={{
                fontWeight: 600,
                borderRadius: 8,
                boxShadow: "none",
                background: "#fff",
                color: "#764ba2",
                marginLeft: 12,
              }}
              onClick={() => setAdvancedOpen(true)}
              disabled={loading}
            >
              Custom Config
            </Button>
            {/* Refresh Button */}
            <Tooltip title="Refresh Data">
              <Button
                onClick={handleRefresh}
                disabled={loading}
                className="refresh-button"
                style={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  minWidth: 40,
                  minHeight: 40,
                  padding: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} style={{ color: "white" }} />
                ) : (
                  <RefreshIcon />
                )}
                <span style={{marginLeft: 8}}>Refresh</span>
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Advanced Generate Dialog */}
      <Dialog 
        open={advancedOpen} 
        onClose={handleAdvancedClose}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 600,
          fontSize: '1.5rem',
          color: '#2c3e50',
          textAlign: 'center',
          pb: 2,
          pt: 4,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '16px 16px 0 0'
        }}>
          Advanced Plot Configuration
        </DialogTitle>
        
        <DialogContent sx={{ px: 4, py: 3, background: '#fff' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b', 
              mb: 3, 
              textAlign: 'center',
              fontSize: '0.875rem'
            }}
          >
            Configure your visualization parameters for customized data plots
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={3}>
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 600, 
                  color: '#374151',
                  fontSize: '0.875rem'
                }}
              >
                Number of Plots
              </Typography>
              <TextField
                type="number"
                value={numOfPlots}
                onChange={(e) => setNumOfPlots(Math.max(1, Math.min(20, Number(e.target.value))))}
                inputProps={{ 
                  min: 1, 
                  max: 20,
                  style: { fontSize: '0.95rem' }
                }}
                variant="outlined"
                fullWidth
                size="medium"
                placeholder="Enter number of plots"
                disabled={advancedLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6b7280', 
                  fontSize: '0.75rem',
                  mt: 0.5,
                  display: 'block'
                }}
              >
                Range: 1-20 plots
              </Typography>
            </Box>

            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 600, 
                  color: '#374151',
                  fontSize: '0.875rem'
                }}
              >
                Data Rows per Plot
              </Typography>
              <TextField
                type="number"
                value={numOfRows}
                onChange={(e) => setNumOfRows(Math.max(1, Math.min(1000, Number(e.target.value))))}
                inputProps={{ 
                  min: 1, 
                  max: 1000,
                  style: { fontSize: '0.95rem' }
                }}
                variant="outlined"
                fullWidth
                size="medium"
                placeholder="Enter number of rows"
                disabled={advancedLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6b7280', 
                  fontSize: '0.75rem',
                  mt: 0.5,
                  display: 'block'
                }}
              >
                Range: 1-1,000 rows
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          px: 4, 
          pb: 4, 
          pt: 2, 
          gap: 2,
          background: '#fff',
          borderRadius: '0 0 16px 16px'
        }}>
          <Button 
            onClick={handleAdvancedClose}
            variant="outlined"
            size="large"
            disabled={advancedLoading}
            sx={{
              minWidth: '100px',
              borderRadius: '8px',
              borderColor: '#e5e7eb',
              color: '#6b7280',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#d1d5db',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdvancedGenerate}
            variant="contained"
            size="large"
            disabled={advancedLoading}
            sx={{
              minWidth: '120px',
              borderRadius: '8px',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
              },
              '&:disabled': {
                background: '#e5e7eb',
                boxShadow: 'none'
              }
            }}
          >
            {advancedLoading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                <span>Generating...</span>
              </Box>
            ) : (
              'Generate Plots'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Tabs for Multiple Files */}
      {fileKeys.length > 1 && (
        <Box sx={{
          borderBottom: 1,
          borderColor: "divider",
          margin: "0 20px 24px 20px",
          background: "#fff",
          borderRadius: "8px 8px 0 0"
        }}>
          <Tabs
            value={selectedFile}
            onChange={(e, newValue) => setSelectedFile(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Visualization File Tabs"
          >
            {fileKeys.map((key) => (
              <Tab
                key={key}
                label={key.replace(/_/g, " ")}
                value={key}
                sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }}
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Fade in={!!error}>
          <Alert
            severity="error"
            style={{ marginBottom: "24px", borderRadius: "8px" }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <LoadingIndicator message="Loading dashboard data..." />
        </div>
      )}

      {/* Charts Grid */}
      {!loading && parsedData.length > 0 && (
        <div
          className="dashboard-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
            gap: "24px",
            padding: "0 16px",
          }}
        >
          {parsedData.map(({ title, description, graphData }, index) => (
            <div key={index} className="chart-container fade-in-up">
              <div
                className="dashboard-card"
                style={{
                  borderRadius: "12px",
                  padding: "24px",
                  minHeight: "500px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Chart Header */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                  {getIconForChart(title)}
                  <div style={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      style={{
                        fontWeight: 600,
                        color: "#333",
                        fontSize: "1.1rem",
                        marginBottom: "4px",
                      }}
                    >
                      {title}
                    </Typography>
                    {description && (
                      <Typography variant="body2" style={{ color: "#666", fontSize: "0.875rem" }}>
                        {description}
                      </Typography>
                    )}
                  </div>
                </div>
                {/* Chart Content */}
                <div
                  className="plotly-chart"
                  style={{
                    flex: 1,
                    minHeight: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plot
                    data={graphData?.data || []}
                    layout={{
                      ...graphData?.layout,
                      title: "",
                      autosize: true,
                      paper_bgcolor: "rgba(0,0,0,0)",
                      plot_bgcolor: "rgba(0,0,0,0)",
                      font: {
                        family: '"Roboto", "Helvetica", "Arial", sans-serif',
                        size: 11,
                        color: "#333",
                      },
                      margin: { t: 10, r: 10, b: 50, l: 50 },
                      showlegend: graphData?.layout?.showlegend || false,
                      hovermode: "closest",
                    }}
                    config={{
                      responsive: true,
                      displayModeBar: false,
                      staticPlot: false,
                      scrollZoom: false,
                      doubleClick: false,
                      showTips: false,
                      displaylogo: false,
                    }}
                    style={{
                      width: "100%",
                      height: "400px",
                    }}
                    useResizeHandler={true}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && parsedData.length === 0 && (
        <div
          className="dashboard-card"
          style={{
            padding: "64px",
            textAlign: "center",
            margin: "0 16px",
            borderRadius: "12px",
          }}
        >
          <VisibilityIcon style={{ fontSize: "64px", color: "#999", marginBottom: "16px" }} />
          <Typography variant="h6" style={{ color: "#666", marginBottom: "8px" }}>
            No visualization data available
          </Typography>
          <Typography variant="body2" style={{ color: "#999" }}>
            Click the refresh button to load data
          </Typography>
        </div>
      )}
    </div>
  );
};

export default Dashboard;