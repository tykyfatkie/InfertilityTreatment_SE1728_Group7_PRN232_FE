import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Select, Card, Avatar, Space, Typography, Divider } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  UserAddOutlined, 
  MedicineBoxOutlined,
  PictureOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

interface DoctorRegistrationData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  specialization: string;
  introduction: string;
  imageUrl: string;
}

interface DoctorRegistrationPopupProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateDoctorPopUp: React.FC<DoctorRegistrationPopupProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Hematology',
    'Infectious Disease',
    'Nephrology',
    'Neurology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Otolaryngology',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Rheumatology',
    'Surgery',
    'Urology',
    'General Practice'
  ];

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  const handleSubmit = async (values: DoctorRegistrationData) => {
    setLoading(true);
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/accounts/register/doctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          imageUrl: imageUrl || ''
        }),
      });

      if (response.ok) {
        message.success('Doctor account created successfully!');
        form.resetFields();
        setImageUrl('');
        onSuccess?.();
        onClose();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Failed to create doctor account');
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl('');
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <Space direction="vertical" size={0}>
            <MedicineBoxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              Register New Doctor
            </Title>
            <Text type="secondary">Add a new doctor to the system</Text>
          </Space>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
      style={{ top: 20 }}
    >
      <div style={{ padding: '20px 0' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark="optional"
        >
          {/* Profile Preview Section */}
          <Card 
            style={{ 
              marginBottom: 24, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px'
            }}
          >
            <div style={{ textAlign: 'center', color: 'white' }}>
              <Avatar 
                size={80} 
                src={imageUrl || undefined}
                icon={!imageUrl ? <UserOutlined /> : undefined}
                style={{ 
                  marginBottom: 16,
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              />
              <div>
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  {form.getFieldValue('fullName') || 'Doctor Name'}
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {form.getFieldValue('specialization') || 'Specialization'}
                </Text>
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card title="Basic Information" style={{ marginBottom: 24, borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: 'Please input username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                  placeholder="Enter username"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                  placeholder="Enter password"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please input email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter email address"
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[
                  { required: true, message: 'Please input full name!' },
                  { min: 2, message: 'Full name must be at least 2 characters!' }
                ]}
              >
                <Input
                  prefix={<UserAddOutlined style={{ color: '#1890ff' }} />}
                  placeholder="Enter full name"
                  size="large"
                  style={{ borderRadius: '8px' }}

                />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please input phone number!' },
                  { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number!' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#1890ff' }} />}
                  placeholder="Enter phone number"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </div>
          </Card>

          {/* Professional Information */}
          <Card title="Professional Information" style={{ marginBottom: 24, borderRadius: '8px' }}>
            <Form.Item
              name="specialization"
              label="Medical Specialization"
              rules={[
                { required: true, message: 'Please select specialization!' }
              ]}
            >
              <Select
                placeholder="Select medical specialization"
                size="large"
                showSearch
                optionFilterProp="children"
                style={{ borderRadius: '8px' }}
                suffixIcon={<MedicineBoxOutlined style={{ color: '#1890ff' }} />}

              >
                {specializations.map(spec => (
                  <Option key={spec} value={spec}>{spec}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="introduction"
              label="Professional Introduction"
              rules={[
                { required: true, message: 'Please input introduction!' },
                { min: 10, message: 'Introduction must be at least 10 characters!' }
              ]}
            >
              <Input.TextArea
                placeholder="Enter doctor's professional background, experience, and expertise..."
                rows={4}
                maxLength={500}
                showCount
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="imageUrl"
              label="Profile Image URL"
              extra="Enter a valid image URL for the doctor's profile photo"
            >
              <Input
                prefix={<PictureOutlined style={{ color: '#1890ff' }} />}
                placeholder="https://example.com/doctor-photo.jpg"
                size="large"
                style={{ borderRadius: '8px' }}
                value={imageUrl}
                onChange={handleImageUrlChange}
              />
            </Form.Item>
          </Card>

          <Divider />

          {/* Action Buttons */}
          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              paddingTop: '8px'
            }}>
              <Button 
                onClick={handleCancel} 
                size="large"
                style={{ 
                  borderRadius: '8px',
                  minWidth: '100px',
                  height: '44px'
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ 
                  borderRadius: '8px',
                  minWidth: '140px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: '500'
                }}
              >
                {loading ? 'Creating...' : 'Register Doctor'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateDoctorPopUp;