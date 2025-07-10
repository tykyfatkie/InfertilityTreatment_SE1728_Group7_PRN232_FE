import React, { useState } from 'react';
import { Modal, Form, DatePicker, TimePicker, Input, Button, message, Select } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

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
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        message.error('Please login to book an appointment');
        return;
      }

      // Combine date and time
      const timeStarted = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .second(0)
        .format('YYYY-MM-DDTHH:mm:ss');

      const bookingData = {
        doctorId: 1, // Default doctor ID
        patientId: userId, // Send as string (UUID)
        timeStarted: timeStarted,
        type: values.type,
        price: 100000, // Default price: 100,000 VND
        step: values.step || "pending",
        note: values.note || ""
      };

      // API call
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Booking/CreateBooking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
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
    // Disable past dates
    return current && current < dayjs().startOf('day');
  };

  const disabledTime = (selectedDate: Dayjs | null) => {
    if (!selectedDate) return {};
    
    const isToday = selectedDate.isSame(dayjs(), 'day');
    const currentHour = dayjs().hour();
    
    return {
      disabledHours: () => {
        const hours = [];
        // Disable past hours for today
        if (isToday) {
          for (let i = 0; i < currentHour; i++) {
            hours.push(i);
          }
        }
        // Disable hours outside clinic hours (8 AM - 6 PM)
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
        // Only allow appointments at 00, 15, 30, 45 minutes
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
      title="Book Rare Disease Consultation"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          label="Appointment Date"
          name="date"
          rules={[{ required: true, message: 'Please select appointment date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Select date"
            disabledDate={disabledDate}
            prefix={<CalendarOutlined />}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          label="Appointment Time"
          name="time"
          rules={[{ required: true, message: 'Please select appointment time' }]}
        >
          <TimePicker
            style={{ width: '100%' }}
            placeholder="Select time"
            format="HH:mm"
            minuteStep={15}
            disabledTime={() => disabledTime(form.getFieldValue('date'))}
            prefix={<ClockCircleOutlined />}
          />
        </Form.Item>

        <Form.Item
          label="Consultation Type"
          name="type"
          rules={[{ required: true, message: 'Please select consultation type' }]}
        >
          <Select placeholder="Select consultation type">
            <Option value="initial">Initial Consultation</Option>
            <Option value="follow-up">Follow-up Consultation</Option>
            <Option value="genetic-counseling">Genetic Counseling</Option>
            <Option value="diagnostic-review">Diagnostic Review</Option>
            <Option value="treatment-planning">Treatment Planning</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Consultation Fee"
          name="price"
        >
          <Input
            value="100,000 VND"
            disabled
            prefix={<DollarOutlined />}
            style={{ color: '#1890ff', fontWeight: 'bold' }}
          />
        </Form.Item>

        <Form.Item
          label="Additional Notes"
          name="note"
        >
          <TextArea
            rows={4}
            placeholder="Please describe your symptoms, medical history, or any specific concerns you'd like to discuss..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ minWidth: 100 }}
            >
              Book Appointment
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateBookingPopUp;