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
  Col,
  Popconfirm} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined,
  HistoryOutlined,
  DeleteOutlined
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

// Enhanced styles with better visual design
const styles = {
  bookingsContent: {
    padding: '16px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderRadius: '12px',
    minHeight: '400px',
  },
  bookingCard: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: 'none',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  bookingCardHover: {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-4px)',
  },
  bookingCardContent: {
    padding: '20px',
    position: 'relative' as const,
  },
  cardAccent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #1890ff, #52c41a)',
  },
  bookingDatetime: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: '16px',
    background: 'rgba(24, 144, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(24, 144, 255, 0.1)',
  },
  dateSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  timeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  infoIcon: {
    color: '#1890ff',
    fontSize: '18px',
    padding: '8px',
    background: 'rgba(24, 144, 255, 0.1)',
    borderRadius: '8px',
  },
  priceIcon: {
    color: '#52c41a',
    fontSize: '20px',
    padding: '8px',
    background: 'rgba(82, 196, 26, 0.1)',
    borderRadius: '8px',
    marginRight: '12px',
  },
  dateText: {
    fontWeight: 600,
    fontSize: '16px',
    color: '#1f2937',
  },
  timeText: {
    fontWeight: 600,
    fontSize: '16px',
    color: '#1f2937',
  },
  bookingPrice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'rgba(82, 196, 26, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(82, 196, 26, 0.1)',
  },
  bookingStatus: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingId: {
    textAlign: 'center' as const,
    padding: '8px',
    background: 'rgba(0, 0, 0, 0.03)',
    borderRadius: '8px',
  },
  requestModalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '8px 0',
  },
  titleIcon: {
    color: '#1890ff',
    fontSize: '28px',
    padding: '8px',
    background: 'rgba(24, 144, 255, 0.1)',
    borderRadius: '12px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 'normal' as const,
    marginTop: '4px',
  },
  priceAmount: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#059669',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  tag: {
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  secondaryText: {
    fontSize: '12px',
    color: '#6b7280',
  },
  headerSection: {
    marginBottom: '24px',
    padding: '20px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '12px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  loadingContainer: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
  },
  emptyContainer: {
    padding: '60px 20px',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
  },
  actionSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },
  cancelButton: {
    borderRadius: '8px',
    fontWeight: 500,
    boxShadow: '0 2px 4px rgba(255, 77, 79, 0.2)',
  },
};

const MyBookingPopUp: React.FC<MyBookingsDisplayProps> = ({
  visible,
  onClose
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);

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

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingBooking(bookingId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Booking/RemoveBooking/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        message.success('Booking cancelled successfully');
        setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      } else {
        message.error('Failed to cancel booking. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      message.error('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingBooking(null);
    }
  };

  const canCancelBooking = (status: string) => {
    const cancellableStatuses = ['pending', 'confirmed'];
    return cancellableStatuses.includes(status.toLowerCase());
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
      width={950}
      destroyOnHidden
      className="request-modal bookings-display-modal"
      styles={{
        content: { padding: '24px' },
        header: { padding: '24px 24px 0' },
      }}
    >
      <div style={styles.bookingsContent}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#6b7280' }}>Loading your bookings...</div>
          </div>
        ) : bookings.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No bookings found"
            style={styles.emptyContainer}
          >
            <Button type="primary" onClick={onClose} size="large">
              Book an Appointment
            </Button>
          </Empty>
        ) : (
          <div>
            <div style={styles.headerSection}>
              <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                <MedicineBoxOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                Your Appointments ({bookings.length})
              </Title>
              <Text type="secondary" style={{ fontSize: '14px', color: '#6b7280' }}>
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
                    <div style={styles.cardAccent} />
                    <div style={styles.bookingCardContent}>
                      <Row gutter={16} align="middle">
                        <Col xs={24} sm={7}>
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

                        <Col xs={24} sm={5}>
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

                        <Col xs={24} sm={5}>
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

                        <Col xs={24} sm={3}>
                          <div style={styles.actionSection}>
                            {canCancelBooking(booking.status) && (
                              <Popconfirm
                                title="Cancel Booking"
                                description="Are you sure you want to cancel this appointment?"
                                onConfirm={() => handleCancelBooking(booking.id)}
                                okText="Yes, Cancel"
                                cancelText="No"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  type="primary"
                                  danger
                                  size="small"
                                  loading={cancellingBooking === booking.id}
                                  icon={<DeleteOutlined />}
                                  style={styles.cancelButton}
                                >
                                  Cancel
                                </Button>
                              </Popconfirm>
                            )}
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