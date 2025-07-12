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
  HeartOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import AdminHeader from '../../components/Header/AdminHeader';
import AdminSidebar from '../../components/Sidebar/AdminSidebar';
import './AdminPage.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Patient {
  userName: string;
  imageUrl: string;
  phoneNumber: string;
  id?: string;
  accountName?: string;
  fullName?: string;
  isActive?: boolean;
  age?: number;
  gender?: string;
}

interface EnhancedPatient extends Patient {
  id: string;
  status: 'active' | 'inactive';
  accountId?: string;
  email?: string;
}

interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  genders: number;
}

const AdminPatient: React.FC = () => {
  const [username, setUsername] = useState('');
  const [patients, setPatients] = useState<EnhancedPatient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<EnhancedPatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState('patients');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [switchLoading, setSwitchLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchText, statusFilter, genderFilter]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
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
        
        const patientUsers = usersList.filter((user: any) => {
          const roles = user.roles?.$values || user.roles || [];
          return roles.some((role: any) => role.value === 'Patient' || role === 'Patient');
        });
        
        if (patientUsers.length > 0) {
          const enhancedPatients: EnhancedPatient[] = patientUsers.map((user: any, index: number) => ({
            id: user.id || user.$id || `patient-${index}`,
            userName: user.userName || user.username || user.name || 'Unknown',
            fullName: user.fullName || user.userName || user.username || user.name,
            accountName: user.userName || user.username,
            accountId: user.id || user.$id,
            email: user.email || '',
            phoneNumber: user.phoneNumber || user.phoneNumber || 'No phone available',
            imageUrl: user.imageUrl || user.avatar || '',
            isActive: user.isActive !== false,
            status: (user.isActive !== false ? 'active' : 'inactive') as 'active' | 'inactive',
          }));
          
          setPatients(enhancedPatients);
          message.success(`Loaded ${enhancedPatients.length} patients successfully`);
        } else {
          setPatients([]);
          message.info('No patients found in the system');
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        setPatients([]);
      }
    } catch (error) {
      setPatients([]);
      message.error('Failed to load patients. Please try again.');
    } finally {
      setLoadingPatients(false);
    }
  };

  const togglePatientStatus = async (patientId: string, currentStatus: 'active' | 'inactive', patientName: string) => {
    try {
      setSwitchLoading(prev => ({ ...prev, [patientId]: true }));
      
      const patient = patients.find(p => p.id === patientId);
      if (!patient) {
        message.error('Patient not found');
        return;
      }

      const username = patient.accountName || patient.userName;
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
        const updatedPatients: EnhancedPatient[] = patients.map(pat => {
          if (pat.id === patientId) {
            const newStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';
            return {
              ...pat,
              status: newStatus,
              isActive: newStatus === 'active'
            };
          }
          return pat;
        });
        
        setPatients(updatedPatients);
        
        const action = currentStatus === 'active' ? 'deactivated' : 'activated';
        message.success(`${patientName} has been ${action} successfully`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        message.error(`Failed to ${currentStatus === 'active' ? 'deactivate' : 'activate'} patient: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling patient status:', error);
      message.error(`Failed to ${currentStatus === 'active' ? 'deactivate' : 'activate'} patient. Please try again.`);
    } finally {
      setSwitchLoading(prev => ({ ...prev, [patientId]: false }));
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchText) {
      filtered = filtered.filter(patient =>
        patient.userName.toLowerCase().includes(searchText.toLowerCase()) ||
        patient.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        patient.gender?.toLowerCase().includes(searchText.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }

    if (genderFilter !== 'all') {
      filtered = filtered.filter(patient => patient.gender === genderFilter);
    }

    setFilteredPatients(filtered);
  };

  const getStats = (): PatientStats => {
    const genders = new Set(patients.map(p => p.gender).filter(g => g && g !== 'Not specified'));
    return {
      total: patients.length,
      active: patients.filter(p => p.status === 'active').length,
      inactive: patients.filter(p => p.status === 'inactive').length,
      genders: genders.size,
    };
  };

  const getUniqueGenders = () => {
    const genders = new Set(patients.map(p => p.gender).filter(g => g && g !== 'Not specified'));
    return Array.from(genders);
  };

  const patientColumns = [
    {
      title: 'Patient',
      dataIndex: 'userName',
      key: 'userName',
      width: 300,
      render: (_text: string, record: EnhancedPatient) => (
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
              {record.fullName || record.userName}
            </div>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '2px' }}>
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
      render: (_: any, record: EnhancedPatient) => (
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
      render: (_: any, record: EnhancedPatient) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Popconfirm
            title={`${record.status === 'active' ? 'Deactivate' : 'Activate'} Patient`}
            description={`Are you sure you want to ${record.status === 'active' ? 'deactivate' : 'activate'} ${record.fullName || record.userName}?`}
            onConfirm={() => togglePatientStatus(record.id, record.status, record.fullName || record.userName)}
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
                    Patients Management
                  </Title>
                  <Paragraph style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                    Manage all patients in your healthcare system
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
                      title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Total Patients</span>}
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
                      title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Active Patients</span>}
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
                      title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Inactive Patients</span>}
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
                      title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Gender Types</span>}
                      value={stats.genders}
                      prefix={<HeartOutlined style={{ color: 'white' }} />}
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
                    placeholder="Search patients by name, gender, or email..."
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
                    value={genderFilter}
                    onChange={setGenderFilter}
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="Filter by gender"
                  >
                    <Option value="all">All Genders</Option>
                    {getUniqueGenders().map(gender => (
                      <Option key={gender} value={gender}>{gender}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'right' }}>
                    <Text style={{ color: '#666', fontSize: '14px' }}>
                      Showing {filteredPatients.length} of {patients.length} patients
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
              {loadingPatients ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px', color: '#666' }}>Loading patients...</div>
                </div>
              ) : filteredPatients.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No patients found"
                  style={{ padding: '60px 0' }}
                >
                  <Button type="primary" icon={<PlusOutlined />}>
                    Add First Patient
                  </Button>
                </Empty>
              ) : (
                <Table
                  columns={patientColumns}
                  dataSource={filteredPatients}
                  rowKey="id"
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} patients`,
                    style: { marginTop: '16px' }
                  }}
                  className="patients-table"
                  rowClassName={(record) => record.id === selectedPatientId ? 'selected-row' : ''}
                  onRow={(record) => ({
                    onClick: () => setSelectedPatientId(record.id),
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