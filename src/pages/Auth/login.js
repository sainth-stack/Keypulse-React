import Logo from "../../assets/images/logo3.png";
import loginbg from "../../assets/svg/loginbg1.png";
import eye from "../../assets/svg/eye-fill.svg";
import eye2 from "../../assets/svg/eye-slash.svg";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LoadingIndicator } from "../../components/loader";
import './styles.css'
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../const";
import sessionManager from "../../utils/sessionManager";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Paper, InputAdornment } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { OtpPopup } from "../../components/OTPPopup";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [toggle2, setToggle2] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);


  const fetchRoles = async (roles) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/roles`);
      const permissions = [];
      console.log(roles); // Debugging: ['super admin']
  
      response?.data?.roles?.forEach((item) => {
        console.log(item); // Debugging: { id, role, permissions }
        console.log(roles.includes(item.role), 'test'); // Debugging: Check if role matches
  
        // Normalize roles for comparison (optional, if case sensitivity is an issue)
        const normalizedItemRole = item.role.toLowerCase();
        const normalizedRoles = roles.map(role => role.toLowerCase());
  
        if (normalizedRoles.includes(normalizedItemRole)) {
          permissions.push(...item.permissions); // Spread permissions to avoid nested arrays
        }
      });
  
      console.log(permissions); // Debugging: Check final permissions array
      localStorage.setItem('permissions', JSON.stringify(permissions)); // Store with a key
      // --- Begin: Check for application permissions and redirect accordingly ---
      // Define application permissions (should match Sidebar logic)
      const appPermissions = [
        'home_Read',
        'data_analysis_Read',
        'visualizations_Read',
        'missing_value_treatment_Read',
        'ai_models_Read',
        'kpi_Read',
      ];
      const adminPaths = [
        { path: '/tenants', prefix: 'tenant_' },
        { path: '/organizations', prefix: 'organization_' },
        { path: '/users', prefix: 'users_' },
        { path: '/roles', prefix: 'roles_' },
      ];
      const hasAppPermission = permissions.some(p => appPermissions.includes(p));
      if (!hasAppPermission) {
        const adminPath = adminPaths.find(ap => permissions.some(p => p.startsWith(ap.prefix)));
        if (adminPath) {
          navigate(adminPath.path);
        } else {
          navigate('/access-denied');
        }
        return permissions;
      }
      navigate('/data-source');
      setLoading(false);
      return permissions; // Return permissions if needed elsewhere
    } catch (error) {
      console.error('Error fetching roles:', error);
      setLoading(false);
      return [];
    }
  };

  const handleLogin = async (event) => {
    setLoading(true);
    event.preventDefault();
    
    const formData = new URLSearchParams();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    formData.append('email', trimmedEmail);
    formData.append('password', trimmedPassword);

    try {
      const response = await axios.post(`${API_URL}/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      console.log('Login Response:', response.data); // Debug: Check what we get from API
      
      setLoading(false);
      // Check for first-time login (last_login is null or empty)
      if (!response.data?.user?.last_login) {
        navigate(`/reset-password?email=${encodeURIComponent(response.data?.user?.email)}&user_id=${encodeURIComponent(response.data?.user?.id)}&first_time=true`);
        return;
      }
      fetchRoles(response.data?.user?.role);
      localStorage.setItem('user', JSON.stringify(response.data?.user));
      localStorage.setItem('token', response.data?.user?.username);
      localStorage.setItem('userName', response.data?.user?.username);
      localStorage.setItem('logo',response.data?.user?.organization?.organization_logo)
      // Store tenant information and setup session timeout
      // Check for tenant data in response
      const tenantData = {
        tenant_id: response.data?.user?.tenant_id || 'default-tenant',
        tenant_name: response.data?.user?.tenant_name || 'Default Tenant',
        tenant_type: response.data?.user?.tenant_type || 'default',
        tenant_timeout: response.data?.user?.tenant_timeout || 30 // Default 30 minutes
      };
      
      console.log('Tenant Data:', tenantData); // Debug: Check tenant data
      localStorage.setItem('tenant', JSON.stringify(tenantData));
      
      // Set session timeout based on tenant configuration
      const timeoutMinutes = tenantData.tenant_timeout;
      const sessionExpiryTime = Date.now() + (timeoutMinutes * 60 * 1000);
      localStorage.setItem('sessionExpiryTime', sessionExpiryTime.toString());
      
      console.log('Session Expiry Time:', new Date(sessionExpiryTime)); // Debug: Check expiry time
      
      // Initialize session monitoring using the session manager
      try {
        console.log('Initializing session manager...'); // Debug
        sessionManager.initializeSessionTimeout();
        console.log('Session manager initialized successfully!'); // Debug
        
        // Create session tracking
        await sessionManager.createSession(response.data?.user);
        console.log('Session tracking created successfully!'); // Debug
      } catch (error) {
        console.error('Error initializing session manager:', error);
      }
      
      // Call the new API to get the file name, passing user id in header
      const userId = response.data?.user?.id;
      if (userId) {
        try {
          const res = await axios.get(`${API_URL}/get_file_name`, {
            headers: {
              'X-User-ID': userId,
            }
          });
          if (res.data && res.data.file_name) {
            localStorage.setItem('fileName', res.data.file_name);
          }
        } catch (err) {
          console.error('Error fetching file name:', err);
        }
      }
      
    } catch (err) {
      setLoading(false);
      console.log(err);
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  const handleSendReset = async () => {
    setResetLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', resetEmail);
      await axios.post(`${API_URL}/send_otp`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowResetModal(false);
      setShowOtpModal(true); // Show OTP modal
    } catch (err) {
      toast.error('Failed to send OTP');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="container-fluid row m-0 p-0 vh-100">
      <div className="col-md-6 col-xs-12 col-sm-12 text-center pt-lg-5 mt-lg-5">
        <div className="pt-5">
          <img className="logo1" src={Logo} alt="Logo" width={100} height={100}/>
        </div>
        <div className="row mt-3">
          <div className="col-md-9 col-lg-9 col-sm-12 col-xs-12 mx-auto">
            <h2 className="mb-5">Login</h2>

            <form onSubmit={handleLogin} className="pr-lg-5 pl-lg-5">
              <div className="form-group2 d-flex flex-column" style={{ textAlign: "start" }}>
                <label className="label2 fs13">Email*</label>
                <input
                  style={{ borderRadius: "40px" }}
                  type="email"
                  className="form-control border"
                  id="email"
                  name="email"
                  autoComplete="off"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group2 d-flex flex-column mt-3" style={{ textAlign: "start" }}>
                <label className="label2 fs13">Password*</label>
                <input
                  style={{ borderRadius: "40px" }}
                  type={toggle2 ? "text" : "password"}
                  className="form-control border"
                  id="password"
                  name="password"
                  value={password}
                  maxLength={16}
                  minLength={6}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="relative">
                  <img
                    className="eye3"
                    src={toggle2 ? eye2 : eye}
                    onClick={() => setToggle2(!toggle2)}
                    alt="Logo"
                  />
                </div>
              </div>
              <div className="d-flex flex-row-reverse mb-4">
                <span className="fs-12 cursor-pointer text-primary" style={{textDecoration:'underline',cursor:"pointer"}} onClick={() => setShowResetModal(true)}>
                  Forgot Password?
                </span>
              </div>
              <button
                className="font-weight-bold text-uppercase w-100 text-white border-0 login2"
                style={{
                  backgroundColor: "#466657",
                  borderRadius: "40px",
                  height: "40px",
                }}
                type={loading ? "button" : "submit"}
                disabled={loading}
              >
                {loading ? "Logging in..." : 'Login'} {loading ? <LoadingIndicator size={"1"} /> : null}
              </button>
            </form>
            {/* <div className="account2 mt-2">Don't Have An Account?</div>
            <Link to="/register" className="text-decoration-none register2">
              <span>Register</span>
            </Link> */}
          </div>
        </div>
      </div>
      <div className="col-md-6 p-0 m-0 bg-biscuit text-center pt-4 pb-4 d-none d-lg-block">
        <h5 className="text-green font-weight-bold mt-2" style={{fontWeight:700,fontSize:'28px'}}>WELCOME TO DATAPX1</h5>
        {/* <h3 className="mt-3">Your Digital Growth Partner <br /> For Manufacturing</h3> */}
        <div className="d-flex justify-content-center">
          <div className="col-md-10" style={{borderRadius:'30px'}}>
            <img className="img-fluid p-3" src={loginbg} alt="Logo" style={{borderRadius:'30px'}}/>
          </div>
        </div>
      </div>
      <div style={{position:'fixed',bottom:20,width:'100%',textAlign:'center',color:'black',fontSize:'12px',fontWeight:'bold'}}>
        © All Rights Reserved, AI-PRIORI {new Date().getFullYear()}
      </div>
      {/* Reset Password Modal */}
      <Dialog open={showResetModal} onClose={() => setShowResetModal(false)} maxWidth="xs" fullWidth PaperProps={{
        style: { borderRadius: 20, boxShadow: '0 8px 32px rgba(60,60,60,0.18)' }
      }}>
        <Paper elevation={0} style={{ borderRadius: 20, background: '#f8fafc' }}>
          <DialogTitle style={{textAlign:'center', fontWeight:700, fontSize:22, letterSpacing:0.5, paddingBottom:0}}>Reset Password</DialogTitle>
          <DialogContent style={{paddingTop:8, paddingBottom:0}}>
            <Box mb={2} color="#555" fontSize={15} textAlign="center">
              Enter your email address and we'll send you a link to reset your password.
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="filled"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              disabled={resetLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon style={{ color: '#466657' }} />
                  </InputAdornment>
                ),
                style: { borderRadius: 12, background: '#fff' }
              }}
              InputLabelProps={{ style: { fontWeight: 500, color: '#466657' } }}
            />
          </DialogContent>
          <DialogActions style={{justifyContent:'space-between', padding:'20px 28px 24px 28px'}}>
            <Button onClick={() => setShowResetModal(false)} disabled={resetLoading} style={{borderRadius:40, minWidth:100, fontWeight:600, color:'#466657', background:'#e8eaf6'}}>
              Cancel
            </Button>
            <Button onClick={handleSendReset} disabled={!resetEmail || resetLoading} variant="contained" style={{background:'#466657', color:'#fff', borderRadius:40, minWidth:140, fontWeight:600, boxShadow:'0 2px 8px rgba(70,102,87,0.08)'}}>
              {resetLoading ? <span style={{display:'flex',alignItems:'center'}}><span className="spinner-border spinner-border-sm" style={{marginRight:8}}></span>Sending...</span> : 'Send Link'}
            </Button>
          </DialogActions>
        </Paper>
      </Dialog>
      {showOtpModal && (
        <OtpPopup
          email={resetEmail}
          onClose={() => setShowOtpModal(false)}
          onSuccess={() => {
            setShowOtpModal(false);
            navigate(`/reset-password?email=${encodeURIComponent(resetEmail)}`);
          }}
        />
      )}
    </div>
  );
};