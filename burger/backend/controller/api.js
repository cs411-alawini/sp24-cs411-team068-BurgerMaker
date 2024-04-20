const express = require('express');
const db = require('../db/connection');
const externalApi = require('./external/api');
const {randomInt} = require('crypto');
const CryptoJS = require("crypto-js");

const router = express.Router();
const {listAssets, getAssetRate, getHistoryData} = externalApi;


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
                    console.log(asset2quantity)
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

router.get('/trade/value/:endtime', async (req, res) => {
    const endtime = req.params.endtime;
    const q = `
        SELECT asset_id, SUM(quantity) quantity
        FROM Trade T JOIN (SELECT * FROM Portfolio WHERE user_id = ?) P ON T.portfolio_id = P.id
        WHERE time < ?
        GROUP BY asset_id
    `;
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({message: 'Internal server error getting database connection'});
        } else {
            connection.query(q, [req.user, endtime], async (err, results) => {
                connection.release(); // Release the connection back to the pool
                if (err) {
                    return res.status(500).json({message: 'Error querying database'});
                } else {
                    let value = 0;
                    for (const data of results) {
                        const rate = (await getAssetRate(data.asset_id, endtime)).rate;
                        console.log(data, rate)
                        value += rate * data.quantity;
                        break
                    }
                    res.json({time: endtime, value: value});
                }
            })
        }
    })
})

router.get('/assets', async (req, res) => {
    const count = parseInt(req.query.count) || 15;
    const offset = parseInt(req.query.offset) || 0;
    const q = `
        SELECT * FROM Asset
        LIMIT ? OFFSET ?
    `;
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({message: 'Internal server error getting database connection'});
        }
        connection.query(q, [count, offset], async (err, results) => {
            connection.release(); // Release the connection back to the pool
            if (err) {
                return res.status(500).json({message: 'Error querying database'});
            }
            const assetsInfo = results.map(info => ({
                asset_id: info.id,
                asset_name: info.name,
                price: info.price_usd,
                logo: info.symbol_url
            }));
            const assets = await listAssets(assetsInfo.map(info => info.asset_id));
            assets.forEach(async asset => {
                const info = assetsInfo.find(info => info.asset_id === asset.asset_id);
                asset.logo = info.logo;
                // const trends = await getHistoryData(asset.asset_id, new Date(Date.now() - 2*24 * 60 * 60 * 1000).toISOString(), new Date().toISOString(), 2);
                // const change = (trends[0].rate_open - trends[1].rate_close) / trends[1].rate_close;
                
                asset.change = randomInt(-1500, 1500) / 10000;
            });
            res.json(assets);
        })
    })
});

// assets trade
// CALL ExecuteTrade(
//     'a544f6f7-d459-4ad1-9dc8-d1b24bd2e638',     -- User ID
//     '00187865-6a84-42a1-aa26-9b73442aaa84',-- Portfolio ID
//     'BTC',    -- Asset ID
//     1.00000000,      -- Buy amount
//     500.00000000     -- Buy price
// );
router.post('/assets/trade', async (req, res) => {
    const { asset_id, portfolio_name, quantity, price } = req.body;
    const user_id = req.user;
    console.log(req.body)
    if (!asset_id || !portfolio_name || !quantity || !price) {
        return res.status(400).json({message: 'Missing required fields'});
    }
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({message: 'Internal server error getting database connection'});
        }
        const q = `
            CALL ExecuteTrade(?, (SELECT id FROM Portfolio WHERE user_id = ? AND name = ?), ?, ?, ?);
        `;
        connection.query(q, [user_id, user_id, portfolio_name, asset_id, quantity, price], (err, results) => {
            connection.release(); // Release the connection back to the pool
            if (err) {
                if (err.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
                    return res.status(500).json({message: 'Insufficient balance'});
                } else {
                    return res.status(500).json({message: 'Error executing trade'});
                }
            }
            res.json({message: 'Trade executed successfully'});
        })
    })
});

router.get('/assets/trending', async (req, res) => {
    const asset_id = req.asset_id;
    // One day ago
    const time_start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const time_end = new Date().toISOString();
    const limit = 2;

    const historyData = await getHistoryData(asset_id, time_start, time_end, limit);
    res.json(historyData);
});


