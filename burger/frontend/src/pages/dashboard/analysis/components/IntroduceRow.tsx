import { InfoCircleOutlined } from '@ant-design/icons';
import { Area, Column } from '@ant-design/plots';
import { Col, Progress, Row, Tooltip } from 'antd';
import { Suspense, useState, useEffect } from 'react';
import numeral from 'numeral';
import type { DataItem } from '../data.d';
import useStyles from '../style.style';
import Yuan from '../utils/Yuan';
import { ChartCard, Field } from './Charts';
import Trend from './Trend';
import {getMarketValue, getPostLike} from '../service';
const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: {
    marginBottom: 24,
  },
};
const IntroduceRow = () => {
  const { styles } = useStyles();

  const [marketValue, setMarketValue] = useState(0);
  const [postLikeSum, setPostLikeSum] = useState(0);
  const [loading, setLoading] = useState({ marketValue: true, postLikeSum: true });

  const fetchMarketValue = async () => {
    setLoading(prev => ({ ...prev, marketValue: true }));
    try {
      const response = await getMarketValue();
      setMarketValue(response.value);
    } finally {
      setLoading(prev => ({ ...prev, marketValue: false }));
    }
  };

  const fetchLikeSum = async () => {
    setLoading(prev => ({ ...prev, postLikeSum: true }));
    try {
      const response = await getPostLike();
      setPostLikeSum(response.value);
    } finally {
      setLoading(prev => ({ ...prev, postLikeSum: false }));
    }
  };
  useEffect(() => {
    fetchMarketValue();
    fetchLikeSum();
  },[]);

  return (
    <Row gutter={24}>
      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          title="Current Market Value"
          action={
            <Tooltip title="Total amount of money in the account">
              <InfoCircleOutlined />
            </Tooltip>
          }
          loading={loading.marketValue}
          total={() => <Yuan>{marketValue}</Yuan>}
          footer={<Field label="Profit today" value={`$${numeral(1001).format('0,0')}`} />}
          contentHeight={46}
        >
          <Trend
            flag="up"
            style={{
              marginRight: 16,
            }}
          >
            Weekly
            <span className={styles.trendText}>1001%</span>
          </Trend>
          <Trend flag="down">
            Daily
            <span className={styles.trendText}>1001%</span>
          </Trend>
        </ChartCard>
      </Col>

      {/* <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          loading={loading}
          title="Monthly value curve"
          action={
            <Tooltip title="Changes of market value this month">
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={<Field label="Peak" value={numeral(1002).format('0,0')} />}
          footer={<Field label="Monthly Profit" value={numeral(1001).format('0,0')} />}
          contentHeight={46}
        >
          <Area
            xField="x"
            yField="y"
            shapeField="smooth"
            height={46}
            axis={false}
            style={{
              fill: 'linear-gradient(-90deg, white 0%, #975FE4 100%)',
              fillOpacity: 0.6,
              width: '100%',
            }}
            padding={-20}
            data={visitData}
          />
        </ChartCard>
      </Col> */}
      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          loading={loading.postLikeSum}
          title="Post Likes"
          action={
            <Tooltip title="Num of likes received in all your posts">
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={numeral(postLikeSum).format('0,0')}
          footer={<Field label="Likes per posts" value="5" />}
          contentHeight={46}
        >
          <Column
            xField="x"
            yField="y"
            padding={-20}
            axis={false}
            height={46}
            // data={visitData}
            scale={{ x: { paddingInner: 0.4 } }}
          />
        </ChartCard>
      </Col>
      {/* <Col {...topColResponsiveProps}>
        <ChartCard
          loading={loading}
          bordered={false}
          title="High Risk Ratio"
          action={
            <Tooltip title="Value of high-risk asset / Total value">
              <InfoCircleOutlined />
            </Tooltip>
          }
          total="10.03%"
          footer={
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <Trend
                flag="up"
                style={{
                  marginRight: 16,
                }}
              >
                Weekly
                <span className={styles.trendText}>12%</span>
              </Trend>
              <Trend flag="down">
                Daily
                <span className={styles.trendText}>11%</span>
              </Trend>
            </div>
          }
          contentHeight={46}
        >
          <Progress percent={10.03} strokeColor={{ from: '#108ee9', to: '#87d068' }} status="active" />
        </ChartCard>
      </Col> */}
    </Row>
  );
};
export default IntroduceRow;
