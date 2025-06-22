import { API_URL } from '../../const';
import './index.css';
import { useState } from 'react';
import Plot from 'react-plotly.js';

const AiAndModels = () => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        model: 'RandomForest', // Default set to RandomForest
        col: '',
        frequency: 'days', // Default frequency
        tenure: '1' // Default tenure
    });
    const [rfInputs, setRfInputs] = useState({});

    const rawData = localStorage.getItem('fileData');
    let fileData = null;
    try {
        fileData = rawData ? JSON.parse(rawData)?.data ? JSON.parse(JSON.parse(rawData).data) : null : null;
    } catch (error) {
        console.error('Error parsing fileData:', error);
    }

    const columns = fileData && Object.keys(fileData)?.length > 0 ? Object.keys(fileData) : [];

    const models = [
        { id: 'RandomForest', label: 'Random Forest' },
        { id: 'K-Means', label: 'K-Means' },
        { id: 'Arima', label: 'ARIMA' },
        { id: 'OutlierDetection', label: 'Outlier Detection' }
    ];

    const frequencyOptions = [
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'months', label: 'Months' },
        { value: 'quarters', label: 'Quarters' },
        { value: 'years', label: 'Years' }
    ];

    const tenureOptions = [1, 3, 5, 7, 10]; // Example tenure values

    const handleModelChange = (model) => {
        setFormData(prev => ({ ...prev, model, col: '' }));
        setResponse(null);
        setRfInputs({});
    };

    const handleColumnChange = (e) => {
        const col = e.target.value;
        setFormData(prev => ({ ...prev, col }));
    };

    const handleFrequencyChange = (e) => {
        const frequency = e.target.value;
        setFormData(prev => ({ ...prev, frequency }));
    };

    const handleTenureChange = (e) => {
        const tenure = e.target.value;
        setFormData(prev => ({ ...prev, tenure }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Get user ID from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id;

            const response = await fetch(`${API_URL}/models`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-User-ID': userId,
                },
                body: new URLSearchParams({
                    model: formData.model,
                    col: formData.col,
                    frequency: formData.frequency,
                    tenure: formData.tenure
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
    
        // Check if the response contains the specific message
        if (response.msg) {
            return <div className="error-text">{response.msg}</div>;
        }
    
        switch (formData.model) {
            case 'RandomForest':
                return (
                    <div className="rf-container">
                        <h2 className="response-title">Random Forest Prediction</h2>
                        <p className="status-text">Status: {response.status} True</p>
                        <div className="rf-content">
                            <form className="rf-input-form" onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const formData2 = new FormData();
                                    formData2.append('form_name', 'rf');
                                    formData2.append('targetColumn', formData.col);
                                    Object.entries(rfInputs).forEach(([key, value]) => {
                                        formData2.append(key, value);
                                    });
    
                                    // Get user ID from localStorage
                                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                                    const userId = user.id;

                                    const response = await fetch(`${API_URL}/model_predict`, {
                                        method: 'POST',
                                        headers: {
                                            'X-User-ID': userId,
                                        },
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
                        </div>
                    </div>
                );
    
            case 'K-Means':
                let clusteredData;
                try {
                    clusteredData = JSON.parse(response.clustered_data);
                } catch (error) {
                    console.error('Error parsing clustered_data:', error);
                    return <div className="error-text">This dataset doesn't meet the modeling requirement</div>;
                }
    
                const tableColumns = Object.keys(clusteredData);
                const rows = Object.keys(clusteredData[tableColumns[0]]).map(rowIndex => {
                    const row = {};
                    tableColumns.forEach(col => {
                        row[col] = clusteredData[col][rowIndex];
                    });
                    return row;
                });
    
                return (
                    <div className="response-container">
                        <h2 className="response-title">Clustering Results</h2>
                        <p className="status-text">Status: {response.status} True</p>
                        <p className="status-text">Clusters: {response.cluster} True</p>
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
                        <h2 className="response-title">Outlier Detection Results</h2>
                        <p className="status-text">Status: {response.status} True</p>
                        <div className="processed-data">
                            <h3 className="response-subtitle">Analysis Details:</h3>
                            <pre className="data-explanation">{response.processed_data}</pre>
                        </div>
                    </div>
                );
    
            case 'Arima':
                let plotData;
                try {
                    plotData = response?.path ? JSON.parse(response?.path) : null;
                } catch (error) {
                    console.error('Error parsing plot data:', error);
                    return <div className="error-text">This dataset doesn't meet the modeling requirement</div>;
                }
    
                return (
                    <div className="response-container">
                        <h2 className="response-title">ARIMA Model Results</h2>
                        <p className="status-text">Status: {response?.status ? "True" : "False"}</p>
                        {plotData && <Plot
                            data={plotData?.data}
                            layout={{
                                ...plotData?.layout,
                                autosize: true,
                                plot_bgcolor: '#ffffff',
                                paper_bgcolor: '#ffffff',
                                margin: { l: 50, r: 50, t: 50, b: 50 }
                            }}
                            config={{ responsive: true }}
                            className="arima-plot"
                        />}
                    </div>
                );
    
            default:
                return <pre className="default-response">{JSON.stringify(response, null, 2)}</pre>;
        }
    };
    

    return (
        <div className="modern-container">
            <h1 className="modern-title">AI and Models Analysis</h1>
            
            <form onSubmit={handleSubmit} className="modern-form">
                <div className="tab-panel">
                    <div className="tabs">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                type="button"
                                className={`tab-button ${formData.model === model.id ? 'active' : ''}`}
                                onClick={() => handleModelChange(model.id)}
                            >
                                {model.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group2">
                    <label className="modern-label">
                        Target Column
                        <select
                            name="col"
                            className="modern-select"
                            value={formData.col}
                            onChange={handleColumnChange}
                            disabled={!formData.model}
                        >
                            <option value="" disabled>Select target column</option>
                            {columns.map((column) => (
                                <option key={column} value={column}>
                                    {column}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

   {formData.model==="Arima"&&     <>
                {/* New frequency dropdown */}
                <div className="form-group2">
                    <label className="modern-label">
                        Frequency
                        <select
                            name="frequency"
                            className="modern-select"
                            value={formData.frequency}
                            onChange={handleFrequencyChange}
                        >
                            {frequencyOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {/* New tenure dropdown */}
                <div className="form-group2">
                    <label className="modern-label">
                        Tenure
                        <select
                            name="tenure"
                            className="modern-select"
                            value={formData.tenure}
                            onChange={handleTenureChange}
                        >
                            {tenureOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

        </>}
                <button 
                    type="submit" 
                    className="modern-submit"
                    disabled={loading || !formData.model || !formData.col}
                >
                    {loading ? 'Analyzing...' : 'Analyze Data'}
                </button>
            </form>

            {loading && <div className="modern-loading">Processing your data...</div>}
            {response && (
                <div className="response-wrapper">
                    {renderResponse()}
                </div>
            )}
        </div>
    );
};

export default AiAndModels;