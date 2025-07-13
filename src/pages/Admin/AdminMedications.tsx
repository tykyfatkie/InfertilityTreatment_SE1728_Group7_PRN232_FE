import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
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
  InfoCircleOutlined
} from '@ant-design/icons';
import AdminHeader from '../../components/Header/AdminHeader';
import AdminSidebar from '../../components/Sidebar/AdminSidebar';
import CreateMedicationsPopUp from './CreateMedicationsPopUp';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface Medication {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  route: string;
  notes: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

const AdminMedications: React.FC = () => {
  const [username, setUsername] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [form] = Form.useForm();
  const [selectedMenuItem, setSelectedMenuItem] = useState('medications');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Medications`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Handle different response formats
      const medicationsList = data.$values || data.values || data || [];
      console.log('Extracted medications:', medicationsList);
      
      setMedications(medicationsList);
    } catch (error) {
      message.error('Failed to fetch medications');
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchMedications();
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
  };

  const handleEdit = (record: Medication) => {
    setEditingMedication(record);
    setEditModalVisible(true);
    form.setFieldsValue({
      name: record.name,
      dosage: record.dosage,
      unit: record.unit,
      route: record.route,
      notes: record.notes,
      amount: record.amount
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Medications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Medication deleted successfully');
      fetchMedications();
    } catch (error) {
      message.error('Failed to delete medication');
      console.error('Error deleting medication:', error);
    }
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMedication) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Medications/${editingMedication.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        message.success('Medication updated successfully');
        setEditModalVisible(false);
        form.resetFields();
        fetchMedications();
      }
    } catch (error) {
      message.error('Failed to update medication');
      console.error('Error updating medication:', error);
    }
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
    form.resetFields();
    setEditingMedication(null);
  };

  const filteredData = medications.filter(item =>
    item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.dosage?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.unit?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.route?.toLowerCase().includes(searchText.toLowerCase()) ||
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Text strong style={{ color: '#1890ff' }}>{text}</Text>
      ),
    },
    {
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage',
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (text: string) => (
        <Tag color="green">{text}</Tag>
      ),
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
      render: (text: string) => (
        <Tag color="purple">{text}</Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {amount?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {text?.length > 50 ? `${text.substring(0, 50)}...` : text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: Medication) => (
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
              title="Are you sure you want to delete this medication?"
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
              <div style={{ position: 'relative', zIndex: 1, marginTop: '-90px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <Title level={1} style={{ color: 'white', margin: 0, marginBottom: '8px', marginTop: '150px', fontSize: '36px', fontWeight: 700 }}>
                      <MedicineBoxOutlined style={{ marginRight: '12px' }} />
                      Medications Management
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
                      Manage all medications in the system
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
                      Add Medication
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
              <Col xs={24} sm={8} lg={8}>
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
                      <Text style={{ fontSize: '14px', color: '#666' }}>Total Medications</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {medications.length}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8} lg={8}>
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
                      <Text style={{ fontSize: '14px', color: '#666' }}>Total Stock</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {medications.reduce((sum, m) => sum + (m.amount || 0), 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8} lg={8}>
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
                      <Text style={{ fontSize: '14px', color: '#666' }}>Low Stock</Text>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {medications.filter(m => (m.amount || 0) < 10).length}
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
                <Title level={3} style={{ margin: 0 }}>Medications List</Title>
                <Input
                  placeholder="Search medications..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300, borderRadius: '8px' }}
                />
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: '16px', color: '#666' }}>Loading medications...</p>
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

      {/* Create Modal */}
      <CreateMedicationsPopUp
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <Modal
        title="Edit Medication"
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
            name="name"
            label="Medication Name"
            rules={[{ required: true, message: 'Please enter medication name!' }]}
          >
            <Input placeholder="Enter medication name" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="dosage"
            label="Dosage"
            rules={[{ required: true, message: 'Please enter dosage!' }]}
          >
            <Input placeholder="Enter dosage (e.g., 500mg)" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Unit"
            rules={[{ required: true, message: 'Please enter unit!' }]}
          >
            <Input placeholder="Enter unit (e.g., tablets, ml)" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="route"
            label="Route"
            rules={[{ required: true, message: 'Please enter route!' }]}
          >
            <Input placeholder="Enter route (e.g., oral, injection)" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount!' }]}
          >
            <InputNumber
              placeholder="Enter amount"
              style={{ width: '100%', borderRadius: '8px' }}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
            rules={[{ required: true, message: 'Please enter notes!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter medication notes"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminMedications;