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

router.get('/list_real2', async (req, res) => {
    const count = parseInt(req.query.count) || 10; // Default to 10 if no count parameter is provided

    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        connection.query(`SELECT * FROM Post ORDER BY create_time DESC LIMIT ?`, [count], (err, rows) => {
            connection.release(); // Make sure to release the connection back to the pool
            if (err) {
                res.status(500).json({ message: 'Error querying the Post table' });
            } else {
                const listData = rows.map((row, index) => {
                    return {
                        id: row.id,
                        owner: `User ${row.user_id}`, // assuming the owner field corresponds to user_id
                        title: row.title,
                        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png', // Assuming a default avatar
                        cover: 'https://gw.alipayobjects.com/zos/rmsportal/uMfMFlvUuceEyPpotzlq.png', // Assuming a default cover
                        status: ['active', 'exception', 'normal'][index % 3], // Cycling status for demonstration
                        percent: Math.ceil(Math.random() * 50) + 50,
                        logo: 'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png', // Assuming a default logo
                        href: 'https://ant.design',
                        updatedAt: row.update_time,
                        createdAt: row.create_time,
                        subDescription: row.description,
                        description: row.content,
                        activeUser: Math.ceil(Math.random() * 100000) + 100000, // Simulated data
                        newUser: Math.ceil(Math.random() * 1000) + 1000, // Simulated data
                        star: Math.ceil(Math.random() * 100) + 100, // Simulated data
                        like: Math.ceil(Math.random() * 100) + 100, // Simulated data
                        message: Math.ceil(Math.random() * 10) + 10, // Simulated data
                        content: row.content,
                        members: [
                            // Example member data, assuming static for demonstration
                            { avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ZiESqWwCXBRQoaPONSJe.png', name: '曲丽丽', id: 'member1' },
                            { avatar: 'https://gw.alipayobjects.com/zos/rmsportal/tBOxZPlITHqwlGjsJWaF.png', name: '王昭君', id: 'member2' },
                            { avatar: 'https://gw.alipayobjects.com/zos/rmsportal/sBxjgqiuHMGRkIjqlQCd.png', name: '董娜娜', id: 'member3' }
                        ]
                    };
                });
                res.json(listData);
            }
        });
    });
});


const holdings = [
    {
        "portfolio_id": "43ba8a9a-2157-407f-8392-f685a5b3a93c",
        "portfolio_name": "p1",
        "quantity": "74.25595311"
    },
    {
        "portfolio_id": "42ba8a9a-2157-407f-8392-f685a5b3a92c",
        "portfolio_name": "p2",
        "quantity": "37.89159969"
    }
];

router.get('/:userid/holds', (req, res) => {
    // 这里可以使用 req.params.userid 来处理不同用户的请求，现在我们返回固定数据
    res.json(holdings);
});


router.get('/:userid/portfolio', (req, res) => {
    const userId = req.params.userid;
    const query = `
      SELECT u.name, p.*, FLOOR(10000 + (RAND() * (100000 - 10000))) AS total_value
      FROM User u
      JOIN Portfolio p ON u.id = p.user_id
      WHERE u.id = ?;
    `;
    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
        } else {
            connection.query(query, [userId], (err, rows) => {
                if (err) {
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    res.json(rows);
                }
            });
        }
    });
});


router.get('/:portfolioid/trade', (req, res) => {
    const portfolioId = req.params.portfolioid;
    const query = `
      SELECT *
      FROM Trade
      WHERE portfolio_id = ?;
    `;
    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
        } else {
            connection.query(query, [portfolioId], (err, rows) => {
                if (err) {
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    res.json(rows);
                }
            });
        }
    });
});



module.exports = router;
