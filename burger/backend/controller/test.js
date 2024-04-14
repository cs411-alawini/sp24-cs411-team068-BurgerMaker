const express = require('express');
const db = require('../db/connection');
const router = express.Router();

router.get('/', async (req, res) => {
    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.json({ message: 'Connected to database' });
        }
    });
});

router.get('/table', async (req, res) => {
    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
        } else {
            connection.query('SHOW TABLES', (err, rows) => {
                if (err) {
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    res.json(rows);
                }
            });
        }
    });
});

router.get('/user', async (req, res) => {
    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
        } else {
            connection.query('SELECT * FROM User', (err, rows) => {
                if (err) {
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    res.json(rows);
                }
            });
        }
    });
});

function generateFakeList(count) {
  const titles = ['Alipay', 'Angular', 'Ant Design', 'Ant Design Pro', 'Bootstrap', 'React', 'Vue', 'Webpack'];
  const avatars = [
    'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
    'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
    'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
    'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
    'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
    'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
    'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
    'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png'
  ];
  const covers = [
    'https://gw.alipayobjects.com/zos/rmsportal/uMfMFlvUuceEyPpotzlq.png',
    'https://gw.alipayobjects.com/zos/rmsportal/uMfMFlvUuceEyPpotzlq.png',
    'https://gw.alipayobjects.com/zos/rmsportal/uMfMFlvUuceEyPpotzlq.png',
    'https://gw.alipayobjects.com/zos/rmsportal/uMfMFlvUuceEyPpotzlq.png'
  ];
  const desc = [
    '那是一种内在的东西，他们到达不了，也无法触及的。',
    '希望是一个好东西，也许是最好的，好东西是不会消逝的。',
    '生命就像一盒巧克力，结果往往出人意料。',
    '城镇中有那么多的瓦砾，但有希望的地方，草就能生长。',
    '这个世界不是由那些乐观的人所构建的。'
  ];

  const list = [];
  for (let i = 0; i < count; i++) {
    list.push({
      id: `fake-list-${Math.random().toString(36).slice(2, 6)}${i}`,
      owner: 'User ' + i,
      title: titles[i % titles.length],
      avatar: avatars[i % avatars.length],
      cover: covers[i % covers.length],
      status: ['active', 'exception', 'normal'][i % 3],
      percent: Math.ceil(Math.random() * 50) + 50,
      logo: avatars[i % avatars.length],
      href: 'https://ant.design',
      updatedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 2 * i).getTime(),
      createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 2 * i).getTime(),
      subDescription: desc[i % desc.length],
      description: '在中台产品的研发过程中，会出现不同的设计规范和实现方式，但其中往往存在很多类似的页面和组件，这些类似的组件会被抽离成一套标准规范。',
      activeUser: Math.ceil(Math.random() * 100000) + 100000,
      newUser: Math.ceil(Math.random() * 1000) + 1000,
      star: Math.ceil(Math.random() * 100) + 100,
      like: Math.ceil(Math.random() * 100) + 100,
      message: Math.ceil(Math.random() * 10) + 10,
      content: '段落示意：蚂蚁金服设计平台 ant.design，用最小的工作量，无缝接入蚂蚁金服生态，提供跨越设计与开发的体验解决方案。',
      members: [
        {
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ZiESqWwCXBRQoaPONSJe.png',
          name: '曲丽丽',
          id: 'member1',
        },
        {
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/tBOxZPlITHqwlGjsJWaF.png',
          name: '王昭君',
          id: 'member2',
        },
        {
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/sBxjgqiuHMGRkIjqlQCd.png',
          name: '董娜娜',
          id: 'member3',
        },
      ]
    });
  }
  return list;
}

router.get('/list_real2', async (req, res) => {
    const count = parseInt(req.query.count) || 10; // Default to 10 if no count parameter is provided
    const listData = generateFakeList(count);
    res.json(listData);
});

module.exports = router;
