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
    const q = `
        SELECT T.id id, T.time time, A.name asset_name, T.quantity quantity, T.price price, P.name portfolio_name 
        FROM Trade T JOIN (SELECT * FROM Portfolio WHERE user_id = ?) P ON T.portfolio_id = P.id JOIN Asset A ON A.id=T.asset_id
        ORDER BY time DESC
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
                    // console.log(results)
                    res.json(results);
                }
            })
        }
    })
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

router.post('/post/publish', async (req, res) => {
    const { title, description, content } = req.body;
    const user_id = req.user;
    if (!title || !description || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ message: 'Internal server error, unable to establish database connection' });
        } else {
            const query = `
                INSERT INTO Post (
                    id,
                    title,
                    thumbs_up_num,
                    description,
                    content,
                    user_id,
                    create_time,
                    update_time
                ) VALUES (UUID(), ?, 0, ?, ?, ?, NOW(), NOW());
            `;
            connection.query(query, [title, description, content, user_id], (err, results) => {
                connection.release(); // Release the connection back to the pool
                if (err) {
                    res.status(500).json({ message: 'Internal server error, failed to insert post' });
                } else {
                    res.status(200).json({ message: 'Post published successfully', postId: results.insertId });
                }
            });
        }
    });
});


router.get('/list_real2', async (req, res) => {
    // Parse the count and page from the query, default to 10 and page 1 if not provided
    const count = parseInt(req.query.count) || 10;
    const page = parseInt(req.query.page) || 1;
    // Retrieve the search parameter from the query string
    const { search } = req.query;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error getting database connection' });
        } else {
            // First, we'll handle the total count query
            let countQuery = `
                SELECT COUNT(*) AS total
                FROM Post p
                LEFT JOIN User u ON p.user_id = u.id
            `;

            const countParams = [];

            if (search) {
                countQuery += ' WHERE p.title LIKE ? OR p.description LIKE ?';
                countParams.push(`%${search}%`, `%${search}%`);
            }

            connection.query(countQuery, countParams, (err, countResults) => {
                if (err) {
                    connection.release();
                    return res.status(500).json({ message: 'Error querying total count' });
                } else {
                    const totalItems = countResults[0].total;

                    // Now handle the main data query with pagination
                    let dataQuery = `
                        SELECT p.id, p.title, p.description, p.create_time, p.update_time, p.thumbs_up_num, p.content,
                               u.name AS owner, u.id AS user_id
                        FROM Post p
                        LEFT JOIN User u ON p.user_id = u.id
                    `;

                    const dataParams = [];

                    if (search) {
                        dataQuery += ' WHERE p.title LIKE ? OR p.description LIKE ?';
                        dataParams.push(`%${search}%`, `%${search}%`);
                    }

                    dataQuery += ' ORDER BY p.create_time DESC LIMIT ? OFFSET ?';
                    const offset = (page - 1) * count;
                    dataParams.push(count, offset);

                    connection.query(dataQuery, dataParams, (err, results) => {
                        connection.release(); // Always release the connection back to the pool

                        if (err) {
                            return res.status(500).json({ message: 'Error querying posts data' });
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

                            // Send both posts and total count in the response
                            res.json({ posts: listData, total: totalItems });
                        }
                    });
                }
            });
        }
    });
});


// New route to handle increasing the star count
router.post('/star_post', async (req, res) => {
    const postId = req.body.postId;  // Ensure you have middleware to parse JSON bodies

    if (!postId) {
        return res.status(400).json({ message: 'Post ID must be provided' });
    }

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error getting database connection' });
        } else {
            const updateQuery = 'UPDATE Post SET thumbs_up_num = thumbs_up_num + 1 WHERE id = ?';

            connection.query(updateQuery, [postId], (err, result) => {
                connection.release();  // Always release the connection back to the pool

                if (err || result.affectedRows === 0) {
                    return res.status(500).json({ message: 'Error updating post star count' });
                }

                res.json({ message: 'Post starred successfully' });
            });
        }
    });
});


module.exports = router;