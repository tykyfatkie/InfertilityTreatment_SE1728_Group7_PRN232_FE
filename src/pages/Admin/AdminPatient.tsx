import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Avatar, 
  Table, 
  Tag, 
  message,
  Input,
  Select,
  Badge,
  Row,
  Col,
  Statistic,
  Empty,
  Spin,
  Switch,
  Popconfirm,
} from 'antd';
import { 
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import AdminHeader from '../../components/Header/AdminHeader';
import AdminSidebar from '../../components/Sidebar/AdminSidebar';
import './AdminPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

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

interface DoctorStats {
  total: number;
  active: number;
  inactive: number;
  specializations: number;
}

const AdminPatient: React.FC = () => {
  const [username, setUsername] = useState('');
  const [doctors, setDoctors] = useState<EnhancedDoctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<EnhancedDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState('doctors');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [switchLoading, setSwitchLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchText, statusFilter, specializationFilter]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/accounts/all-users`);
      
      if (response.ok) {
        const usersData = await response.json();
        
        let usersList: any[] = [];
        
        if (usersData && usersData.$values && Array.isArray(usersData.$values)) {
          usersList = usersData.$values;
        } else if (Array.isArray(usersData)) {
          usersList = usersData;
        } else if (usersData && usersData.data && Array.isArray(usersData.data)) {
          usersList = usersData.data;
        }
        
        const doctorUsers = usersList.filter((user: any) => {
          const roles = user.roles?.$values || user.roles || [];
          return roles.some((role: any) => role.value === 'Doctor' || role === 'Doctor');
        });
        
        if (doctorUsers.length > 0) {
          const enhancedDoctors: EnhancedDoctor[] = doctorUsers.map((user: any, index: number) => ({
            id: user.id || user.$id || `doctor-${index}`,
            userName: user.userName || user.username || user.name || 'Unknown',
            fullName: user.fullName || user.userName || user.username || user.name,
            accountName: user.userName || user.username,
            accountId: user.id || user.$id,
            email: user.email || '',
            specialization: user.specialization || 'General Medicine',
            phoneNumber: user.phoneNumber || user.phoneNumber || 'No phone available',
            imageUrl: user.imageUrl || user.avatar || '',
            isActive: user.isActive !== false,
            status: (user.isActive !== false ? 'active' : 'inactive') as 'active' | 'inactive',
          }));
          
          setDoctors(enhancedDoctors);
          message.success(`Loaded ${enhancedDoctors.length} doctors successfully`);
        } else {
          setDoctors([]);
          message.info('No doctors found in the system');
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        setDoctors([]);
      }
    } catch (error) {
      setDoctors([]);
      message.error('Failed to load doctors. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const toggleDoctorStatus = async (doctorId: string, currentStatus: 'active' | 'inactive', doctorName: string) => {
    try {
      setSwitchLoading(prev => ({ ...prev, [doctorId]: true }));
      
      const doctor = doctors.find(d => d.id === doctorId);
      if (!doctor) {
        message.error('Doctor not found');
        return;
      }

      const username = doctor.accountName || doctor.userName;
      let apiUrl = '';
      let method = '';
      
      if (currentStatus === 'active') {
        // Deactivate user
        apiUrl = `${import.meta.env.VITE_API_BASE_URL}/accounts/${username}`;
        method = 'DELETE';
      } else {
        // Activate user
        apiUrl = `${import.meta.env.VITE_API_BASE_URL}/accounts/${username}/restore`;
        method = 'PUT';
      }

      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        const updatedDoctors: EnhancedDoctor[] = doctors.map(doc => {
          if (doc.id === doctorId) {
            const newStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';
            return {
              ...doc,
              status: newStatus,
              isActive: newStatus === 'active'
            };
          }
          return doc;
        });
        
        setDoctors(updatedDoctors);
        
        const action = currentStatus === 'active' ? 'deactivated' : 'activated';
        message.success(`Dr. ${doctorName} has been ${action} successfully`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        message.error(`Failed to ${currentStatus === 'active' ? 'deactivate' : 'activate'} doctor: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling doctor status:', error);
      message.error(`Failed to ${currentStatus === 'active' ? 'deactivate' : 'activate'} doctor. Please try again.`);
    } finally {
      setSwitchLoading(prev => ({ ...prev, [doctorId]: false }));
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    if (searchText) {
      filtered = filtered.filter(doctor =>
        doctor.userName.toLowerCase().includes(searchText.toLowerCase()) ||
        doctor.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchText.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doctor => doctor.status === statusFilter);
    }

    if (specializationFilter !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialization === specializationFilter);
    }

    setFilteredDoctors(filtered);
  };

  const getStats = (): DoctorStats => {
    const specializations = new Set(doctors.map(d => d.specialization));
    return {
      total: doctors.length,
      active: doctors.filter(d => d.status === 'active').length,
      inactive: doctors.filter(d => d.status === 'inactive').length,
      specializations: specializations.size,
    };
  };

  const getUniqueSpecializations = () => {
    const specializations = new Set(doctors.map(d => d.specialization));
    return Array.from(specializations);
  };

  const doctorColumns = [
    {
      title: 'Doctor',
      dataIndex: 'userName',
      key: 'userName',
      width: 300,
      render: (_text: string, record: EnhancedDoctor) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge 
            dot 
            color={record.status === 'active' ? '#52c41a' : '#ff4d4f'}
            offset={[-8, 8]}
          >
            <Avatar
              size={48}
              src={record.imageUrl}
              icon={<UserOutlined />}
              style={{ 
                backgroundColor: record.status === 'active' ? '#f6ffed' : '#fff2f0',
                color: record.status === 'active' ? '#52c41a' : '#ff4d4f',
                border: `2px solid ${record.status === 'active' ? '#52c41a' : '#ff4d4f'}`,
              }}
            />
          </Badge>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
              {record.fullName || `Dr. ${record.userName}`}
            </div>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '2px' }}>
              <MedicineBoxOutlined style={{ marginRight: '4px' }} />
              {record.specialization}
            </div>
            {record.accountName && (
              <div style={{ color: '#999', fontSize: '11px' }}>
                @{record.accountName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (_: any, record: EnhancedDoctor) => (
        <div>
          {record.email && (
            <div style={{ marginBottom: '4px', fontSize: '12px' }}>
              <MailOutlined style={{ marginRight: '6px', color: '#1890ff' }} />
              <Text copyable={{ text: record.email }}>{record.email}</Text>
            </div>
          )}
          <div style={{ fontSize: '12px' }}>
            <PhoneOutlined style={{ marginRight: '6px', color: '#52c41a' }} />
            <Text copyable={{ text: record.phoneNumber }}>{record.phoneNumber}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: 'active' | 'inactive') => (
        <Tag 
          color={status === 'active' ? 'success' : 'error'}
          icon={status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          style={{ fontWeight: 500 }}
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: EnhancedDoctor) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Popconfirm
            title={`${record.status === 'active' ? 'Deactivate' : 'Activate'} Doctor`}
            description={`Are you sure you want to ${record.status === 'active' ? 'deactivate' : 'activate'} Dr. ${record.fullName || record.userName}?`}
            onConfirm={() => toggleDoctorStatus(record.id, record.status, record.fullName || record.userName)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PoweroffOutlined 
                style={{ 
                  color: record.status === 'active' ? '#52c41a' : '#ff4d4f',
                  fontSize: '12px'
                }} 
              />
              <Switch
                size="small"
                checked={record.status === 'active'}
                loading={switchLoading[record.id] || false}
                style={{
                  backgroundColor: record.status === 'active' ? '#52c41a' : '#ff4d4f',
                }}
              />
            </div>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const stats = getStats();

  return (
    <Layout className="admin-layout">
      <AdminHeader username={username} />
      
      <Layout>
        <AdminSidebar 
          selectedMenuItem={selectedMenuItem} 
          onMenuItemSelect={setSelectedMenuItem} 
        />

        <Content className="admin-content" style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
          <div className="admin-content-wrapper">
            {/* Header Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                    <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    Doctors Management
                  </Title>
                  <Paragraph style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                    Manage all medical professionals in your healthcare system
                  </Paragraph>
                </div>
              </div>

              {/* Stats Cards */}
              <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                  <Card 
                    bordered={false}
                    style={{ 
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Total Doctors</span>}
                      value={stats.total}
                      prefix={<TeamOutlined style={{ color: 'white' }} />}
                      valueStyle={{ color: 'white', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card 
                    bordered={false}
                    style={{ 
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white'
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Active Doctors</span>}
                      value={stats.active}
                      prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
                      valueStyle={{ color: 'white', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card 
                    bordered={false}
                    style={{ 
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white'
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Inactive Doctors</span>}
                      value={stats.inactive}
                      prefix={<CloseCircleOutlined style={{ color: 'white' }} />}
                      valueStyle={{ color: 'white', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card 
                    bordered={false}
                    style={{ 
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      color: 'white'
                    }}
                  >
                    <Statistic
                      title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Specializations</span>}
                      value={stats.specializations}
                      prefix={<MedicineBoxOutlined style={{ color: 'white' }} />}
                      valueStyle={{ color: 'white', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Filters Section */}
            <Card 
              bordered={false}
              style={{ 
                marginBottom: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <Search
                    placeholder="Search doctors by name, specialization, or email..."
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ borderRadius: '6px' }}
                    size="large"
                  />
                </Col>
                <Col span={4}>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="Filter by status"
                  >
                    <Option value="all">All Status</Option>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </Col>
                <Col span={4}>
                  <Select
                    value={specializationFilter}
                    onChange={setSpecializationFilter}
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="Filter by specialization"
                  >
                    <Option value="all">All Specializations</Option>
                    {getUniqueSpecializations().map(spec => (
                      <Option key={spec} value={spec}>{spec}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'right' }}>
                    <Text style={{ color: '#666', fontSize: '14px' }}>
                      Showing {filteredDoctors.length} of {doctors.length} doctors
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Table Section */}
            <Card 
              bordered={false}
              style={{ 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              {loadingDoctors ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px', color: '#666' }}>Loading doctors...</div>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No doctors found"
                  style={{ padding: '60px 0' }}
                >
                  <Button type="primary" icon={<PlusOutlined />}>
                    Add First Doctor
                  </Button>
                </Empty>
              ) : (
                <Table
                  columns={doctorColumns}
                  dataSource={filteredDoctors}
                  rowKey="id"
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} doctors`,
                    style: { marginTop: '16px' }
                  }}
                  className="doctors-table"
                  rowClassName={(record) => record.id === selectedDoctorId ? 'selected-row' : ''}
                  onRow={(record) => ({
                    onClick: () => setSelectedDoctorId(record.id),
                  })}
                  style={{ backgroundColor: 'white' }}
                />
              )}
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPatient;