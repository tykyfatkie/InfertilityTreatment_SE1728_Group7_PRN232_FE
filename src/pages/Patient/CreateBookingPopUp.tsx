import React, { useState } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Input,
  Button,
  message,
  Select,
  Divider
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import './CreateRequestPopUp.css';

const { TextArea } = Input;
const { Option } = Select;

interface CreateRequestPopUpProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateRequestPopUp: React.FC<CreateRequestPopUpProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        message.error('Please login to create a service request');
        return;
      }

      const timeStarted = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .second(0)
        .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      const serviceRequestData = {
        doctorId: 0,
        patientId: userId,
        timeStarted: timeStarted,
        type: values.type,
        price: values.type === 'ivf-consultation' ? 200000 : 
               values.type === 'reproductive-endocrinology' ? 180000 : 
               values.type === 'male-fertility' ? 150000 :
               values.type === 'pregnancy-planning' ? 120000 : 100000
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/serviceRequest/CreateServiceRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceRequestData)
      });
  
      if (response.ok) {
        message.success('Service request created successfully! Our team will contact you within 24 hours.');
        form.resetFields();
        onClose();
        onSuccess?.();
      } else {
        const errorData = await response.json();
        message.error(`Failed to create service request: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      message.error('Failed to create service request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Chỉ cho phép chọn từ ngày mai trở đi
  const disabledDate = (current: Dayjs) => {
    return current && current <= dayjs().endOf('day');
  };

  // Chỉ cho phép chọn giờ hành chính (8:00 - 17:00) với khoảng cách 30 phút
  const disabledTime = () => {
    return {
      disabledHours: () => {
        const hours = [];
        // Disable giờ từ 0-7 (trước 8h sáng)
        for (let i = 0; i < 8; i++) {
          hours.push(i);
        }
        // Disable giờ từ 17-23 (sau 5h chiều)
        for (let i = 17; i < 24; i++) {
          hours.push(i);
        }
        return hours;
      },
      disabledMinutes: () => {
        const minutes = [];
        // Chỉ cho phép chọn phút 00 và 30
        for (let i = 0; i < 60; i++) {
          if (i % 30 !== 0) {
            minutes.push(i);
          }
        }
        return minutes;
      }
    };
  };

  const getConsultationPrice = (type: string) => {
    switch (type) {
      case 'ivf-consultation':
        return '200,000 VND';
      case 'reproductive-endocrinology':
        return '180,000 VND';
      case 'male-fertility':
        return '150,000 VND';
      case 'pregnancy-planning':
        return '120,000 VND';
      default:
        return '100,000 VND';
    }
  };

  const selectedType = Form.useWatch('type', form);

  return (
    <Modal
      title={
        <div className="request-modal-title">
          <MedicineBoxOutlined className="title-icon" />
          <div>
            <span>Fertility & Reproductive Health Center</span>
            <div className="subtitle">Specialized Service Request</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
      className="request-modal rare-disease-modal"
    >
      <div className="request-modal-content">
        <div className="request-header">
          <div className="request-header-text">
            <h3>
              <HeartOutlined className="header-icon" />
              Request Your Fertility Consultation
            </h3>
            <p>Our experienced team specializes in fertility treatments and reproductive health</p>
          </div>
          <div className="hospital-info">
            <div className="info-item">
              <SafetyOutlined /> Expert fertility specialists
            </div>
            <div className="info-item">
              <UserOutlined /> Personalized treatment plans
            </div>
            <div className="info-item">
              <HeartOutlined /> Comprehensive reproductive care
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="request-form"
        >
          <div className="form-section">
            <h4 className="section-title">Service Request Details</h4>
            <div className="form-row">
              <div className="form-col">
                <Form.Item
                  label={
                    <span className="form-label">
                      <CalendarOutlined className="label-icon" />
                      Preferred Date (From tomorrow onwards)
                    </span>
                  }
                  name="date"
                  rules={[{ required: true, message: 'Please select a date' }]}
                >
                  <DatePicker
                    className="custom-date-picker"
                    placeholder="Select appointment date"
                    disabledDate={disabledDate}
                    format="DD/MM/YYYY"
                    size="large"
                  />
                </Form.Item>
              </div>

              <div className="form-col">
                <Form.Item
                  label={
                    <span className="form-label">
                      <ClockCircleOutlined className="label-icon" />
                      Preferred Time (8:00 AM - 5:00 PM)
                    </span>
                  }
                  name="time"
                  rules={[{ required: true, message: 'Please select a time' }]}
                >
                  <TimePicker
                    className="custom-time-picker"
                    placeholder="Select time"
                    format="HH:mm"
                    minuteStep={30}
                    disabledTime={disabledTime}
                    size="large"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <Divider />

          <div className="form-section">
            <h4 className="section-title">Service Type</h4>
            <Form.Item
              label={
                <span className="form-label">
                  <MedicineBoxOutlined className="label-icon" />
                  Type of Service
                </span>
              }
              name="type"
              rules={[{ required: true, message: 'Please select a service type' }]}
            >
              <Select
                placeholder="Select service type"
                className="custom-select"
                size="large"
              >
                <Option value="initial-consultation">
                  <div className="option-content">
                    <strong>Initial Fertility Consultation</strong>
                    <span className="option-desc">Comprehensive fertility assessment and evaluation</span>
                  </div>
                </Option>
                <Option value="follow-up">
                  <div className="option-content">
                    <strong>Follow-up Appointment</strong>
                    <span className="option-desc">Ongoing treatment monitoring and adjustments</span>
                  </div>
                </Option>
                <Option value="ivf-consultation">
                  <div className="option-content">
                    <strong>IVF Consultation</strong>
                    <span className="option-desc">In-vitro fertilization planning and guidance</span>
                  </div>
                </Option>
                <Option value="male-fertility">
                  <div className="option-content">
                    <strong>Male Fertility Assessment</strong>
                    <span className="option-desc">Specialized evaluation for male fertility issues</span>
                  </div>
                </Option>
                <Option value="pregnancy-planning">
                  <div className="option-content">
                    <strong>Pre-conception Counseling</strong>
                    <span className="option-desc">Planning for healthy pregnancy and conception</span>
                  </div>
                </Option>
                <Option value="reproductive-endocrinology">
                  <div className="option-content">
                    <strong>Reproductive Endocrinology</strong>
                    <span className="option-desc">Hormone-related fertility disorders</span>
                  </div>
                </Option>
              </Select>
            </Form.Item>
          </div>

          <Divider />

          <div className="form-section">
            <h4 className="section-title">Service Fee</h4>
            <Form.Item
              label={
                <span className="form-label">
                  <DollarOutlined className="label-icon" />
                  Estimated Cost
                </span>
              }
              name="price"
            >
              <div className="price-display">
                <span className="price-amount">{getConsultationPrice(selectedType)}</span>
                <span className="price-note">
                  {selectedType === 'ivf-consultation' ? 'Includes IVF planning and counseling' :
                   selectedType === 'reproductive-endocrinology' ? 'Includes hormone evaluation and treatment planning' :
                   selectedType === 'male-fertility' ? 'Includes comprehensive male fertility assessment' :
                   selectedType === 'pregnancy-planning' ? 'Includes pre-conception health optimization' :
                   'Standard fertility consultation fee'}
                </span>
              </div>
            </Form.Item>
          </div>

          <Divider />

          <div className="form-section">
            <h4 className="section-title">Health & Fertility Information</h4>
            <Form.Item
              label={
                <span className="form-label">
                  <FileTextOutlined className="label-icon" />
                  Medical History & Fertility Concerns
                </span>
              }
              name="note"
              rules={[{ required: true, message: 'Please provide your medical and fertility information' }]}
            >
              <TextArea
                rows={5}
                placeholder="Please provide details about:
• How long you've been trying to conceive
• Previous pregnancies or pregnancy complications
• Menstrual cycle irregularities
• Any previous fertility treatments
• Current medications or supplements
• Family history of fertility issues
• Specific concerns or questions for the specialist"
                maxLength={1000}
                showCount
                className="custom-textarea"
              />
            </Form.Item>
          </div>

          <div className="important-notice">
            <h4>Important Information:</h4>
            <ul>
              <li>Appointments are available from tomorrow onwards during business hours (8:00 AM - 5:00 PM)</li>
              <li>Please bring all relevant medical records, test results, and previous fertility reports</li>
              <li>Both partners should attend the initial consultation when possible</li>
              <li>Service requests are confirmed within 24 hours via phone or SMS</li>
              <li>Cancellation policy: 48 hours advance notice required</li>
              <li>For urgent fertility concerns, please call our emergency hotline</li>
              <li>Insurance verification will be completed before your visit</li>
            </ul>
          </div>

          <Form.Item className="form-actions">
            <Button
              onClick={onClose}
              className="cancel-btn"
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="submit-btn"
              size="large"
            >
              {loading ? 'Creating Request...' : 'Create Service Request'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateRequestPopUp;