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
  xl: 6,
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
          // loading={loading.postLikeSum}
          loading={loading}
          title="Post Likes"
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
            // data={visitData}
            scale={{x: {paddingInner: 0.4}}}
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
