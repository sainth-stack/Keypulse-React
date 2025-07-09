# Session Management System

This document explains the session management system implemented in the application that handles tenant-based session timeouts.

## Overview

The session management system provides:
- **Tenant-configurable session timeouts** (default: 30 minutes)
- **Real-time session monitoring** with automatic logout
- **Activity-based session renewal** (user activity resets the timeout)
- **Session expiry warnings** (5 minutes before expiry)
- **Automatic cleanup** of expired sessions

## Components

### 1. SessionManager (`src/utils/sessionManager.js`)

The core session management utility that handles:
- Session timeout monitoring
- Activity tracking
- Session expiry warnings
- Automatic logout on expiry
- Session extension functionality

#### Key Methods:
- `initializeSessionTimeout()` - Starts session monitoring
- `isSessionValid()` - Checks if current session is valid
- `resetSessionTimeout()` - Extends session based on tenant timeout
- `logout()` - Manually logs out user
- `getSessionInfo()` - Returns current session information

### 2. ProtectedRoute (`src/components/ProtectedRoute.js`)

A React component that wraps protected routes and:
- Checks authentication status
- Validates session expiry
- Redirects to login if session is invalid
- Initializes session monitoring

#### Usage:
```jsx
<Route path="/" element={
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

### 3. SessionStatus (`src/components/SessionStatus.js`)

A React component that displays session information:
- Real-time session countdown
- Session extend/logout buttons
- Tenant and user information

#### Usage:
```jsx
// Simple status display
<SessionStatus showDetails={false} />

// Detailed status display
<SessionStatus showDetails={true} />
```

### 4. Updated Login (`src/pages/Auth/login.js`)

The login component now:
- Stores tenant configuration from API response
- Sets up session expiry time based on tenant timeout
- Initializes session monitoring after successful login

## Session Flow

### 1. Login Process
```
1. User logs in with email/password
2. API returns user data + tenant configuration including tenant_timeout
3. Session expiry time is calculated: current_time + (tenant_timeout * 60 * 1000)
4. Tenant data and session expiry time are stored in localStorage
5. Session monitoring is initialized
```

### 2. Session Monitoring
```
1. SessionManager checks session validity every minute
2. Activity listeners track user interactions (mouse, keyboard, touch)
3. Any user activity resets the session timeout
4. Warning shown 5 minutes before expiry
5. Automatic logout when session expires
```

### 3. Session Expiry
```
1. Session expires based on tenant_timeout configuration
2. All localStorage data is cleared
3. User is redirected to login page
4. Session monitoring is stopped
```

## API Response Structure

The login API should return tenant information:
```json
{
  "user": { ... },
  "token": "...",
  "tenant_id": "497d4958-6bd3-453f-9eb7-cf67c8ae5d9b",
  "tenant_name": "AI Priori",
  "tenant_type": "ai-priori",
  "tenant_timeout": 30
}
```

## localStorage Structure

The system stores the following in localStorage:
- `user` - User information
- `token` - Authentication token
- `tenant` - Tenant configuration including timeout
- `sessionExpiryTime` - Timestamp when session expires
- `permissions` - User permissions
- `userName` - Username
- `logo` - Organization logo
- `organization` - Organization data
- `fileName` - User-specific file name

## Configuration

### Tenant Timeout Configuration
- Default timeout: 30 minutes
- Configurable per tenant via `tenant_timeout` field
- Timeout is applied in real-time

### Activity Events
The system tracks these events to reset session timeout:
- `mousedown`
- `mousemove`
- `keypress`
- `scroll`
- `touchstart`
- `click`

## Usage Examples

### Basic Implementation
```jsx
// App.js
import ProtectedRoute from './components/ProtectedRoute';
import SessionStatus from './components/SessionStatus';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
      <SessionStatus showDetails={false} />
    </BrowserRouter>
  );
}
```

### Manual Session Management
```jsx
import sessionManager from './utils/sessionManager';

// Check if session is valid
if (sessionManager.isSessionValid()) {
  // Session is valid
}

// Get session information
const sessionInfo = sessionManager.getSessionInfo();
console.log('Time until expiry:', sessionInfo.timeUntilExpiry);

// Extend session manually
sessionManager.resetSessionTimeout();

// Logout manually
sessionManager.logout();
```

### Custom Session Warning
```jsx
import sessionManager from './utils/sessionManager';

// Custom warning implementation
const checkSessionStatus = () => {
  const timeLeft = sessionManager.getTimeUntilExpiry();
  const minutesLeft = Math.floor(timeLeft / (1000 * 60));
  
  if (minutesLeft <= 5 && minutesLeft > 0) {
    // Show custom warning
    showCustomWarning(minutesLeft);
  }
};
```

## Security Considerations

1. **Session Storage**: Uses localStorage for session data
2. **Activity Tracking**: Monitors user activity to extend sessions
3. **Automatic Cleanup**: Clears all data on session expiry
4. **Token Validation**: Checks token existence and session validity
5. **Real-time Monitoring**: Continuously monitors session status

## Troubleshooting

### Common Issues

1. **Session not initializing**: Ensure tenant data is properly returned from login API
2. **Session not extending**: Check if activity listeners are properly attached
3. **Warning not showing**: Verify session monitoring is initialized
4. **Logout not working**: Check sessionManager cleanup methods

### Debug Information

Enable debug logging:
```javascript
// In sessionManager.js, add console.log statements
console.log('Session expiry time:', sessionExpiryTime);
console.log('Current time:', Date.now());
console.log('Time until expiry:', timeUntilExpiry);
```

Use SessionStatus component with `showDetails={true}` for debugging.

## Future Enhancements

1. **Cookie-based storage** for better security
2. **Server-side session validation**
3. **Multiple warning levels**
4. **Session analytics**
5. **Configurable warning messages** 