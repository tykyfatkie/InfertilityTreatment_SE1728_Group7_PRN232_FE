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
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  address: string;
  status: 'active' | 'inactive';
  registrationDate: string;
  lastVisit?: string;
  totalVisits: number;
  imageUrl?: string;
}

const AdminPatient: React.FC = () => {
  const [username, setUsername] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState('patients');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // Mock data for patients since we don't have a real API
      const mockPatients: Patient[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1234567890',
          age: 35,
          gender: 'male',
          address: '123 Main St, City, Country',
          status: 'active',
          registrationDate: '2024-01-15',
          lastVisit: '2024-07-05',
          totalVisits: 12,
          imageUrl: 'https://via.placeholder.com/40'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+1234567891',
          age: 28,
          gender: 'female',
          address: '456 Oak Ave, City, Country',
          status: 'active',
          registrationDate: '2024-02-20',
          lastVisit: '2024-07-08',
          totalVisits: 8,
          imageUrl: 'https://via.placeholder.com/40'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob.johnson@email.com',
          phone: '+1234567892',
          age: 42,
          gender: 'male',
          address: '789 Pine Rd, City, Country',
          status: 'inactive',
          registrationDate: '2023-11-10',
          lastVisit: '2024-05-15',
          totalVisits: 15,
          imageUrl: 'https://via.placeholder.com/40'
        },
        {
          id: '4',
          name: 'Alice Brown',
          email: 'alice.brown@email.com',
          phone: '+1234567893',
          age: 31,
          gender: 'female',
          address: '321 Elm St, City, Country',
          status: 'active',
          registrationDate: '2024-03-05',
          lastVisit: '2024-07-10',
          totalVisits: 6,
          imageUrl: 'https://via.placeholder.com/40'
        }
      ];
      
      setPatients(mockPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    form.setFieldsValue(patient);
    setIsModalVisible(true);
  };

  const handleDeletePatient = (patient: Patient) => {
    Modal.confirm({
      title: 'Delete Patient',
      content: `Are you sure you want to delete patient ${patient.name}?`,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setPatients(patients.filter(p => p.id !== patient.id));
        message.success('Patient deleted successfully');
      }
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingPatient) {
        setPatients(patients.map(p => p.id === editingPatient.id ? { ...p, ...values } : p));
        message.success('Patient updated successfully');
      } else {
        const newPatient: Patient = {
          ...values,
          id: `patient-${Date.now()}`,
          status: 'active' as const,
          registrationDate: new Date().toISOString().split('T')[0],
          totalVisits: 0
        };
        setPatients([...patients, newPatient]);
        message.success('Patient added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const patientColumns = [
    {
      title: 'Patient',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Patient) => (
        <div className="patient-cell">
          <Avatar
            size={40}
            src={record.imageUrl}
            icon={<UserOutlined />}
            className="patient-avatar"
          />
          <div className="patient-info">
            <div className="patient-name">{text}</div>
            <div className="patient-contact">
              <span className="patient-email">
                <MailOutlined /> {record.email}
              </span>
              <span className="patient-phone">
                <PhoneOutlined /> {record.phone}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      render: (age: number) => `${age} years`,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (
        <Tag color={gender === 'male' ? 'blue' : gender === 'female' ? 'pink' : 'default'}>
          {gender.toUpperCase()}
        </Tag>
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
      title: 'Total Visits',
      dataIndex: 'totalVisits',
      key: 'totalVisits',
      render: (count: number) => <Badge count={count} showZero color="#1890ff" />,
    },
    {
      title: 'Last Visit',
      dataIndex: 'lastVisit',
      key: 'lastVisit',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Patient) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEditPatient(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDeletePatient(record)} />
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
            <div className="patients-content">
              <div className="patients-header">
                <div className="patients-title">
                  <Title level={2}>Patients Management</Title>
                  <Paragraph>Manage all patients in the system</Paragraph>
                </div>
              </div>
              
              <Card className="patients-table-card">
                <Table
                  columns={patientColumns}
                  dataSource={patients}
                  loading={loadingPatients}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  className="patients-table"
                />
              </Card>
            </div>
          </div>
        </Content>
      </Layout>

      <Modal
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Patient Name"
            rules={[{ required: true, message: 'Please input patient name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please input phone number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: 'Please input age!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: 'Please select gender!' }]}
          >
            <Select>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please input address!' }]}
          >
            <Input.TextArea rows={3} />
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

export default AdminPatient;