import { GridContent } from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import type { FC } from 'react';
import { Suspense } from 'react';
import IntroduceRow from './components/IntroduceRow';
import PageLoading from './components/PageLoading';
import PortfolioHoldingsPie from './components/PortfolioHoldingsPie';
import PortfolioList from './components/PortfolioList';
import TradeHistoryTable from './components/TradeHistoryTable';
import { type AnalysisData } from './data.d';


type AnalysisProps = {
  dashboardAndanalysis: AnalysisData;
  loading: boolean;
};

const Analysis: FC<AnalysisProps> = () => {
  return (
    <GridContent>
      <>
        <Suspense fallback={<PageLoading/>}>
          <IntroduceRow/>
        </Suspense>

        <Row
          gutter={24}
          style={{
            marginTop: 24,
          }}
        >
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>
            <Suspense fallback={null}>
              <PortfolioList/>
            </Suspense>
          </Col>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>
            <Suspense fallback={null}>
              <PortfolioHoldingsPie/>
            </Suspense>
          </Col>
        </Row>
        <div style={{marginTop: '24px'}}></div>
        <Suspense fallback={<PageLoading/>}>
          <TradeHistoryTable/>
        </Suspense>
      </>
    </GridContent>
  );
};
export default Analysis;
