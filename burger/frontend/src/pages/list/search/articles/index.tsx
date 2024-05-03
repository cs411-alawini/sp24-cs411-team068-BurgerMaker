import React, { useState, useEffect } from 'react';
import { LikeOutlined, LoadingOutlined, MessageOutlined, StarOutlined, StarTwoTone } from '@ant-design/icons';
import { Button, Card, Form, Input, List, Pagination, Modal, message } from 'antd';
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

  const starPost = async (postId) => {
    // console.log('Received values of form:', postId);
    try {
      const params = { postId: postId };
      const data = await doStar(params);  // Assuming doStar directly returns a parsed JSON object
  
      if (!data || data.error) {  // Check if the response includes an error
        throw new Error(data.message || 'Failed to process your request');
      }
  
      message.success('Star status updated!');
    } catch (error) {
      message.error("You cannot star yourself...")
    }
  
    getPosts(searchText, currentPage);  // Refresh the posts list
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

  const determineColor = (item) => {
    // Example condition: change color based on the "starred" status
    // console.log(item.starredByMe)
    return item.starredByMe ? '#000000':'#D3D3D3'; // green if starred, pink otherwise
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
              <Button key="star" icon={<StarTwoTone twoToneColor={determineColor(item)} />} onClick={() => starPost(item.id)}>
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
