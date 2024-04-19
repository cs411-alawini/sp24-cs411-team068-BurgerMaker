import React, { useState, useEffect } from 'react';
import { LikeOutlined, LoadingOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { Button, Form, Input, Card, message, Pagination, List } from 'antd';
import ArticleListContent from '../articles/components/ArticleListContent';
import type { FC } from 'react';
import useStyles from './style.style';
import { doPublish } from './service';  // Adjust the import path as necessary
import { getPostList, doStar } from '../articles/service';

const Publish: FC = () => {
  const [form] = Form.useForm();
  const [expandedId, setExpandedId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(50);

  const { styles } = useStyles();

    // Fetch posts based on the searchText
    const getPosts = async (search = '', page = 1, pageSize = 10) => {
      setLoading(true);
      try {
        const params = {search: search, pageSize: pageSize, page: page, all:"false"};
        const response = await getPostList(params);
        // const response = await getPostList(search, pageSize, page);
        // if (!response.ok) {
        //   throw new Error('Network response was not ok');
        // }
        // const json = await response.json();
        setPosts(response.posts);
        setTotalItems(response.total);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
      setLoading(false);
    };

    const starPost = async (postId) => {
      console.log('Received values of form:', postId);
      try {
        const params = {postId: postId}
        const response = await doStar(params)
        // if (!response.ok) {
        //   throw new Error('Network response was not ok');
        // }
        message.success('Thank you for your like!');
      } catch (error) {
        console.error('Failed to like:', error);
      }
      getPosts(searchText, currentPage);
    };

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

    // Effect to fetch posts when searchText changes
    useEffect(() => {
      getPosts(searchText, currentPage);
    }, [searchText, currentPage]);
  
    const handleSearch = (values) => {
      setSearchText(values.search); // Update searchText to re-fetch in useEffect
    };
  
    const handleSeeMore = (id) => {
      setExpandedId(expandedId === id ? null : id);
    };
  
    const handlePageChange = page => {
      setCurrentPage(page);
    };

  return (
    <>
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

    <Card
        bordered={false}
        bodyStyle={{ padding: '8px 32px 32px 32px' }}
      >
        <List
          size="large"
          loading={loading}
          rowKey="id"
          itemLayout="vertical"
          dataSource={posts}
          renderItem={(item) => (
            <List.Item
            key={item.id}
            // actions={[
            //   <Button key="star" icon={<StarOutlined />} onClick={() => starPost(item.id)}>
            //     {item.star}
            //   </Button>,
            // ]}
            extra={<div className={styles.listItemExtra} />}
          >
              {expandedId === item.id ? (
                <ArticleListContent data={item} />
              ) : (
                <Card
                  hoverable
                  bodyStyle={{ padding: '10px' }}
                >
                  <Card.Meta
                    title={item.title}
                    description={`${item.description.substring(0, 100)}...`}
                  />
                  <Button type="link" onClick={() => handleSeeMore(item.id)}>
                    See More
                  </Button>
                </Card>
              )}
            </List.Item>
          )}
        />
        <Pagination
          current={currentPage}
          // pageSize={pageSize}
          onChange={handlePageChange}
          total={totalItems}
          style={{ textAlign: 'center', marginTop: '20px' }}
          showSizeChanger={false}
        />
      </Card>
    </>
  );
};

export default Publish;
