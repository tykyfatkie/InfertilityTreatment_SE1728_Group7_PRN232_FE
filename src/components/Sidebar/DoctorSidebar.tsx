import React from 'react';
import { Layout } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; 

const { Sider } = Layout;

interface AdminSidebarProps {
  selectedMenuItem: string;
  onMenuItemSelect: (key: string) => void;
}

const DoctorSidebar: React.FC<AdminSidebarProps> = ({ selectedMenuItem, onMenuItemSelect }) => {
  const navigate = useNavigate(); 

  const menuItems = [
    { key: 'booking', icon: <UnorderedListOutlined />, label: 'Bookings', path: '/doctor/bookings' },
  ];

  const handleMenuClick = (key: string, path: string) => {
    onMenuItemSelect(key);
    navigate(path); 
  };

  return (
    <Sider className="admin-sider" width={250}>
      <div className="admin-menu">
        {menuItems.map(item => (
          <div
            key={item.key}
            className={`menu-item ${selectedMenuItem === item.key ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.key, item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </Sider>
  );
};

export default DoctorSidebar;
