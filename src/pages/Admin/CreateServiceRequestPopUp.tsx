import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, message, Spin } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
}


interface CreateServiceRequestPopUpProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateServiceRequestPopUp: React.FC<CreateServiceRequestPopUpProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchDoctors();
    }
  }, [visible]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Doctors API Response:', data);
      
      const doctorsList = data.$values || data.values || data || [];
      setDoctors(doctorsList);
    } catch (error) {
      message.error('Failed to fetch doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/serviceRequest/CreateServiceRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Service request created successfully');
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error('Failed to create service request');
      console.error('Error creating service request:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Create Service Request"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      style={{ top: 20 }}
      okText="Create"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: '20px' }}
      >
        <Form.Item
          name="doctorId"
          label="Doctor"
          rules={[{ required: true, message: 'Please select a doctor!' }]}
        >
          <Select
            placeholder="Select a doctor"
            showSearch
            loading={loadingDoctors}
            style={{ borderRadius: '8px' }}
            notFoundContent={loadingDoctors ? <Spin size="small" /> : 'No doctors found'}
          >
            {doctors.map(doctor => (
              <Option key={doctor.id} value={doctor.id}>
                {doctor.fullName} - {doctor.specialization}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="serviceName"
          label="Service Name"
          rules={[{ required: true, message: 'Please enter service name!' }]}
        >
          <Input placeholder="Enter service name" style={{ borderRadius: '8px' }} />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Please enter service type!' }]}
        >
          <Input placeholder="Enter service type" style={{ borderRadius: '8px' }} />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price (VND)"
          rules={[{ required: true, message: 'Please enter price!' }]}
        >
          <InputNumber
            placeholder="Enter price"
            style={{ width: '100%', borderRadius: '8px' }}
            min={0}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description!' }]}
        >
          <TextArea
            rows={4}
            placeholder="Enter service description"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateServiceRequestPopUp;