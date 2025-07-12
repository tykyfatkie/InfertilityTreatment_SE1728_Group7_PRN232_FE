import React, { useEffect, useState } from 'react';
import { Layout, Typography, Button, Space } from 'antd';
import AppFooter from '../../components/Footer/Footer';
import CreateRequestPopUp from './CreateBookingPopUp';
import {
  ArrowRightOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const backgroundImages = ['../../../src/assets/home.jpg'];

const PatientHomepage: React.FC = () => {
  const [, setCurrentImageIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval); 
  }, []);

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
            marginTop: '480px',
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