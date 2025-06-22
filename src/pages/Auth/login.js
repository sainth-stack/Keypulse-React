import Logo from "../../assets/images/logo3.png";
import loginbg from "../../assets/svg/loginbg.svg";
import eye from "../../assets/svg/eye-fill.svg";
import eye2 from "../../assets/svg/eye-slash.svg";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LoadingIndicator } from "../../components/loader";
import './styles.css'
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../const";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [toggle2, setToggle2] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const fetchOrganizations = async (user) => {
    try {
      const response2 = await axios.get(`${API_URL}/organizations/${user?.organization}`)
      localStorage.setItem('logo',response2.data['Organization Details']['logo_data'])
    } catch (error) {
    } finally {
    }
  };


  const fetchRoles = async (roles) => {
    setLoading(true);
    try {
      const response = await axios.get('http://54.169.213.200:4003/api/roles');
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
      navigate('/');
      setLoading(false);
      return permissions; // Return permissions if needed elsewhere
    } catch (error) {
      console.error('Error fetching roles:', error);
      setLoading(false);
      return [];
    }
  };

  const handleLogin = (event) => {
    setLoading(true);
    event.preventDefault();
    
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    axios.post(`${API_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
    .then((response) => {
      setLoading(false);
      fetchRoles(response.data?.user?.role)
      fetchOrganizations(response.data?.user)
      localStorage.setItem('user', JSON.stringify(response.data?.user));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userName', response.data?.user?.username);
      
    })
    .catch((err) => {
      setLoading(false);
      console.log(err);
      alert("Login failed. Please check your credentials and try again.");
    });
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
                  minLength={8}
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
                <Link to="#">
                  <span className="fs-12 cursor-pointer">
                    Forgot Password
                  </span>
                </Link>
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
            <div className="account2 mt-2">Don't Have An Account?</div>
            <Link to="/register" className="text-decoration-none register2">
              <span>Register</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="col-md-6 p-0 m-0 bg-biscuit text-center pt-4 pb-4 d-none d-lg-block">
        <h5 className="text-green font-weight-bold mt-2" style={{fontWeight:700,fontSize:'28px'}}>WELCOME TO DATAPX1</h5>
        {/* <h3 className="mt-3">Your Digital Growth Partner <br /> For Manufacturing</h3> */}
        <div className="d-flex justify-content-center">
          <div className="col-md-10">
            <img className="img-fluid p-3" src={loginbg} alt="Logo" />
          </div>
        </div>
      </div>
      <div style={{position:'fixed',bottom:20,width:'100%',textAlign:'center',color:'black',fontSize:'12px',fontWeight:'bold'}}>
        © All Rights Reserved, AI-PRIORI {new Date().getFullYear()}
      </div>
    </div>
  );
};