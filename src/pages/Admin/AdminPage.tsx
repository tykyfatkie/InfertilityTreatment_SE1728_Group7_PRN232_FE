import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Row, 
  Col, 
  Space, 
  Statistic, 
} from 'antd';
import AdminHeader from '../../components/Header/AdminHeader';
import AdminSidebar from '../../components/Sidebar/AdminSidebar';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import './AdminPage.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface AdminStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  monthlyRevenue: number;
}

const AdminPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors`);
      if (response.ok) {
        const doctorsData = await response.json();
        const totalDoctors = Array.isArray(doctorsData) ? doctorsData.length : 0;
        
        setAdminStats({
          totalDoctors,
          totalPatients: 1245,
          totalAppointments: 89,
          monthlyRevenue: 125000
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setAdminStats({
        totalDoctors: 0,
        totalPatients: 1245,
        totalAppointments: 89,
        monthlyRevenue: 125000
      });
    }
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <Row gutter={[24, 24]} className="stats-row">
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card">
                  <Statistic
                    title="Total Doctors"
                    value={adminStats.totalDoctors}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card">
                  <Statistic
                    title="Total Patients"
                    value={adminStats.totalPatients}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card">
                  <Statistic
                    title="Appointments Today"
                    value={adminStats.totalAppointments}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card">
                  <Statistic
                    title="Monthly Revenue"
                    value={adminStats.monthlyRevenue}
                    prefix="$"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 24]} className="charts-row">
              <Col xs={24} lg={16}>
                <Card title="Recent Activity" className="activity-card">
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon">
                        <UserOutlined />
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">New patient registration</div>
                        <div className="activity-time">5 minutes ago</div>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">
                        <CalendarOutlined />
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">Appointment scheduled</div>
                        <div className="activity-time">15 minutes ago</div>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">
                        <TeamOutlined />
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">Doctor profile updated</div>
                        <div className="activity-time">1 hour ago</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Quick Actions" className="quick-actions-card">
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Button type="primary" icon={<PlusOutlined />} block>
                      Add New Doctor
                    </Button>
                    <Button icon={<UserOutlined />} block>
                      Add Patient
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        );

      default:
        return (
          <div className="coming-soon">
            <Title level={3}>Coming Soon</Title>
            <Paragraph>This feature is under development.</Paragraph>
          </div>
        );
    }
  };

  return (
    <Layout className="admin-layout">
      <AdminHeader username={username} />
      
      <Layout>
        <AdminSidebar 
          selectedMenuItem={selectedMenuItem} 
          onMenuItemSelect={setSelectedMenuItem} 
        />

        <Content className="admin-content">
          <div className="admin-content-wrapper">
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;