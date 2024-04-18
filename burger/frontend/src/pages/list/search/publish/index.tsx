import React from 'react';
import { Button, Form, Input, Card, message } from 'antd';
import type { FC } from 'react';
import { doPublish } from './service';  // Adjust the import path as necessary

const Publish: FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    console.log('Received values of form:', values);
    try {
      const response = await doPublish(values);
      message.success('Post published successfully!');
    } catch (error) {
      message.error('Failed to publish the post.');
      console.error('Failed to submit form:', error);
    }
  };

  return (
    <Card style={{ marginTop: 24, marginBottom: 24 }} bordered={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please input the title of your post!' }]}
        >
          <Input placeholder="Enter the title of your post" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input the description of your post!' }]}
        >
          <Input placeholder="Enter a brief description of your post" />
        </Form.Item>
        <Form.Item
          name="content"
          label="Content"
          rules={[{ required: true, message: 'Please input your post content!' }]}
        >
          <Input.TextArea rows={4} placeholder="What are you thinking about?" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Publish
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Publish;