router.get('/post/like', async (req, res) => {
    const q = `
        SELECT SUM(thumbs_up_num) cnt FROM Post
        WHERE user_id = ?
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
                        return res.status(401).json({message: 'Not returned single row'});
                    } else {
                        // console.log(results[0]['cnt'])
                        res.json({value: results[0]['cnt']});
                    }
                }
            })
        }
    })
});

router.get('/post/count', async (req, res) => {
    const q = `
        SELECT COUNT(*) cnt FROM Post
        WHERE user_id = ?
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
                        return res.status(401).json({message: 'Not returned single row'});
                    } else {
                        // console.log(results[0]['cnt'])
                        res.json({value: results[0]['cnt']});
                    }
                }
            })
        }
    })
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

router.get('/balance', (req, res) => {
    const userId = req.user;
    const q = `
        SELECT balance cnt FROM User
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
                        return res.status(401).json({message: 'Not returned single row'});
                    } else {
                        // console.log(results[0]['cnt'])
                        res.json({value: results[0]['cnt']});
                    }
                }
            })
        }
    })

})

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
    const { all } = req.query;
    // const all = false
    // Retrieve the search parameter from the query string
    const { search } = req.query;
    const user_id = req.user;

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

            if (all === "false") {
                if (countQuery.includes('WHERE')) {
                    countQuery += ' AND p.user_id = ?';
                } else {
                    countQuery += ' WHERE p.user_id = ?';
                }
                countParams.push(`${user_id}`);
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

                    if (all === "false") {
                        if (dataQuery.includes('WHERE')) {
                            dataQuery += ' AND p.user_id = ?';
                        } else {
                            dataQuery += ' WHERE p.user_id = ?';
                        }
                        dataParams.push(`${user_id}`);
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
// DELIMITER $$

// CREATE TRIGGER IncreaseBurgerCoinAfterStar
// AFTER UPDATE ON Post
// FOR EACH ROW
// BEGIN
//     IF OLD.thumbs_up_num <> NEW.thumbs_up_num THEN
//         UPDATE User
//         SET burger_coin = burger_coin + 1
//         WHERE id = NEW.user_id;
//     END IF;
// END$$

// DELIMITER ;
router.post('/star_post', async (req, res) => {
    const postId = req.body.postId;  // Ensure you have middleware to parse JSON bodies
    const user_id = req.user; // Assuming `req.user` is set from authentication middleware

    if (!postId) {
        return res.status(400).json({ message: 'Post ID must be provided' });
    }

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error getting database connection' });
        } else {
            // First, check if the user trying to star the post is the owner of the post
            connection.query('SELECT user_id FROM Post WHERE id = ?', [postId], (err, results) => {
                if (err) {
                    connection.release();
                    return res.status(500).json({ message: 'Error querying the post owner' });
                }

                if (results.length === 0) {
                    connection.release();
                    return res.status(404).json({ message: 'Post not found' });
                }

                const postOwnerId = results[0].user_id;
                if (postOwnerId === user_id) {
                    connection.release();
                    return res.status(403).json({ message: 'You cannot star your own post' });
                }

                // Proceed to update the star count if the user is not the post owner
                const updateQuery = 'UPDATE Post SET thumbs_up_num = thumbs_up_num + 1 WHERE id = ?';
                connection.query(updateQuery, [postId], (err, result) => {
                    connection.release();  // Always release the connection back to the pool

                    if (err || result.affectedRows === 0) {
                        return res.status(500).json({ message: 'Error updating post star count' });
                    }

                    res.json({ message: 'Post starred successfully! The owner will be awarded one burger coin' });
                });
            });
        }
    });
});

router.put('/user', async (req, res) => {
    let {email, name, pwd, npwd} = req.body;
    pwd = CryptoJS.MD5(pwd).toString();
    npwd = CryptoJS.MD5(npwd).toString();
    const check = `
        SELECT password FROM User
        WHERE id = ?
    `
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({message: 'Internal server error getting database connection'});
        } else {
            connection.query(check, [req.user], (err, results) => {
                connection.release(); // Release the connection back to the pool
                if (err) {
                    return res.status(500).json({message: 'Error querying database'});
                } else {
                    if (results[0].password !== pwd) {
                        return res.status(501).json({message: 'Wrong password!'})
                    }
                }
            })
        }
    })
    const q = `
        UPDATE User SET password = ?, email = ?, name = ?
        WHERE id = ?
    `;
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({message: 'Internal server error getting database connection'});
        } else {
            connection.query(q, [npwd, email, name, req.user], (err, results) => {
                connection.release(); // Release the connection back to the pool
                if (err) {
                    return res.status(500).json({message: 'Error querying database'});
                }
                return res.status(204).json({message: 'Info updated!'});
            })
        }
    })
});




module.exports = router;