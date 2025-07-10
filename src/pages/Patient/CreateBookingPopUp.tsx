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
import './CreateBookingPopUp.css';

const { TextArea } = Input;
const { Option } = Select;

interface CreateBookingPopUpProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateBookingPopUp: React.FC<CreateBookingPopUpProps> = ({
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
        message.error('Please login to book an appointment');
        return;
      }

      const timeStarted = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .second(0)
        .format('YYYY-MM-DDTHH:mm:ss');

      const bookingData = {
        doctorId: 1,
        patientId: userId,
        timeStarted: timeStarted,
        type: values.type,
        price: values.type === 'genetic-counseling' ? 150000 : 
               values.type === 'comprehensive-evaluation' ? 200000 : 100000,
        step: values.step || 'pending',
        note: values.note || '',
        urgency: values.urgency || 'routine'
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Booking/CreateBooking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        message.success('Appointment booked successfully! Our team will contact you within 24 hours.');
        form.resetFields();
        onClose();
        onSuccess?.();
      } else {
        const errorData = await response.json();
        message.error(`Failed to create booking: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      message.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const disabledTime = (selectedDate: Dayjs | null) => {
    if (!selectedDate) return {};

    const isToday = selectedDate.isSame(dayjs(), 'day');
    const currentHour = dayjs().hour();

    return {
      disabledHours: () => {
        const hours = [];
        if (isToday) {
          for (let i = 0; i < currentHour; i++) {
            hours.push(i);
          }
        }
        for (let i = 0; i < 8; i++) {
          hours.push(i);
        }
        for (let i = 17; i < 24; i++) {
          hours.push(i);
        }
        return hours;
      },
      disabledMinutes: () => {
        const minutes = [];
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
      case 'genetic-counseling':
        return '150,000 VND';
      case 'comprehensive-evaluation':
        return '200,000 VND';
      case 'multidisciplinary-consultation':
        return '180,000 VND';
      default:
        return '100,000 VND';
    }
  };

  const selectedType = Form.useWatch('type', form);

  return (
    <Modal
      title={
        <div className="booking-modal-title">
          <MedicineBoxOutlined className="title-icon" />
          <div>
            <span>Rare Disease Center</span>
            <div className="subtitle">Specialized Care Appointment</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
      className="booking-modal rare-disease-modal"
    >
      <div className="booking-modal-content">
        <div className="booking-header">
          <div className="booking-header-text">
            <h3>
              <HeartOutlined className="header-icon" />
              Schedule Your Consultation
            </h3>
            <p>Our specialized team is here to provide expert care for rare diseases</p>
          </div>
          <div className="hospital-info">
            <div className="info-item">
              <SafetyOutlined /> Expert specialists in rare diseases
            </div>
            <div className="info-item">
              <UserOutlined /> Personalized treatment plans
            </div>
            <div className="info-item">
              <HeartOutlined /> Compassionate comprehensive care
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="booking-form"
        >
          <div className="form-section">
            <h4 className="section-title">Appointment Details</h4>
            <div className="form-row">
              <div className="form-col">
                <Form.Item
                  label={
                    <span className="form-label">
                      <CalendarOutlined className="label-icon" />
                      Preferred Date
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
                      Preferred Time
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
                    disabledTime={() => disabledTime(form.getFieldValue('date'))}
                    size="large"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <Divider />

          <div className="form-section">
            <h4 className="section-title">Consultation Type</h4>
            <Form.Item
              label={
                <span className="form-label">
                  <MedicineBoxOutlined className="label-icon" />
                  Type of Consultation
                </span>
              }
              name="type"
              rules={[{ required: true, message: 'Please select a consultation type' }]}
            >
              <Select
                placeholder="Select consultation type"
                className="custom-select"
                size="large"
              >
                <Option value="initial-consultation">
                  <div className="option-content">
                    <strong>Initial Consultation</strong>
                    <span className="option-desc">First visit for rare disease evaluation</span>
                  </div>
                </Option>
                <Option value="follow-up">
                  <div className="option-content">
                    <strong>Follow-up Appointment</strong>
                    <span className="option-desc">Ongoing care and monitoring</span>
                  </div>
                </Option>
                <Option value="genetic-counseling">
                  <div className="option-content">
                    <strong>Genetic Counseling</strong>
                    <span className="option-desc">Genetic testing and family planning</span>
                  </div>
                </Option>
                <Option value="comprehensive-evaluation">
                  <div className="option-content">
                    <strong>Comprehensive Evaluation</strong>
                    <span className="option-desc">Complete diagnostic workup</span>
                  </div>
                </Option>
                <Option value="multidisciplinary-consultation">
                  <div className="option-content">
                    <strong>Multidisciplinary Consultation</strong>
                    <span className="option-desc">Team-based approach consultation</span>
                  </div>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <span className="form-label">
                  <FileTextOutlined className="label-icon" />
                  Urgency Level
                </span>
              }
              name="urgency"
              rules={[{ required: true, message: 'Please select urgency level' }]}
            >
              <Select
                placeholder="Select urgency level"
                className="custom-select"
                size="large"
              >
                <Option value="routine">Routine - Standard scheduling</Option>
                <Option value="urgent">Urgent - Within 1 week</Option>
                <Option value="emergent">Emergent - Within 24-48 hours</Option>
              </Select>
            </Form.Item>
          </div>

          <Divider />

          <div className="form-section">
            <h4 className="section-title">Consultation Fee</h4>
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
                  {selectedType === 'genetic-counseling' ? 'Includes genetic testing consultation' :
                   selectedType === 'comprehensive-evaluation' ? 'Includes comprehensive diagnostic workup' :
                   selectedType === 'multidisciplinary-consultation' ? 'Team consultation fee' :
                   'Standard consultation fee'}
                </span>
              </div>
            </Form.Item>
          </div>

          <Divider />

          <div className="form-section">
            <h4 className="section-title">Medical Information</h4>
            <Form.Item
              label={
                <span className="form-label">
                  <FileTextOutlined className="label-icon" />
                  Medical History & Symptoms
                </span>
              }
              name="note"
              rules={[{ required: true, message: 'Please provide medical information' }]}
            >
              <TextArea
                rows={5}
                placeholder="Please describe:
• Current symptoms and their duration
• Previous diagnoses or suspected conditions
• Family history of rare diseases
• Current medications
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
              <li>Please bring all relevant medical records and test results</li>
              <li>Appointments are confirmed within 24 hours</li>
              <li>Cancellation policy: 48 hours advance notice required</li>
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
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateBookingPopUp;