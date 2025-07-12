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
  message,
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
import './AdminPage.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Doctor {
  userName: string;
  imageUrl: string;
  specialization: string;
  phoneNumber: string;
  id?: string;
  accountName?: string;
  fullName?: string;
  isActive?: boolean;
}

interface EnhancedDoctor extends Doctor {
  id: string;
  status: 'active' | 'inactive';
  accountId?: string;
  email?: string;
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
      setLoadingDoctors(true);
      // Changed API endpoint to match the image
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/accounts/all-users`);
      
      if (response.ok) {
        const usersData = await response.json();
        
        console.log('Raw API Response:', usersData);
        
        let usersList: any[] = [];
        
        // Handle the API response structure from the image
        if (usersData && usersData.$values && Array.isArray(usersData.$values)) {
          usersList = usersData.$values;
        } else if (Array.isArray(usersData)) {
          usersList = usersData;
        } else if (usersData && usersData.data && Array.isArray(usersData.data)) {
          usersList = usersData.data;
        }
        
        console.log('Processed usersList:', usersList);
        
        // Filter users to only include those with Doctor role
        const doctorUsers = usersList.filter((user: any) => {
          const roles = user.roles?.$values || user.roles || [];
          return roles.some((role: any) => role.value === 'Doctor' || role === 'Doctor');
        });
        
        console.log('Filtered doctor users:', doctorUsers);
        
        if (doctorUsers.length > 0) {
          const enhancedDoctors: EnhancedDoctor[] = doctorUsers.map((user: any, index: number) => ({
            id: user.id || user.$id || `doctor-${index}`,
            userName: user.userName || user.username || user.name || 'Unknown',
            fullName: user.fullName || user.userName || user.username || user.name,
            accountName: user.userName || user.username,
            accountId: user.id || user.$id,
            email: user.email || '',
            specialization: user.specialization || 'General Medicine',
            phoneNumber: user.phoneNumber || user.phoneNumber || 'No phoneNumber available',
            imageUrl: user.imageUrl || user.avatar || '',
            isActive: user.isActive !== false,
            status: (user.isActive !== false ? 'active' : 'inactive') as 'active' | 'inactive',
          }));
          
          console.log('Enhanced doctors:', enhancedDoctors);
          setDoctors(enhancedDoctors);
          message.success(`Loaded ${enhancedDoctors.length} doctors successfully`);
        } else {
          console.log('No doctors found in the system');
          setDoctors([]);
          message.info('No doctors found in the system');
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        setDoctors([]);
      }
    } catch (error) {
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const updateDoctor = async (doctorId: string, doctorData: Doctor) => {
    try {
      const apiData = {
        userName: doctorData.userName,
        imageUrl: doctorData.imageUrl,
        specialization: doctorData.specialization,
        phoneNumber: doctorData.phoneNumber
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        message.success('Doctor updated successfully');
        fetchDoctors();
        return true;
      } else {
        const errorData = await response.json();
        message.error(errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      message.error('Error updating doctor. Please try again.');
      return false;
    }
  };

  const deleteDoctor = async (doctorId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors/${doctorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Doctor deleted successfully');
        fetchDoctors();
        return true;
      } else {
        const errorData = await response.json();
        message.error(errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      message.error('Error deleting doctor. Please try again.');
      return false;
    }
  };

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditDoctor = (doctor: EnhancedDoctor) => {
    setEditingDoctor(doctor);
    form.setFieldsValue({
      userName: doctor.userName,
      specialization: doctor.specialization,
      phoneNumber: doctor.phoneNumber,
      imageUrl: doctor.imageUrl
    });
    setIsModalVisible(true);
  };

  const handleDeleteDoctor = (doctor: EnhancedDoctor) => {
    Modal.confirm({
      title: 'Delete Doctor',
      content: `Are you sure you want to delete Dr. ${doctor.userName}?`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        await deleteDoctor(doctor.id);
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingDoctor) {
        const success = await updateDoctor(editingDoctor.id, values);
        if (success) {
          setIsModalVisible(false);
          form.resetFields();
        }
      } else {
        const newDoctor = await createDoctor(values);
        if (newDoctor) {
          setIsModalVisible(false);
          form.resetFields();
        }
      }
    } catch (error) {
    }
  };

  const doctorColumns = [
    {
      title: 'Doctor',
      dataIndex: 'userName',
      key: 'userName',
      render: (_text: string, record: EnhancedDoctor) => (
        <div className="doctor-cell">
          <Avatar
            size={40}
            src={record.imageUrl}
            icon={<UserOutlined />}
            className="doctor-avatar"
          />
          <div className="doctor-info">
            <div className="doctor-name">
              {record.fullName || `Dr. ${record.userName}`}
            </div>
            <div className="doctor-specialization">{record.specialization}</div>
            {record.accountName && (
              <div className="doctor-account">@{record.accountName}</div>
            )}
            {record.email && (
              <div className="doctor-email">{record.email}</div>
            )}
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
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text: string) => (
        <div className="phoneNumber-cell">
          <Tooltip title={text}>
            {text && text.length > 50 ? `${text.substring(0, 50)}...` : text}
          </Tooltip>
        </div>
      ),
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
            name="phoneNumber"
            label="Phone Number"
            rules={[{ required: true, message: 'Please input phone number!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="Image URL"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminDoctor;