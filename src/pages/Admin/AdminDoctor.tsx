import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Space, 
  Avatar, 
  Table, 
  Tag, 
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
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import './AdminDoctor.css';

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

// Enhanced Doctor interface for internal use
interface EnhancedDoctor extends Doctor {
  id: string;
  status: 'active' | 'inactive';
  experience: number;
  rating: number;
  patients: number;
}

const AdminDoctor: React.FC = () => {
  const [username, setUsername] = useState('');
  const [doctors, setDoctors] = useState<EnhancedDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState('doctors');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<EnhancedDoctor | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchDoctors();
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

export default AdminDoctor;