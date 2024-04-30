import { Avatar } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import useStyles from './index.style';
type ArticleListContentProps = {
  data: {
    content: React.ReactNode;
    updatedAt: number;
    avatar: string;
    owner: string;
    href: string;
  };
};
const ArticleListContent: React.FC<ArticleListContentProps> = ({
  data: { content, updatedAt, owner },
}) => {
  const { styles } = useStyles();
  return (
    <div>
      <div className={styles.description}>{content}</div>
      <div className={styles.extra}>
        <label>{owner}</label>
        <em>{dayjs(updatedAt).format('YYYY-MM-DD HH:mm')}</em>
      </div>
    </div>
  );
};
export default ArticleListContent;
