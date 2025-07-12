import React, { useState, useEffect } from 'react';
import { Modal, Table, message, Spin, Tag } from 'antd';
import { CalendarOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface BookingDetail {
  id: string;
  timeStarted: string;
  price: number;
  status: string;
  patientId: string;
  doctorId?: string;
  createdAt?: string;
}

interface BookingDetailPopUpProps {
  visible: boolean;
  onClose: () => void;
  userId?: string; // In real app, this would be fetched from localStorage
}

const BookingDetailPopUp: React.FC<BookingDetailPopUpProps> = ({ 
  visible, 
  onClose, 
  userId = "sample-user-id" // Default value for demo
}) => {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'https://localhost:7184/api';

  useEffect(() => {
    if (visible && userId) {
      fetchBookingDetails();
    }
  }, [visible, userId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      // In real implementation, uncomment the line below:
      // const userIdFromStorage = localStorage.getItem('userId') || userId;
      
      const response = await fetch(`${API_BASE_URL}/Booking/GetBookingByPatientId/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle both single booking and array of bookings
      const bookingArray = Array.isArray(data) ? data : [data];
      setBookings(bookingArray);
      
    } catch (error) {
      console.error('Error fetching booking details:', error);
      message.error('Không thể tải thông tin đặt lịch. Vui lòng thử lại sau.');
      
      // Demo data for testing UI
      setBookings([
        {
          id: '1',
          timeStarted: '2024-07-15T10:00:00',
          price: 500000,
          status: 'confirmed',
          patientId: userId
        },
        {
          id: '2',
          timeStarted: '2024-07-20T14:30:00',
          price: 750000,
          status: 'pending',
          patientId: userId
        },
        {
          id: '3',
          timeStarted: '2024-07-10T09:15:00',
          price: 600000,
          status: 'completed',
          patientId: userId
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      'confirmed': { color: 'green', text: 'Đã xác nhận' },
      'pending': { color: 'orange', text: 'Chờ xác nhận' },
      'completed': { color: 'blue', text: 'Hoàn thành' },
      'cancelled': { color: 'red', text: 'Đã hủy' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'timeStarted',
      key: 'timeStarted',
      render: (text: string) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-blue-500" />
          <span>{formatDateTime(text)}</span>
        </div>
      ),
      width: '40%'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <div className="flex items-center">
          <DollarOutlined className="mr-2 text-green-500" />
          <span className="font-semibold text-green-600">{formatPrice(price)}</span>
        </div>
      ),
      width: '30%'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <div className="flex items-center">
          <CheckCircleOutlined className="mr-2" />
          {getStatusTag(status)}
        </div>
      ),
      width: '30%'
    }
  ];

  return (
    <Modal
      title={
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-blue-500" />
          <span>Chi tiết đặt lịch khám</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="booking-detail-modal"
    >
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" />
            <span className="ml-3">Đang tải thông tin...</span>
          </div>
        ) : (
          <>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarOutlined className="text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500">Không có lịch đặt khám nào</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-gray-600">
                    Tổng số lịch đặt: <span className="font-semibold text-blue-600">{bookings.length}</span>
                  </p>
                </div>
                <Table
                  columns={columns}
                  dataSource={bookings}
                  rowKey="id"
                  pagination={false}
                  scroll={{ y: 400 }}
                  className="booking-table"
                />
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

// Demo component to show the popup
const App: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="p-8">
      <button
        onClick={() => setVisible(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Xem chi tiết đặt lịch
      </button>
      
      <BookingDetailPopUp
        visible={visible}
        onClose={() => setVisible(false)}
        userId="sample-user-id"
      />
    </div>
  );
};

export default App;