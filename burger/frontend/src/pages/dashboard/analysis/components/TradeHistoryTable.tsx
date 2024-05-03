import React from 'react';
import {Table, Tooltip} from 'antd';
import type {TableColumnsType} from 'antd';
import {useState, useEffect, useMemo} from 'react';
import moment from 'moment';
import {getTrade} from "@/pages/dashboard/analysis/service";

interface DataType {
  id: string;
  portfolio_name: string;
  asset_name: string;
  quantity: number;
  price: number;
  time: string; // dt?
}

// const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
//   console.log('params', pagination, filters, sorter, extra);
// };

const TradeHistoryTable = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DataType[]|undefined>();

    const fetchMarketValue = async () => {
        setLoading(true);
        try {
          const response = await getTrade();
          // console.log(response);
          const dataWithSerialId = response.map((item, index) => ({
            ...item,
            serialId: index + 1  // Starting from 1 for better readability
          }));
          setData(dataWithSerialId);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

  const assetOptions = useMemo(() => {
    return [...new Set(data?.map(item => item.asset_name))];
  }, [data]);

  const portfolioOptions = useMemo(() => {
    return [...new Set(data?.map(item => item.portfolio_name))];
  }, [data]);

  useEffect(() => {
    fetchMarketValue();
  }, [])

  const columns: TableColumnsType<DataType> = [
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
    // {
    //   title: 'Trade ID',
    //   dataIndex: 'id',
    //   showSorterTooltip: {target: 'full-header'},
    // },
    {
      title: 'Portfolio',
      dataIndex: 'portfolio_name', // name not id
          filters: portfolioOptions.map(option => ({ text: option, value: option })),
          onFilter: (value, record) => record.portfolio_name === value,
        },
        {
          title: 'Asset',
          dataIndex: 'asset_name', // name not id
          filters: assetOptions.map(option => ({ text: option, value: option })),
            onFilter: (value, record) => record.asset_name === value,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
        },
        {
            title: 'Price',
            dataIndex: 'price'
        },
        {
            title: 'Time',
            dataIndex: 'time',
            defaultSortOrder: 'descend',
            sorter: (a, b) => moment(a.time).unix() - moment(b.time).unix()
        }
      ];

    return (
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        // onChange={onChange}
        showSorterTooltip={{target: 'sorter-icon'}}
        rowKey='id'
      />
    );
};

export default TradeHistoryTable;
