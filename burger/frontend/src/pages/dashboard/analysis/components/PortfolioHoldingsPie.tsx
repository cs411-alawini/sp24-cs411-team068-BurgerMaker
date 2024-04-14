import { Pie } from '@ant-design/plots';
import { Card, Typography } from 'antd';
import { useEffect, useState } from 'react';
const { Text } = Typography;

const PortfolioHoldingsPie = ({ userId }) => {
  const [holdingsData, setHoldingsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHoldingsData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/test/${userId}/holds`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // 转换数据以适应饼图
        const formattedData = data.map((item) => ({
          type: item.portfolio_name,
          value: parseFloat(item.quantity),
        }));
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
          text: (item) => {
            return `${item.type}: ${item.value}`;
          },
          content: '{name}: {percentage}',
        }}
      />
    </Card>
  );
};

export default PortfolioHoldingsPie;
