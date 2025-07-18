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
  InputNumber, 
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
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MedicineBoxOutlined,
  SearchOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import AdminHeader from '../../components/Header/AdminHeader';
import AdminSidebar from '../../components/Sidebar/AdminSidebar';
import CreateServiceRequestPopUp from './CreateServiceRequestPopUp';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ServiceRequest {
  id: string;
  doctorId: string;
  serviceName: string;
  type: string;
  price: number;
  description: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  accountId?: string;
  accountName?: string;
  imageUrl?: string;
  introduction?: string;
  isActive?: boolean;
  role?: string;
}

const AdminServiceRequest: React.FC = () => {
  const [username, setUsername] = useState('');
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(null);
  const [form] = Form.useForm();
  const [selectedMenuItem, setSelectedMenuItem] = useState('service-requests');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/serviceRequest/GetAllServiceRequests`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Xử lý dữ liệu trả về từ API
      let requests = [];
      if (Array.isArray(data)) {
        requests = data;
      } else if (data.$values) {
        requests = data.$values;
      } else if (data.values) {
        requests = data.values;
      } else if (data.data) {
        requests = Array.isArray(data.data) ? data.data : (data.data.$values || data.data.values || []);
      }
      
      console.log('Extracted requests:', requests);
      console.log('Total requests count:', requests.length);
      
      setServiceRequests(requests);
    } catch (error) {
      message.error('Failed to fetch service requests');
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Doctors API Response:', data);
      
      // Xử lý dữ liệu doctors từ API response
      let doctorsList = [];
      if (Array.isArray(data)) {
        doctorsList = data;
      } else if (data.$values) {
        doctorsList = data.$values;
      } else if (data.values) {
        doctorsList = data.values;
      } else if (data.data) {
        doctorsList = Array.isArray(data.data) ? data.data : (data.data.$values || data.data.values || []);
      }
      
      // Lọc chỉ lấy các doctor đang active
      const activeDoctors = doctorsList.filter((doctor: Doctor) => doctor.isActive !== false);
      
      console.log('Extracted doctors:', activeDoctors);
      setDoctors(activeDoctors);
    } catch (error) {
      message.error('Failed to fetch doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchServiceRequests();
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
  };

  const handleEdit = async (record: ServiceRequest) => {
    setEditingRequest(record);
    setEditModalVisible(true);
    
    // Fetch doctors when opening edit modal
    await fetchDoctors();
    
    form.setFieldsValue({
      doctorId: record.doctorId,
      serviceName: record.serviceName,
      type: record.type,
      price: record.price,
      description: record.description
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/serviceRequest/RemoveServiceRequest/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Service request deleted successfully');
      fetchServiceRequests();
    } catch (error) {
      message.error('Failed to delete service request');
      console.error('Error deleting service request:', error);
    }
  };

  const handleEditModalOk = async () => {
  try {
    const values = await form.validateFields();
    
    if (editingRequest) {
      const requestBody = {
        id: editingRequest.id,
        doctorId: values.doctorId,
        serviceName: values.serviceName,
        type: values.type,
        price: values.price,
        description: values.description,
        status: editingRequest.status || "Available" 
      };

      console.log('Sending update request:', requestBody);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/serviceRequest/UpdateServiceRequest`, {
        method: 'PATCH', // Changed from PUT to PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Update response:', result);

      message.success('Service request updated successfully');
      setEditModalVisible(false);
      form.resetFields();
      setEditingRequest(null);
      setDoctors([]); // Clear doctors list
      fetchServiceRequests();
    }
  } catch (error) {
    console.error('Error updating service request:', error);
  }
};

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
    form.resetFields();
    setEditingRequest(null);
    setDoctors([]); 
  };

  const filteredData = serviceRequests.filter(item =>
    item.serviceName?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const activeRequests = serviceRequests.filter(r => r.status === 'Available').length;
  const deletedRequests = serviceRequests.filter(r => r.status === 'Deleted').length;

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
      title: 'Service Name',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (text: string) => (
        <Text strong style={{ color: '#1890ff' }}>{text}</Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
          <DollarOutlined /> {price?.toLocaleString()} VND
        </Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {text?.length > 50 ? `${text.substring(0, 50)}...` : text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          'Available': { color: 'green', text: 'Available' },
          'Deleted': { color: 'red', text: 'Deleted' },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'orange', text: status || 'Unknown' };
        
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: ServiceRequest) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
              style={{ borderRadius: '6px' }}
              disabled={record.status === 'Deleted'}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this service request?"
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
                disabled={record.status === 'Deleted'}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

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
                    <Title level={1} style={{ color: 'white', margin: 0, marginBottom: '8px', marginTop: '100px', fontSize: '36px', fontWeight: 700 }}>
                      <MedicineBoxOutlined style={{ marginRight: '12px' }} />
                      Service Requests Management
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
                      Manage all service requests in the system
                    </Text>
                  </div>
                  
                  <Space style={{ marginTop: '140px'}}>
                    <Button 
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreate}
                      size="large"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      Add Service Request
                    </Button>
                  </Space>
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
                      <MedicineBoxOutlined />
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>Total Requests</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {serviceRequests.length}
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
                      <Text style={{ fontSize: '14px', color: '#666' }}>Active Requests</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {activeRequests}
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
                      backgroundColor: '#ff4d4f15', 
                      borderRadius: '12px', 
                      padding: '16px',
                      fontSize: '24px',
                      color: '#ff4d4f'
                    }}>
                      <StopOutlined />
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>Deleted Requests</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {deletedRequests}
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
                      backgroundColor: '#fa541c15', 
                      borderRadius: '12px', 
                      padding: '16px',
                      fontSize: '24px',
                      color: '#fa541c'
                    }}>
                      <DollarOutlined />
                    </div>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>Total Value</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {serviceRequests.reduce((sum, r) => sum + (r.price || 0), 0).toLocaleString()} VND
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
                <Title level={3} style={{ margin: 0 }}>
                  Service Requests List ({filteredData.length} items)
                </Title>
                <Input
                  placeholder="Search service requests..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300, borderRadius: '8px' }}
                />
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: '16px', color: '#666' }}>Loading service requests...</p>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey={(record) => record.id}
                  loading={loading}
                  scroll={{ x: 1200 }}
                  style={{ borderRadius: '8px' }}
                  size="middle"
                />
              )}
            </Card>
          </div>
        </Content>
      </Layout>

      {/* Create Modal */}
      <CreateServiceRequestPopUp
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <Modal
        title="Edit Service Request"
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
            name="doctorId"
            label="Doctor"
            rules={[{ required: true, message: 'Please select a doctor!' }]}
          >
            <Select
              placeholder="Select a doctor"
              showSearch
              loading={doctorsLoading}
              style={{ borderRadius: '8px' }}
              notFoundContent={doctorsLoading ? <Spin size="small" /> : 'No doctors found'}
            >
              {doctors.map(doctor => (
                <Option key={doctor.id} value={doctor.id}>
                  {doctor.fullName} - {doctor.specialization}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="serviceName"
            label="Service Name"
            rules={[{ required: true, message: 'Please enter service name!' }]}
          >
            <Input placeholder="Enter service name" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please enter service type!' }]}
          >
            <Input placeholder="Enter service type" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (VND)"
            rules={[{ required: true, message: 'Please enter price!' }]}
          >
            <InputNumber
              placeholder="Enter price"
              style={{ width: '100%', borderRadius: '8px' }}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter service description"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminServiceRequest;