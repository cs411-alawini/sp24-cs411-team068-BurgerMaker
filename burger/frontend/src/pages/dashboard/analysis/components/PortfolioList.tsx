import { Card, Modal, Table } from 'antd';
import { useEffect, useState } from 'react';

function PortfolioList() {
  const [portfolios, setPortfolios] = useState([]);
  const [trades, setTrades] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch(
        'http://localhost:5001/test/0baed70b-1557-4f32-aec4-8b5508ae3986/portfolio',
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      const dataWithSerialId = jsonData.map((item, index) => ({
        ...item,
        serialId: index + 1,
      }));
      setPortfolios(dataWithSerialId);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchTrades = async (portfolioId) => {
    try {
      const response = await fetch(`http://localhost:5001/test/${portfolioId}/trade`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      setTrades(jsonData);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleNameClick = (portfolioId) => {
    fetchTrades(portfolioId);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'serialId',
      key: 'serialId',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a
          onClick={() => handleNameClick(record.id)}
          style={{ color: `#${record.color.toString(16).padStart(6, '0')}` }}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'Total Won',
      dataIndex: 'total_value',
      key: 'total_value',
    },
    {
      title: 'Created on',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (time) => new Date(time).toLocaleDateString(),
    },
  ];

  return (
    <Card title="Portfolio List" bordered={false}>
      <Table
        dataSource={portfolios}
        columns={columns}
        rowKey="serialId"
        pagination={{ pageSize: 5 }}
      />
      <Modal title="Trade Details" visible={isModalVisible} onCancel={closeModal} footer={null}>
        <Table
          dataSource={trades}
          columns={[
            { title: 'Asset ID', dataIndex: 'asset_id', key: 'asset_id' },
            { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
            { title: 'Price', dataIndex: 'price', key: 'price' },
            {
              title: 'Time',
              dataIndex: 'time',
              key: 'time',
              render: (time) => new Date(time).toLocaleString(),
            },
          ]}
          pagination={false}
          rowKey="id"
        />
      </Modal>
    </Card>
  );
}

export default PortfolioList;
