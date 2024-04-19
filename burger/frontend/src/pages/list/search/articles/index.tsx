import React, { useState, useEffect } from 'react';
import { LikeOutlined, LoadingOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, List, Pagination } from 'antd';
import type { FC } from 'react';
import ArticleListContent from './components/ArticleListContent';
import useStyles from './style.style';
import { getPostList, doStar } from './service';

const pageSize = 10;

const Articles: FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(50);

  const { styles } = useStyles();

  // Fetch posts based on the searchText
  const getPosts = async (search = '', page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {search: search, pageSize: pageSize, page: page, all: "true"};
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

  // const starPost = async (postId) => {
  //   try {
  //     const response = await fetch('http://localhost:29979/api/star_post', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ postId }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }

  //     // Fetch posts again to update the UI
  //     getPosts(searchText, currentPage);
  //     console.log("postId:")
  //     console.log(postId)
  //   } catch (error) {
  //     console.error('Failed to star post:', error);
  //   }
  // };

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
              <Button key="star" icon={<StarOutlined />} onClick={() => starPost(item.id)}>
                {item.star}
              </Button>,
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

export default Articles;
