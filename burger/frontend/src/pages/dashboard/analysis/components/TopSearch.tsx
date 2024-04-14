import { InfoCircleOutlined } from '@ant-design/icons';
import { Area } from '@ant-design/plots';
import { Card, Col, Row, Table, Tooltip } from 'antd';
import numeral from 'numeral';
import React from 'react';
import type { DataItem } from '../data.d';
import useStyles from '../style.style';
import NumberInfo from './NumberInfo';
import Trend from './Trend';

const TopSearch = ({
  loading,
  visitData2,
  searchData,
  dropdownGroup,
}: {
  loading: boolean;
  visitData2: DataItem[];
  dropdownGroup: React.ReactNode;
  searchData: DataItem[];
}) => {
  const { styles } = useStyles();
  const columns = [
    {
      title: 'No.',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: 'Portfolios Name',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (text: React.ReactNode) => <a href="/">{text}</a>,
    },
    {
      title: 'Total Value',
      dataIndex: 'count',
      key: 'count',
      sorter: (
        a: {
          count: number;
        },
        b: {
          count: number;
        },
      ) => a.count - b.count,
    },
    {
      title: 'Weekly Change',
      dataIndex: 'range',
      key: 'range',
      sorter: (
        a: {
          range: number;
        },
        b: {
          range: number;
        },
      ) => a.range - b.range,
      render: (
        text: React.ReactNode,
        record: {
          status: number;
        },
      ) => (
        <Trend flag={record.status === 1 ? 'down' : 'up'}>
          <span
            style={{
              marginRight: 4,
            }}
          >
            {text}%
          </span>
        </Trend>
      ),
    },
  ];
  return (
    <Card
      loading={loading}
      bordered={false}
      title="User's Portfolios"
      extra={dropdownGroup}
      style={{
        height: '100%',
      }}
    >
      <Table<any>
        rowKey={(record) => record.index}
        size="small"
        columns={columns}
        dataSource={searchData}
        pagination={{
          style: {
            marginBottom: 0,
          },
          pageSize: 7,
        }}
      />
    </Card>
  );
};
export default TopSearch;
