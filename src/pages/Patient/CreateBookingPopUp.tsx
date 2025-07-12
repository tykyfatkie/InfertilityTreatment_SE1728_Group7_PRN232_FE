import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Button,
  message,
  Select,
  Divider,
  Spin
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import './CreateBookingPopUp.css';

const { Option } = Select;

interface CreateRequestPopUpProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ServiceRequest {
  id: number;
  doctorId: number;
  serviceName: string;
  type: string;
  price: number;
  description: string;
  status: string;
}

const CreateBookingPopUp: React.FC<CreateRequestPopUpProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loadingServiceRequests, setLoadingServiceRequests] = useState(false);

  // Fetch service requests when modal opens
  useEffect(() => {
    if (visible) {
      fetchServiceRequests();
    }
  }, [visible]);

  const fetchServiceRequests = async () => {
    setLoadingServiceRequests(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/serviceRequest/GetAllServiceRequests`);
      
      if (response.ok) {
        const data = await response.json();
        // Filter active service requests
        const activeRequests = data.values?.filter((request: ServiceRequest) => request.status === 'Active') || [];
        setServiceRequests(activeRequests);
      } else {
        message.error('Failed to load service requests');
      }
    } catch (error) {
      message.error('Error fetching service requests');
    } finally {
      setLoadingServiceRequests(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        message.error('Please login to create a booking');
        return;
      }

      const startDate = dayjs(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .second(0)
        .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      const bookingData = {
        serviceRequestIds: values.serviceRequestIds, // Array of selected service request IDs
        startDate: startDate,
        patientId: userId
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Booking/CreateBooking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
  
      if (response.ok) {
        message.success('Booking created successfully! Our team will contact you within 24 hours.');
        form.resetFields();
        onClose();
        onSuccess?.();
      } else {
        const errorData = await response.json();
        message.error(`Failed to create booking: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      message.error('Failed to create booking. Please try again.');
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

  const getConsultationPrice = (serviceIds: number[]) => {
    if (!serviceIds || serviceIds.length === 0) {
      return '0 VND';
    }
    
    const totalPrice = serviceIds.reduce((total, id) => {
      const service = serviceRequests.find(sr => sr.id === id);
      return total + (service?.price || 0);
    }, 0);
    
    return `${totalPrice.toLocaleString()} VND`;
  };

  const getServiceDescription = (serviceIds: number[]) => {
    if (!serviceIds || serviceIds.length === 0) {
      return 'No services selected';
    }
    
    const selectedServices = serviceIds.map(id => {
      const service = serviceRequests.find(sr => sr.id === id);
      return service?.serviceName || 'Unknown service';
    });
    
    return selectedServices.join(', ');
  };

  const selectedServiceIds = Form.useWatch('serviceRequestIds', form);

  return (
    <Modal
      title={
        <div className="request-modal-title">
          <MedicineBoxOutlined className="title-icon" />
          <div>
            <span>Fertility & Reproductive Health Center</span>
            <div className="subtitle">Book Your Appointment</div>
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
              Book Your Fertility Consultation
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
            <h4 className="section-title">Appointment Details</h4>
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
            <h4 className="section-title">Service Selection</h4>
            <Form.Item
              label={
                <span className="form-label">
                  <MedicineBoxOutlined className="label-icon" />
                  Available Services
                </span>
              }
              name="serviceRequestIds"
              rules={[{ required: true, message: 'Please select at least one service' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select service requests"
                className="custom-select"
                size="large"
                loading={loadingServiceRequests}
                notFoundContent={loadingServiceRequests ? <Spin size="small" /> : 'No services available'}
                onChange={(selectedIds) => {
                  // Update price display when selection changes
                  form.setFieldsValue({ serviceRequestIds: selectedIds });
                }}
              >
                {serviceRequests.map(service => (
                  <Option key={service.id} value={service.id}>
                    <div className="option-content">
                      <strong>{service.serviceName}</strong>
                      <span className="option-desc">{service.description}</span>
                      <span className="option-price">{service.price.toLocaleString()} VND</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Divider />

          <div className="form-section">
            <h4 className="section-title">Total Service Fee</h4>
            <Form.Item
              label={
                <span className="form-label">
                  <DollarOutlined className="label-icon" />
                  Estimate Cost
                </span>
              }
            >
              <div className="price-display">
                <span className="price-amount">{getConsultationPrice(selectedServiceIds)}</span>
                <span className="price-note">
                  Selected services: {getServiceDescription(selectedServiceIds)}
                </span>
              </div>
            </Form.Item>
          </div>

          <Divider />

          <div className="important-notice">
            <h4>Important Information:</h4>
            <ul>
              <li>Appointments are available from tomorrow onwards during business hours (8:00 AM - 5:00 PM)</li>
              <li>Please bring all relevant medical records, test results, and previous fertility reports</li>
              <li>Both partners should attend the initial consultation when possible</li>
              <li>Bookings are confirmed within 24 hours via phone or SMS</li>
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
              {loading ? 'Creating Booking...' : 'Create Booking'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateBookingPopUp;