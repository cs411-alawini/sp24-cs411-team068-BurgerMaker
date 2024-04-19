import React, { useState, useEffect } from 'react';
import { PlusOutlined, ShoppingCartOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, List, Select, Flex, Typography, Modal, Input } from 'antd';
import { Row, Col, message } from 'antd';
import type { CardListItemDataType } from './data.d';
import { getAssetsList, getPortfolioData, trade } from './service';
import useStyles from './style.style';
const { Paragraph } = Typography;

const CardList = () => {
  const { styles } = useStyles();
  const [assets, setAssets] = useState<CardListItemDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Adjust the page size as needed

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getAssetsList(pageSize, (currentPage - 1) * pageSize);
      setAssets(result);
      setLoading(false);
    };
    fetchData();
  }, [currentPage, pageSize]);

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
    setCurrentPage(current);
  };

  // get portfolio data
  const [portfolioData, setPortfolioData] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const currentUser = localStorage.getItem('currentUser');
      const userId = currentUser ? JSON.parse(currentUser).id : '';
      const result = await getPortfolioData(userId);
      setPortfolioData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  const [visible, setVisible] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [amount, setAmount] = useState('');

  const showModal = (item) => {
    setSelectedCrypto(item);
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  }

  const handleTrade= (isBuy: boolean) => {
    console.log('Selected Crypto:', selectedCrypto);
    console.log('Selected Portfolio:', selectedPortfolio);
    console.log('Amount:', amount);
    console.log('Portfolio:', portfolioData);

    const currentUser = localStorage.getItem('currentUser');
    const userId = currentUser ? JSON.parse(currentUser).id : '';

    const indicator = isBuy ? 1 : -1;
    
    if  (selectedCrypto === null) {
      messageApi.error('Please select a crypto');
      return;
    } else if (selectedPortfolio === null) {
      messageApi.error('Please select a portfolio');
      return;
    } else if (amount === '') {
      messageApi.error('Please enter an amount');
      return;
    } else if (indicator*amount <= 0) {
      messageApi.error('Please enter a valid amount');
      return;
    } else if (isNaN(amount)) {
      messageApi.error('Please enter a valid number');
      return;
    } else if (userId === '') {
      messageApi.error('Please login to trade');
      return;
    } 

    const portfolioName = selectedPortfolio.name;
    const price = selectedCrypto.price_usd;
    const quantity = amount;

    trade(selectedCrypto.asset_id, portfolioName, quantity, price, { userId })
      .then(() => {
        messageApi.success(`Trade successful: ${isBuy ? 'Bought' : 'Sold'} ${quantity} ${selectedCrypto.name} in ${portfolioName}!`);
        setVisible(false);
      })
      .catch(error => {
        console.log(error)
        messageApi.error('Trade failed: ' + error.message);
      });
  };

  const handleBuy = () => {
    handleTrade(true);
  };

  const handleSell = () => {
    handleTrade(false);
  };


  return (
    <>
      {contextHolder}
      <PageContainer>
        <div className={styles.cardList}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 5 }}
            dataSource={assets}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: 200, // You should dynamically set this based on the total number of items from your API
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange
            }}
            renderItem={item => (
              <List.Item key={item.id}>
                <Card
                  hoverable
                  className={styles.card}
                  onClick={() => showModal(item)}
                >
                  <Card.Meta
                    avatar={<img alt="" className={styles.cardAvatar} src={item.logo} />}
                    title={
                      <div className={styles.title}>
                        <a className={styles.name}>{item.name}</a>
                        <Paragraph className={item.change >= 0 ? styles.priceUp : styles.priceDown}>
                          {item.change >= 0 ? '↑' : '↓'}{Math.abs(item.change * 100).toFixed(2)}%
                        </Paragraph>
                      </div>
                    }
                    description={
                      <Paragraph className={styles.price}>
                          Price: ${item.price_usd.toFixed(2)}
                      </Paragraph>
                    }
                  />
                    <Paragraph className={styles.item}>
                        <Row>Volume 1h: ${item.volume_1hrs_usd.toFixed(2)}</Row>
                        <Row><CalendarOutlined /> : {item.data_start}</Row>
                    </Paragraph>
                </Card>
              </List.Item>
            )}
          />
        </div>


        <Modal
          title={
            <div>
              <img alt="" className={styles.modalLogo} src={selectedCrypto?.logo} />
              <a>Trade {selectedCrypto?.name}</a>
            </div>
          }
          visible={visible}
          onOk={handleCancel}
          onCancel={handleCancel}
          footer={[
            <Flex gap="small" align="center" wrap="wrap">
              <Button key="submit" type="primary" className='modalButton' icon={<ShoppingCartOutlined />} onClick={handleBuy}>
                Buy
              </Button>   
              <Button key="submit" type="primary" className='modalButton' danger icon={<DollarOutlined />} onClick={handleSell}>
                Sell
              </Button>
            </Flex>
          ]}
        > 
          
          <p> Current Price: {selectedCrypto?.price_usd.toFixed(5)}</p>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{ marginBottom: 20, width: '60%', marginRight: '5%' }}
            />
            <Select
              placeholder="Select Portfolio"
              style={{ marginBottom: 20, width: '35%' }}
              onChange={value => setSelectedPortfolio(portfolioData.find(item => item.id === value))}
              options={portfolioData.map(item => ({ label: item.name, value: item.id }))}
            />
          </div>
        </Modal>
      </PageContainer>
    </>
  );
};

export default CardList;
