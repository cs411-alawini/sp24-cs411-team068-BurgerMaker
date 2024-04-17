const express = require('express');
const db = require('../db/connection');
const externalApi = require('./external/api')

const router = express.Router();

const listAssets = externalApi.listAssets;

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
};

router.get('/trade/value', async (req, res) => {
    const q = `
        SELECT asset_id,hold_quantity 
        FROM Portfolio P JOIN Hold H 
        ON P.id=H.portfolio_id
        WHERE P.user_id = ?
    `;
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({message: 'Internal server error getting database connection'});
        } else {
            connection.query(q, [req.user], async (err, results) => {
                connection.release(); // Release the connection back to the pool

                if (err) {
                    return res.status(500).json({message: 'Error querying database'});
                } else {
                    const asset2quantity = {};
                    results.forEach(data => {
                        asset2quantity[data.asset_id] = data.hold_quantity;
                    });
                    const assetsInfo = await listAssets(Object.keys(asset2quantity));
                    // console.log(assetsInfo)
                    let value = 0;
                    assetsInfo.forEach(info => {
                        value += info.price_usd * asset2quantity[info.asset_id];
                    });
                    res.json({value: value});
                }
            })
        }
    })
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

router.get('/holds', (req, res) => {
    // 这里可以使用 req.params.userid 来处理不同用户的请求，现在我们返回固定数据
    // res.json(holdings);
    const userId = req.user;
    // console.log("user的id是", req.user);
    const query = 'CALL CalculatePortfolioCostAndStatus(?);';

    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({message: 'Internal server error'});
            return;
        }

        connection.query(query, [userId], (err, results) => {
            connection.release();
            if (err) {
                res.status(500).json({message: 'Internal server error'});
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
            res.status(500).json({message: 'Internal server error'});
        } else {
            connection.query(query, [userId], (err, rows) => {
                if (err) {
                    res.status(500).json({message: 'Internal server error'});
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
            res.status(500).json({message: 'Internal server error'});
        } else {
            connection.query(query, [portfolioId], (err, rows) => {
                if (err) {
                    res.status(500).json({message: 'Internal server error'});
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
            res.status(500).json({message: 'Internal server error'});
            return;
        }

        connection.query(query, [userId], (err, results) => {
            connection.release();
            if (err) {
                res.status(500).json({message: 'Internal server error'});
            } else {
                // Typically, the result of a stored procedure is nested inside an array.
                res.json(results[0]);
            }
        });
    });
});


module.exports = router;