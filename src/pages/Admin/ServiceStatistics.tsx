import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Alert, Spin, Tag, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Content } = Layout;
const { Title } = Typography;

interface ServiceStatistic {
  id: string;
  type: string;
  date: string;
  count: number;
}

interface ServiceStatisticsResponse {
  id: string;
  values: ServiceStatistic[];
}

const ServiceStatistics: React.FC = () => {
  const [data, setData] = useState<ServiceStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/statistics/services`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching service statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceStatistics();
  }, []);

  const handleRetry = () => {
    fetchServiceStatistics();
  };

  // Prepare data for charts
  const prepareChartData = () => {
    if (!data?.values) return { barData: [], pieData: [] };

    // Group by type for bar chart
    const typeGroups = data.values.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + item.count;
      return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(typeGroups).map(([type, count]) => ({
      type,
      count
    }));

    // Prepare pie chart data
    const pieData = barData.map((item, index) => ({
      name: item.type,
      value: item.count,
      color: `hsl(${(index * 360) / barData.length}, 70%, 50%)`
    }));

    return { barData, pieData };
  };

  const { barData, pieData } = prepareChartData();

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Loại dịch vụ',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'Diagnosis' ? 'blue' : type === 'MT' ? 'green' : 'orange'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
      align: 'right' as const,
      render: (count: number) => <strong>{count}</strong>
    },
  ];

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
            Thống kê dịch vụ
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '16px' }}>
            Chi tiết thống kê các dịch vụ y tế
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Charts */}
            <div style={{ marginBottom: '24px' }}>
              <Card title="Biểu đồ thống kê" style={{ marginBottom: '16px' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Phân bố dịch vụ">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? 'N/A'} ${(percent !== undefined ? (percent * 100).toFixed(0) : '0')}%`             
                    }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Data table */}
            <Card title="Chi tiết dữ liệu">
              <Table
                columns={columns}
                dataSource={data?.values || []}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} bản ghi`
                }}
              />
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

export default ServiceStatistics;