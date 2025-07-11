import { API_URL } from '../../const';
import './index.css';
import { useState } from 'react';
import Plot from 'react-plotly.js';

const AiAndModels = () => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        model: 'Prediction', // Default set to Prediction
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
        { id: 'Classification', label: 'Classification', description: 'Discover hidden patterns and segment data using clustering' },
        { id: 'Prediction', label: 'Prediction', description: 'Categorize data into distinct groups using supervised learning' },
        { id: 'Forecast', label: 'Forecast', description: 'Time-series forecasting for trend analysis' },
        { id: 'OutlierDetection', label: 'Outlier Detection', description: 'Identify anomalies and unusual patterns' }
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

            // Map business terms to technical models
            const modelMapping = {
                'Classification': 'K-Means',
                'Prediction': 'RandomForest',
                'Forecast': 'Arima',
                'OutlierDetection': 'OutlierDetection'
            };

            const response = await fetch(`${API_URL}/models`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-User-ID': userId,
                },
                body: new URLSearchParams({
                    model: modelMapping[formData.model],
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
            case 'Classification':
                let clusteredData;
                try {
                    clusteredData = JSON.parse(response.clustered_data);
                } catch (error) {
                    console.error('Error parsing clustered_data:', error);
                    return <div className="error-text">This dataset doesn't meet the clustering requirements</div>;
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
                        <h2 className="response-title">Pattern Recognition Results</h2>
                        <div className="business-inference">
                            <h3>Business Insights:</h3>
                            <p>
                                This analysis discovers hidden patterns in your <strong>{formData.col}</strong> data by grouping similar records together. 
                                These clusters reveal natural segments in your data that can inform customer targeting, product positioning, and strategic decisions.
                            </p>
                        </div>
                        <p className="status-text">Analysis Status: {response.status ? 'Successfully Completed' : 'Analysis Failed'}</p>
                        <p className="status-text">Clusters Identified: {response.cluster}</p>
                        <div className="table-container">
                            <table className="clustered-data-table">
                                <thead>
                                    <tr>
                                        {tableColumns.map(col => (
                                            <th key={col}>{col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
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
    
            case 'Prediction':
                return (
                    <div className="rf-container">
                        <h2 className="response-title">Prediction Analysis</h2>
                        <div className="business-inference">
                            <h3>Business Insights:</h3>
                            <p>
                                This model can categorize your {formData.col} data into distinct groups, helping you understand different segments in your business data.
                            </p>
                        </div>
                        <p className="status-text">Model Status: {response.status ? 'Successfully Trained' : 'Training Failed'}</p>
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
                                    <h4>Enter Values for Prediction:</h4>
                                    {response.rf_cols?.map((col) => (
                                        <div key={col} className="rf-form-group">
                                            <label className="rf-label">
                                                {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                <input
                                                    type={col.toLowerCase().includes('date') ? 'date' : 'text'}
                                                    className="rf-input"
                                                    value={rfInputs[col] || ''}
                                                    onChange={(e) => setRfInputs(prev => ({
                                                        ...prev,
                                                        [col]: e.target.value
                                                    }))}
                                                    required
                                                    placeholder={`Enter ${col.replace(/_/g, ' ')}`}
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
                                        <div className="business-interpretation">
                                            <h4>Business Interpretation:</h4>
                                            <p>
                                                Based on the input data, this record belongs to the "{response.rf_result}" category. This prediction can help you understand customer segments, risk categories, or performance tiers.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
    
            case 'Forecast':
                let plotData;
                try {
                    plotData = response?.path ? JSON.parse(response?.path) : null;
                } catch (error) {
                    console.error('Error parsing plot data:', error);
                    return <div className="error-text">This dataset doesn't meet the forecasting requirements</div>;
                }
    
                return (
                    <div className="response-container">
                        <h2 className="response-title">Time Series Forecast Results</h2>
                        <div className="business-inference">
                            <h3>Business Insights:</h3>
                            <p>
                                This forecast analysis predicts future trends for <strong>{formData.col}</strong> over the next {formData.tenure} {formData.frequency}. 
                                The model identifies seasonal patterns, trends, and potential future values to support strategic planning and resource allocation.
                            </p>
                        </div>
                        <p className="status-text">Forecast Status: {response?.status ? "Successfully Generated" : "Generation Failed"}</p>
                        {plotData && (
                            <>
                                <Plot
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
                                />

                            </>
                        )}
                    </div>
                );
    
            case 'OutlierDetection':
                return (
                    <div className="response-container">
                        <h2 className="response-title">Anomaly Detection Results</h2>
                        <div className="business-inference">
                            <h3>Business Insights:</h3>
                            <p>
                                This analysis identifies unusual patterns or anomalies in your <strong>{formData.col}</strong> data. 
                                Outliers can indicate data quality issues, fraud, exceptional performance, or opportunities for investigation.
                            </p>
                        </div>
                        <p className="status-text">Detection Status: {response.status ? 'Analysis Complete' : 'Analysis Failed'}</p>
                        <div className="processed-data">
                            <h3 className="response-subtitle">Analysis Details:</h3>
                            <div 
                                className="data-explanation" 
                                dangerouslySetInnerHTML={{ __html: response.processed_data }}
                            />
                        </div>
                    </div>
                );
    
            default:
                return <pre className="default-response">{JSON.stringify(response, null, 2)}</pre>;
        }
    };
    

    return (
        <div className="modern-container">
            <h1 className="modern-title">AI and Models Analysis</h1>
            
            <form onSubmit={handleSubmit} className="modern-form2">
                <div className="tab-panel">
                    <div className="tabs">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                type="button"
                                className={`tab-button ${formData.model === model.id ? 'active' : ''}`}
                                onClick={() => handleModelChange(model.id)}
                                title={model.description}
                            >
                                {model.label}
                            </button>
                        ))}
                    </div>
                    <div className="model-description">
                        <p>{models.find(m => m.id === formData.model)?.description}</p>
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

   {formData.model==="Forecast"&&     <>
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
                        Forecast Period
                        <select
                            name="tenure"
                            className="modern-select"
                            value={formData.tenure}
                            onChange={handleTenureChange}
                        >
                            {tenureOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option} {formData.frequency}
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
                    {loading ? 'Analyzing...' : `Run ${formData.model} Analysis`}
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