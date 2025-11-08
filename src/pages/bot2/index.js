import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import Plot from 'react-plotly.js';
import Spinner from 'react-bootstrap/Spinner';
import { Collapse } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import Bot from '../bot';
import { API_URL } from '../../const';
import { LoadingIndicator } from '../../components/loader';
import { logAmplitudeEvent } from '../../utils';

const Bot2 = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(localStorage.getItem('fileName') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialFileProcessing, setIsInitialFileProcessing] = useState(false);
  const [messages, setMessages] = useState([
    
  ]);
  const [recentChats, setRecentChats] = useState([]);

  const safeParseMaybeJson = (value) => {
    if (!value) return null;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return null;
    try {
      // Replace bare NaN with null to avoid JSON.parse errors if present
      const sanitized = value.replace(/\bNaN\b/g, 'null');
      return JSON.parse(sanitized);
    } catch (_) {
      return null;
    }
  };

  const parseResponseJsonTolerant = async (response) => {
    const raw = await response.text();
    try {
      return JSON.parse(raw);
    } catch (_) {
      try {
        const sanitized = raw.replace(/\bNaN\b/g, 'null');
        return JSON.parse(sanitized);
      } catch (e2) {
        throw e2;
      }
    }
  };

  const normalizeTableOutput = (textOutput) => {
    if (!textOutput) return null;
    let parsed = textOutput;
    if (typeof textOutput === 'string') {
      try {
        parsed = JSON.parse(textOutput);
      } catch (_) {
        return null;
      }
    }
    if (!parsed || typeof parsed !== 'object' || parsed.format !== 'table') return null;

    // prefer provided columns + data if valid
    let columns = Array.isArray(parsed.columns) ? parsed.columns : undefined;
    let data = undefined;

    if (Array.isArray(parsed.data)) {
      // data is an array of row objects
      data = parsed.data.map(row => (row && typeof row === 'object') ? row : {});
      if (!columns) {
        const columnSet = new Set();
        data.forEach(row => Object.keys(row).forEach(k => columnSet.add(k)));
        columns = Array.from(columnSet);
      }
    } else if (parsed.data && typeof parsed.data === 'object') {
      // data is an object of column -> array values
      const colNames = Object.keys(parsed.data);
      const maxLen = colNames.reduce((m, c) => Math.max(m, Array.isArray(parsed.data[c]) ? parsed.data[c].length : 0), 0);
      data = Array.from({ length: maxLen }, (_, i) => {
        const row = {};
        colNames.forEach(c => {
          const colArr = Array.isArray(parsed.data[c]) ? parsed.data[c] : [];
          row[c] = colArr[i];
        });
        return row;
      });
      columns = columns || colNames;
    }

    if (!columns || !Array.isArray(data)) return null;
    return { format: 'table', columns, data };
  };

  // Fetch and cache 'describe the data' response
  const fetchDescribeData = async (fileName = null) => {
    setIsInitialFileProcessing(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    try {
      const formData = new FormData();
      formData.append('prompt', 'explain about the data');
      const response = await fetch(`${API_URL}/get_insights`, {
        method: 'POST',
        headers: {
          'X-User-ID': userId,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await parseResponseJsonTolerant(response);
      // Cache the result and file name
      localStorage.setItem('describeDataCache', JSON.stringify(data));
      if (fileName) {
        localStorage.setItem('describeDataCacheFileName', fileName);
      }
      const tableOutput = normalizeTableOutput(data?.text_output);
      const content = tableOutput ? "" : (data?.chart_response ? "" : (typeof data?.text_output === 'string' ? data?.text_output : (data?.text_pre_code_response || data?.message)));
      setMessages(prev => [...prev, {
        type: 'bot',
        content,
        tableOutput,
        plotsData: data?.chart_response || safeParseMaybeJson(data?.plot),
        code: data?.code || "Not Found",
        data: safeParseMaybeJson(data?.data) || "",
        // New format fields
        kpiSummary: data?.kpi_summary,
        executiveInsights: data?.executive_insights,
        strategicRecommendations: data?.strategic_recommendations,
        chartInsights: data?.chart_insights,
        charts: data?.charts,
        overallSummary: data?.overall_summary
      }]);
    } catch (error) {
      console.error('Error processing initial file:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'File uploaded successfully! I encountered an issue describing the data, but you can ask me questions about it.',
        code: 'Not Found'
      }]);
    } finally {
      setIsInitialFileProcessing(false);
    }
  };

  // On mount, show 'describe the data' response (from cache or API)
  useEffect(() => {
    // Log Home Opened event on mount
    const fileName = typeof file === 'string' ? file : (file?.name || '');
    if (window && window.amplitude) {
      logAmplitudeEvent('Home Opened', { fileName });
    }
    const cached = localStorage.getItem('describeDataCache');
    const cachedFileName = localStorage.getItem('describeDataCacheFileName');
    console.log(file,cachedFileName,'cached');
    const lastUploadedFileName = file ? file : null;
    if (cached && cachedFileName && lastUploadedFileName && cachedFileName === lastUploadedFileName) {
      try {
        const data = JSON.parse(cached);
        const tableOutput = normalizeTableOutput(data?.text_output);
        const content = tableOutput ? "" : (data?.chart_response ? "" : (typeof data?.text_output === 'string' ? data?.text_output : data?.text_pre_code_response));
        setMessages(prev => [...prev, {
          type: 'bot',
          content,
          tableOutput,
          plotsData: data?.chart_response || safeParseMaybeJson(data?.plot),
          code: data?.code || "Not Found",
          data: safeParseMaybeJson(data?.data) || "",
          // New format fields
          kpiSummary: data?.kpi_summary,
          executiveInsights: data?.executive_insights,
          strategicRecommendations: data?.strategic_recommendations,
          chartInsights: data?.chart_insights,
          charts: data?.charts,
          overallSummary: data?.overall_summary
        }]);
      } catch (e) {
        fetchDescribeData(lastUploadedFileName);
      }
    } else {
      fetchDescribeData(lastUploadedFileName);
    }
    // eslint-disable-next-line
  }, [file]);

  // Callback function to handle file upload completion
  const handleFileUploadComplete = async (uploadData) => {
    // Reset recent chats
    setRecentChats([]);
    // Invalidate cache and re-fetch with new file name
    if (file && file.name) {
      localStorage.removeItem('describeDataCache');
      localStorage.removeItem('describeDataCacheFileName');
      fetchDescribeData(file.name);
    } else {
      localStorage.removeItem('describeDataCache');
      localStorage.removeItem('describeDataCacheFileName');
      fetchDescribeData();
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      try {
        const response = await fetch(`${API_URL}/file_upload`, {
          method: 'POST',
          headers: {
            'X-User-ID': userId,
          },
          body: formData,
        });
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const fileName = typeof file === 'string' ? file : (file?.name || '');
    // Log Query Asked event
    if (window && window.amplitude) {
      logAmplitudeEvent('Query Asked', { query: message, fileName });
    }
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: message,
      question:true,
      isLoading: true 
    }]);
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('prompt', message);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    try {
      setIsLoading(true); 
    
      // Use interactive bot API for follow-up user questions
      const endpoint = `${API_URL}/gen_ai_interactive_bot`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-User-ID': userId,
        },
        body: formData,
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    
      const data = await parseResponseJsonTolerant(response);
      const tableOutput = normalizeTableOutput(data?.text_output);
      const postHtml = typeof data?.text_post_code_response === 'string' ? data.text_post_code_response : null;
      const preHtml = typeof data?.text_pre_code_response === 'string' ? data.text_pre_code_response : null;
      // Prefer provided HTML, otherwise if text_output is an object, pretty print it inside a <pre>
      const objectOutput = (data?.text_output && typeof data.text_output === 'object' && !Array.isArray(data.text_output)) ? `<pre>${JSON.stringify(data.text_output, null, 2)}</pre>` : null;
      const content = tableOutput ? "" : (data?.chart_response ? "" : (postHtml || preHtml || (typeof data?.text_output === 'string' ? data?.text_output : (objectOutput || ''))));
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? { ...msg, isLoading: false } : msg
      ).concat([{ 
        type: 'bot', 
        content,
        tableOutput,
        plotsData: data?.chart_response || safeParseMaybeJson(data?.plot),
        code:data?.code || "Not Found",
        data: safeParseMaybeJson(data?.data) || "",
        // New format fields
        kpiSummary: data?.kpi_summary,
        executiveInsights: data?.executive_insights,
        strategicRecommendations: data?.strategic_recommendations,
        chartInsights: data?.chart_insights,
        charts: data?.charts,
        overallSummary: data?.overall_summary
      }]));
      // Log Query Answered event
      if (window && window.amplitude) {
        const answerForLog = typeof data?.text_output === 'string' ? data.text_output : (postHtml || preHtml || '');
        logAmplitudeEvent('Query Answered', { query: message, answer: answerForLog, fileName });
      }
      setRecentChats(prev => [...prev, { question: message, answer: data?.result }]);
    } catch (error) {
      console.error('Error:', error);
      
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? { ...msg, isLoading: false } : msg
      ).concat([{ 
        type: 'bot', 
        content: 'Sorry, there was an error processing your request.',
        messageType: 'text',
        code:'Not Found'
      }]));
    } finally {
      setIsLoading(false); // Ensure loader stops in both success and failure cases
      setMessage(''); 
    }
    
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const fileInputRef = useRef(null);


  const messagesEndRef = useRef(null);

  
  return (
   <div>
    <Bot onFileUploadComplete={handleFileUploadComplete} />
    {isInitialFileProcessing && (
      <LoadingIndicator message="Processing..." />
    )}
     <div className="chat-container">
      <div className="recent-chats">
        <h3>Recent Chats</h3>
        {recentChats.map((chat, index) => (
          <div key={index} className="recent-chat-item">
            <p><strong></strong> {chat.question}</p>
            {/* <p><strong>A:</strong> {chat.answer}</p> */}
          </div>
        ))}
      </div>
      <div className="chat-window">
        <div className="chat-messages">
        {messages?.map((msg, index) =>{
          console.log(msg,'msg')  
          return  (
            <div
              key={index}
              style={{
                display: "flex",
                maxWidth: "100%",
                flexDirection: "column",
                gap: "10px",
                alignItems: msg.question ? "flex-start" : "flex-end", // Align right for questions
              }}
            >
              <div
                className={`${msg.type}-message`}
                style={{
                  display: "flex",
                  width: msg.question ? "fit-content" : "100%",
                  flexDirection: "column",
                  gap: "12px",
                  maxWidth: "100%",
                  alignSelf: msg.question ? "flex-end" : "flex-start",
                  alignItems: msg.question ? "flex-end" : "flex-start",
                }}
              >
                {msg?.content ? (
                  msg.type === "bot" ? (
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#475569', 
                      lineHeight: '1.6',
                      marginBottom: '8px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#ffffff'
                    }} dangerouslySetInnerHTML={{ __html: msg.content }} />
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '8px',
                      maxWidth: 'fit-content'
                    }}>
                      {msg.content}
                    </div>
                  )
                ) : null}

                {/* Structured text_output rendering (interactive API) */}
                {msg?.structuredOutput && (
                  <div style={{ width: '100%', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#2d3748' }}>Report</h3>
                    </div>
                    <div style={{ padding: '12px 16px', overflowX: 'auto' }}>
                      <pre style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: '#334155' }}>
{JSON.stringify(msg.structuredOutput, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Overall Summary */}
                {msg?.overallSummary && (
                  <div className="overall-summary-card" style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    marginBottom: '24px',
                    border: '1px solid #e2e8f0',
                    width: '100%'
                  }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#2d3748', 
                      marginBottom: '12px',
                      marginTop: 0
                    }}>
                      Overall Summary
                    </h3>
                    <p style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.6', margin: 0 }}>
                      {msg.overallSummary}
                    </p>
                  </div>
                )}

                {/* KPI Summary Cards */}
                {msg?.kpiSummary && Array.isArray(msg.kpiSummary) && msg.kpiSummary.length > 0 && (
                  <div style={{ marginBottom: '24px', width: '100%' }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#2d3748', 
                      marginBottom: '16px',
                      marginTop: 0
                    }}>
                      Key Performance Indicators
                    </h3>
                    <div className="kpi-grid" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '12px',
                      width: '100%'
                    }}>
                      {msg.kpiSummary.map((kpi, idx) => (
                        <div key={idx} className="kpi-card" style={{
                          backgroundColor: '#fff',
                          padding: '16px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          position: 'relative'
                        }}>
                          <div style={{ 
                            position: 'absolute', 
                            top: '10px', 
                            right: '10px',
                            fontSize: '10px',
                            fontWeight: '500',
                            color: kpi.status === 'good' ? '#10b981' : 
                                   kpi.status === 'warning' ? '#f59e0b' : '#ef4444',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span style={{ fontSize: '12px', lineHeight: 1 }} aria-hidden="true">
                              {kpi.status === 'good' ? '✔️' : (kpi.status === 'warning' ? '⚠️' : '❌')}
                            </span>
                            {kpi.status}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '8px', paddingRight: '60px' }}>
                            {kpi.name}
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                            {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                          </div>
                          {kpi.target !== null && kpi.target !== undefined && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Target: {typeof kpi.target === 'number' ? kpi.target.toLocaleString() : kpi.target}
                            </div>
                          )}
                          {kpi.impact && (
                            <div style={{ 
                              fontSize: '10px', 
                              color: '#64748b',
                              marginTop: '6px',
                              fontWeight: '500',
                              textTransform: 'capitalize'
                            }}>
                              Impact: {kpi.impact}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Executive Insights and Strategic Recommendations Side by Side */}
                {((msg?.executiveInsights && Array.isArray(msg.executiveInsights) && msg.executiveInsights.length > 0) || 
                  (msg?.strategicRecommendations && Array.isArray(msg.strategicRecommendations) && msg.strategicRecommendations.length > 0)) && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '16px', 
                    marginBottom: '24px',
                    width: '100%'
                  }}>
                    {/* Executive Insights */}
                    {msg?.executiveInsights && Array.isArray(msg.executiveInsights) && msg.executiveInsights.length > 0 && (
                      <div>
                        <h3 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#2d3748', 
                          marginBottom: '12px',
                          marginTop: 0
                        }}>
                          Executive Insights
                        </h3>
                        <ul style={{ 
                          listStyle: 'none', 
                          padding: 0, 
                          margin: 0 
                        }}>
                          {msg.executiveInsights.map((insight, idx) => (
                            <li key={idx} className="insight-item" style={{
                              backgroundColor: '#f8f9fa',
                              padding: '12px 16px',
                              borderRadius: '6px',
                              marginBottom: '8px',
                              borderLeft: '3px solid #64748b',
                              fontSize: '13px',
                              color: '#475569',
                              lineHeight: '1.6'
                            }}>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Strategic Recommendations */}
                    {msg?.strategicRecommendations && Array.isArray(msg.strategicRecommendations) && msg.strategicRecommendations.length > 0 && (
                      <div>
                        <h3 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#2d3748', 
                          marginBottom: '12px',
                          marginTop: 0
                        }}>
                          Strategic Recommendations
                        </h3>
                        <ul style={{ 
                          listStyle: 'none', 
                          padding: 0, 
                          margin: 0 
                        }}>
                          {msg.strategicRecommendations.map((recommendation, idx) => (
                            <li key={idx} className="recommendation-item" style={{
                              backgroundColor: '#f8f9fa',
                              padding: '12px 16px',
                              borderRadius: '6px',
                              marginBottom: '8px',
                              borderLeft: '3px solid #64748b',
                              fontSize: '13px',
                              color: '#475569',
                              lineHeight: '1.6'
                            }}>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Chart Insights */}
                {msg?.chartInsights && Array.isArray(msg.chartInsights) && msg.chartInsights.length > 0 && (
                  <div style={{ marginBottom: '24px', width: '100%' }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#2d3748', 
                      marginBottom: '12px',
                      marginTop: 0
                    }}>
                      Chart Insights
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      {msg.chartInsights.map((insight, idx) => (
                        <div key={idx} className="chart-insight-card" style={{
                          backgroundColor: '#fff',
                          padding: '12px 16px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          width: '100%'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '6px'
                          }}>
                            <div style={{ 
                              fontSize: '13px', 
                              fontWeight: '600', 
                              color: '#1e293b' 
                            }}>
                              {insight.kpi}
                            </div>
                            <div style={{
                              color: insight.trend === 'increasing' ? '#10b981' : 
                                     insight.trend === 'decreasing' ? '#ef4444' : '#64748b',
                              fontSize: '11px',
                              fontWeight: '500',
                              textTransform: 'capitalize'
                            }}>
                              {insight.trend}
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#64748b', 
                            lineHeight: '1.6' 
                          }}>
                            {insight.commentary}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Charts from charts array */}
                {msg?.charts && Array.isArray(msg.charts) && msg.charts.length > 0 && (
                  <div style={{ marginBottom: '24px', width: '100%' }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#2d3748', 
                      marginBottom: '16px',
                      marginTop: 0
                    }}>
                      Visualizations
                    </h3>
                    {msg.charts.map((chart, idx) => {
                      const plotlyData = safeParseMaybeJson(chart.plotly_chart);
                      return plotlyData ? (
                        <div key={idx} style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff', width: '100%' }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#1e293b',
                            marginBottom: '12px'
                          }}>
                            {chart.kpi}
                          </div>
                          <div style={{ width: '100%', height: '500px' }}>
                            <Plot
                              data={plotlyData.data}
                              layout={{
                                ...plotlyData.layout,
                                autosize: true,
                                margin: { l: 60, r: 40, t: 40, b: 60 }
                              }}
                              config={{ responsive: true, displayModeBar: false }}
                              style={{
                                width: "100%",
                                height: "100%"
                              }}
                              useResizeHandler={true}
                            />
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                {msg?.tableOutput && (
                  <div style={{ width: '100%', overflowX: 'auto', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff' }}>
                    <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {msg.tableOutput.columns?.map((col) => (
                            <th key={col} style={{ backgroundColor: '#f8fafc', padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#1e293b', borderBottom: '2px solid #e2e8f0', fontSize: '13px' }}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(msg.tableOutput.data) && msg.tableOutput.data.map((row, rowIdx) => (
                          <tr key={rowIdx} style={{ borderBottom: rowIdx === msg.tableOutput.data.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                            {msg.tableOutput.columns?.map((col) => (
                              <td key={col} style={{ padding: '12px 16px', color: '#475569', fontSize: '13px' }}>
                                {(row[col] === null || row[col] === undefined || (typeof row[col] === 'number' && Number.isNaN(row[col])) || row[col] === 'NaN') ? 'N/A' : String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {(msg?.code && msg?.code !== "Not Found") && (
              <Collapse>
                  <Collapse.Panel header="Code" key="msg-code">
                  <div key={'text'} className="code-block-container">
                              <button 
                                  className="copy-button"
                                  // onClick={() => handleCopyCode(msg.code)}
                              >
                                  <CopyOutlined /> Copy
                              </button>
                              <pre className="code-block">
                                  <code>{msg.code}</code>
                              </pre>
                          </div>
                  </Collapse.Panel>
              </Collapse>
          )}
          
                {msg?.plotsData && (
                  <div style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff', width: '100%' }}>
                    <div style={{ width: '100%', height: '500px' }}>
                      <Plot
                        data={msg?.plotsData?.data}
                        layout={{
                          ...msg?.plotsData?.layout,
                          autosize: true,
                          margin: { l: 60, r: 40, t: 40, b: 60 }
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{
                          width: "100%",
                          height: "100%"
                        }}
                        useResizeHandler={true}
                        className="plot-container"
                      />
                    </div>
                  </div>
                )}
          
          {msg?.data && (
            <div style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden', width: '100%' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#2d3748' }}>Forecast Data</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        color: '#1e293b',
                        fontWeight: '600',
                        fontSize: '13px',
                        backgroundColor: '#f8fafc',
                        borderBottom: '2px solid #e2e8f0'
                      }}>Date</th>
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        color: '#1e293b',
                        fontWeight: '600',
                        fontSize: '13px',
                        backgroundColor: '#f8fafc',
                        borderBottom: '2px solid #e2e8f0'
                      }}>Forecasted Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(msg.data.date).map((key, idx) => (
                      <tr
                        key={key}
                        style={{
                          borderBottom: idx === Object.keys(msg.data.date).length - 1 ? 'none' : '1px solid #f1f5f9'
                        }}
                      >
                        <td style={{ padding: '12px 16px', color: '#475569', fontSize: '13px' }}>{msg.data.date[key]}</td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontSize: '13px' }}>{msg.data.forecasted_value[key]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          
              </div>
              {msg.isLoading && (
                <div className="spinner-container">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              )}
            </div>
          )
        })}
  <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-container">
            {/* <FaPaperclip className="upload-icon" onClick={handleIconClick} /> */}
            <input
              type="text"
              className="chat-input"
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
            />
            <input
              type="file"
              className="file-input"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
            />
          </div>
          <button type="submit" className="send-button" disabled={isLoading}>
            {isLoading ? (
              <Spinner
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              'Send'
            )}
          </button>
        </form>
        {/* {file && (
            <div className="file-name">
              Selected file: {file.name}
            </div>
          )} */}
      </div>
    </div>
   </div>
  );
};

export default Bot2;