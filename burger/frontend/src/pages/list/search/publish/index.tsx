import React from 'react';
import { Button, Form, Input, message } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import type { FC } from 'react';
import { doPublish } from './service';

const Publish: FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    console.log('Received values of form:', values);
    try {
      const response = await doPublish(values)
      // if (!response.ok) {
      //   throw new Error('Network response was not ok');
      // }
      message.success('Post published successfully!');
    } catch (error) {
      message.error('Failed to publish the post.');
      console.error('Failed to submit form:', error);
    }
  };

  return (
    <PageContainer
      content={
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600, margin: "0 auto" }}
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
      }
    >
    </PageContainer>
  );
};

export default Publish;
