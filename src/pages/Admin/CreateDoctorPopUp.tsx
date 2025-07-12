import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Upload, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserAddOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

const { Option } = Select;

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
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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

  const handleImageUpload: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList);
    
    if (info.file.status === 'done') {
      // In a real application, you would get the URL from the server response
      const url = URL.createObjectURL(info.file.originFileObj as File);
      setImageUrl(url);
      form.setFieldsValue({ imageUrl: url });
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
      return false;
    }
    return false; // Prevent automatic upload
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
        setFileList([]);
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
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title="Register New Doctor"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: 'Please input username!' },
            { min: 3, message: 'Username must be at least 3 characters!' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter username"
            size="large"
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
            prefix={<LockOutlined />}
            placeholder="Enter password"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Enter email address"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[
            { required: true, message: 'Please input full name!' },
            { min: 2, message: 'Full name must be at least 2 characters!' }
          ]}
        >
          <Input
            prefix={<UserAddOutlined />}
            placeholder="Enter full name"
            size="large"
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
            prefix={<PhoneOutlined />}
            placeholder="Enter phone number"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="specialization"
          label="Specialization"
          rules={[
            { required: true, message: 'Please select specialization!' }
          ]}
        >
          <Select
            placeholder="Select specialization"
            size="large"
            showSearch
            optionFilterProp="children"
          >
            {specializations.map(spec => (
              <Option key={spec} value={spec}>{spec}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="introduction"
          label="Introduction"
          rules={[
            { required: true, message: 'Please input introduction!' },
            { min: 10, message: 'Introduction must be at least 10 characters!' }
          ]}
        >
          <Input.TextArea
            placeholder="Enter doctor's introduction and background"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="imageUrl"
          label="Profile Image"
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleImageUpload}
            beforeUpload={beforeUpload}
            maxCount={1}
          >
            {fileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Register Doctor
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDoctorPopUp;