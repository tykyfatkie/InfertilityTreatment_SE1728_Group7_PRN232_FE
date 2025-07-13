import React from 'react';
import { Layout, Space, Button, Avatar, Dropdown, Menu } from 'antd';
import {
  UserOutlined,
  DownOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

interface AdminHeaderProps {
  username: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ username }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Navigate to login page
      navigate("/", { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Divider />
      <Menu.Item 
        key="logout" 
        icon={<LogoutOutlined />} 
        onClick={handleLogout} 
        style={{ color: 'red' }}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="admin-header">
      <div className="admin-header-left">
        <div className="admin-logo">        
          <span style={{ color: 'orange' }}>Admin Dashboard</span>
        </div>
      </div>
      <div className="admin-header-right">
        <Space style={{ marginRight: '80px' }}>
          <Dropdown overlay={userMenu} trigger={['click']}>
            <Button type="text" className="user-dropdown">
              <Avatar icon={<UserOutlined />} />
              <span>
                Welcome back <span style={{ color: 'orange' }}>{username}</span>!
              </span>
              <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default AdminHeader;