import React from 'react';
import { Layout, Space, Badge, Button, Avatar, Dropdown, Menu, Modal } from 'antd';
import {
  MedicineBoxOutlined,
  BellOutlined,
  UserOutlined,
  DownOutlined,
  SettingOutlined,
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
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="admin-header">
      <div className="admin-header-left">
        <div className="admin-logo">
          <MedicineBoxOutlined />
          <span>MedAdmin</span>
        </div>
      </div>
      <div className="admin-header-right">
        <Space>
          <Badge count={5}>
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
          <Dropdown overlay={userMenu} trigger={['click']}>
            <Button type="text" className="user-dropdown">
              <Avatar icon={<UserOutlined />} />
              <span>Admin {username}</span>
              <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default AdminHeader;