import React, { useState, useEffect } from 'react';
import { Layout, Card, Col, Row, Statistic, Alert, Spin } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  MedicineBoxOutlined, 
  DollarOutlined 
} from '@ant-design/icons';

const { Content } = Layout;

interface DashboardStats {
  id: string;
  totalServices: number;
  totalDoctors: number;
  totalPatients: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleRetry = () => {
    fetchDashboardStats();
  };

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '24px' }}>
        <Content>
          <Alert
            message="Lỗi tải dữ liệu"
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
                Thử lại
              </button>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '16px' }}>
            Tổng quan thống kê hệ thống
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng số dịch vụ"
                  value={stats?.totalServices || 0}
                  prefix={<MedicineBoxOutlined />}
                  valueStyle={{ color: '#3f8600', fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng số bác sĩ"
                  value={stats?.totalDoctors || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng số bệnh nhân"
                  value={stats?.totalPatients || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={stats?.totalRevenue || 0}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#cf1322', fontSize: '24px' }}
                  precision={0}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Debug info cho development */}
        {process.env.NODE_ENV === 'development' && stats && (
          <Card title="Debug Info" style={{ marginTop: '24px' }} size="small">
            <pre style={{ fontSize: '12px', maxHeight: '150px', overflow: 'auto' }}>
              {JSON.stringify(stats, null, 2)}
            </pre>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default AdminDashboard;