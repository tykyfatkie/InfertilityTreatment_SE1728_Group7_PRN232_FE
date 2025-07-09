import React, { useState } from 'react';
import {
  Layout,
  Card,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Typography,
  Space,
  Row,
  Col,
  Divider,
  Spin
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import Sidebar from '../../components/Sidebar/Sidebar';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface BookingFormData {
  timeStarted: Dayjs;
  type: string;
  step: string;
  note: string;
}

const PatientBooking: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const serviceTypes = [
    { value: 'general', label: 'General Checkup' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'ophthalmology', label: 'Ophthalmology' },
    { value: 'otolaryngology', label: 'ENT' },
  ];

  const steps = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'examination', label: 'Examination' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'follow-up', label: 'Follow-up' },
  ];

  const handleSubmit = async (values: BookingFormData) => {
    setLoading(true);
    
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        message.error('Please login to book an appointment');
        return;
      }

      // Prepare data for API
      const bookingData = {
        doctorId: "1",
        patientId: userId,
        timeStarted: values.timeStarted.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        type: values.type,
        price: "100000",
        step: values.step,
        note: values.note || ""
      };

      // Call API
      const response = await fetch('/api/Booking/CreateBooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        message.success('Booking created successfully!');
        form.resetFields();
      } else {
        const errorData = await response.json();
        message.error(`Error: ${errorData.message || 'Unable to create booking'}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      message.error('An error occurred while booking. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (key: string) => {
    console.log('Menu clicked:', key);
    // Handle navigation logic here
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    message.success('Logged out successfully');
    // Redirect to login page
    window.location.href = '/login';
  };

  // Disable past dates
  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 250, 
        transition: 'margin-left 0.2s',
        minHeight: '100vh'
      }}>
        <Content style={{ 
          padding: '24px', 
          background: '#f0f2f5', 
          minHeight: '100vh',
          overflow: 'auto'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <CalendarOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={2} style={{ margin: '0 0 8px 0' }}>
                  Book Health Appointment
                </Title>
                <Text type="secondary">
                  Please fill in the information to book an appointment
                </Text>
              </div>

              <Spin spinning={loading}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  requiredMark={false}
                >
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="timeStarted"
                        label="Appointment Date & Time"
                        rules={[
                          { required: true, message: 'Please select date and time' }
                        ]}
                      >
                        <DatePicker
                          showTime
                          format="DD/MM/YYYY HH:mm"
                          placeholder="Select date and time"
                          style={{ width: '100%' }}
                          disabledDate={disabledDate}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="type"
                        label={
                          <Space>
                            <UserOutlined />
                            <span>Service Type</span>
                          </Space>
                        }
                        rules={[
                          { required: true, message: 'Please select service type' }
                        ]}
                      >
                        <Select placeholder="Select service type">
                          {serviceTypes.map(service => (
                            <Option key={service.value} value={service.value}>
                              {service.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item
                        name="step"
                        label="Step"
                        rules={[
                          { required: true, message: 'Please select step' }
                        ]}
                      >
                        <Select placeholder="Select step">
                          {steps.map(step => (
                            <Option key={step.value} value={step.value}>
                              {step.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="note"
                    label={
                      <Space>
                        <FileTextOutlined />
                        <span>Note (Optional)</span>
                      </Space>
                    }
                  >
                    <TextArea
                      rows={4}
                      placeholder="Enter notes about symptoms or special requests..."
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>

                  <Divider />

                  <div style={{ textAlign: 'center' }}>
                    <Space size="middle">
                      <Button
                        size="large"
                        onClick={() => form.resetFields()}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading}
                        style={{ minWidth: '120px' }}
                      >
                        Book Appointment
                      </Button>
                    </Space>
                  </div>
                </Form>
              </Spin>
            </Card>

            {/* Additional Information */}
            <Card 
              style={{ marginTop: '24px' }}
              title="Important Notes"
              size="small"
            >
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Please arrive 15 minutes before your appointment</li>
                <li>Bring your ID and health insurance card (if applicable)</li>
                <li>You can cancel or reschedule 24 hours in advance</li>
                <li>Contact hotline: 1900-xxx-xxx for support</li>
              </ul>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PatientBooking;