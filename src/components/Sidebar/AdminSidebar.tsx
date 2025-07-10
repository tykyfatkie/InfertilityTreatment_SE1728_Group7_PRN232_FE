import React from 'react';
import { Layout } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined} from '@ant-design/icons';

const { Sider } = Layout;

interface AdminSidebarProps {
  selectedMenuItem: string;
  onMenuItemSelect: (key: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ selectedMenuItem, onMenuItemSelect }) => {
  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'doctors', icon: <TeamOutlined />, label: 'Doctors' },
    { key: 'patients', icon: <UserOutlined />, label: 'Patients' },
  ];

  return (
    <Sider className="admin-sider" width={250}>
      <div className="admin-menu">
        {menuItems.map(item => (
          <div
            key={item.key}
            className={`menu-item ${selectedMenuItem === item.key ? 'active' : ''}`}
            onClick={() => onMenuItemSelect(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </Sider>
  );
};

export default AdminSidebar;