import React, { useState } from 'react';
import { PlusOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Card, List, Select, Flex, Typography, Modal, Input } from 'antd';
import type { CardListItemDataType } from './data.d';
import { queryFakeList, queryDetails } from './service';
import useStyles from './style.style';
const { Paragraph } = Typography;

const CardList = () => {
  const { styles } = useStyles();
  const { data, loading } = useRequest(() => {
    return queryFakeList();
  });
  const list = data?.list || [];

  const content = (
    <div className={styles.pageHeaderContent}>
      <p>
        You can trade cryptocurrencies here. We provide a seamless experience for you to trade. 
        There are many cryptocurrencies to choose from.
      </p>
      <div className={styles.contentLink}>
        <a>
          <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/MjEImQtenlyueSmVEfUD.svg" />{' '}
          Quick Start
        </a>
        <a>
          <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/ohOEPSYdDTNnyMbGuyLb.svg" />{' '}
          General Information
        </a>
      </div>
    </div>
  );

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

  const handleBuy = () => {
    console.log('Handle Buy logic here');
    setVisible(false);
  };

  const handleSell = () => {
    console.log('Handle Sell logic here');
    setVisible(false);
  };

  const extraContent = (
    <div className={styles.extraImg}>
      <img
        alt="这是一个标题"
        src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png"
      />
    </div>
  );

  const nullData: Partial<CardListItemDataType> = {};
  return (
    <PageContainer>
      <div className={styles.cardList}>
        <List
          rowKey="id"
          loading={loading}
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 5 }}
          dataSource={list}
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
                      <a>{item.title}</a>
                      <Paragraph className={item.change >= 0 ? styles.priceUp : styles.priceDown}>
                        {item.change >= 0 ? '↑' : '↓'}{Math.abs(item.change * 100).toFixed(2)}%
                      </Paragraph>
                    </div>
                  }
                  description={
                      <Paragraph className={styles.price}>
                        Price: ${item.price} 
                      </Paragraph>
                  }
                />
                  <Paragraph className={styles.item} ellipsis={{ rows: 2 }}>
                    {item.description}
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
            <a>Trade {selectedCrypto?.title}</a>
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
        
        <p> Current Price: {selectedCrypto?.price}</p>
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
            options={[{ value: 'CryptoWallet', label: 'ETHAsset' }]}
          />
        </div>
      </Modal>
    </PageContainer>
  );
};
export default CardList;
