import {Pie} from '@ant-design/plots';
import {Card} from 'antd';
import {useEffect, useState} from 'react';
import {getTotalCostOfUser} from "@/pages/dashboard/analysis/service";

const PortfolioHoldingsPie = ({userId}) => {
  const [holdingsData, setHoldingsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHoldingsData = async () => {
      setLoading(true);
      try {
        const response = await getTotalCostOfUser();
        // 先计算总和
        const total = response.reduce((sum, curr) => sum + parseFloat(curr.total_cost), 0);
        // 过滤并转换数据以适应饼图
        const formattedData = response
          .map((item) => ({
            type: item.portfolio_name,
            value: parseFloat(item.total_cost),
            percentage: (parseFloat(item.total_cost) / total) * 100  // 计算百分比
          }))
          .filter(item => item.percentage >= 1); // 只包含占比至少1%的数据项

        setHoldingsData(formattedData);
      } catch (error) {
        console.error('Failed to fetch holdings data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldingsData();
  }, [userId]);

  return (
    <Card
      loading={loading}
      title="Portfolio Holdings Ratio"
      bordered={false}
      style={{ height: '100%' }}
    >
      <Pie
        height={340}
        radius={0.8}
        innerRadius={0.5}
        data={holdingsData}
        angleField="value"
        colorField="type"
        legend={false}
        label={{
          position: 'spider',
          text: (item) => `${item.type}: ${item.value.toFixed(2)} (${item.percentage.toFixed(2)}%)`,
          content: '{name}: {percentage}',
          layout: [
            { type: 'overlap' },  // 使用内置的避重策略
            { type: 'adjust-color' }  // 自动调整文本颜色以提高可读性
          ]
        }}
      />
    </Card>
  );
};

export default PortfolioHoldingsPie;
