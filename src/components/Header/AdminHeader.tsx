import React from 'react';
import { Layout, Space, Button, Avatar, Dropdown, Menu, Modal } from 'antd';
import {
  MedicineBoxOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

interface AdminHeaderProps {
  username: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ username }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to logout?',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        localStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        navigate("/");
      }
    });
  };

  const userMenu = (
    <Menu>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} style={ { color: 'red' }}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="admin-header" >
      <div className="admin-header-left">
        <div className="admin-logo">
          <MedicineBoxOutlined style={{ color: 'orange' }} />
          <span style={{ color: 'orange' }}>Admin Dashboard</span>
        </div>
      </div>
      <div className="admin-header-right">
        <Space style={ { marginRight: '80px'}}>
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