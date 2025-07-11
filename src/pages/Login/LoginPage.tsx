import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Spin, message } from "antd";
import { jwtDecode } from "jwt-decode"; 

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccessfulLogin = (token: string, userId?: string) => {
    localStorage.setItem("token", token);

    try {
      const userData: any = jwtDecode(token);
      
      // Lấy userId từ JWT token nếu không được truyền vào
      const extractedUserId = userId || userData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      const username = userData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      const email = userData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      
      // Lưu thông tin user
      localStorage.setItem("userId", extractedUserId);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      
      // Kiểm tra role - có thể role nằm trong claim khác hoặc cần gọi API khác để lấy
      const userRole = userData.role || userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      
      if (userRole) {
        localStorage.setItem("role", userRole);
        
        // Điều hướng dựa trên role
        if (userRole === "admin") {
          navigate("/admin/doctors");
        } else if (userRole === "Doctor") {
          navigate("/doctor");
        } else if (userRole === "Patient || Customer") {
          navigate("/home");
        } else {
          navigate("/home");
        }
      } else {
        // Nếu không có role trong JWT, có thể cần gọi API khác để lấy thông tin user
        // Tạm thời điều hướng về home
        console.warn("No role found in JWT token");
        navigate("/home");
      }
    } catch (error) {
      let errorMessage = "Error processing login information.";
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
   
      message.error(errorMessage);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const userId = query.get('userId');
    
    if (!token && !userId) {
      const oauthState = localStorage.getItem('oauth_state');
      
      if (oauthState) {
        verifyOAuthToken(oauthState);
      }
    } else if (token && userId) {
      handleSuccessfulLogin(token, userId);
    }
  }, [location, navigate]);

  const verifyOAuthToken = async (oauthState: string) => {
    setLoading(true);
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-token`, {
        params: { token: oauthState }
      });
      
      if (response.status === 200) {
        const { accessToken } = response.data.data || response.data;
        localStorage.removeItem('oauth_state');
        handleSuccessfulLogin(accessToken);
      }
    } catch (error: any) {
      console.error("OAuth verification failed:", error);
      message.error(error.response?.data?.message || "OAuth verification failed. Please try again.");
      localStorage.removeItem('oauth_state');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/accounts/login`, {
        username, // Thay đổi từ email thành username
        password,
      });

      if (response.status === 200) {
        const { accessToken } = response.data;
        handleSuccessfulLogin(accessToken);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login" style={{ backgroundColor: "#ffffff" }}>
      <button onClick={() => navigate("/")} className="login__return-button">{"< Return"}</button>
      <div className="login__access">
        <h1 className="login__title">Welcome!</h1>
        <div className="login__area">
          {loading ? (
            <Spin />
          ) : (
            <form className="login__form" onSubmit={handleLogin} autoComplete="off">
              <div className="login__content grid">
                <div className="login__box">
                  <input
                    type="text" // Đổi từ email thành text
                    id="username" // Đổi id từ email thành username
                    required
                    placeholder=" "
                    className="login__input"
                    value={username} // Đổi từ email thành username
                    onChange={(e) => setUsername(e.target.value)} // Đổi từ setEmail thành setUsername
                    autoComplete="username" // Đổi từ new-email thành username
                  />
                  <label htmlFor="username" className="login__label">Username</label> {/* Đổi label từ Email thành Username */}
                  <i className="ri-user-fill login__icon"></i> {/* Đổi icon từ mail thành user */}
                </div>

                <div className="login__box">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    placeholder=" "
                    className="login__input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password" // Đổi từ new-password thành current-password
                  />
                  <label htmlFor="password" className="login__label">Password</label>
                  <i 
                    className={showPassword ? "ri-eye-fill login__icon login__password" : "ri-eye-off-fill login__icon login__password"} 
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  ></i>
                </div>
              </div>

              <a href="/forgot-password" className="login__forgot">Forgot your password?</a>
              <button type="submit" className="login__button">Login</button>
            </form>
          )}

          <p className="login__switch">
            Don't have an account? <button id="loginButtonRegister" onClick={() => navigate("/register")}>Create Account</button>
          </p>
        </div>
      </div>

      <div className="login__background">
        <img src="src/assets/img/bg-img.jpg" alt="Background" className="login__bg" style={{ display: "block" }} />
      </div>
    </div>
  );
};

export default LoginPage;