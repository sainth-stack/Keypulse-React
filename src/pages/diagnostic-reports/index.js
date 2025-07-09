import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { LoadingIndicator } from '../../components/loader';
import { message, Card, Row, Col, Button } from 'antd';
import './index.css';

const DiagnosticReports = () => {
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [charts, setCharts] = useState([]);

  useEffect(() => {
    loadDataAndGenerateGraphs();
  }, []);

  const loadDataAndGenerateGraphs = async () => {
    setLoading(true);
    try {
      const fileData = JSON.parse(localStorage.getItem('fileData') || '{}');
      
      if (!fileData || !fileData.data) {
        message.error('No data available. Please upload a dataset first.');
        setLoading(false);
        return;
      }

      const parsedData = JSON.parse(fileData.data);
      setRawData(parsedData);
      
      // Generate 4 charts (2 advanced + 2 normal)
      const generatedCharts = generate4Charts(parsedData);
      setCharts(generatedCharts);
      
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load data for graphs');
    } finally {
      setLoading(false);
    }
  };

  const generate4Charts = (data) => {
    const columns = Object.keys(data);
    const charts = [];
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];

    if (columns.length === 0) return [];

    // Better column detection - more lenient
    const numericalColumns = [];
    const categoricalColumns = [];
    
    columns.forEach(col => {
      const values = Object.values(data[col]).slice(0, 50); // Check more samples
      const numericValues = values.filter(val => {
        const num = parseFloat(val);
        return !isNaN(num) && isFinite(num) && val !== null && val !== '';
      });
      
      // If more than 70% of values are numeric, consider it numerical
      if (numericValues.length > values.length * 0.7 && numericValues.length > 0) {
        numericalColumns.push(col);
      } else {
        categoricalColumns.push(col);
      }
    });

    console.log('Numerical columns:', numericalColumns);
    console.log('Categorical columns:', categoricalColumns);

    // CHART 1: Advanced - Correlation Heatmap (if we have 2+ numerical columns)
    if (numericalColumns.length >= 2) {
      const correlationMatrix = calculateCorrelationMatrix(data, numericalColumns.slice(0, 5)); // Max 5 columns
      charts.push({
        id: 'correlation-heatmap',
        title: 'Correlation Analysis',
        data: {
          data: [{
            z: correlationMatrix.values,
            x: correlationMatrix.labels,
            y: correlationMatrix.labels,
            type: 'heatmap',
            colorscale: 'RdBu',
            zmin: -1,
            zmax: 1,
            showscale: true,
            text: correlationMatrix.values.map(row => 
              row.map(val => val.toFixed(2))
            ),
            texttemplate: "%{text}",
            textfont: {
              size: 12,
              color: "white"
            },
            hovertemplate: '<b>%{y}</b> vs <b>%{x}</b><br>Correlation: %{z:.3f}<extra></extra>',
            colorbar: {
              title: "Correlation<br>Coefficient",
              titleside: "right",
              tickmode: "linear",
              tick0: -1,
              dtick: 0.5
            }
          }],
          layout: {
            title: {
              text: 'Feature Correlation Matrix',
              font: { size: 16, color: '#333' }
            },
            xaxis: { 
              title: 'Features',
              tickangle: 45,
              side: 'bottom'
            },
            yaxis: { 
              title: 'Features',
              tickangle: 0
            },
            plot_bgcolor: '#fafafa',
            paper_bgcolor: '#ffffff',
            margin: { l: 80, r: 30, t: 60, b: 80 },
            annotations: []
          }
        }
      });
    }

    // CHART 2: Advanced - Multi-Dimensional Scatter (if we have 2+ numerical and 1+ categorical)
    if (numericalColumns.length >= 2 && categoricalColumns.length > 0) {
      const col1 = numericalColumns[0];
      const col2 = numericalColumns[1];
      const colorCol = categoricalColumns[0];
      
      const values1 = Object.values(data[col1]).map(v => parseFloat(v)).filter(v => !isNaN(v));
      const values2 = Object.values(data[col2]).map(v => parseFloat(v)).filter(v => !isNaN(v));
      const colorValues = Object.values(data[colorCol]);

      charts.push({
        id: 'multi-scatter',
        title: 'Multi-Dimensional Analysis',
        data: {
          data: [{
            x: values1,
            y: values2,
            type: 'scatter',
            mode: 'markers',
            marker: {
              color: colorValues,
              size: 12,
              opacity: 0.8,
              line: { width: 2, color: 'white' },
              colorscale: 'Viridis',
              showscale: true,
              colorbar: {
                title: colorCol,
                titleside: "right"
              }
            },
            text: colorValues.map((v, i) => 
              `${colorCol}: ${v}<br>${col1}: ${values1[i]}<br>${col2}: ${values2[i]}`
            ),
            hovertemplate: '%{text}<extra></extra>',
            name: 'Data Points'
          }],
          layout: {
            title: {
              text: `${col1} vs ${col2} (colored by ${colorCol})`,
              font: { size: 16, color: '#333' }
            },
            xaxis: { 
              title: {
                text: col1,
                font: { size: 14, color: '#666' }
              },
              showgrid: true,
              gridcolor: '#e0e0e0'
            },
            yaxis: { 
              title: {
                text: col2,
                font: { size: 14, color: '#666' }
              },
              showgrid: true,
              gridcolor: '#e0e0e0'
            },
            plot_bgcolor: '#fafafa',
            paper_bgcolor: '#ffffff',
            margin: { l: 60, r: 30, t: 60, b: 60 },
            showlegend: false
          }
        }
      });
    }

    // CHART 3: Normal - Bar Chart (for categorical data)
    if (categoricalColumns.length > 0) {
      const col = categoricalColumns[0];
      const values = Object.values(data[col]);
      const counts = {};
      values.forEach(val => counts[val] = (counts[val] || 0) + 1);
      
      const sortedEntries = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 categories

      charts.push({
        id: 'bar-chart',
        title: 'Category Distribution',
        data: {
          data: [{
            x: sortedEntries.map(([key]) => key),
            y: sortedEntries.map(([, count]) => count),
            type: 'bar',
            marker: {
              color: colors[0],
              line: { width: 1, color: '#ffffff' }
            },
            text: sortedEntries.map(([, count]) => count),
            textposition: 'outside',
            textfont: {
              size: 12,
              color: '#333'
            },
            hovertemplate: '<b>%{x}</b><br>Count: %{y}<br>Percentage: %{customdata:.1f}%<extra></extra>',
            customdata: sortedEntries.map(([, count]) => 
              (count / values.length * 100)
            ),
            name: 'Categories'
          }],
          layout: {
            title: {
              text: `Distribution of ${col}`,
              font: { size: 16, color: '#333' }
            },
            xaxis: { 
              title: {
                text: col,
                font: { size: 14, color: '#666' }
              },
              tickangle: 45
            },
            yaxis: { 
              title: {
                text: 'Count',
                font: { size: 14, color: '#666' }
              },
              showgrid: true,
              gridcolor: '#e0e0e0'
            },
            plot_bgcolor: '#fafafa',
            paper_bgcolor: '#ffffff',
            margin: { l: 60, r: 30, t: 60, b: 100 },
            showlegend: false
          }
        }
      });
    }

    // CHART 4: Normal - Line Chart (for numerical data trends)
    if (numericalColumns.length > 0) {
      const col = numericalColumns[0];
      const values = Object.values(data[col])
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v));
      
      if (values.length > 0) {
        const indices = values.map((_, idx) => idx + 1);
        
        charts.push({
          id: 'line-chart',
          title: 'Trend Analysis',
          data: {
            data: [{
              x: indices,
              y: values,
              type: 'scatter',
              mode: 'lines+markers',
              name: col,
              line: { 
                color: colors[1], 
                width: 3
              },
              marker: { 
                color: colors[1], 
                size: 8,
                line: { width: 2, color: 'white' }
              },
              text: values.map((val, i) => `Point ${i + 1}: ${val.toFixed(2)}`),
              hovertemplate: '<b>Data Point %{x}</b><br>%{fullData.name}: %{y:.2f}<extra></extra>'
            }],
            layout: {
              title: {
                text: `${col} Trend Over Data Points`,
                font: { size: 16, color: '#333' }
              },
              xaxis: { 
                title: {
                  text: 'Data Point Index',
                  font: { size: 14, color: '#666' }
                },
                showgrid: true,
                gridcolor: '#e0e0e0'
              },
              yaxis: { 
                title: {
                  text: col,
                  font: { size: 14, color: '#666' }
                },
                showgrid: true,
                gridcolor: '#e0e0e0'
              },
              plot_bgcolor: '#fafafa',
              paper_bgcolor: '#ffffff',
              margin: { l: 60, r: 30, t: 60, b: 60 },
              showlegend: true,
              legend: {
                x: 0,
                y: 1,
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: '#ccc',
                borderwidth: 1
              }
            }
          }
        });
      }
    }

    // Fallback charts if we don't have enough data for the above
    if (charts.length === 0) {
      // If no numerical columns, create simple charts from first few columns
      const firstCol = columns[0];
      const values = Object.values(data[firstCol]);
      
      // Simple frequency chart
      const counts = {};
      values.forEach(val => counts[val] = (counts[val] || 0) + 1);
      const entries = Object.entries(counts).slice(0, 10);
      
      charts.push({
        id: 'fallback-bar',
        title: 'Data Overview',
        data: {
          data: [{
            x: entries.map(([key]) => key),
            y: entries.map(([, count]) => count),
            type: 'bar',
            marker: { color: colors[0] },
            text: entries.map(([, count]) => count),
            textposition: 'outside',
            textfont: { size: 12, color: '#333' },
            hovertemplate: '<b>%{x}</b><br>Count: %{y}<extra></extra>',
            name: 'Values'
          }],
          layout: {
            title: {
              text: `${firstCol} Overview`,
              font: { size: 16, color: '#333' }
            },
            xaxis: { 
              title: {
                text: firstCol,
                font: { size: 14, color: '#666' }
              }
            },
            yaxis: { 
              title: {
                text: 'Count',
                font: { size: 14, color: '#666' }
              }
            },
            plot_bgcolor: '#fafafa',
            paper_bgcolor: '#ffffff',
            margin: { l: 60, r: 30, t: 60, b: 60 },
            showlegend: false
          }
        }
      });
    }

    // Add histogram if we have numerical data and less than 4 charts
    if (charts.length < 4 && numericalColumns.length > 0) {
      const col = numericalColumns[0];
      const values = Object.values(data[col])
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v));
      
      if (values.length > 0) {
        charts.push({
          id: 'histogram',
          title: 'Distribution Analysis',
          data: {
            data: [{
              x: values,
              type: 'histogram',
              marker: {
                color: colors[2],
                opacity: 0.7,
                line: { width: 1, color: 'white' }
              },
              nbinsx: Math.min(20, Math.max(8, Math.ceil(Math.sqrt(values.length)))),
              hovertemplate: '<b>Range:</b> %{x}<br><b>Count:</b> %{y}<br><b>Percentage:</b> %{customdata:.1f}%<extra></extra>',
              name: col
            }],
            layout: {
              title: {
                text: `${col} Distribution`,
                font: { size: 16, color: '#333' }
              },
              xaxis: { 
                title: {
                  text: col,
                  font: { size: 14, color: '#666' }
                },
                showgrid: true,
                gridcolor: '#e0e0e0'
              },
              yaxis: { 
                title: {
                  text: 'Frequency',
                  font: { size: 14, color: '#666' }
                },
                showgrid: true,
                gridcolor: '#e0e0e0'
              },
              plot_bgcolor: '#fafafa',
              paper_bgcolor: '#ffffff',
              margin: { l: 60, r: 30, t: 60, b: 60 },
              showlegend: false
            }
          }
        });
      }
    }

    // Add pie chart if we have categorical data and less than 4 charts
    if (charts.length < 4 && categoricalColumns.length > 0) {
      const col = categoricalColumns[0];
      const values = Object.values(data[col]);
      const counts = {};
      values.forEach(val => counts[val] = (counts[val] || 0) + 1);
      
      const entries = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
      
      if (entries.length > 1) {
        charts.push({
          id: 'pie-chart',
          title: 'Composition Analysis',
          data: {
            data: [{
              values: entries.map(([, count]) => count),
              labels: entries.map(([key]) => key),
              type: 'pie',
              marker: { 
                colors: colors,
                line: { color: 'white', width: 2 }
              },
              textinfo: 'label+percent+value',
              textposition: 'outside',
              textfont: {
                size: 12,
                color: '#333'
              },
              hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>',
              name: col
            }],
            layout: {
              title: {
                text: `${col} Composition`,
                font: { size: 16, color: '#333' }
              },
              showlegend: true,
              legend: {
                orientation: "v",
                x: 1.05,
                y: 0.5,
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: '#ccc',
                borderwidth: 1
              },
              plot_bgcolor: '#fafafa',
              paper_bgcolor: '#ffffff',
              margin: { l: 60, r: 60, t: 60, b: 60 }
            }
          }
        });
      }
    }

    return charts.slice(0, 4); // Ensure exactly 4 charts
  };

  const calculateCorrelationMatrix = (data, numericalCols) => {
    const matrix = [];
    const labels = numericalCols;
    
    numericalCols.forEach(col1 => {
      const row = [];
      numericalCols.forEach(col2 => {
        const values1 = Object.values(data[col1])
          .map(v => parseFloat(v))
          .filter(v => !isNaN(v));
        const values2 = Object.values(data[col2])
          .map(v => parseFloat(v))
          .filter(v => !isNaN(v));
        const correlation = calculatePearsonCorrelation(values1, values2);
        row.push(correlation);
      });
      matrix.push(row);
    });
    
    return { values: matrix, labels };
  };

  const calculatePearsonCorrelation = (x, y) => {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    
    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const downloadChart = (chartData, filename) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${filename}</h1>
            <div id="chart" style="width:100%;height:600px;"></div>
          </div>
          <script>
            Plotly.newPlot('chart', ${JSON.stringify(chartData.data)}, ${JSON.stringify(chartData.layout)}, {responsive: true});
          </script>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingIndicator message="Generating charts..." />;
  }

  if (!rawData) {
    return (
      <div className="diagnostic-container">
        <div className="no-data">
          <h2>📊 No Data Available</h2>
          <p>Please upload a dataset first to generate graphs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="diagnostic-container">
      <h1>Analytics</h1>

      <Row gutter={[16, 16]}>
        {charts.map((chart) => (
          <Col xs={24} lg={12} key={chart.id}>
            <Card 
              title={chart.title}
              extra={
                <Button 
                  size="small"
                  onClick={() => downloadChart(chart, chart.title.replace(/[^a-zA-Z0-9]/g, '-'))}
                >
                  Download
                </Button>
              }
              className="chart-card"
            >
              <Plot
                data={chart.data.data}
                layout={{...chart.data.layout, height: 400}}
                config={{ 
                  responsive: true, 
                  displayModeBar: true,
                  modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                  displaylogo: false
                }}
                style={{ width: '100%', height: '400px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {charts.length === 0 && (
        <div className="no-charts">
          <h3>No charts could be generated</h3>
          <p>Please make sure your data has valid columns with data.</p>
        </div>
      )}
    </div>
  );
};

export default DiagnosticReports; 