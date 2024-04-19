import {InfoCircleOutlined} from '@ant-design/icons';
import {Area, Column} from '@ant-design/plots';
import {Col, Progress, Row, Tooltip} from 'antd';
import {Suspense, useState, useEffect, useMemo} from 'react';
import numeral from 'numeral';
import type {DataItem} from '../data.d';
import useStyles from '../style.style';
import Yuan from '../utils/Yuan';
import {ChartCard, Field} from './Charts';
import Trend from './Trend';
import {getMarketValue, getPostLike, getPostCount, getOldMarketValue} from '../service';
import {formatDate} from '@/utils/helper'

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 8,
  style: {
    marginBottom: 24,
  },
};
const IntroduceRow = () => {
  const {styles} = useStyles();

  const [marketValue, setMarketValue] = useState(0);
  const [oldMarketValue, setOldMarketValue] = useState({});
  const [postLikeSum, setPostLikeSum] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);


  const fetchData = async () => {
    // setLoading(prev => ({...prev, oldMarketValue: true}));
    setLoading(true);
    try {
      // market value
      const response = await getMarketValue();
      setMarketValue(response.value);

      // old market value
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(new Date(today).setDate(today.getDate() - 7));
      const oneMonthAgo = new Date(new Date(today).setMonth(today.getMonth() - 1));

      const dateOptions = {
        today: formatDate(today),
        weekAgo: formatDate(sevenDaysAgo),
        monthAgo: formatDate(oneMonthAgo)
      };
      let tmp = {};
      for (const [t, dt] of Object.entries(dateOptions)) {
        const val = await getOldMarketValue(dt);
        tmp = {...tmp, [t]: val}
      }
      // console.log(tmp)
      setOldMarketValue(tmp);

      // likes
      const likeResponse = await getPostLike();
      setPostLikeSum(likeResponse.value);

      // post count
      const cntResponse = await getPostCount();
      setPostCount(cntResponse.value);
    } finally {
      setLoading(false);
    }
  };

  console.log(loading, oldMarketValue)
  const todayProfit = useMemo(() => {
    if (oldMarketValue?.today?.value > 0)
      return numeral((marketValue - oldMarketValue.today.value) || 0).format('0,0.00');
    return '0'
  }, [marketValue, oldMarketValue]);

  const todayPct = useMemo(() => {
    if (oldMarketValue?.today?.value > 0)
      return numeral((marketValue - oldMarketValue?.today?.value) / oldMarketValue?.today?.value).format('0.00%')
    return '0%'
  }, [marketValue, oldMarketValue]);

  const weekPct = useMemo(() => {
    if (oldMarketValue?.weekAgo?.value > 0)
      return numeral((marketValue - oldMarketValue?.weekAgo?.value) / oldMarketValue?.weekAgo?.value).format('0,0.00')
    return '0'
  }, [marketValue, oldMarketValue]);

  const monthPct = useMemo(() => {
    if (oldMarketValue?.monthAgo?.value > 0)
      return numeral((marketValue - oldMarketValue?.monthAgo?.value) / oldMarketValue?.monthAgo?.value).format('0,0.00')
    return '0'
  }, [marketValue, oldMarketValue])

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Row gutter={24}>
      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          title="Current Market Value"
          action={
            <Tooltip title="Total amount of money in the account">
              <InfoCircleOutlined/>
            </Tooltip>
          }
          // loading={loading.marketValue || loading.oldMarketValue}
          loading={loading}
          total={() => <Yuan>{marketValue}</Yuan>}
          footer={<Field label="Profit today"
                         value={`$${todayProfit}  (${todayPct})`}/>}
          contentHeight={46}
        >

          <Trend
            flag={weekPct > 0 ? "up" : "down"}
            style={{
              marginRight: 16,
            }}
          >
            Weekly
            <span
              className={styles.trendText}>
              {weekPct}%
            </span>
          </Trend>
          <Trend flag={monthPct >= 0 ? "up" : "down"}>
            Monthly
            <span
              className={styles.trendText}>
              {monthPct}%
            </span>
          </Trend>
        </ChartCard>
      </Col>

      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          loading={loading}
          title="Key Metrics"
          action={
            <Tooltip title="Key financial indicators">
              <InfoCircleOutlined/>
            </Tooltip>
          }
          total={<div>{`$${todayProfit}`}</div>}
          footer={
            <div>
              Weekly Growth: <span></span>
              <span style={{color: weekPct > 0 ? 'red' : 'green', fontWeight: 'bold'}}>
          {weekPct}%
        </span>
            </div>
          }
          contentHeight={46}
        >
          <Column
            xField="x"
            yField="y"
            padding={-20}
            axis={false}
            height={46}
            // data={visitData}
            scale={{x: {paddingInner: 0.4}}}
          />
        </ChartCard>
      </Col>


      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          loading={loading}
          title="Burger Coins"
          action={
            <Tooltip title="Num of likes received in all your posts">
              <InfoCircleOutlined/>
            </Tooltip>
          }
          total={numeral(postLikeSum).format('0,0')}
          footer={<Field label="Likes per posts" value={postLikeSum / postCount}/>}
          contentHeight={46}
        >
          <Column
            xField="x"
            yField="y"
            padding={-20}
            axis={false}
            height={46}
            scale={{x: {paddingInner: 0.4}}}
          />
          <img
            src="data:image/jpeg;base64,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"
            alt="Description of image" style={{width: '12%', height: 'auto'}}/>

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
