import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; 
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Gọi login từ context với data nhận được
      await login(data);
      navigate('/');
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Medical background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        zIndex: -1
      }} />
      
      <div style={{
        backgroundColor: 'white',
        padding: '3rem 2.5rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Medical cross decoration */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, #4CAF50, #45a049)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.1
        }}>
          <div style={{
            width: '40px',
            height: '8px',
            backgroundColor: 'white',
            borderRadius: '4px',
            position: 'relative'
          }}>
            <div style={{
              width: '8px',
              height: '40px',
              backgroundColor: 'white',
              borderRadius: '4px',
              position: 'absolute',
              top: '-16px',
              left: '16px'
            }} />
          </div>
        </div>

        {/* Hospital Logo/Icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)'
          }}>
            <div style={{
              width: '35px',
              height: '7px',
              backgroundColor: 'white',
              borderRadius: '3px',
              position: 'relative'
            }}>
              <div style={{
                width: '7px',
                height: '35px',
                backgroundColor: 'white',
                borderRadius: '3px',
                position: 'absolute',
                top: '-14px',
                left: '14px'
              }} />
            </div>
          </div>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '0.5rem',
            color: '#2c3e50',
            fontSize: '2rem',
            fontWeight: '700'
          }}>
            Hệ thống Bệnh viện
          </h2>
          <p style={{
            color: '#7f8c8d',
            fontSize: '0.9rem',
            margin: 0
          }}>
            Đăng nhập vào hệ thống quản lý
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: '#2c3e50',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              👤 Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Nhập tên đăng nhập"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e1e8ed',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#f8f9fa',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4CAF50';
                e.target.style.backgroundColor = 'white';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 5px 15px rgba(76, 175, 80, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e1e8ed';
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: '#2c3e50',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              🔒 Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e1e8ed',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                backgroundColor: '#f8f9fa',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4CAF50';
                e.target.style.backgroundColor = 'white';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 5px 15px rgba(76, 175, 80, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e1e8ed';
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {error && (
            <div style={{ 
              color: '#e74c3c', 
              marginBottom: '1.5rem',
              textAlign: 'center',
              backgroundColor: '#fdf2f2',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              fontSize: '0.9rem'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              background: isLoading 
                ? 'linear-gradient(135deg, #95a5a6, #7f8c8d)' 
                : 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isLoading 
                ? 'none' 
                : '0 10px 30px rgba(76, 175, 80, 0.3)',
              transform: isLoading ? 'none' : 'translateY(0)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLElement;
                target.style.transform = 'translateY(-2px)';
                target.style.boxShadow = '0 15px 35px rgba(76, 175, 80, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                const target = e.target as HTMLElement;
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = '0 10px 30px rgba(76, 175, 80, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.5rem'
                }} />
                Đang đăng nhập...
              </span>
            ) : (
              '🏥 Đăng nhập hệ thống'
            )}
          </button>
        </form>
        
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#7f8c8d',
          fontSize: '0.8rem'
        }}>
          <p>© 2024 Hệ thống Quản lý Bệnh viện</p>
          <p>Bảo mật thông tin - An toàn dữ liệu</p>
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Login;