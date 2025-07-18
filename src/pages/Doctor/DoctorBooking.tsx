import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Button, 
  message, 
  Popconfirm, 
  Space, 
  Typography,
  Spin,
  Tag,
  Tooltip,
  Row,
  Col,
  Input
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined,
  CalendarOutlined,
  SearchOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import DoctorHeader from '../../components/Header/DoctorHeader';
import DoctorSidebar from '../../components/Sidebar/DoctorSidebar';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;

interface Booking {
  id: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes?: string;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DoctorBooking: React.FC = () => {
  const [username, setUsername] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState('bookings');
  const [searchText, setSearchText] = useState('');
  const [userId, setUserId] = useState('');
  const [processingBookings, setProcessingBookings] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Get userId from localStorage instead of doctorId
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchBookings(storedUserId);
    } else {
      message.error('User ID not found in session. Please login again.');
      setLoading(false);
    }
  }, []);

  const fetchBookings = async (userId: string) => {
    try {
      setLoading(true);
      // Updated API endpoint to use userId instead of doctorId
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Booking/GetBookingAsDoctor/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Handle different response formats
      const bookingsList = data.$values || data.values || data || [];
      console.log('Extracted bookings:', bookingsList);
      
      setBookings(bookingsList);
    } catch (error) {
      message.error('Failed to fetch bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      setProcessingBookings(prev => new Set(prev).add(bookingId));
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/Booking/UpdateBooking/${bookingId}?status=confirmed`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Booking accepted successfully');
      fetchBookings(userId); // Refresh the bookings list
    } catch (error) {
      message.error('Failed to accept booking');
      console.error('Error accepting booking:', error);
    } finally {
      setProcessingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const handleDecline = async (bookingId: string) => {
    try {
      setProcessingBookings(prev => new Set(prev).add(bookingId));
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/Booking/UpdateBooking/${bookingId}?status=cancelled`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Booking declined successfully');
      fetchBookings(userId); // Refresh the bookings list
    } catch (error) {
      message.error('Failed to decline booking');
      console.error('Error declining booking:', error);
    } finally {
      setProcessingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'blue';
    }
  };

  const filteredData = bookings.filter(item =>
    item.patientName?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.reason?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text code>{String(text || '').substring(0, 8)}...</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (text: string) => (
        <Text strong style={{ color: '#1890ff' }}>
          <UserOutlined style={{ marginRight: '8px' }} />
          {text}
        </Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date: string) => (
        <Text>
          <CalendarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
          {date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
      render: (time: string) => (
        <Text>
          <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          {time || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status || 'pending'}
        </Tag>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 150 }}>
            {text?.length > 30 ? `${text.substring(0, 30)}...` : text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 150 }}>
            {text?.length > 30 ? `${text.substring(0, 30)}...` : text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 140,
      render: (_: any, record: Booking) => {
        const isProcessing = processingBookings.has(record.id);
        const isPending = record.status?.toLowerCase() === 'pending';
        const isConfirmed = record.status?.toLowerCase() === 'confirmed';
        const isCancelled = record.status?.toLowerCase() === 'cancelled';
        
        return (
          <Space size="small">
            {isPending && (
              <>
                <Tooltip title="Accept Booking">
                  <Popconfirm
                    title="Accept this booking?"
                    description="Are you sure you want to accept this booking?"
                    onConfirm={() => handleAccept(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="primary" 
                      icon={<CheckOutlined />} 
                      size="small"
                      loading={isProcessing}
                      style={{ 
                        borderRadius: '6px',
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a'
                      }}
                    />
                  </Popconfirm>
                </Tooltip>
                <Tooltip title="Decline Booking">
                  <Popconfirm
                    title="Decline this booking?"
                    description="Are you sure you want to decline this booking?"
                    onConfirm={() => handleDecline(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="primary" 
                      danger 
                      icon={<CloseOutlined />} 
                      size="small"
                      loading={isProcessing}
                      style={{ borderRadius: '6px' }}
                    />
                  </Popconfirm>
                </Tooltip>
              </>
            )}
            {isConfirmed && (
              <Tag color="green" style={{ margin: 0 }}>
                <CheckOutlined style={{ marginRight: '4px' }} />
                Accepted
              </Tag>
            )}
            {isCancelled && (
              <Tag color="red" style={{ margin: 0 }}>
                <CloseOutlined style={{ marginRight: '4px' }} />
                Declined
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  const todayBookings = bookings.filter(booking => 
    dayjs(booking.appointmentDate).isSame(dayjs(), 'day')
  );

  const upcomingBookings = bookings.filter(booking => 
    dayjs(booking.appointmentDate).isAfter(dayjs(), 'day')
  );

  const completedBookings = bookings.filter(booking => 
    booking.status?.toLowerCase() === 'completed'
  );

  const pendingBookings = bookings.filter(booking => 
    booking.status?.toLowerCase() === 'pending'
  );

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <DoctorHeader username={username} />
      
      <Layout>
        <DoctorSidebar 
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
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '40px' }}>
                  <div>
                    <Title level={1} style={{ color: 'white', margin: 0, marginBottom: '8px', fontSize: '36px', fontWeight: 700 }}>
                      <CalendarOutlined style={{ marginRight: '12px' }} />
                      Bookings
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
                      Manage your patient appointments and bookings
                    </Text>
                  </div>
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
            </div>

            {/* Statistics Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={6} lg={6}>
                <Card 
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #f0f0f0',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      backgroundColor: '#52c41a15', 
                      borderRadius: '12px', 
                      padding: '16px',
                      fontSize: '24px',
                      color: '#52c41a'
                    }}>
                      <CalendarOutlined />
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>Total Bookings</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {bookings.length}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6} lg={6}>
                <Card 
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #f0f0f0',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      backgroundColor: '#fa8c1615', 
                      borderRadius: '12px', 
                      padding: '16px',
                      fontSize: '24px',
                      color: '#fa8c16'
                    }}>
                      <ClockCircleOutlined />
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>Pending</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {pendingBookings.length}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6} lg={6}>
                <Card 
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #f0f0f0',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      backgroundColor: '#1890ff15', 
                      borderRadius: '12px', 
                      padding: '16px',
                      fontSize: '24px',
                      color: '#1890ff'
                    }}>
                      <InfoCircleOutlined />
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>Today</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {todayBookings.length}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6} lg={6}>
                <Card 
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #f0f0f0',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      backgroundColor: '#52c41a15', 
                      borderRadius: '12px', 
                      padding: '16px',
                      fontSize: '24px',
                      color: '#52c41a'
                    }}>
                      <UserOutlined />
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>Completed</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {completedBookings.length}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Main Content */}
            <Card 
              style={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #f0f0f0'
              }}
            >
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ margin: 0 }}>Your Bookings</Title>
                <Input
                  placeholder="Search bookings..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300, borderRadius: '8px' }}
                />
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: '16px', color: '#666' }}>Loading bookings...</p>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="id"
                  pagination={{
                    total: filteredData.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    style: { marginTop: '16px' }
                  }}
                  scroll={{ x: 1200 }}
                  style={{ borderRadius: '8px' }}
                />
              )}
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DoctorBooking;