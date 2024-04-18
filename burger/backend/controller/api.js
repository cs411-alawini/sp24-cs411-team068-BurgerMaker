const express = require('express');
const db = require('../db/connection');

const router = express.Router();


// trade
// router.post('/trade', (req, res) => {
//     const { name, age } = req.body;

//     pool.query('INSERT INTO Trade VALUES (?,?,?,?,?,?)', [name, age], (error, results) => {
//         if (error) {
//             return res.status(500).json({ error: error.message });
//         }
//         res.status(200).json({ message: 'Data inserted successfully', insertId: results.insertId });
//     });
// });
mock = {
    tradeValue: {
        value: 10000
    },
    tradeData: [
        {
            id: '1',
            time: '2021-07-01 12:00:00',
            asset_name: 'BTC',
            quantity: 100,
            price: 100,
            portfolio_name: 'xxx'
        },
        {
            id: '2',
            time: '2021-07-02 12:00:00',
            asset_name: 'BTC',
            quantity: 200,
            price: 80,
            portfolio_name: 'xxy'
        },
        {
            id: '3',
            time: '2021-07-03 12:00:00',
            asset_name: 'BTC',
            quantity: -300,
            price: 200,
            portfolio_name: 'xxx'
        }
    ],
    postLike: {
        value: 50
    }
}
router.get('/trade/value', async (req, res) => {
    /*
        params: userId, portfolioId, startTime, endTime
    */
    const params = req.query;
    return res.json(mock.tradeValue)
    // if (params.userId !== undefined) {
    //     const q = `
    //         SELECT SUM(quantity*price)
    //         FROM Trade T JOIN (SELECT * FROM Portfolio WHERE user_id=userId) P ON T.portfolio_id=P.id
    //         WHERE time>=start_time AND time<=end_time
    //     `
    // }
    // db.getConnection((err, connection) => {
    //     if (err) {
    //         res.status(500).json({ message: 'Internal server error' });
    //     } else {
    //         connection.query('SELECT * FROM Trade WHERE id = ?', [tradeId], (error, results) => {
    //             connection.release();
    //             if (error) {
    //                 res.status(500).json({ message: 'Failed to query trade data' });
    //             } else {
    //                 res.json(results);
    //                 console.log(results);
    //             }
    //         });
    //     }
    // });
});

router.get('/trade', async (req, res) => {
    return res.json(mock.tradeData);
});

router.get('/post/like', async (req, res) => {
    return res.json(mock.postLike);
});

router.get('/user', async (req, res) => {
    if (!req.user) {
        res.status(401).json({message: "Not logged in. Please login to proceed"})
    } else {
        // console.log('cur userid: ', req.user);
        const q = `
            SELECT * FROM User
            WHERE id = ?
        `;
        db.getConnection((err, connection) => {
            if (err) {
                return res.status(500).json({message: 'Internal server error getting database connection'});
            } else {
                connection.query(q, [req.user], (err, results) => {
                    connection.release(); // Release the connection back to the pool

                    if (err) {
                        return res.status(500).json({message: 'Error querying database'});
                    } else {
                        // Map the results to the desired format
                        if (results.length !== 1) {
                            return res.status(401).json({message: 'User not found!'});
                        } else {
                            res.json(results[0]);
                        }

                    }
                })
            }
        })
    }
});

router.get('/cost-info-of-user', (req, res) => {
    // 这里可以使用 req.params.userid 来处理不同用户的请求，现在我们返回固定数据
    // res.json(holdings);
    const userId = req.user;
    // console.log("user的id是", req.user);
    const query = 'CALL CalculatePortfolioCostAndStatus(?);';

    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        connection.query(query, [userId], (err, results) => {
            connection.release();
            if (err) {
                res.status(500).json({ message: 'Internal server error' });
            } else {
                // 使用 map 方法来重新格式化每个条目
                const formattedResults = results[0].map(row => ({
                    portfolio_id: row.Portfolio_ID,
                    portfolio_name: row.Portfolio_Name,
                    total_cost: row.Total_Cost.toFixed(2)  // 格式化总成本为字符串，保留两位小数
                }));

                res.json(formattedResults);
            }
        });
    });
});

router.get('/portfolio', (req, res) => {
    // const userId = req.params.userid;
    const userId = req.user;
    const query = `
      SELECT u.name, p.*
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

router.get('/:portfolioid/holds', (req, res) => {
    const portfolioId = req.params.portfolioid;
    const query = `
      SELECT *
      FROM Hold
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

router.get('/portfolio-status', (req, res) => {
    // const userId = req.user.userId;
    // console.log(req.user);
    const userId = req.user;
    // console.log("user的id是", req.user);
    const query = 'CALL CalculatePortfolioCostAndStatus(?);';

    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        connection.query(query, [userId], (err, results) => {
            connection.release();
            if (err) {
                res.status(500).json({ message: 'Internal server error' });
            } else {
                // Typically, the result of a stored procedure is nested inside an array.
                res.json(results[0]);
            }
        });
    });
});


module.exports = router;