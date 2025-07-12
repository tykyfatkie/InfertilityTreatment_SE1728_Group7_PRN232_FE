import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Button,
  message,
  Spin,
  Empty,
  Tag,
  Typography,
  Row,
  Col} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface MyBookingsDisplayProps {
  visible: boolean;
  onClose: () => void;
}

interface Booking {
  id: string;
  timeStarted: string;
  price: number;
  status: string;
  serviceDetails?: any;
}

// Styles object to replace styled-jsx
const styles = {
  bookingsContent: {
    padding: '8px',
  },
  bookingCard: {
    transition: 'all 0.3s ease',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #f0f0f0',
  },
  bookingCardHover: {
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
  },
  bookingCardContent: {
    padding: '8px',
  },
  bookingDatetime: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  dateSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  timeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
  },
  infoIcon: {
    color: '#1890ff',
    fontSize: '16px',
  },
  priceIcon: {
    color: '#52c41a',
    fontSize: '16px',
    marginRight: '8px',
  },
  dateText: {
    fontWeight: 500,
    fontSize: '14px',
  },
  timeText: {
    fontWeight: 500,
    fontSize: '14px',
  },
  bookingPrice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingStatus: {
    display: 'flex',
    justifyContent: 'center',
  },
  bookingId: {
    textAlign: 'center' as const,
  },
  requestModalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  titleIcon: {
    color: '#1890ff',
    fontSize: '24px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'normal' as const,
  },
  priceAmount: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: '#1890ff',
  },
  tag: {
    fontSize: '14px',
    padding: '4px 12px',
    borderRadius: '6px',
  },
  secondaryText: {
    fontSize: '12px',
  },
};

const MyBookingPopUp: React.FC<MyBookingsDisplayProps> = ({
  visible,
  onClose
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fetchBookings();
    }
  }, [visible]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        message.error('Please login to view your bookings');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Booking/GetBookingByPatientId/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Bookings API Response:', data);
        
        const bookingsList = data.$values || data || [];
        setBookings(bookingsList);
      } else {
        message.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'red';
      case 'in progress':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return <CheckCircleOutlined />;
      case 'pending':
        return <ExclamationCircleOutlined />;
      case 'cancelled':
        return <CloseCircleOutlined />;
      case 'in progress':
        return <SyncOutlined spin />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const formatTime = (dateString: string) => {
    return dayjs(dateString).format('HH:mm');
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} VND`;
  };

  return (
    <Modal
      title={
        <div style={styles.requestModalTitle}>
          <HistoryOutlined style={styles.titleIcon} />
          <div>
            <span>My Booking History</span>
            <div style={styles.subtitle}>View all your appointments</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} size="large">
          Close
        </Button>
      ]}
      width={900}
      destroyOnClose
      className="request-modal bookings-display-modal"
    >
      <div style={styles.bookingsContent}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Loading your bookings...</div>
          </div>
        ) : bookings.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No bookings found"
            style={{ padding: '50px' }}
          >
            <Button type="primary" onClick={onClose}>
              Book an Appointment
            </Button>
          </Empty>
        ) : (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <Title level={4}>
                <MedicineBoxOutlined style={{ marginRight: '8px' }} />
                Your Appointments ({bookings.length})
              </Title>
              <Text type="secondary">
                Here are all your booked appointments with our fertility specialists
              </Text>
            </div>

            <Row gutter={[16, 16]}>
              {bookings.map((booking) => (
                <Col xs={24} key={booking.id}>
                  <Card
                    style={{
                      ...styles.bookingCard,
                      ...(hoveredCard === booking.id ? styles.bookingCardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard(booking.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div style={styles.bookingCardContent}>
                      <Row gutter={16} align="middle">
                        <Col xs={24} sm={8}>
                          <div style={styles.bookingDatetime}>
                            <div style={styles.dateSection}>
                              <CalendarOutlined style={styles.infoIcon} />
                              <div>
                                <div style={styles.dateText}>
                                  {formatDate(booking.timeStarted)}
                                </div>
                                <Text type="secondary" style={styles.secondaryText}>
                                  Appointment Date
                                </Text>
                              </div>
                            </div>
                            <div style={styles.timeSection}>
                              <ClockCircleOutlined style={styles.infoIcon} />
                              <div>
                                <div style={styles.timeText}>
                                  {formatTime(booking.timeStarted)}
                                </div>
                                <Text type="secondary" style={styles.secondaryText}>
                                  Time
                                </Text>
                              </div>
                            </div>
                          </div>
                        </Col>

                        <Col xs={24} sm={6}>
                          <div style={styles.bookingPrice}>
                            <DollarOutlined style={styles.priceIcon} />
                            <div>
                              <div style={styles.priceAmount}>
                                {formatPrice(booking.price)}
                              </div>
                              <Text type="secondary" style={styles.secondaryText}>
                                Total Cost
                              </Text>
                            </div>
                          </div>
                        </Col>

                        <Col xs={24} sm={6}>
                          <div style={styles.bookingStatus}>
                            <Tag
                              color={getStatusColor(booking.status)}
                              icon={getStatusIcon(booking.status)}
                              style={styles.tag}
                            >
                              {booking.status}
                            </Tag>
                          </div>
                        </Col>

                        <Col xs={24} sm={4}>
                          <div style={styles.bookingId}>
                            <Text type="secondary" style={styles.secondaryText}>
                              ID: {booking.id}
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MyBookingPopUp;