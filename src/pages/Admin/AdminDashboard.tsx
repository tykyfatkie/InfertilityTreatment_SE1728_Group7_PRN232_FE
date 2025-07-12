import React, { useState, useEffect } from 'react';
import { Layout, Card, Col, Row, Alert, Spin, Typography, Progress, Button, Badge } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  MedicineBoxOutlined, 
  DollarOutlined,
  ReloadOutlined,
  DashboardOutlined,
  CalendarOutlined,
  RiseOutlined 
} from '@ant-design/icons';
import AdminHeader from '../../components/Header/AdminHeader';
import AdminSidebar from '../../components/Sidebar/AdminSidebar';

const { Content } = Layout;
const { Title, Text } = Typography;

interface DashboardStats {
  id: string;
  totalServices: number;
  totalDoctors: number;
  totalPatients: number;
  totalRevenue: number;
  activePatients?: number;
  appointmentsToday?: number;
  monthlyGrowth?: number;
  doctorsOnline?: number;
}

const AdminDashboard: React.FC = () => {
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StatCard = ({ title, value, prefix, color, suffix, trend, trendValue, extra }: any) => (
    <Card 
      className="stat-card"
      style={{
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #f0f0f0',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
      bodyStyle={{ padding: '24px' }}
      hoverable
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ 
            backgroundColor: `${color}15`, 
            borderRadius: '12px', 
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '24px', color: color }}>
              {prefix}
            </div>
          </div>
          {extra && (
            <Badge 
              count={extra} 
              style={{ 
                backgroundColor: color,
                fontSize: '12px',
                height: '20px',
                lineHeight: '20px',
                borderRadius: '10px'
              }} 
            />
          )}
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <Text style={{ fontSize: '16px', color: '#666', fontWeight: 500 }}>
            {title}
          </Text>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
          <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
          {suffix && (
            <Text style={{ fontSize: '16px', color: '#666' }}>
              {suffix}
            </Text>
          )}
        </div>
        
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RiseOutlined   style={{ color: '#52c41a', fontSize: '14px' }} />
            <Text style={{ fontSize: '14px', color: '#52c41a', fontWeight: 500 }}>
              +{trendValue} from last month
            </Text>
          </div>
        )}
      </div>
      
      {/* Decorative background element */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '80px',
        height: '80px',
        background: `${color}08`,
        borderRadius: '50%',
        zIndex: 0
      }} />
    </Card>
  );

  if (error) {
    return (
      <Layout className="admin-layout" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <AdminHeader username={username} />
        
        <Layout>
          <AdminSidebar 
            selectedMenuItem={selectedMenuItem} 
            onMenuItemSelect={setSelectedMenuItem} 
          />

          <Content style={{ padding: '24px', backgroundColor: '#f8f9fa' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                textAlign: 'center'
              }}>
                <Alert
                  message="Unable to Load Dashboard Data"
                  description={
                    <div>
                      <p style={{ marginBottom: '16px' }}>{error}</p>
                      <Button 
                        type="primary" 
                        icon={<ReloadOutlined />}
                        onClick={handleRetry}
                        size="large"
                        style={{
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)'
                        }}
                      >
                        Retry Loading
                      </Button>
                    </div>
                  }
                  type="error"
                  showIcon
                  style={{
                    borderRadius: '12px',
                    border: '1px solid #ffcdd2',
                    backgroundColor: '#fef9f9'
                  }}
                />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <AdminHeader username={username} />
      
      <Layout>
        <AdminSidebar 
          selectedMenuItem={selectedMenuItem} 
          onMenuItemSelect={setSelectedMenuItem} 
        />

        <Content style={{ padding: '24px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 1, marginTop: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <Title level={1} style={{ color: 'white', margin: 0, marginBottom: '8px', fontSize: '36px', fontWeight: 700 }}>
                      <DashboardOutlined style={{ marginRight: '12px' }} />
                      Admin Dashboard
                    </Title>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarOutlined style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }} />
                      <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                        {getCurrentDate()}
                      </Text>
                    </div>
                  </div>
                  
                  <Button 
                    type="primary"
                    icon={<ReloadOutlined spin={refreshing} />}
                    onClick={handleRefresh}
                    loading={refreshing}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    Refresh Data
                  </Button>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '200px',
                height: '200px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                zIndex: 0
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-50px',
                left: '-50px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                zIndex: 0
              }} />
            </div>

            {/* Stats Section */}
            {loading ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '80px 40px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <Spin size="large" />
                <p style={{ marginTop: '24px', fontSize: '16px', color: '#666' }}>Loading dashboard statistics...</p>
                <Progress 
                  percent={75} 
                  showInfo={false} 
                  style={{ maxWidth: '300px', margin: '16px auto 0' }}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Total Services"
                    value={stats?.totalServices || 0}
                    prefix={<MedicineBoxOutlined />}
                    color="#52c41a"
                    trend={true}
                    trendValue={stats?.totalServices || 0}
                    extra={stats?.activePatients ? Math.floor(stats.activePatients / 10) : undefined}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Total Doctors"
                    value={stats?.totalDoctors || 0}
                    prefix={<TeamOutlined />}
                    color="#1890ff"
                    trend={true}
                    trendValue={stats?.totalDoctors || 0}
                    extra={stats?.doctorsOnline || Math.floor((stats?.totalDoctors || 0) * 0.7)}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Total Patients"
                    value={stats?.totalPatients || 0}
                    prefix={<UserOutlined />}
                    color="#722ed1"
                    trend={true}
                    trendValue={stats?.totalPatients || 0}
                    extra={stats?.appointmentsToday || Math.floor((stats?.totalPatients || 0) * 0.1)}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatCard
                    title="Total Revenue"
                    value={stats?.totalRevenue || 0}
                    prefix={<DollarOutlined />}
                    color="#fa541c"
                    suffix="USD"
                    trend={true}
                    trendValue={stats?.totalRevenue || 0}
                  />
                </Col>
              </Row>
            )}

            {/* Additional Analytics Section */}
            {!loading && stats && (
              <div style={{ marginTop: '24px' }}>
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;