import {Card, Modal, Table, Tooltip} from 'antd';
import {useEffect, useState} from 'react';
import {fetchPortfolios, fetchPortfoliosStatusAndCost, fetchTrades} from '../service'

function isColorLight(color) {
  const hex = color.toString(16).padStart(6, '0');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Using the luminance formula to find brightness of the color
  return (0.299 * r + 0.587 * g + 0.114 * b) > 186; // luminance threshold
}

function PortfolioList() {
  const [combinedPortfolios, setCombinedPortfolios] = useState([]);
  const [trades, setTrades] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // const userId = "054fb851-41ab-4cd3-9b81-eae67a41690d";

  // const userId = "04b6086e-97a3-4e2c-b36c-27f260aa1f16";

  const combineData = async () => {
    const portfolios = await fetchPortfolios();
    const portfoliosStatus = await fetchPortfoliosStatusAndCost();

    // Map over the portfolios and find corresponding status data, generate serialId based on index
    const combinedData = portfolios?.map((portfolio, index) => {
      // Find the corresponding status and cost information by matching Portfolio_ID with id
      const statusData = portfoliosStatus.find(status => status.Portfolio_ID === portfolio.id) || {};

      return {
        ...portfolio,
        // Apply data from the status and cost data
        Total_Cost: statusData.Total_Cost,
        Portfolio_Status: statusData.Portfolio_Status,
        // Generate a serialId using the index, starting at 1 for human readability
        serialId: index + 1
      };
    });

    // Debugging logs to see the outputs
    console.log(portfolios);
    console.log(portfoliosStatus);
    console.log(combinedData);

    // Set the combined data into state
    setCombinedPortfolios(combinedData);
  };

  useEffect(() => {
    combineData();
  }, []);

  const handleNameClick = async (portfolioId) => {
    setTrades(await fetchTrades(portfolioId));
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const getColorForRisk = (status) => {
    switch (status) {
      case 'risk_high':
        return '#ff4d4f'; // red
      case 'risk_mid':
        return '#faad14'; // yellow
      default:
        return '#52c41a'; // green
    }
  };


  const columns = [
    {
      title: 'ID',
      dataIndex: 'serialId',
      key: 'serialId',
      render: (text, record) => (
        <Tooltip title={`Real ID: ${record.id}`}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const textColor = isColorLight(record.color) ? '#000000' : `#${record.color.toString(16).padStart(6, '0')}`;
        return (
          <a
            onClick={() => handleNameClick(record.id)}
            style={{ color: textColor }}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: 'Risk',
      dataIndex: 'Portfolio_Status',
      key: 'risk',
      render: status => (
        <span style={{ color: getColorForRisk(status) }}>
        {status?.toUpperCase().replace('RISK_', '')}
      </span>
      )
    },
    {
      title: 'Total Cost',
      dataIndex: 'Total_Cost',
      key: 'total_cost',
      render: cost => cost !== null && cost !== undefined ? cost.toLocaleString() : 'N/A'
    },
    {
      title: 'Created on',
      dataIndex: 'create_time',
      key: 'create_time',
      render: time => new Date(time).toLocaleDateString()
    },
  ];


  return (
    <Card title="Portfolio List" bordered={false}>
      <Table
        dataSource={combinedPortfolios}
        columns={columns}
        rowKey="serialId"
        pagination={{ pageSize: 5 }}
      />
      <Modal
        title="Trade Details"
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
      >
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
              render: time => new Date(time).toLocaleString(),
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




