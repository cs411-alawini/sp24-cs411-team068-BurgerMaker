import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="Powered by Burger Maker Team"
      links={[
        {
          key: 'Burger Crypto',
          title: 'Burger Crypto',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/cs411-alawini/sp24-cs411-team068-BurgerMaker',
          blankTarget: true,
        },
        {
          key: 'Burger Maker',
          title: 'Burger Maker',
          href: '',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
