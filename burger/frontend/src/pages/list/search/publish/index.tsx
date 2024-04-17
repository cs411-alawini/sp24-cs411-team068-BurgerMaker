import React from 'react';
import { Button, Form, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation, useMatch } from '@umijs/max';
import type { FC } from 'react';

const Publish: FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('Received values of form:', values);
    message.success('Post published successfully!');
    // Implement the backend request to publish the post.
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
