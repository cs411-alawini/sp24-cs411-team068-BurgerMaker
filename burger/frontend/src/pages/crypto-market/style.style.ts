import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => {
  return {
    card: {
      '.ant-card-meta-title': {
        marginBottom: '12px',
        '& > a': {
          display: 'inline-block',
          maxWidth: '100%',
          color: token.colorTextHeading,
        },
      },
      '.ant-card-body:hover': {
        '.ant-card-meta-title > a': {
          color: token.colorPrimary,
        },
      },
    },
    title: { 
      display: 'flex', 
      alignItems: 'baseline',
    },
    item: {
      height: '64px',
      overflow: 'hidden',
      marginTop: '12px',
    },
    price: {
      color: token.colorTextSecondary,
      fontSize: '16px',
      marginTop: '-15px',
    },
    priceUp: {
      marginLeft: '12px',
      color: "#3f8600"
    },
    priceDown: {
      marginLeft: '12px',
      color: "#cf1322",
    },
    cardList: {
      '.ant-list .ant-list-item-content-single': { maxWidth: '100%' },
    },
    extraImg: {
      width: '155px',
      marginTop: '-20px',
      textAlign: 'center',
      img: { width: '100%' },
      [`@media screen and (max-width: ${token.screenMD}px)`]: {
        display: 'none',
      },
    },
    newButton: {
      width: '100%',
      height: '201px',
      color: token.colorTextSecondary,
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
    },
    modalButton: {
      marginInlineEnd: '10px',
    },
    cardAvatar: {
      width: '70px',
      height: '70px',
      borderRadius: '70px',
    },
    modalLogo: {
      width: '30px',
      height: '30px',
      borderRadius: '30px',
      marginRight: '8px',
    },
    cardDescription: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      wordBreak: 'break-all',
    },
    pageHeaderContent: {
      position: 'relative',
      [`@media screen and (max-width: ${token.screenSM}px)`]: {
        paddingBottom: '30px',
      },
    },
    contentLink: {
      marginTop: '16px',
      a: {
        marginRight: '32px',
        img: {
          width: '24px',
        },
      },
      img: { marginRight: '8px', verticalAlign: 'middle' },
      [`@media screen and (max-width: ${token.screenLG}px)`]: {
        a: {
          marginRight: '16px',
        },
      },
      [`@media screen and (max-width: ${token.screenSM}px)`]: {
        position: 'absolute',
        bottom: '-4px',
        left: '0',
        width: '1000px',
        a: {
          marginRight: '16px',
        },
        img: {
          marginRight: '4px',
        },
      },
    },
  };
});

export default useStyles;
