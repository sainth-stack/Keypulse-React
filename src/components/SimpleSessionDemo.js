import React, { useState, useEffect } from 'react';

const SimpleSessionDemo = () => {
  const [timeLeft, setTimeLeft] = useState(90);
  const [isActive, setIsActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 4)]);
  };

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Show warning at 5 seconds
          if (newTime === 5 && !showWarning) {
            setShowWarning(true);
            addLog("⚠️ WARNING: Session expires in 5 seconds!");
          }
          
          // Session expired
          if (newTime <= 0) {
            setIsActive(false);
            setShowWarning(false);
            addLog("🚪 SESSION EXPIRED - User logged out!");
            alert("Session expired! You would be redirected to login.");
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, showWarning]);

  const startSession = () => {
    setTimeLeft(90);
    setIsActive(true);
    setShowWarning(false);
    addLog("🚀 Session started - 90 seconds timeout");
  };

  const simulateActivity = () => {
    setTimeLeft(90);
    setShowWarning(false);
    addLog("🔄 User activity detected - Session reset to 90 seconds");
  };

  const extendSession = () => {
    setTimeLeft(90);
    setShowWarning(false);
    addLog("⏰ Session extended - 90 seconds added");
  };

  const stopSession = () => {
    setIsActive(false);
    setShowWarning(false);
    addLog("⏹️ Session stopped");
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2>🕐 90-Second Session Timeout Demo</h2>
      
      <div style={{ 
        background: isActive ? (timeLeft > 5 ? '#e8f5e8' : '#ffeaa7') : '#f5f5f5',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          margin: '0',
          color: isActive ? (timeLeft > 5 ? '#27ae60' : '#e74c3c') : '#7f8c8d'
        }}>
          {timeLeft}s
        </h1>
        <p style={{ margin: '5px 0', fontSize: '18px' }}>
          {isActive ? 'Session Active' : 'Session Inactive'}
        </p>
        
        {showWarning && (
          <div style={{ 
            background: '#e74c3c',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            margin: '10px 0'
          }}>
            ⚠️ SESSION EXPIRING IN {timeLeft} SECONDS!
            <br />
            <button 
              onClick={extendSession}
              style={{ 
                background: 'white',
                color: '#e74c3c',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '3px',
                marginTop: '5px',
                cursor: 'pointer'
              }}
            >
              Extend Session
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startSession}
          disabled={isActive}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: isActive ? '#ccc' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isActive ? 'not-allowed' : 'pointer'
          }}
        >
          {isActive ? 'Session Running' : 'Start 90s Session'}
        </button>
        
        <button 
          onClick={simulateActivity}
          disabled={!isActive}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: !isActive ? '#ccc' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isActive ? 'not-allowed' : 'pointer'
          }}
        >
          Simulate Activity (Reset Timer)
        </button>
        
        <button 
          onClick={stopSession}
          disabled={!isActive}
          style={{ 
            padding: '10px 20px', 
            margin: '5px',
            backgroundColor: !isActive ? '#ccc' : '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isActive ? 'not-allowed' : 'pointer'
          }}
        >
          Stop Session
        </button>
      </div>

      <div style={{ 
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h3>📋 What This Demo Shows:</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>90-second countdown:</strong> Timer starts at 90 and counts down</li>
          <li><strong>Activity reset:</strong> "Simulate Activity" resets timer to 90s</li>
          <li><strong>5-second warning:</strong> Warning appears when 5 seconds left</li>
          <li><strong>Auto-logout:</strong> Session expires at 0 seconds</li>
          <li><strong>Extend option:</strong> User can extend session when warning shows</li>
        </ul>
      </div>

      <div>
        <h3>📊 Session Logs:</h3>
        <div style={{ 
          background: '#2c3e50',
          color: '#ecf0f1',
          padding: '15px',
          borderRadius: '5px',
          fontSize: '14px',
          fontFamily: 'monospace',
          height: '120px',
          overflow: 'auto'
        }}>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {log}
              </div>
            ))
          ) : (
            <div style={{ color: '#7f8c8d' }}>No logs yet. Start a session to see logs.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleSessionDemo; 