import React, { useEffect, useState } from 'react';
import { Layout, Typography, Button, Card, Row, Col, Space, Avatar, Rate, Spin, Tag } from 'antd';
import AppFooter from '../../components/Footer/Footer';
import CreateRequestPopUp from './CreateBookingPopUp';
import {
  UserOutlined,
  MedicineBoxOutlined,
  StarFilled,
  ArrowRightOutlined,
  HeartOutlined,
  ExperimentOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const backgroundImages = ['../../../src/assets/home.jpg'];

interface Doctor {
  userName: string;
  imageUrl: string;
  specialization: string;
  introduction: string;
}

const PatientHomepage: React.FC = () => {
  const [, setCurrentImageIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [loadingServices] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchDoctors();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval); 
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors`);
      if (response.ok) {
        const doctorsData = await response.json();
        if (Array.isArray(doctorsData)) {
          setDoctors(doctorsData);
        } else {
          setDoctors([]); 
        }
      } else {
        setDoctors([]);
      }
    } catch (error) {
      setDoctors([]); 
    } finally {
      setLoadingDoctors(false);
    }
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('diagnosis') || name.includes('test')) {
      return <ExperimentOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
    } else if (name.includes('treatment') || name.includes('therapy')) {
      return <HeartOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />;
    } else if (name.includes('surgery') || name.includes('operation')) {
      return <SafetyOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
    } else if (name.includes('consultation') || name.includes('counseling')) {
      return <ThunderboltOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />;
    } else {
      return <MedicineBoxOutlined style={{ fontSize: '24px', color: '#722ed1' }} />;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'diagnosis':
        return '#1890ff';
      case 'treatment':
        return '#52c41a';
      case 'surgery':
        return '#fa8c16';
      case 'consultation':
        return '#722ed1';
      default:
        return '#13c2c2';
    }
  };


  const handleLogout = () => {
    localStorage.clear();
    
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    navigate("/");
  };

  const handleBookingSuccess = () => {
    console.log('Booking created successfully!');
  };

  return (
    <Layout style={{ minHeight: '100vh', margin: "0px", background: 'white' }}>
      <Content>
        {/* Hero Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '700px',
            overflow: 'hidden',
            marginBottom: '30px',
            marginTop: '1220px',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            borderRadius: '0 0 30px 30px',
            marginRight: '0px',
          }}
        >
          {/* Left Content */}
          <div
            style={{
              width: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 48px',
              background: 'linear-gradient(135deg, rgb(30, 58, 138) 0%, rgb(59, 130, 246) 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              top: '0px',
              left: '0px',
            }} />
            <div style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              bottom: '-50px',
              right: '50px',
            }} />
            
            <div style={{ maxWidth: '480px', textAlign: 'left', position: 'relative', zIndex: 2 }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                marginBottom: '16px'
              }}>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Patient</span>
              </div>             
              <Title
                level={1}
                style={{
                  color: 'white',
                  fontSize: '52px',
                  marginBottom: '24px',
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Welcome <span style={{ color: 'orange' }}>{username}</span>!
              </Title>

              <Paragraph style={{ fontSize: 18, marginBottom: 32, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6 }}>
                Regain hope with our cutting-edge reproductive medicine solutions. Your family-building journey starts here.
              </Paragraph>          
              
              <Space size="middle">
                <Button 
                  type="primary" 
                  size="large" 
                  style={{ 
                    borderRadius: '50px', 
                    paddingLeft: '28px', 
                    paddingRight: '28px',
                    height: '52px',
                    background: 'white',
                    color: '#1e3a8a',
                    border: 'none',
                    fontWeight: 600,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => setShowBookingPopup(true)}
                >
                  Book Now! <ArrowRightOutlined style={{ marginLeft: '8px' }} />
                </Button>
                <Button 
                  type="primary" 
                  size="large" 
                  style={{ 
                    borderRadius: '50px', 
                    paddingLeft: '28px', 
                    paddingRight: '28px',
                    height: '52px',
                    background: 'rgba(255, 65, 65, 0.77)',
                    color: '#1e3a8a',
                    border: 'none',
                    fontWeight: 600,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Space>
            </div>
          </div>

          {/* Right Image */}
          <div
            style={{
              width: '50%',
              backgroundImage: 'url(../../../src/assets/home1.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
          </div>
        </div>

        {/* Our Expert Doctors Section */}
        <div style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <Title level={2} style={{ 
                fontSize: '42px', 
                color: '#1e3a8a', 
                marginBottom: '16px',
                fontWeight: 700
              }}>
                Meet Our Expert Doctors
              </Title>
              <Paragraph style={{ 
                fontSize: '18px', 
                color: '#64748b', 
                maxWidth: '600px', 
                margin: '0 auto',
                lineHeight: 1.6
              }}>
                Our team of specialized fertility doctors brings years of experience and cutting-edge expertise to help you achieve your family dreams.
              </Paragraph>
            </div>

            {loadingDoctors ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px', color: '#64748b' }}>Loading our expert doctors...</div>
              </div>
            ) : doctors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ color: '#64748b', fontSize: '18px' }}>No doctors available at the moment.</div>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>Please check back later.</div>
              </div>
            ) : (
              <Row gutter={[24, 32]} justify="center">
                {doctors.map((doctor, index) => (
                  <Col key={index} xs={24} sm={12} lg={8} xl={6}>
                    <Card
                      style={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        height: '420px'
                      }}
                      bodyStyle={{ padding: '24px' }}
                      className="doctor-card"
                      hoverable
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          position: 'relative', 
                          marginBottom: '20px',
                          display: 'inline-block'
                        }}>
                          <Avatar
                            size={120}
                            src={doctor.imageUrl}
                            icon={<UserOutlined />}
                            style={{
                              border: '4px solid #1890ff',
                              boxShadow: '0 8px 24px rgba(24, 144, 255, 0.2)'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '-8px',
                            right: '8px',
                            background: '#52c41a',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '3px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <MedicineBoxOutlined style={{ fontSize: '10px', color: 'white' }} />
                          </div>
                        </div>
                        
                        <Title level={4} style={{ 
                          marginBottom: '8px',
                          color: '#1e3a8a',
                          fontSize: '20px',
                          fontWeight: 600
                        }}>
                          Dr. {doctor.userName}
                        </Title>
                        
                        <Text style={{ 
                          color: '#1890ff', 
                          fontWeight: 500,
                          fontSize: '14px',
                          background: 'rgba(24, 144, 255, 0.1)',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          display: 'inline-block',
                          marginBottom: '12px'
                        }}>
                          {doctor.specialization}
                        </Text>
                        
                        <div style={{ marginBottom: '16px' }}>
                          <Rate
                            disabled
                            defaultValue={4.8}
                            character={<StarFilled style={{ fontSize: '14px' }} />}
                            style={{ color: '#ffa940' }}
                          />
                          <Text style={{ 
                            marginLeft: '8px', 
                            color: '#64748b',
                            fontSize: '12px'
                          }}>
                            4.8/5 (120+ reviews)
                          </Text>
                        </div>
                        
                        <Paragraph 
                          ellipsis={{ rows: 3 }}
                          style={{ 
                            color: '#64748b', 
                            fontSize: '14px',
                            lineHeight: 1.5,
                            marginBottom: '20px',
                            height: '63px'
                          }}
                        >
                          {doctor.introduction}
                        </Paragraph>
                        
                        <Button
                          type="primary"
                          size="small"
                          style={{
                            borderRadius: '20px',
                            fontWeight: 500,
                            height: '36px',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                          }}
                          onClick={() => setShowBookingPopup(true)}
                        >
                          Book Consultation
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </div>

        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .doctor-card:hover {
              transform: translateY(-8px);
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
            }
            .service-card:hover {
              transform: translateY(-6px);
              box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12) !important;
            }
            .service-card:hover .service-icon {
              transform: scale(1.05);
            }
          `
        }} />
      </Content>
      <AppFooter />
      
      {/* Booking Popup */}
      <CreateRequestPopUp
        visible={showBookingPopup}
        onClose={() => setShowBookingPopup(false)}
        onSuccess={handleBookingSuccess}
      />
    </Layout>
  );
};

export default PatientHomepage;