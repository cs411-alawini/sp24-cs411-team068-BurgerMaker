import { Modal, Input, Button, Card, Table, Tooltip } from 'antd';
import {useEffect, useState} from 'react';
import { Pie } from '@ant-design/plots';
import {
  fetchPortfolios,
  fetchPortfoliosStatusAndCost,
  fetchPortfolioTrade,
  fetchTrades,
  fetchPortfolioAdvice,
  genPortfolioAdvice,
  createPortfolio
} from '../service'
import chatLogo from './chat.jpg';


function isColorLight(color) {
  if (typeof color !== 'number') {
    return false;
  }

  const hex = color.toString(16).padStart(6, '0');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return (0.299 * r + 0.587 * g + 0.114 * b) > 186;
}


function PortfolioList() {
  const [combinedPortfolios, setCombinedPortfolios] = useState([]);
  const [trades, setTrades] = useState([]);
  const [holds, setHolds] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [advice, setAdvice] = useState('');
  const [activePortfolioId, setActivePortfolioId] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioColor, setNewPortfolioColor] = useState('');
  const [isPinned, setIsPinned] = useState(1); // 默认设置为固定


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
    // console.log(portfolios);
    // console.log(portfoliosStatus);
    // console.log(combinedData);

    // Set the combined data into state
    setCombinedPortfolios(combinedData);
  };

  useEffect(() => {
    combineData();
  }, []);

  const handleNameClick = async (portfolioId) => {
    const fetchedTrades = await fetchTrades(portfolioId);
    const fetchedHolds = await fetchPortfolioTrade(portfolioId);
    const fetchedAdvice = await fetchPortfolioAdvice(portfolioId);
    setActivePortfolioId(portfolioId);
    // console.log(fetchedAdvice);
    setAdvice(fetchedAdvice.length > 0 ? fetchedAdvice[0].content : 'No advice available');

    setTrades(fetchedTrades);
    setHolds(fetchedHolds);

    setIsModalVisible(true);

    // console.log(portfolioId, ' trade:', fetchedTrades);
    // console.log(portfolioId, " holds:", fetchedHolds);
  };

  const handleBtnClick = async (portfolioId) => {
    try {
      await genPortfolioAdvice(portfolioId); // 生成新的投资建议
      const fetchedAdvice = await fetchPortfolioAdvice(portfolioId); // 获取最新的投资建议
      setAdvice(fetchedAdvice.length > 0 ? fetchedAdvice[0].content : 'No advice available.');
    } catch (error) {
      console.error('Error fetching new advice:', error);
      setAdvice('Failed to fetch new advice');
    }
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
      sorter: (a, b) => a.name.localeCompare(b.name),  // 使用 localeCompare 进行字符串比较
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
      sorter: (a, b) => a.Total_Cost - b.Total_Cost,  // 数字排序
      render: cost => cost !== null && cost !== undefined ? cost.toLocaleString() : 'N/A'
    },
    {
      title: 'Created on',
      dataIndex: 'create_time',
      key: 'create_time',
      sorter: (a, b) => new Date(a.create_time) - new Date(b.create_time),
      render: time => new Date(time).toLocaleDateString()
    },
  ];

  const config = {
    appendPadding: 10,  // add padding to the pie chart
    data: holds.map(item => ({
      type: item.asset_id,
      value: item.hold_quantity,
    })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.75,  // reduce the radius to make the pie smaller
    innerRadius: 0.4,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  const showAddPortfolioModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddPortfolio = async () => {
    const color = newPortfolioColor ? parseInt(newPortfolioColor, 16) : Math.floor(Math.random() * 16777215);
    const portfolioData = {
      name: newPortfolioName,
      color,
      isPinned
    };

    try {
      await createPortfolio(portfolioData);
      // Assuming the response object is correctly formatted and successful
      alert('Portfolio created successfully!');
      setIsAddModalVisible(false); // Close the modal on success
      combineData(); // Refresh the list of portfolios
    } catch (error) {
      // umi-request might throw an error which contains a response object
      console.error('Error creating new portfolio:', error);
      if (error.response) {
        // Assuming error response is in JSON format and has a message field
        error.response.clone().json().then((jsonData) => {
          alert(`Failed to create portfolio: ${jsonData.message || 'Unknown error'}`);
        });
      } else {
        // Network error or cannot parse response
        alert(`Failed to create portfolio: ${error.message}`);
      }
    }
  };


  const handleCancel = () => {
    setIsAddModalVisible(false);
  };

  return (
    <Card title={
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Portfolio List</span>
        <Button onClick={showAddPortfolioModal} style={{
          padding: '10px 12px',
          fontSize: '13px',
          // cursor: 'pointer',
          background: '#1d8ae1',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '8px',
          border: 'none',
          display: 'flex',         // 确保使用 flex 布局
          justifyContent: 'center', // 水平居中
          alignItems: 'center',     // 垂直居中
        }}>
          Add New Portfolio
        </Button>
      </div>
    } bordered={false}>
      <Table
        dataSource={combinedPortfolios}
        columns={columns}
        rowKey="serialId"
        pagination={{pageSize: 5}}
      />
      <Modal
        title="Trade and Holdings Details"
        visible={isModalVisible}
        onCancel={closeModal}
        width={800}
        footer={null}
        key={Date.now()} // ensure the modal is re-rendered when the state changes
      >
        <div style={{display: 'flex', justifyContent: 'space-between', overflow: 'hidden'}}>
          <div style={{flex: 1, marginRight: '20px'}}>
            <Table
              dataSource={trades}
              columns={tradeColumns}
              pagination={{pageSize: 4}}  // display 4 trades per page
              rowKey="id"
            />
          </div>
          <div style={{flex: '1 1 auto', overflow: 'hidden'}} key={`pie-${Date.now()}`}>
            <Pie {...config} />
          </div>
        </div>
        <div style={{flex: 1, display: 'flex'}}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            marginRight: '20px',
            alignItems: 'center',
            width: '100px'
          }}>
            <img src={chatLogo} alt="Investment Advice" style={{width: '100%', height: 'auto', marginBottom: '10px'}}/>
            <button onClick={() => handleBtnClick(activePortfolioId)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      background: "#006acb",
                      color: "white",
                      fontWeight: 'bold',
                      borderRadius: "8px",
                      border: 'none'
                    }}>
              Generate Advice
            </button>
          </div>
          <div style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px', overflow: 'auto'}}>
            {advice}
          </div>
        </div>
      </Modal>
      <Modal
        title="Add New Portfolio"
        visible={isAddModalVisible}
        onOk={handleAddPortfolio}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddPortfolio}>
            Add Portfolio
          </Button>,
        ]}
      >
        <Input
          placeholder="Enter portfolio name"
          value={newPortfolioName}
          onChange={e => setNewPortfolioName(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Input
          placeholder="Enter hex color (optional)"
          value={newPortfolioColor}
          onChange={e => setNewPortfolioColor(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
      </Modal>
    </Card>
  );
}

export default PortfolioList;




