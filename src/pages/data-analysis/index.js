import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './index.css';
import { API_URL } from '../../const';
import Plot from 'react-plotly.js';
import { LoadingIndicator } from '../../components/loader';

const DataAnalysis = () => {
  const location = useLocation();
  const fileData = JSON.parse(localStorage.getItem('fileData'));

  const [analysisData, setAnalysisData] = useState(fileData);
  const [apiData, setApiData] = useState(null);
  const [plotData, setPlotData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get data from localStorage instead of location state
  const fileName = localStorage.getItem('fileName');
  useEffect(() => {
    // Fetch API data when component mounts
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user ID from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

        const [dataResponse] = await Promise.all([
          fetch(`${API_URL}/dataprocess`, {
            headers: {
              'X-User-ID': userId,
            },
          })    
            ]);
        
        const data = await dataResponse.json();
        const plots = {...data?.barplots, ...data?.pieplots, ...data?.scatterplots, ...data?.boxplots};
        setApiData(data);
        setPlotData(plots);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const renderSummaryStats = () => {
    if (!apiData) return null;
    
    const stats = [
      { label: 'Total Records', value: apiData.nof_rows },
      { label: 'Number of Columns', value: apiData.nof_columns },
      { label: 'Time Stamp Data', value: apiData.timestamp },
      // { label: 'Missing Records', value: apiData.missing_data },
      { label: 'Stationary', value: apiData.stationary },
      { label: 'Sentiment', value: apiData.sentiment },
    ];

    return (
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.label}</h3>
            <p>{stat.value || 'N/A'}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderAccordionSection = (title, content) => (
    <div className="accordion-item">
      <h2 className="accordion-header">
        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#${title.replace(/\s+/g, '')}`}>
          {title}
        </button>
      </h2>
      <div id={title.replace(/\s+/g, '')} className="accordion-collapse collapse show">
        <div className="accordion-body">
          {content}
        </div>
      </div>
    </div>
  );

  const renderTable = () => {
    if (!apiData?.data || apiData?.data == 'No data') return <p>No data available</p>;
    
    const parsedData = JSON.parse(apiData.data);
    const headers = Object.keys(parsedData);
    const rowCount = Object.values(parsedData)[0] ? Object.keys(Object.values(parsedData)[0]).length : 0;
    
    // Helper function to format date values
    const formatValue = (value, header) => {
      if (header === 'Date' && typeof value === 'number') {
        return new Date(value).toLocaleDateString();
      }
      return value;
    };
    
    // Limit rows to first 100 for better performance
    const maxRows = Math.min(rowCount, 100);
    
    return (
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(maxRows)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <td key={colIndex}>
                    {formatValue(parsedData[header][rowIndex], header)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rowCount > 100 && (
          <div className="table-info">
            <p>Showing first 100 rows out of {rowCount} total rows</p>
          </div>
        )}
      </div>
    );
  };

  const renderMissingValueAnalysis = () => {
    if (!apiData?.missingvalue || apiData?.missingvalue == 'No data' ) return <p>No data available</p>;
    
    const missingData = JSON.parse(apiData.missingvalue);
    return (
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Missing Value Count</th>
            </tr>
          </thead>
          <tbody>
            {missingData.map((item, index) => (
              <tr key={index}>
                <td>{item.Parameters}</td>
                <td>{item["Missing Value Count"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderNumericalAnalysis = () => {
    if (!apiData?.numdf || apiData.numdf == 'No data') return <p>No data available</p>;

    const numData = JSON.parse(apiData.numdf);
    
    // Check if numData is an array or object
    if (!Array.isArray(numData) || numData.length === 0) {
      return <p>No numerical data available</p>;
    }

    // Extract column names and statistical metrics
    const columnNames = numData.map(item => item.ColumnName || 'Unknown Column');
    const metricKeys = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'];
    const metricLabels = ['Count', 'Mean', 'Std Dev', 'Min', '25th Percentile', 'Median', '75th Percentile', 'Max'];
    
    return (
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Metric</th>
              {columnNames.map((columnName, index) => (
                <th key={index}>{columnName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricKeys.map((metricKey, metricIndex) => (
              <tr key={metricKey}>
                <td><strong>{metricLabels[metricIndex]}</strong></td>
                {numData.map((columnData, columnIndex) => {
                  const value = columnData[metricKey];
                  const numericValue = Number(value);
                  return (
                    <td key={columnIndex}>
                      {isNaN(numericValue) || value === null || value === undefined 
                        ? 'N/A' 
                        : numericValue.toFixed(2)
                      }
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCategoricalAnalysis = () => {
    if (!apiData || !apiData['data description']) return <p>No data available</p>;
    
    const dataDescription = apiData['data description'];
    
    // Convert technical data types to user-friendly ones
    const getUserFriendlyType = (technicalType) => {
      const typeMap = {
        'datetime64[ns]': 'Date/Time',
        'int64': 'Integer',
        'int32': 'Integer',
        'float64': 'Number',
        'float32': 'Number',
        'object': 'Text',
        'bool': 'Boolean',
        'category': 'Category'
      };
      return typeMap[technicalType] || technicalType;
    };

    const dataTypes = Object.entries(dataDescription).map(([column, type]) => ({
      column,
      type: getUserFriendlyType(type)
    }));

    return (
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
            </tr>
          </thead>
          <tbody>
            {dataTypes.map((item, index) => (
              <tr key={index}>
                <td>{item.column}</td>
                <td>{item.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPlots = () => {
    if (!plotData) return null;

    return Object.entries(plotData).map(([key, value]) => {
      const graphData = JSON.parse(value);
      return (
        <div key={key} className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className="accordion-button" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target={`#plot-${key.replace(/\s+/g, '')}`}
            >
              {key}
            </button>
          </h2>
          <div id={`plot-${key.replace(/\s+/g, '')}`} className="accordion-collapse collapse show">
            <div className="accordion-body">
              <Plot
                data={graphData?.data}
                layout={graphData?.layout}
                config={{ responsive: true }}
                style={{
                  width: "100%",
                  height: "60vh",
                  padding: "15px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                }}
              />
            </div>
          </div>
        </div>
      );
    });
  };

  // if (!analysisData) {
  //   return (
  //     <div className="analysis-container">
  //       <div className="loading">Loading data analysis...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="analysis-container">
      {loading && <LoadingIndicator message="Loading analysis data..." />}
      
      <h1 className="analysis-title">Data Analysis</h1>
      {/* <div className="file-info">
        <h2>Analyzing: {fileName}</h2>
      </div> */}
      
      {renderSummaryStats()}

      <div className="accordion mt-4">
        {renderAccordionSection('Data Overview', renderTable())}
        {renderAccordionSection('Feature Analysis', renderCategoricalAnalysis())}
        {renderAccordionSection('Numerical Analysis', renderNumericalAnalysis())}
        {/* {renderAccordionSection('Missing Value Analysis', renderMissingValueAnalysis())} */}
        {/* {renderAccordionSection('Visualizations', renderPlots())} */}
      </div>
    </div>
  );
};

export default DataAnalysis;