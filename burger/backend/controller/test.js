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

// CREATE TABLE IF NOT EXISTS User(
//     id VARCHAR(64) PRIMARY KEY,
//     name VARCHAR(256),
//     password VARCHAR(256),
//     email VARCHAR(256),
//     join_time DATETIME,
//     balance DECIMAL(20,8),
//     burger_coin INT    
// );

// CREATE TABLE IF NOT EXISTS Post(
//     id VARCHAR(64) PRIMARY KEY,
//     title VARCHAR(256),
//     thumbs_up_num INT,
//     description TEXT,
//     content TEXT,
//     user_id VARCHAR(64) REFERENCES User(id) on delete set NULL on update cascade,
//     create_time DATETIME,
//     update_time DATETIME
// );

router.get('/list_real2', async (req, res) => {
    // Parse the count from query, default to 10 if not provided
    const count = parseInt(req.query.count) || 10;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error getting database connection' });
        } else {
            // SQL query to fetch posts and user details
            const query = `
                SELECT p.id, p.title, p.description, p.create_time, p.update_time, p.thumbs_up_num, p.content,
                       u.name AS owner, u.id AS user_id
                FROM Post p
                LEFT JOIN User u ON p.user_id = u.id
                ORDER BY p.create_time DESC
                LIMIT ?
            `;

            connection.query(query, [count], (err, results) => {
                connection.release(); // Release the connection back to the pool

                if (err) {
                    return res.status(500).json({ message: 'Error querying database' });
                } else {
                    // Map the results to the desired format
                    const listData = results.map(post => ({
                        id: post.id,
                        owner: post.owner || 'Unknown User',
                        title: post.title,
                        avatar: post.avatar || 'https://example.com/default_avatar.png',
                        cover: 'https://example.com/default_cover.png', // Assuming a default cover
                        updatedAt: post.update_time,
                        createdAt: post.create_time,
                        description: post.description,
                        star: post.thumbs_up_num,
                        content: post.content
                    }));

                    res.json(listData);
                }
            });
        }
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
