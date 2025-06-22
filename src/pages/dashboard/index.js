import { useEffect, useState } from "react";
import { API_URL } from "../../const";
import Plot from "react-plotly.js";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { LoadingIndicator } from "../../components/loader";
import './index.css'

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const parsedData = data
    ? Object.entries(data).map(([title, graphJson]) => ({
        title,
        graphData: JSON.parse(graphJson),
      }))
    : [];

  return (
    <>
      {loading && <LoadingIndicator message="Loading dashboard data..." />}
      <Grid container spacing={3} padding={3}>
        {parsedData.map(({ title, graphData }, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card elevation={3} sx={{ borderRadius: 3, padding: 2, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{fontWeight:600}}>
                  {title}
                </Typography>
                <Plot
                  data={graphData?.data}
                  layout={{ ...graphData?.layout, title: "", autosize: true }}
                  config={{ responsive: true, useResizeHandler: true }}
                  style={{ width: "100%", height: "50vh",boxShadow:'none' }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Dashboard;
