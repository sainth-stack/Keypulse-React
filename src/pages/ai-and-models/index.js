import { API_URL } from '../../const';
import './index.css';
import { useState } from 'react';
import Plot from 'react-plotly.js';

const AiAndModels = () => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        model: '',
        col: ''
    });
    const [rfInputs, setRfInputs] = useState({});

    // Get data from localStorage and parse it properly
    const rawData = localStorage.getItem('fileData');
    let fileData = null;
    try {
        fileData = rawData ? JSON.parse(rawData)?.data ? JSON.parse(JSON.parse(rawData).data) : null : null;
    } catch (error) {
        console.error('Error parsing fileData:', error);
    }

    // Get column names from the processed data
    const columns = fileData && Object.keys(fileData)?.length > 0 ? Object.keys(fileData) : [];

    const handleModelChange = (e) => {
        const model = e.target.value;
        setFormData({ model, col: '' }); // Reset the column when model changes
        setResponse(null); // Reset the response
        setRfInputs({}); // Reset the Random Forest inputs
    };

    const handleColumnChange = (e) => {
        const col = e.target.value;
        setFormData(prev => ({ ...prev, col }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/models`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    model: formData.model,
                    col: formData.col,
                }),
            });

            const data = await response.json();
            setResponse(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderResponse = () => {
        if (!response) return null;

        switch (formData.model) {
            case 'RandomForest':
                return (
                    <div className="rf-container">
                        <h2>Random Forest Prediction</h2>
                        <p>Status: {response.status} True</p>
                       {response.rf_cols ? <div className="rf-content">
                            <form className="rf-input-form" onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    // Create FormData and append all inputs
                                    const formData2 = new FormData();
                                    formData2.append('form_name', 'rf');
                                    formData2.append('targetColumn', formData.col);
                                    Object.entries(rfInputs).forEach(([key, value]) => {
                                        formData2.append(key, value);
                                    });

                                    const response = await fetch(`${API_URL}/model_predict`, {
                                        method: 'POST',
                                        body: formData2,
                                    });
                                    const data = await response.json();
                                    setResponse(prev => ({
                                        ...prev,
                                        rf_result: data.rf_result
                                    }));
                                } catch (error) {
                                    console.error('Error:', error);
                                }
                            }}>
                                <div className="rf-inputs">
                                    {response.rf_cols?.map((col) => (
                                        <div key={col} className="rf-form-group">
                                            <label className="rf-label">
                                                {col.replace(/_/g, ' ')}
                                                <input
                                                    type={col.toLowerCase().includes('date') ? 'date' : 'text'}
                                                    className="rf-input"
                                                    value={rfInputs[col] || ''}
                                                    onChange={(e) => setRfInputs(prev => ({
                                                        ...prev,
                                                        [col]: e.target.value
                                                    }))}
                                                    required
                                                />
                                            </label>
                                        </div>
                                    ))}
                                    <button type="submit" className="rf-submit-button">
                                        Get Prediction
                                    </button>
                                </div>
                            </form>
                            <div className="rf-result">
                                {response.rf_result && (
                                    <div className="prediction-result">
                                        <h3>Prediction Result:</h3>
                                        <p className="result-value">{response.rf_result}</p>
                                    </div>
                                )}
                            </div>
                        </div> : <div>{response?.msg || "No data found"}</div>}
                    </div>
                );
            case 'K-Means':
                // Parse the clustered_data string into an object
                let clusteredData;
                try {
                    clusteredData = JSON.parse(response.clustered_data);
                } catch (error) {
                    console.error('Error parsing clustered_data:', error);
                    return <div>This dataset doesn't meet the modeling requirement</div>;
                }

                // Get column names from the clustered data
                const tableColumns = Object.keys(clusteredData);

                // Convert object structure to array of rows
                const rows = Object.keys(clusteredData[tableColumns[0]]).map(rowIndex => {
                    const row = {};
                    tableColumns.forEach(col => {
                        row[col] = clusteredData[col][rowIndex];
                    });
                    return row;
                });

                return (
                    <div className="response-container">
                        <h2>Clustering Results</h2>
                        <p>Status: {response.status} True</p>
                        <p>Clusters: {response.cluster} True</p>
                        
                        <div className="table-container">
                            <table className="clustered-data-table">
                                <thead>
                                    <tr>
                                        {tableColumns.map(col => (
                                            <th key={col}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={index}>
                                            {tableColumns.map(col => (
                                                <td key={`${index}-${col}`}>
                                                    {typeof row[col] === 'number' 
                                                        ? row[col].toFixed(2) 
                                                        : row[col]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'OutlierDetection':
                return (
                    <div className="response-container">
                        <h2>Outlier Detection Results</h2>
                        <p>Status: {response.status}  True</p>
                    <div>
               {response.processed_data ? <div className="processed-data">
                            <h3>Analysis Details:</h3>
                            <pre className="data-explanation">
                                {response.processed_data}
                            </pre>
                        </div> : <div>{"This dataset doesn't meet the modeling requirement." || "No data found"}</div>}
                    </div>

                    </div>
                );
            case 'Arima':
                // Parse the response data
                let plotData;
                try {
                    plotData = response?.path ? JSON.parse(response?.path) : null;
                } catch (error) {
                    console.error('Error parsing plot data:', error);
                    return <div>This dataset doesn't meet the modeling requirement.</div>;
                }
                return (
                    <div className="">
                        <h2>ARIMA Model Results</h2>
                        {/* <p>Status: {response?.status ? "True" : "False"}</p> */}
                        {plotData ? <Plot
                            data={plotData?.data}
                            layout={plotData?.layout}
                            config={{ responsive: true }}
                            style={{
                                width: "100%",
                                height: "60vh",
                                padding: "15px",
                                backgroundColor: "#ffffff",
                                borderRadius: "12px",
                            }}
                            className=""
                        /> :<div>This dataset doesn't meet the modeling requirement.</div>}
                    </div>
                );
            default:
                return <pre>{JSON.stringify(response, null, 2)}</pre>;
        }
    };

    return (
        <div className="container">
            <h1 className="title">AI and Models</h1>
            <form onSubmit={handleSubmit} className="styled-form">
                <div className="form-group">
                    <label className="label">
                        Select Model
                        <select 
                            name="model" 
                            id="model" 
                            className="select"
                            value={formData.model}
                            onChange={handleModelChange}
                        >
                            <option value="" disabled hidden>Select your Model</option>
                            <option value="RandomForest">Random Forest</option>
                            <option value="K-Means">K-Means</option>
                            <option value="Arima">Arima</option>
                            <option value="OutlierDetection">Outlier Detection</option>
                        </select>
                    </label>
                </div>

                <div className="form-group">
                    <label className="label">
                        Target Column
                        <select 
                            name="col" 
                            id="cols" 
                            className="select"
                            value={formData.col}
                            onChange={handleColumnChange}
                        >
                            <option value="" disabled hidden>Select target column</option>
                            {columns.map((column) => (
                                <option key={column} value={column}>
                                    {column}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Analyze Data'}
                </button>
            </form>

            {loading && <div className="loading">Processing...</div>}
            {response && renderResponse()}
        </div>
    );
};

export default AiAndModels;