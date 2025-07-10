import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Row, 
  Col, 
  Space, 
  Avatar, 
  Table, 
  Tag, 
  Statistic, 
  Modal,
  Form,
  Input,
  Select,
  message,
  Badge,
  Tooltip,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import AdminHeader from '../../components/Header/AdminHeader';
import AdminSidebar from '../../components/Sidebar/AdminSidebar';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import './AdminPage.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;

interface Doctor {
  userName: string;
  imageUrl: string;
  specialization: string;
  introduction: string;
  id?: string;
  status?: 'active' | 'inactive';
  experience?: number;
  rating?: number;
  patients?: number;
}

interface AdminStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  monthlyRevenue: number;
}

// Enhanced Doctor interface for internal use
interface EnhancedDoctor extends Doctor {
  id: string;
  status: 'active' | 'inactive';
  experience: number;
  rating: number;
  patients: number;
}

const AdminPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [doctors, setDoctors] = useState<EnhancedDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<EnhancedDoctor | null>(null);
  const [form] = Form.useForm();
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

    fetchDoctors();
    fetchAdminStats();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors`);
      if (response.ok) {
        const doctorsData = await response.json();
        if (Array.isArray(doctorsData)) {
          // Add mock data for admin view with proper typing
          const enhancedDoctors: EnhancedDoctor[] = doctorsData.map((doctor: Doctor, index: number) => ({
            ...doctor,
            id: doctor.id || `doctor-${index}`,
            status: (Math.random() > 0.2 ? 'active' : 'inactive') as 'active' | 'inactive',
            experience: Math.floor(Math.random() * 15) + 5,
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
            patients: Math.floor(Math.random() * 200) + 50
          }));
          setDoctors(enhancedDoctors);
          setAdminStats(prev => ({ ...prev, totalDoctors: enhancedDoctors.length }));
        } else {
          setDoctors([]);
        }
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAdminStats = async () => {
    // Mock data for admin stats
    setAdminStats({
      totalDoctors: 0, // Will be updated when doctors are fetched
      totalPatients: 1245,
      totalAppointments: 89,
      monthlyRevenue: 125000
    });
  };

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditDoctor = (doctor: EnhancedDoctor) => {
    setEditingDoctor(doctor);
    form.setFieldsValue(doctor);
    setIsModalVisible(true);
  };

  const handleDeleteDoctor = (doctor: EnhancedDoctor) => {
    Modal.confirm({
      title: 'Delete Doctor',
      content: `Are you sure you want to delete Dr. ${doctor.userName}?`,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setDoctors(doctors.filter(d => d.id !== doctor.id));
        message.success('Doctor deleted successfully');
      }
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingDoctor) {
        setDoctors(doctors.map(d => d.id === editingDoctor.id ? { ...d, ...values } : d));
        message.success('Doctor updated successfully');
      } else {
        const newDoctor: EnhancedDoctor = {
          ...values,
          id: `doctor-${Date.now()}`,
          status: 'active' as const,
          experience: 5,
          rating: 4.0,
          patients: 0
        };
        setDoctors([...doctors, newDoctor]);
        message.success('Doctor added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const doctorColumns = [
    {
      title: 'Doctor',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string, record: EnhancedDoctor) => (
        <div className="doctor-cell">
          <Avatar
            size={40}
            src={record.imageUrl}
            icon={<UserOutlined />}
            className="doctor-avatar"
          />
          <div className="doctor-info">
            <div className="doctor-name">Dr. {text}</div>
            <div className="doctor-specialization">{record.specialization}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'active' | 'inactive') => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      render: (years: number) => `${years} years`,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div className="rating-cell">
          <span className="rating-value">{rating}</span>
          <span className="rating-stars">★★★★★</span>
        </div>
      ),
    },
    {
      title: 'Patients',
      dataIndex: 'patients',
      key: 'patients',
      render: (count: number) => <Badge count={count} showZero color="#1890ff" />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: EnhancedDoctor) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEditDoctor(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDeleteDoctor(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

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
                    <Button type="primary" icon={<PlusOutlined />} block onClick={handleAddDoctor}>
                      Add New Doctor
                    </Button>
                    <Button icon={<CalendarOutlined />} block>
                      Schedule Appointment
                    </Button>
                    <Button icon={<UserOutlined />} block>
                      Add Patient
                    </Button>
                    <Button icon={<SettingOutlined />} block>
                      System Settings
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 'doctors':
        return (
          <div className="doctors-content">
            <div className="doctors-header">
              <div className="doctors-title">
                <Title level={2}>Doctors Management</Title>
                <Paragraph>Manage all doctors in the system</Paragraph>
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDoctor}>
                Add Doctor
              </Button>
            </div>
            
            <Card className="doctors-table-card">
              <Table
                columns={doctorColumns}
                dataSource={doctors}
                loading={loadingDoctors}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                className="doctors-table"
              />
            </Card>
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

      <Modal
        title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="userName"
            label="Doctor Name"
            rules={[{ required: true, message: 'Please input doctor name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="specialization"
            label="Specialization"
            rules={[{ required: true, message: 'Please input specialization!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="introduction"
            label="Introduction"
            rules={[{ required: true, message: 'Please input introduction!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="Image URL"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminPage;