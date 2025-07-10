import React, { useState } from 'react';
import { Modal, Form, DatePicker, TimePicker, Input, Button, message, Select } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, DollarOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
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
      title={
        <div className="booking-modal-title">
          <UserOutlined className="title-icon" />
          <span>Đặt lịch khám bệnh hiếm</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnHidden
      className="booking-modal"
    >
      <div className="booking-modal-content">
        <div className="booking-header">
          <div className="booking-header-text">
            <h3>Thông tin đặt lịch</h3>
            <p>Vui lòng điền đầy đủ thông tin để đặt lịch khám</p>
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
                    Ngày khám
                  </span>
                }
                name="date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}
              >
                <DatePicker
                  className="custom-date-picker"
                  placeholder="Chọn ngày"
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
                    Giờ khám
                  </span>
                }
                name="time"
                rules={[{ required: true, message: 'Vui lòng chọn giờ khám' }]}
              >
                <TimePicker
                  className="custom-time-picker"
                  placeholder="Chọn giờ"
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
                Loại tư vấn
              </span>
            }
            name="type"
            rules={[{ required: true, message: 'Vui lòng chọn loại tư vấn' }]}
          >
            <Select 
              placeholder="Chọn loại tư vấn"
              className="custom-select"
              size="large"
            >
              <Option value="initial">Tư vấn ban đầu</Option>
              <Option value="follow-up">Tái khám</Option>
              <Option value="genetic-counseling">Tư vấn di truyền</Option>
              <Option value="diagnostic-review">Xem xét chẩn đoán</Option>
              <Option value="treatment-planning">Lập kế hoạch điều trị</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span className="form-label">
                <DollarOutlined className="label-icon" />
                Phí tư vấn
              </span>
            }
            name="price"
          >
            <div className="price-display">
              <span className="price-amount">100,000 VND</span>
              <span className="price-note">Phí cố định cho tư vấn</span>
            </div>
          </Form.Item>

          <Form.Item
            label={
              <span className="form-label">
                <FileTextOutlined className="label-icon" />
                Ghi chú thêm
              </span>
            }
            name="note"
          >
            <TextArea
              rows={4}
              placeholder="Vui lòng mô tả triệu chứng, tiền sử bệnh, hoặc bất kỳ mối quan tâm cụ thể nào bạn muốn thảo luận..."
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
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="submit-btn"
              size="large"
            >
              Đặt lịch khám
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateBookingPopUp;