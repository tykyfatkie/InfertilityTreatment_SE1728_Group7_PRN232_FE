import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Alert, Spin, Empty, Typography, Row, Col, Statistic } from 'antd';
import { MedicineBoxOutlined, BarChartOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;

interface MedicationStatisticsResponse {
  id: string;
  values: any[];
}

const MedicationStatistics: React.FC = () => {
  const [data, setData] = useState<MedicationStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicationStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/statistics/medications`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching medication statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicationStatistics();
  }, []);

  const handleRetry = () => {
    fetchMedicationStatistics();
  };

  // Prepare columns dynamically based on data structure
  const getTableColumns = () => {
    if (!data?.values || data.values.length === 0) return [];

    const sampleItem = data.values[0];
    const keys = Object.keys(sampleItem);

    return keys.map(key => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      dataIndex: key,
      key: key,
      render: (value: any) => {
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        if (typeof value === 'boolean') {
          return value ? 'Có' : 'Không';
        }
        return value?.toString() || '-';
      }
    }));
  };

  const columns = getTableColumns();

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
          <Title level={2} style={{ margin: 0 }}>
            Thống kê thuốc
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '16px' }}>
            Chi tiết thống kê thuốc và dược phẩm
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Tổng số bản ghi"
                    value={data?.values?.length || 0}
                    prefix={<DatabaseOutlined />}
                    valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="ID Dataset"
                    value={data?.id || 'N/A'}
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Trạng thái"
                    value={data?.values?.length ? 'Có dữ liệu' : 'Trống'}
                    prefix={<MedicineBoxOutlined />}
                    valueStyle={{ 
                      color: data?.values?.length ? '#52c41a' : '#f5222d',
                      fontSize: '18px'
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Main content */}
            <Card title="Dữ liệu thuốc">
              {!data?.values || data.values.length === 0 ? (
                <Empty 
                  description="Không có dữ liệu thuốc"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <Table
                  columns={columns}
                  dataSource={data.values}
                  rowKey={(_record, index) => index?.toString() || '0'}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} của ${total} bản ghi`
                  }}
                  scroll={{ x: 800 }}
                />
              )}
            </Card>
          </>
        )}

        {/* Debug info cho development */}
        {process.env.NODE_ENV === 'development' && data && (
          <Card title="Debug Info" style={{ marginTop: '24px' }} size="small">
            <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default MedicationStatistics;