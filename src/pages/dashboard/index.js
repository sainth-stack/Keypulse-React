import { useEffect, useState, useRef } from "react";
import { API_URL } from "../../const";
import Plot from "react-plotly.js";
import { Typography, Grid, Paper } from "@mui/material";
import { LoadingIndicator } from "../../components/loader";
import './index.css'

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls
    if (hasFetched.current) return;
    
    const fetchData = async () => {
      hasFetched.current = true;
      setLoading(true);
      try {
        // Get user ID from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

        const response = await fetch(`${API_URL}/get_plots`, {
          headers: {
            'X-User-ID': userId,
          },
        });
        const result = await response.json();
        const plots = { ...result?.barplots, ...result?.pieplots, ...result?.scatterplots, ...result?.boxplots,...result?.additionalplots };
        setData(plots);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Reset flag on error so user can retry
        hasFetched.current = false;
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      // Reset flag when component unmounts
      hasFetched.current = false;
    };
  }, []);

  const parsedData = data
    ? Object.entries(data).map(([title, graphJson]) => ({
        title,
        graphData: JSON.parse(graphJson),
      }))
    : [];

  return (
    <div className="dashboard-container">
      {loading && <LoadingIndicator message="Loading dashboard data..." />}
      <Grid container spacing={3} padding={3} className="dashboard-grid">
        {parsedData.map(({ title, graphData }, index) => (
          <Grid item xs={12} md={6} key={index} className="dashboard-grid-item">
            <Paper 
              elevation={2} 
              className="dashboard-paper"
            >
              <Typography variant="h6" className="dashboard-title">
                {title}
              </Typography>
              <div className="plotly-graph-container">
                <Plot
                  data={graphData?.data}
                  layout={{ 
                    ...graphData?.layout, 
                    title: "", 
                    autosize: true,
                    margin: { l: 60, r: 40, t: 40, b: 100 },
                    showlegend: graphData?.layout?.showlegend !== false,
                    xaxis: {
                      ...graphData?.layout?.xaxis,
                      tickangle: -45,
                      tickfont: { size: 12 },
                      title: {
                        ...graphData?.layout?.xaxis?.title,
                        standoff: 20
                      }
                    },
                    yaxis: {
                      ...graphData?.layout?.yaxis,
                      tickfont: { size: 12 },
                      title: {
                        ...graphData?.layout?.yaxis?.title,
                        standoff: 20
                      }
                    }
                  }}
                  config={{ 
                    responsive: true, 
                    useResizeHandler: true,
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d']
                  }}
                  style={{ width: "100%", height: "100%" }}
                  useResizeHandler={true}
                />
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Dashboard;
