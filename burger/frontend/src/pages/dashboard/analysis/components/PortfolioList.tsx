import React, { useState, useEffect } from 'react';
import { Card, Table } from 'antd';

function PortfolioList() {
  const [portfolios, setPortfolios] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/user/00310be2-843a-4a61-a809-38a934fdc972/portfolios')
      .then(response => response.json())
      .then(data => {
        // 为每个项目添加一个顺序编号字段 'serialId'
        const dataWithSerialId = data.map((item, index) => ({
          ...item,
          serialId: index + 1  // 添加序号，从1开始
        }));
        setPortfolios(dataWithSerialId);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'serialId',  // 使用新的序号字段
      key: 'serialId'
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      render: color => <span style={{ color: `#${color.toString(16).padStart(6, '0')}` }}>{`#${color.toString(16).padStart(6, '0')}`}</span>
    },
    {
      title: 'Created on',
      dataIndex: 'create_time',
      key: 'create_time',
      render: time => new Date(time).toLocaleDateString()
    }
  ];

  return (
    <Card title="Portfolio List" bordered={false}>
      <Table
        dataSource={portfolios}
        columns={columns}
        rowKey="serialId"  // 使用序号作为 key
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
}

export default PortfolioList;
