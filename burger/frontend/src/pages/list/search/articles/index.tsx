import React, { useState } from 'react';
import { LikeOutlined, LoadingOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Button, Card, Form, Input, List } from 'antd';
import type { FC } from 'react';
import { categoryOptions } from '../../mock';
import ArticleListContent from './components/ArticleListContent';
import StandardFormRow from './components/StandardFormRow';
import TagSelect from './components/TagSelect';
import type { ListItemDataType } from './data.d';
import { queryFakeList } from './service';
import useStyles from './style.style';

const pageSize = 5;

const Articles: FC = () => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { styles } = useStyles();

  const { data, loading, refresh } = useRequest(
    () => queryFakeList({ count: pageSize, query: searchText }),
    {
      refreshDeps: [searchText], // Refresh data when searchText changes
    }
  );

  const list = data?.list || [];

  const IconText = ({ icon, text }) => (
    <span>
      {React.createElement(icon, { style: { marginRight: 8 } })}
      {text}
    </span>
  );

  const handleSearch = (values) => {
    setSearchText(values.search); // Update searchText state to trigger re-fetching data
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
        <List<ListItemDataType>
          size="large"
          loading={loading}
          rowKey="id"
          itemLayout="vertical"
          dataSource={list}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <IconText key="star" icon={StarOutlined} text={item.star} />,
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
