import React from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';

const { TextArea } = Input;

interface CreateMedicationsPopUpProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateMedicationsPopUp: React.FC<CreateMedicationsPopUpProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Medication created successfully');
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error('Failed to create medication');
      console.error('Error creating medication:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Create Medication"
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
          name="name"
          label="Medication Name"
          rules={[{ required: true, message: 'Please enter medication name!' }]}
        >
          <Input placeholder="Enter medication name" style={{ borderRadius: '8px' }} />
        </Form.Item>

        <Form.Item
          name="dosage"
          label="Dosage"
          rules={[{ required: true, message: 'Please enter dosage!' }]}
        >
          <Input placeholder="Enter dosage (e.g., 500mg)" style={{ borderRadius: '8px' }} />
        </Form.Item>

        <Form.Item
          name="unit"
          label="Unit"
          rules={[{ required: true, message: 'Please enter unit!' }]}
        >
          <Input placeholder="Enter unit (e.g., tablets, ml)" style={{ borderRadius: '8px' }} />
        </Form.Item>

        <Form.Item
          name="route"
          label="Route"
          rules={[{ required: true, message: 'Please enter route!' }]}
        >
          <Input placeholder="Enter route (e.g., oral, injection)" style={{ borderRadius: '8px' }} />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: 'Please enter amount!' }]}
        >
          <InputNumber
            placeholder="Enter amount"
            style={{ width: '100%', borderRadius: '8px' }}
            min={0}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes"
          rules={[{ required: true, message: 'Please enter notes!' }]}
        >
          <TextArea
            rows={4}
            placeholder="Enter medication notes"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateMedicationsPopUp;