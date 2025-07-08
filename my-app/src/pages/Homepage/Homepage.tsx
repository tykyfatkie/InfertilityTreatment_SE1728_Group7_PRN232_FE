import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Homepage: React.FC = () => {
  const { user, logout, token } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '1rem'
      }}>
        <h1>Trang chủ</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>
            Xin chào, {user?.name || user?.email}!
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main>
        <div style={{ marginBottom: '2rem' }}>
          <h2>Thông tin người dùng</h2>
          <div style={{ 
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Tên:</strong> {user?.name}</p>
            {user?.role && <p><strong>Vai trò:</strong> {user.role}</p>}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2>Token JWT</h2>
          <div style={{ 
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px',
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }}>
            {token}
          </div>
        </div>

        <div>
          <h2>Chức năng</h2>
          <p>Đây là trang chủ của ứng dụng. Chỉ những người dùng đã đăng nhập mới có thể truy cập.</p>
        </div>
      </main>
    </div>
  );
};

export default Homepage;