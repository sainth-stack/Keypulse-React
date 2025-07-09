import React, { useState, useEffect } from 'react';
import sessionManager from '../utils/sessionManager';

const SessionTestPage = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Update session info every 5 seconds
    const interval = setInterval(() => {
      const info = sessionManager.getSessionInfo();
      setSessionInfo(info);
      
      // Add log entry
      const logEntry = {
        timestamp: new Date().toLocaleTimeString(),
        isValid: info.isValid,
        timeLeft: Math.floor(info.timeUntilExpiry / 60000) + ' minutes',
        tenant: info.tenant.tenant_name || 'N/A'
      };
      
      setLogs(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 logs
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTestSessionTimeout = () => {
    // Set a very short timeout for testing (1 minute)
    const testExpiryTime = Date.now() + (1 * 60 * 1000);
    localStorage.setItem('sessionExpiryTime', testExpiryTime.toString());
    
    // Update tenant with short timeout
    const tenant = JSON.parse(localStorage.getItem('tenant') || '{}');
    tenant.tenant_timeout = 1;
    localStorage.setItem('tenant', JSON.stringify(tenant));
    
    alert('Session timeout set to 1 minute for testing!');
  };

  const handleResetSession = () => {
    sessionManager.resetSessionTimeout();
    alert('Session timeout reset!');
  };

  const handleInitializeSession = () => {
    try {
      sessionManager.initializeSessionTimeout();
      alert('Session manager initialized!');
    } catch (error) {
      alert('Error initializing session manager: ' + error.message);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Session Management Test Page</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Session Information</h3>
        {sessionInfo ? (
          <div style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            marginBottom: '10px'
          }}>
            <p><strong>Status:</strong> {sessionInfo.isValid ? 'Valid' : 'Invalid'}</p>
            <p><strong>Time Until Expiry:</strong> {Math.floor(sessionInfo.timeUntilExpiry / 60000)} minutes</p>
            <p><strong>Tenant:</strong> {sessionInfo.tenant.tenant_name || 'N/A'}</p>
            <p><strong>Timeout Duration:</strong> {sessionInfo.tenant.tenant_timeout || 'N/A'} minutes</p>
            <p><strong>User:</strong> {sessionInfo.user.username || 'N/A'}</p>
            {sessionInfo.expiryTime && (
              <p><strong>Expires At:</strong> {sessionInfo.expiryTime.toLocaleString()}</p>
            )}
          </div>
        ) : (
          <p>Loading session information...</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Controls</h3>
        <button 
          onClick={handleTestSessionTimeout}
          style={{ 
            padding: '10px 20px', 
            margin: '5px', 
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Session Timeout (1 min)
        </button>
        
        <button 
          onClick={handleResetSession}
          style={{ 
            padding: '10px 20px', 
            margin: '5px', 
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reset Session
        </button>
        
        <button 
          onClick={handleInitializeSession}
          style={{ 
            padding: '10px 20px', 
            margin: '5px', 
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Initialize Session Manager
        </button>
        
        <button 
          onClick={() => sessionManager.logout()}
          style={{ 
            padding: '10px 20px', 
            margin: '5px', 
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Local Storage Data</h3>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
          <p><strong>User:</strong> {localStorage.getItem('user') ? 'Present' : 'Missing'}</p>
          <p><strong>Tenant:</strong> {localStorage.getItem('tenant') || 'Missing'}</p>
          <p><strong>Session Expiry:</strong> {localStorage.getItem('sessionExpiryTime') || 'Missing'}</p>
        </div>
      </div>

      <div>
        <h3>Session Logs</h3>
        <button 
          onClick={handleClearLogs}
          style={{ 
            padding: '5px 10px', 
            marginBottom: '10px',
            backgroundColor: '#9E9E9E',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Clear Logs
        </button>
        
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '5px',
          height: '200px',
          overflow: 'auto',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <strong>{log.timestamp}</strong> - Status: {log.isValid ? 'Valid' : 'Invalid'} | 
                Time Left: {log.timeLeft} | Tenant: {log.tenant}
              </div>
            ))
          ) : (
            <p>No logs yet. Logs will appear here every 5 seconds.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionTestPage; 