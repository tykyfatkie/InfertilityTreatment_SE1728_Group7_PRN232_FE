import React, { useEffect, useState } from 'react';
import { Layout, Typography, Button, Card, Row, Col, Space } from 'antd';
import AppFooter from '../../components/Footer/Footer';
import {
  MedicineBoxOutlined,
  HeartTwoTone,
  TeamOutlined,
  SolutionOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const backgroundImages = ['../../../src/assets/home.jpg'];

const Homepage: React.FC = () => {
  const [, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {}, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval); 
  }, []);

  const features = [
    {
      icon: <MedicineBoxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: "Advanced Fertility Treatments",
      description: "Access the latest IVF, IUI, and ART technologies for higher success rates."
    },
    {
      icon: <HeartTwoTone twoToneColor="#eb2f96" style={{ fontSize: '48px' }} />,
      title: "Personalized Care",
      description: "Tailored treatment plans guided by experienced reproductive specialists."
    },
    {
      icon: <SolutionOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: "Comprehensive Diagnostics",
      description: "In-depth hormonal, genetic, and imaging evaluations for couples."
    },
    {
      icon: <TeamOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: "Emotional & Peer Support",
      description: "Join a supportive community and access counseling during your journey."
    },
  ];

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
            marginTop: '420px',
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
                <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>TRUSTED BY COUPLES WORLDWIDE</span>
              </div>
              
              <Title level={1} style={{ color: 'white', fontSize: '52px', marginBottom: '24px', fontWeight: 700, lineHeight: 1.2 }}>
                Infertility Diagnosis & Treatment Center
              </Title>
              <Paragraph style={{ fontSize: 18, marginBottom: 32, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6 }}>
                Regain hope with our cutting-edge reproductive medicine solutions. Your family-building journey starts here.
              </Paragraph>
              
              <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#3b82f6', marginRight: '12px' }} />
                  <Text style={{ color: 'white' }}>Board-certified fertility experts</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#3b82f6', marginRight: '12px' }} />
                  <Text style={{ color: 'white' }}>State-of-the-art IVF lab</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlined style={{ color: '#3b82f6', marginRight: '12px' }} />
                  <Text style={{ color: 'white' }}>Success-driven treatment programs</Text>
                </div>
              </Space>
              
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
                  onClick={() => navigate("/login")}
                >
                  Login <ArrowRightOutlined style={{ marginLeft: '8px' }} />
                </Button>
                <Button 
                  size="large"
                  style={{ 
                    borderRadius: '50px', 
                    borderColor: 'rgba(255, 255, 255, 0.3)', 
                    color: 'white',
                    paddingLeft: '28px', 
                    paddingRight: '28px',
                    height: '52px',
                    background: 'transparent',
                    fontWeight: 500,
                  }}
                >
                  Learn More
                </Button>
              </Space>
            </div>
          </div>

          {/* Right Image */}
          <div
            style={{
              width: '50%',
              backgroundImage: 'url(../../../src/assets/0.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
          </div>
        </div>

        {/* Features Section */}
        <Row gutter={[16, 24]} style={{ padding: '48px 12px' }}>
          {features.map((feature, index) => (
            <Col key={index} xs={24} sm={12} md={6}>
              <Card
                variant="outlined"
                style={{ borderRadius: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
              >
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  {feature.icon}
                </div>
                <Title level={4} style={{ textAlign: 'center' }}>{feature.title}</Title>
                <Paragraph style={{ textAlign: 'center' }}>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>     
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default Homepage;
