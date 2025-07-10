import React, { useState } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Input,
  Button,
  message,
  Select
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  FileTextOutlined
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
        price: 100000,
        step: values.step || 'pending',
        note: values.note || ''
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Booking/CreateBooking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        message.success('Booking created successfully!');
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
        for (let i = 18; i < 24; i++) {
          hours.push(i);
        }
        return hours;
      },
      disabledMinutes: () => {
        const minutes = [];
        for (let i = 0; i < 60; i++) {
          if (i % 15 !== 0) {
            minutes.push(i);
          }
        }
        return minutes;
      }
    };
  };

  return (
    <Modal
      title={
        <div className="booking-modal-title">
          <UserOutlined className="title-icon" />
          <span>Rare Disease Appointment Booking</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
      className="booking-modal"
    >
      <div className="booking-modal-content">
        <div className="booking-header">
          <div className="booking-header-text">
            <h3>Booking Information</h3>
            <p>Please fill in all the information to schedule an appointment</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="booking-form"
        >
          <div className="form-row">
            <div className="form-col">
              <Form.Item
                label={
                  <span className="form-label">
                    <CalendarOutlined className="label-icon" />
                    Appointment Date
                  </span>
                }
                name="date"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker
                  className="custom-date-picker"
                  placeholder="Select a date"
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
                    Appointment Time
                  </span>
                }
                name="time"
                rules={[{ required: true, message: 'Please select a time' }]}
              >
                <TimePicker
                  className="custom-time-picker"
                  placeholder="Select a time"
                  format="HH:mm"
                  minuteStep={15}
                  disabledTime={() => disabledTime(form.getFieldValue('date'))}
                  size="large"
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            label={
              <span className="form-label">
                <FileTextOutlined className="label-icon" />
                Consultation Type
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
              <Option value="initial">Initial Consultation</Option>
              <Option value="follow-up">Follow-up</Option>
              <Option value="genetic-counseling">Genetic Counseling</Option>
              <Option value="diagnostic-review">Diagnostic Review</Option>
              <Option value="treatment-planning">Treatment Planning</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span className="form-label">
                <DollarOutlined className="label-icon" />
                Consultation Fee
              </span>
            }
            name="price"
          >
            <div className="price-display">
              <span className="price-amount">100,000 VND</span>
              <span className="price-note">Fixed fee for consultation</span>
            </div>
          </Form.Item>

          <Form.Item
            label={
              <span className="form-label">
                <FileTextOutlined className="label-icon" />
                Additional Notes
              </span>
            }
            name="note"
          >
            <TextArea
              rows={4}
              placeholder="Please describe symptoms, medical history, or any specific concerns you want to discuss..."
              maxLength={500}
              showCount
              className="custom-textarea"
            />
          </Form.Item>

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
              Book Appointment
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateBookingPopUp;
