import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import Plot from 'react-plotly.js';
import Spinner from 'react-bootstrap/Spinner';
import { Spin, Collapse, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import Bot from '../bot';

const Bot2 = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [messageType, setMessageType] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! How can I assist you today?' }
  ]);
  const [recentChats, setRecentChats] = useState([]);
  const [visualizationData, setVisualizationData] = useState(null);

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
        const response = await fetch('http://54.169.213.200:4004/api/file_upload', {
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

    setMessages(prev => [...prev, { 
      type: 'user', 
      content: message,
      question:true,
      isLoading: true 
    }]);
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('prompt', message);

    // Get user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    try {
      setIsLoading(true); // Ensure loading starts before the request
    
      const endpoint = 'http://54.169.213.200:4003/api/genai_bot';
      
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
    
      const data = await response.json();
    console.log(data,'dsfsd')
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? { ...msg, isLoading: false } : msg
      ).concat([{ 
        type: 'bot', 
        content:data?.chart_response ? "" :data?.text_output || data?.text_pre_code_response,
        plotsData:data?.chart_response || (data?.plot ? JSON.parse(data?.plot || `{}`):null),
        code:data?.code || "Not Found",
        data:data?.data ? JSON.parse(data?.data):""
      }]));
    
      setRecentChats(prev => [...prev, { question: message, answer: data?.result }]);
    
      if (messageType === 'graph') {
        setVisualizationData(data?.chartData);
      }
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

  const fileInputRef = useRef(null);

  const handleIconClick = () => {
    fileInputRef.current.click(); 
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
   <div>
    <Bot />
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
                  width: msg.question ? "fit-content" : "100%", // 50% for questions, 100% for answers
                  flexDirection: "column",
                  gap: "10px",
                  maxWidth: "100%",
                  alignSelf: msg.question ? "flex-end" : "flex-start",
                  alignItems: msg.question ? "flex-end" : "flex-start", // Align content accordingly
                }}
              >
                {msg?.content && msg?.content}
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
                  <Plot
                    data={msg?.plotsData?.data}
                    layout={msg?.plotsData?.layout}
                    config={{ responsive: true }}
                    style={{
                      width: "100%",
                      height: "60vh",
                      padding: "15px",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                    }}
                    className="plot-container"
                  />
                )}
          
          {msg?.data && (
            <div style={{ padding: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Forecast Data</h2>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #ccc',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <thead style={{ backgroundColor: '#f5f5f5' }}>
                  <tr>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: '#444',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      borderBottom: '1px solid #ccc',
                    }}>Date</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: '#444',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      borderBottom: '1px solid #ccc',
                    }}>Forecasted Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(msg.data.date).map((key) => (
                    <tr
                      key={key}
                      style={{
                        borderTop: '1px solid #e0e0e0',
                        backgroundColor: key % 2 === 0 ? '#fff' : '#f9f9f9',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f1f1')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = key % 2 === 0 ? '#fff' : '#f9f9f9')
                      }
                    >
                      <td style={{ padding: '12px' }}>{msg.data.date[key]}</td>
                      <td style={{ padding: '12px' }}>{msg.data.forecasted_value[key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              placeholder="Ask something..."
            />
            <input
              type="file"
              className="file-input"
              ref={fileInputRef}
              onChange={handleFileChange}
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
        {file && (
            <div className="file-name">
              Selected file: {file.name}
            </div>
          )}
      </div>
    </div>
   </div>
  );
};

export default Bot2;