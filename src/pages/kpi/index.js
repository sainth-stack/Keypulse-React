import React, { useState } from 'react';
import { API_URL } from '../../const.js';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { Spin, Collapse, message } from 'antd';
import { LoadingOutlined, CopyOutlined } from '@ant-design/icons';
import './index.css';

const Kpi = () => {
    const [kpis, setKpis] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [selectedKpiImage, setSelectedKpiImage] = useState([]);
    const [loadingImage, setLoadingImage] = useState(false);
    const [selectedKpiNames, setSelectedKpiNames] = useState([]);
    const [generatingKPIs, setGeneratingKPIs] = useState(false); // New state for KPI generation loading

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) {
            message.warning('Please enter a prompt');
            return;
        }

        setGeneratingKPIs(true); // Start loading

        try {
            // Get user ID from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id;

            const response = await axios.post(`${API_URL}/kpi_process`, 
                `prompt=${encodeURIComponent(prompt)}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-User-ID': userId,
                    }
                }
            );
            setKpis(response?.data?.kpis || []);
            message.success('KPIs generated successfully');
        } catch (error) {
            console.error('Error fetching KPIs:', error);
            message.error('Failed to generate KPIs');
        } finally {
            setGeneratingKPIs(false); // Stop loading
        }
    };

    const generateKPIImage = async (kpi) => {
        const kpiName = kpi["KPI Name"];
        try {
            setLoadingImage(true);
            setSelectedKpiNames(prev => [...prev, kpiName]);
            
            const newKpiImage = {
                name: kpiName,
                plots: null,
                code: null,
                loading: true
            };
            
            setSelectedKpiImage(prev => [...prev, newKpiImage]);

            // Get user ID from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id;

            const response = await axios.post(`${API_URL}/generate_code`,
                `kpi_names=${encodeURIComponent(kpiName)}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-User-ID': userId,
                    }
                }
            );

            if (response?.data?.code || response?.data?.plots) {
                const formattedCode = response.data.code;
                const plots = response.data.plots;

                setSelectedKpiImage(prev => 
                    prev.map(item => 
                        item.name === kpiName
                            ? {
                                ...item,
                                loading: false,
                                code: formattedCode,
                                plots: plots
                            }
                            : item
                    )
                );
                message.success(`Generated visualization for ${kpiName}`);
            }
        } catch (error) {
            console.error('Error generating KPI visualization:', error);
            message.error(`Failed to generate visualization for ${kpiName}`);
            setSelectedKpiNames(prev => prev.filter(name => name !== kpiName));
            setSelectedKpiImage(prev => prev.filter(item => item.name !== kpiName));
        } finally {
            setLoadingImage(false);
        }
    };

    const handleCardClick = (kpi) => {
        if (loadingImage) return;

        const kpiName = kpi["KPI Name"];
        if (selectedKpiNames.includes(kpiName)) {
            setSelectedKpiNames(prev => prev.filter(name => name !== kpiName));
            setSelectedKpiImage(prev => prev.filter(item => item.name !== kpiName));
        } else {
            generateKPIImage(kpi);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code)
            .then(() => {
                message.success('Code copied to clipboard');
            })
            .catch(() => {
                message.error('Failed to copy code');
            });
    };

    return (
        <div className="kpi-container">
            <h1 className="kpi-title">KPI Generator</h1>
            
            <form className="kpi-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <div className="input-label">
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter your prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                    <Spin spinning={generatingKPIs} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
                        <button type="submit" className="submit-button" disabled={generatingKPIs}>
                            {generatingKPIs ? 'Generating...' : 'Generate KPIs'}
                        </button>
                    </Spin>
                </div>
            </form>

            {Object.keys(kpis)?.length > 0 && (
                <div className="kpi-grid">
                    {Object.entries(kpis).map(([key, kpi]) => (
                        <div
                            key={key}
                            className={`kpi-card ${selectedKpiNames.includes(kpi.KPI_Name) ? 'selected' : ''}`}
                            onClick={() => handleCardClick(kpi)}
                        >
                            <div className="kpi-header">
                                {/* <div className="kpi-icon">
                                    <i className="fas fa-chart-line"></i>
                                </div> */}
                                <h3 className="kpi-name">{kpi["KPI Name"]}</h3>
                            </div>
                            <div className="kpi-details">
                                <div className="kpi-detail-row">
                                    <span className="detail-label">Column:</span>
                                    <span className="detail-value">{kpi.Column}</span>
                                </div>
                                <div className="kpi-detail-row">
                                    <span className="detail-label">Logic:</span>
                                    <span className="detail-value">{kpi.Logic}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedKpiImage.length > 0 && (
                <Collapse>
                    {selectedKpiImage.map((item, index) => (
                        <Collapse.Panel header={item.name} key={index}>
                            {item.loading ? (
                                <div className="loading-container">
                                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                                </div>
                            ) : (
                                <>
                                    {item?.plots && Object.entries(item.plots).map(([plotName, plotData]) => (
                                        <div key={plotName} className="plot-container">
                                            <h3>{plotName}</h3>
                                            <Plot
                                                data={plotData.data}
                                                layout={{
                                                    ...plotData.layout,
                                                    autosize: true,
                                                    margin: { l: 50, r: 50, t: 50, b: 50 }
                                                }}
                                                config={{ responsive: true }}
                                                style={{
                                                    width: '100%',
                                                    height: '60vh',
                                                    padding: '15px',
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: '12px'
                                                }}
                                            />
                                        </div>
                                    ))}
                                    {item?.code && Object.entries(item.code).map(([plotName, plotData]) => (
                                        <div className="code-block-container">
                                            <button 
                                                className="copy-button"
                                                onClick={() => handleCopyCode(plotData)}
                                            >
                                                <CopyOutlined /> Copy
                                            </button>
                                            <div 
                                                className="code-block"
                                                dangerouslySetInnerHTML={{ __html: plotData }}
                                            />
                                        </div>
                                    ))}
                                </>
                            )}
                        </Collapse.Panel>
                    ))}
                </Collapse>
            )}
        </div>
    );
};

export default Kpi;