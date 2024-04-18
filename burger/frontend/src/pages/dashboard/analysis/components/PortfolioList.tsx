import {Card, Modal, Table, Tooltip} from 'antd';
import {useEffect, useState} from 'react';
import { Pie } from '@ant-design/plots';
import {
  fetchPortfolios,
  fetchPortfoliosStatusAndCost,
  fetchPortfolioTrade,
  fetchTrades,
} from '../service'

function isColorLight(color) {
  if (typeof color !== 'number') {
    // 如果颜色不是数字类型，返回默认的文本颜色为暗色
    return false;
  }

  const hex = color.toString(16).padStart(6, '0');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // 使用亮度公式来判断颜色
  return (0.299 * r + 0.587 * g + 0.114 * b) > 186; // 亮度阈值
}


function PortfolioList() {
  const [combinedPortfolios, setCombinedPortfolios] = useState([]);
  const [trades, setTrades] = useState([]);
  const [holds, setHolds] = useState([]);
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
    const fetchedTrades = await fetchTrades(portfolioId);
    const fetchedHolds = await fetchPortfolioTrade(portfolioId);

    // 首先更新状态
    setTrades(fetchedTrades);
    setHolds(fetchedHolds);

    // 状态更新后再显示Modal
    setIsModalVisible(true);

    // 更新后再打印日志，确保日志显示的是最新状态
    console.log(portfolioId, '的trade:', fetchedTrades);
    console.log(portfolioId, "的holds:", fetchedHolds);
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


  const tradeColumns = [
    { title: 'Asset ID', dataIndex: 'asset_id', key: 'asset_id' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: time => new Date(time).toLocaleString(),
    },
  ];

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

  const config = {
    appendPadding: 10,  // 增加更多的内边距
    data: holds.map(item => ({
      type: item.asset_id,
      value: item.hold_quantity,
    })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.75,  // 减小饼图的半径
    innerRadius: 0.4,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <Card title="Portfolio List" bordered={false}>
      <Table
        dataSource={combinedPortfolios}
        columns={columns}
        rowKey="serialId"
        pagination={{ pageSize: 5 }}
      />
      <Modal
        title="Trade and Holdings Details"
        visible={isModalVisible}
        onCancel={closeModal}
        width={800}
        footer={null}
        key={Date.now()} // 每次模态框打开都提供一个新的key
      >
        <div style={{display: 'flex', justifyContent: 'space-between', overflow: 'hidden'}}>
          <div style={{flex: 1, marginRight: '20px'}}>
            <Table
              dataSource={trades}
              columns={tradeColumns}
              pagination={{ pageSize: 4 }}  // 修改这里，设置每页显示4条记录
              rowKey="id"
            />
          </div>
          <div style={{flex: '1 1 auto', overflow: 'hidden'}} key={`pie-${Date.now()}`}>
            <Pie {...config} />
          </div>
        </div>
      </Modal>
    </Card>
  );
}

export default PortfolioList;




