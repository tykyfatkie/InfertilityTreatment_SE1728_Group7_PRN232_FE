import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  CalendarOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
  onMenuClick?: (key: string) => void;
  onLogout?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onMenuClick,
  onLogout,
  collapsed = false,
  onCollapsedChange,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('service-booking');

  const handleMenuClick = (key: string) => {
    setSelectedKey(key);
    onMenuClick?.(key);
  };

  const handleLogout = () => {
    onLogout?.();
  };

  const menuItems = [
    {
      key: 'service-booking',
      icon: <CalendarOutlined />,
      label: 'Service & Booking',
    },
    {
      key: 'service-history',
      icon: <HistoryOutlined />,
      label: 'Service History',
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        padding: '16px 0'
      }}>
        {/* Header with collapse button */}
        <div style={{ 
          padding: '0 16px', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between'
        }}>
          {!collapsed && (
            <h3 style={{ margin: 0, color: '#1890ff' }}>
              Dashboard
            </h3>
          )}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => onCollapsedChange?.(!collapsed)}
            style={{
              fontSize: '16px',
              width: 32,
              height: 32,
            }}
          />
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1 }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ 
              borderRight: 0,
              background: 'transparent'
            }}
            onClick={({ key }) => handleMenuClick(key)}
            items={menuItems}
          />
        </div>

        {/* Logout Button */}
        <div style={{ 
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
          marginTop: 'auto'
        }}>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              height: '40px'
            }}
          >
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;