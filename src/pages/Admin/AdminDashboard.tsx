import React, { useState, useEffect } from 'react';
import { Layout, Card, Col, Row, Statistic, Alert, Spin, Typography } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  MedicineBoxOutlined, 
  DollarOutlined 
} from '@ant-design/icons';
import AdminHeader from '../../components/Header/AdminHeader';
import AdminSidebar from '../../components/Sidebar/AdminSidebar';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface DashboardStats {
  id: string;
  totalServices: number;
  totalDoctors: number;
  totalPatients: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading data');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDashboardStats();
  };

  if (error) {
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
              <Alert
                message="Data Load Error"
                description={error}
                type="error"
                showIcon
                action={
                  <button 
                    onClick={handleRetry} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#1890ff', 
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Retry
                  </button>
                }
              />
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

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
            <div className="dashboard-content">
              <div className="dashboard-header">
                <div className="dashboard-title">
                  <Title level={2}>Admin Dashboard</Title>
                  <Paragraph>System statistics overview</Paragraph>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: '16px' }}>Loading data...</p>
                </div>
              ) : (
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Total Services"
                        value={stats?.totalServices || 0}
                        prefix={<MedicineBoxOutlined />}
                        valueStyle={{ color: '#3f8600', fontSize: '24px' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Total Doctors"
                        value={stats?.totalDoctors || 0}
                        prefix={<TeamOutlined />}
                        valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Total Patients"
                        value={stats?.totalPatients || 0}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Total Revenue"
                        value={stats?.totalRevenue || 0}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: '#cf1322', fontSize: '24px' }}
                        precision={0}
                      />
                    </Card>
                  </Col>
                </Row>
              )}
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
