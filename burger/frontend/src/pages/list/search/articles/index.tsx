import React, { useState, useEffect } from 'react';
import { LikeOutlined, LoadingOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, List } from 'antd';
import type { FC } from 'react';
import ArticleListContent from './components/ArticleListContent';
import useStyles from './style.style';

const pageSize = 5;

const Articles: FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { styles } = useStyles();

  // Fetch posts based on the searchText
  const getPosts = async (search = '') => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:29979/test/list_real2?search=${encodeURIComponent(search)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const posts = await response.json();
      setPosts(posts);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  // Effect to fetch posts when searchText changes
  useEffect(() => {
    getPosts(searchText);
  }, [searchText]);

  const handleSearch = (values) => {
    setSearchText(values.search); // Update searchText to re-fetch in useEffect
  };

  const handleSeeMore = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <Card style={{ marginTop: 24, marginBottom: 24 }} bordered={false}>
        <Form form={form} onFinish={handleSearch} layout="inline">
          <Form.Item name="search" style={{ width: '100%' }}>
            <Input.Search
              placeholder="Search articles"
              enterButton="Search"
              onSearch={form.submit}
              allowClear
            />
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
              actions={[
                <Button key="star" icon={<StarOutlined />} >{item.star}</Button>,
              ]}
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
      </Card>
    </>
  );
};

export default Articles;
