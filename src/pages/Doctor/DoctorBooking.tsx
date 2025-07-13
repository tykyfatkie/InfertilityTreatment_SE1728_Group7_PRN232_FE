import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  TimePicker,
  message, 
  Popconfirm, 
  Space, 
  Typography,
  Spin,
  Tag,
  Tooltip,
  Row,
  Col
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined,
  CalendarOutlined,
  SearchOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import AdminHeader from '../../components/Header/AdminHeader';
import AdminSidebar from '../../components/Sidebar/AdminSidebar';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [form] = Form.useForm();
  const [selectedMenuItem, setSelectedMenuItem] = useState('bookings');
  const [searchText, setSearchText] = useState('');
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Get doctor ID from localStorage or props
    const storedDoctorId = localStorage.getItem('doctorId') || '1'; // Default to 1 for demo
    setDoctorId(storedDoctorId);
    
    if (storedDoctorId) {
      fetchBookings(storedDoctorId);
    }
  }, []);

  const fetchBookings = async (doctorId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Booking/GetBookingAsDoctor/${doctorId}`);
      
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

  const handleEdit = (record: Booking) => {
    setEditingBooking(record);
    setEditModalVisible(true);
    form.setFieldsValue({
      patientName: record.patientName,
      appointmentDate: record.appointmentDate ? dayjs(record.appointmentDate) : null,
      appointmentTime: record.appointmentTime ? dayjs(record.appointmentTime, 'HH:mm') : null,
      status: record.status,
      notes: record.notes,
      reason: record.reason
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Booking/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Booking deleted successfully');
      fetchBookings(doctorId);
    } catch (error) {
      message.error('Failed to delete booking');
      console.error('Error deleting booking:', error);
    }
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingBooking) {
        const formattedValues = {
          ...values,
          appointmentDate: values.appointmentDate ? values.appointmentDate.format('YYYY-MM-DD') : null,
          appointmentTime: values.appointmentTime ? values.appointmentTime.format('HH:mm') : null,
        };

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Booking/${editingBooking.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedValues),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        message.success('Booking updated successfully');
        setEditModalVisible(false);
        form.resetFields();
        fetchBookings(doctorId);
      }
    } catch (error) {
      message.error('Failed to update booking');
      console.error('Error updating booking:', error);
    }
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
    form.resetFields();
    setEditingBooking(null);
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
      width: 120,
      render: (_: any, record: Booking) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
              style={{ borderRadius: '6px' }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this booking?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
                style={{ borderRadius: '6px' }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
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
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <Title level={1} style={{ color: 'white', margin: 0, marginBottom: '8px', fontSize: '36px', fontWeight: 700 }}>
                      <CalendarOutlined style={{ marginRight: '12px' }} />
                      Doctor Bookings
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
                      backgroundColor: '#1890ff15', 
                      borderRadius: '12px', 
                      padding: '16px',
                      fontSize: '24px',
                      color: '#1890ff'
                    }}>
                      <ClockCircleOutlined />
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
                      backgroundColor: '#fa8c1615', 
                      borderRadius: '12px', 
                      padding: '16px',
                      fontSize: '24px',
                      color: '#fa8c16'
                    }}>
                      <InfoCircleOutlined />
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>Upcoming</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {upcomingBookings.length}
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

      {/* Edit Modal */}
      <Modal
        title="Edit Booking"
        open={editModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        width={600}
        style={{ top: 20 }}
        okText="Update"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="patientName"
            label="Patient Name"
            rules={[{ required: true, message: 'Please enter patient name!' }]}
          >
            <Input placeholder="Enter patient name" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="appointmentDate"
                label="Appointment Date"
                rules={[{ required: true, message: 'Please select appointment date!' }]}
              >
                <DatePicker 
                  style={{ width: '100%', borderRadius: '8px' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="appointmentTime"
                label="Appointment Time"
                rules={[{ required: true, message: 'Please select appointment time!' }]}
              >
                <TimePicker 
                  style={{ width: '100%', borderRadius: '8px' }}
                  format="HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select placeholder="Select status" style={{ borderRadius: '8px' }}>
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
          >
            <Input.TextArea
              rows={2}
              placeholder="Enter reason for appointment"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter additional notes"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default DoctorBooking;