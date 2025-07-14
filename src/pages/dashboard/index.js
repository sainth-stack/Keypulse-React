import { useEffect, useState, useRef } from "react";
import { API_URL } from "../../const";
import Plot from "react-plotly.js";
import { 
  Typography, 
  Box, 
  IconButton, 
  Tooltip,
  CircularProgress,
  Alert,
  Fade
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
  const hasFetched = useRef(false);

  // Cache key for localStorage
  const CACHE_KEY = 'dashboard_data';
  const CACHE_EXPIRY_KEY = 'dashboard_data_expiry';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Monitor fileName changes from localStorage
  useEffect(() => {
    const checkFileName = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentFileName = user.fileName || localStorage.getItem('fileName');
      
      if (currentFileName !== fileName) {
        setFileName(currentFileName);
        // Clear cache when fileName changes
        clearCache();
        fetchData(true);
      }
    };

    // Check immediately
    checkFileName();

    // Set up interval to check for fileName changes
    const interval = setInterval(checkFileName, 1000);

    return () => clearInterval(interval);
  }, [fileName]);

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

  const fetchData = async (forceRefresh = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setLastRefresh(new Date(parseInt(localStorage.getItem(CACHE_EXPIRY_KEY)) - CACHE_DURATION));
          setLoading(false);
          return;
        }
      }

      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      const response = await fetch(`${API_URL}/get_plots`, {
        headers: {
          'X-User-ID': userId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle new API structure - check if plots are in the new format
      let plots;
      if (result?.plots) {
        // New structure: result.plots contains plot objects with description and plot_data
        plots = result.plots;
      } else {
        // Old structure: plots are spread across different categories
        plots = { 
          ...result?.barplots, 
          ...result?.pieplots, 
          ...result?.scatterplots, 
          ...result?.boxplots,
          ...result?.additionalplots 
        };
      }
      
      setData(plots);
      setCachedData(plots);
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to fetch dashboard data");
      // Try to use cached data as fallback
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setLastRefresh(new Date(parseInt(localStorage.getItem(CACHE_EXPIRY_KEY)) - CACHE_DURATION));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    clearCache();
    fetchData(true);
  };

  // Clear cache on page reload/mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    // Clear cache on page reload
    clearCache();
    fetchData(true);

    return () => {
      hasFetched.current = false;
    };
  }, []);

  const parsedData = data
    ? Object.entries(data).map(([title, plotObject]) => {
        try {
          // Handle new API structure where each plot has description and plot_data
          if (plotObject && typeof plotObject === 'object' && plotObject.plot_data) {
            return {
              title,
              description: plotObject.description,
              graphData: JSON.parse(plotObject.plot_data),
            };
          } else {
            // Handle old structure where plotObject is the JSON string directly
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
      }).filter(item => item.graphData !== null) // Filter out failed parses
    : [];

  const getIconForChart = (title) => {
    if (title.toLowerCase().includes('trend') || title.toLowerCase().includes('time')) {
      return <TrendingUpIcon style={{ color: '#1976d2', marginRight: '8px' }} />;
    }
    return <VisibilityIcon style={{ color: '#1976d2', marginRight: '8px' }} />;
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div style={{ 
        padding: '24px', 
        margin: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <VisibilityIcon style={{ fontSize: '32px', marginRight: '16px' }} />
            <div>
              <Typography variant="h4" component="h1" style={{ 
                fontWeight: 'bold', 
                color: 'white',
                marginBottom: '4px'
              }}>
                Visualizations
              </Typography>
              <Typography variant="body1" style={{ opacity: 0.9 }}>
                Real-time insights and data visualization
              </Typography>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {lastRefresh && (
              <div className="status-indicator status-success">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                className="refresh-button"
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              >
                {loading ? (
                  <CircularProgress size={24} style={{ color: 'white' }} />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            style={{ marginBottom: '24px', borderRadius: '8px' }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <LoadingIndicator message="Loading dashboard data..." />
        </div>
      )}

      {/* Charts Grid - Custom CSS Grid Layout */}
      {parsedData.length > 0 && (
        <div className="dashboard-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          padding: '0 16px'
        }}>
          {parsedData.map(({ title, description, graphData }, index) => (
            <div key={index} className="chart-container fade-in-up">
              <div className="dashboard-card" style={{
                borderRadius: '12px',
                padding: '24px',
                minHeight: '500px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Chart Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  {getIconForChart(title)}
                  <div style={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="h2"
                      style={{ 
                        fontWeight: 600,
                        color: '#333',
                        fontSize: '1.1rem',
                        marginBottom: '4px'
                      }}
                    >
                      {title}
                    </Typography>
                    {description && (
                      <Typography 
                        variant="body2" 
                        style={{ 
                          color: '#666',
                          fontSize: '0.875rem'
                        }}
                      >
                        {description}
                      </Typography>
                    )}
                  </div>
                </div>
                
                {/* Chart Container */}
                <div className="plotly-chart" style={{ 
                  flex: 1,
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Plot
                    data={graphData?.data || []}
                    layout={{ 
                      ...graphData?.layout, 
                      title: "", 
                      autosize: true,
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: {
                        family: '"Roboto", "Helvetica", "Arial", sans-serif',
                        size: 11,
                        color: '#333'
                      },
                      margin: { t: 10, r: 10, b: 50, l: 50 },
                      showlegend: graphData?.layout?.showlegend || false,
                      hovermode: 'closest'
                    }}
                    config={{ 
                      responsive: true,
                      displayModeBar: false,
                      staticPlot: false,
                      scrollZoom: false,
                      doubleClick: false,
                      showTips: false,
                      displaylogo: false
                    }}
                    style={{ 
                      width: "100%", 
                      height: "400px"
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
        <div className="dashboard-card" style={{
          padding: '64px',
          textAlign: 'center',
          margin: '0 16px',
          borderRadius: '12px'
        }}>
          <VisibilityIcon style={{ fontSize: '64px', color: '#999', marginBottom: '16px' }} />
          <Typography variant="h6" style={{ color: '#666', marginBottom: '8px' }}>
            No visualization data available
          </Typography>
          <Typography variant="body2" style={{ color: '#999' }}>
            Click the refresh button to load data
          </Typography>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
