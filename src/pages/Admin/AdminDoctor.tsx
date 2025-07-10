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

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface Doctor {
  userName: string;
  imageUrl: string;
  specialization: string;
  introduction: string;
  id?: string;
  accountName?: string;
  fullName?: string;
  isActive?: boolean;
}

// Enhanced Doctor interface
interface EnhancedDoctor extends Doctor {
  id: string;
  status: 'active' | 'inactive';
  accountId?: string;
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors`);
      
      if (response.ok) {
        const doctorsData = await response.json();
        
        console.log('Raw API Response:', doctorsData);
        
        let doctorsList: any[] = [];
        
        // Xử lý response theo cấu trúc thực tế từ API
        if (doctorsData && doctorsData.$id && doctorsData.$values && Array.isArray(doctorsData.$values)) {
          // API trả về với cấu trúc có $values array
          doctorsList = doctorsData.$values;
        } 
        else if (doctorsData && typeof doctorsData === 'object' && !Array.isArray(doctorsData)) {
          // API trả về object với keys là IDs
          doctorsList = Object.entries(doctorsData).map(([id, doctor]: [string, any]) => ({
            ...doctor,
            id: id
          }));
        } 
        else if (Array.isArray(doctorsData)) {
          doctorsList = doctorsData;
        } 
        else if (doctorsData && doctorsData.data && Array.isArray(doctorsData.data)) {
          doctorsList = doctorsData.data;
        }
        
        console.log('Processed doctorsList:', doctorsList);
        
        if (doctorsList.length > 0) {
          const enhancedDoctors: EnhancedDoctor[] = doctorsList.map((doctor: any, index: number) => ({
            id: doctor.$id || doctor.id || doctor._id || `doctor-${index}`,
            userName: doctor.userName || doctor.username || doctor.name || 'Unknown',
            fullName: doctor.fullName || doctor.userName || doctor.username || doctor.name,
            accountName: doctor.accountName || doctor.username,
            accountId: doctor.accountId || doctor.id,
            specialization: doctor.specialization || 'General',
            introduction: doctor.introduction || 'No introduction available',
            imageUrl: doctor.imageUrl || '',
            isActive: doctor.isActive !== false,
            status: (doctor.isActive !== false ? 'active' : 'inactive') as 'active' | 'inactive',
          }));
          
          console.log('Enhanced doctors:', enhancedDoctors);
          setDoctors(enhancedDoctors);
          message.success(`Loaded ${enhancedDoctors.length} doctors successfully`);
        } else {
          console.log('No doctors found in processed data');
          setDoctors([]);
          message.info('No doctors found in the system');
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        message.error(`Failed to fetch doctors: ${response.status} ${response.statusText}`);
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      message.error('Error fetching doctors. Please check your connection.');
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const createDoctor = async (doctorData: Doctor) => {
    try {
      // Only send the fields that the API accepts
      const apiData = {
        userName: doctorData.userName,
        imageUrl: doctorData.imageUrl,
        specialization: doctorData.specialization,
        introduction: doctorData.introduction
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        const newDoctor = await response.json();
        message.success('Doctor created successfully');
        // Refresh the doctors list
        fetchDoctors();
        return newDoctor;
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Failed to create doctor');
        return null;
      }
    } catch (error) {
      console.error('Error creating doctor:', error);
      message.error('Error creating doctor. Please try again.');
      return null;
    }
  };

  const updateDoctor = async (doctorId: string, doctorData: Doctor) => {
    try {
      // Only send the fields that the API accepts
      const apiData = {
        userName: doctorData.userName,
        imageUrl: doctorData.imageUrl,
        specialization: doctorData.specialization,
        introduction: doctorData.introduction
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
        // Refresh the doctors list
        fetchDoctors();
        return true;
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Failed to update doctor');
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
        // Refresh the doctors list
        fetchDoctors();
        return true;
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Failed to delete doctor');
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
      introduction: doctor.introduction,
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
        // Update existing doctor
        const success = await updateDoctor(editingDoctor.id, values);
        if (success) {
          setIsModalVisible(false);
          form.resetFields();
        }
      } else {
        // Create new doctor
        const newDoctor = await createDoctor(values);
        if (newDoctor) {
          setIsModalVisible(false);
          form.resetFields();
        }
      }
    } catch (error) {
      console.error('Form validation failed:', error);
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
      title: 'Introduction',
      dataIndex: 'introduction',
      key: 'introduction',
      render: (text: string) => (
        <div className="introduction-cell">
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
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminDoctor;