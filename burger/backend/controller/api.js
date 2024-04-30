const express = require('express');
const db = require('../db/connection');
const externalApi = require('./external/api');
const {randomInt} = require('crypto');
const CryptoJS = require("crypto-js");

const router = express.Router();
const {listAssets, getAssetRate, getHistoryData, genAdvice} = externalApi;


// ChatGPT config
// const configuration = new Configuration({
//     apiKey: "sk-proj-ssmxN20r5fkZwzfbkuduT3BlbkFJDDl5t9rAa2yhujcjiE3J"
// });


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
    const search_text = req.query.search_text || '';
    const rankers = req.query.rankers.split(',') || [];
    const extractLastDigits = filename => (filename.match(/\d+/g)?.slice(-1)[0]?.slice(-6) || null);

    const q = `
        SELECT * FROM Asset
        WHERE name LIKE ?
    `; 
    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({message: 'Internal server error getting database connection'});
        }
        connection.query(q, [`%${search_text}%`], async (err, results) => {
            connection.release(); // Release the connection back to the pool
            if (err) {
                return res.status(500).json({message: 'Error querying database'});
            }
            const assetsInfo = results.map(info => ({
                asset_id: info.id,
                asset_name: info.name,
                logo: info.symbol_url
            }));
            let assets = await listAssets(assetsInfo.map(info => info.asset_id));
            assets.forEach(async asset => {
                const info = assetsInfo.find(info => info.asset_id === asset.asset_id);
                if (!info) {
                    return;
                }
                asset.logo = info.logo;
                // const trends = await getHistoryData(asset.asset_id, new Date(Date.now() - 2*24 * 60 * 60 * 1000).toISOString(), new Date().toISOString(), 2);
                // const change = (trends[0].rate_open - trends[1].rate_close) / trends[1].rate_close;
                const num = extractLastDigits(info.logo)
                const indicator = (num % 2) * 2 - 1;
                asset.change = indicator * num / 20000;
                if (info.asset_name == 'Tether') {
                    asset.change = 0;
                }
            });

            // Apply filters [count, offset, rankers]
            total = Math.ceil(assets.length);
            assets = assets.slice(offset, offset + count);
            rankers.forEach(ranker => {
                assets.sort((a, b) => {return b[ranker] - a[ranker];})
            });
            res.json(
                {
                    total: total,
                    assets: assets,
                }
            )
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
    const {asset_id, portfolio_name, quantity, price} = req.body;
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
        SELECT SUM(star) cnt 
        FROM StarPostRecord spr, Post p
        WHERE spr.post_id = p.id and p.user_id = ?
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
      WHERE portfolio_id = ?
      ORDER BY time DESC;
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

router.get('/:portfolioid/holds', (req, res) => {
    const portfolioId = req.params.portfolioid;
    const query = `
      SELECT *
      FROM Hold
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


router.get('/:portfolioid/advice', (req, res) => {
    const portfolioId = req.params.portfolioid;
    const query = `
      SELECT content
      FROM InvestmentAdvice
      WHERE portfolio_id = ?
      ORDER BY create_time DESC
      LIMIT 1;
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
    const {title, description, content} = req.body;
    const user_id = req.user;
    if (!title || !description || !content) {
        return res.status(400).json({message: 'Missing required fields'});
    }

    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({message: 'Internal server error, unable to establish database connection'});
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
                    res.status(500).json({message: 'Internal server error, failed to insert post'});
                } else {
                    res.status(200).json({message: 'Post published successfully', postId: results.insertId});
                }
            });
        }
    });
})


// 添加新的portfolio
router.post('/portfolio', async (req, res) => {
    const { name, color, isPinned } = req.body;  // 从请求体中获取portfolio名称、颜色和是否固定
    console.log(req.body)
    const userId = req.user;  // 假设req.user是已经通过认证中间件设置的用户ID

    if (!name || color === undefined || isPinned === undefined) {
        return res.status(400).json({ message: 'Portfolio name, color, and pin status are required' });
    }

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error getting database connection' });
        }

        // 插入新的portfolio到数据库
        const query = `
            INSERT INTO Portfolio (id, name, color, is_pinned, user_id, create_time)
            VALUES (uuid(), ?, ?, ?, ?, now());
        `;

        connection.query(query, [name, color, isPinned, userId], (err, results) => {
            connection.release();  // 总是释放连接回连接池

            if (err) {
                return res.status(500).json({ message: 'Error inserting new portfolio into the database' });
            }

            res.status(201).json({
                message: 'Portfolio created successfully'
            });
        });
    });
});





router.get('/list_real2', async (req, res) => {
    // Parse the count and page from the query, default to 10 and page 1 if not provided
    const count = parseInt(req.query.count) || 10;
    const page = parseInt(req.query.page) || 1;
    const {all} = req.query;
    // const all = false
    // Retrieve the search parameter from the query string
    const {search} = req.query;
    const user_id = req.user;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({message: 'Internal server error getting database connection'});
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
                    return res.status(500).json({message: 'Error querying total count'});
                } else {
                    const totalItems = countResults[0].total;

                    // Now handle the main data query with pagination
                    // let dataQuery = `
                    //     SELECT p.id, p.title, p.description, p.create_time, p.update_time, p.thumbs_up_num, p.content,
                    //            u.name AS owner, u.id AS user_id, count(spr.star) as star, starredInfo.starCntByMe
                    //     FROM Post p
                    //     LEFT JOIN User u ON p.user_id = u.id
                    //     LEFT JOIN (
                    //         select post_id, count(star) as starCntByMe
                    //         from StarPostRecord
                    //         where user_id = '00310be2-843a-4a61-a809-38a934fdc972'
                    //     ) as starredInfo on starredInfo.post_id = p.id
                    //     LEFT JOIN StarPostRecord spr ON spr.post_id = p.id and spr.star = 1
                    // `;
                    let dataQuery = `
                        SELECT 
                            p.id, 
                            p.title, 
                            p.description, 
                            p.create_time, 
                            p.update_time, 
                            p.thumbs_up_num, 
                            p.content,
                            u.name AS owner, 
                            u.id AS user_id, 
                            count(spr.star) as star, 
                            COALESCE(starredInfo.starCntByMe, 0) as starCntByMe
                        FROM 
                            Post p
                        LEFT JOIN 
                            User u ON p.user_id = u.id
                        LEFT JOIN (
                            SELECT 
                                post_id, 
                                sum(star) as starCntByMe
                            FROM 
                                StarPostRecord
                            WHERE 
                                user_id = ?
                            GROUP BY 
                                post_id
                        ) AS starredInfo ON starredInfo.post_id = p.id
                        LEFT JOIN 
                            StarPostRecord spr ON spr.post_id = p.id and spr.star = 1
                            `


                    const dataParams = [];
                    dataParams.push(`${user_id}`);

                    const hasWhere = false;

                    if (search) {
                        dataQuery += ' WHERE p.title LIKE ? OR p.description LIKE ?';
                        dataParams.push(`%${search}%`, `%${search}%`);
                        hasWhere = true;
                    }

                    if (all === "false") {
                        if (hasWhere) {
                            dataQuery += ' AND p.user_id = ?';
                        } else {
                            dataQuery += ' WHERE p.user_id = ?';
                        }
                        dataParams.push(`${user_id}`);
                    }

                    dataQuery += ' group by p.id, starredInfo.starCntByMe';
                    dataQuery += ' ORDER BY p.create_time DESC LIMIT ? OFFSET ?';
                    const offset = (page - 1) * count;
                    dataParams.push(count, offset);

                    console.log("Executing data query:", dataQuery, dataParams);
                    connection.query(dataQuery, dataParams, (err, results) => {
                        connection.release(); // Always release the connection back to the pool

                        if (err) {
                            return res.status(500).json({message: 'Error querying posts data'});
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
                                star: post.star,
                                content: post.content,
                                starredByMe: post.starCntByMe > 0
                            }));

                            // Send both posts and total count in the response
                            res.json({posts: listData, total: totalItems});
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
        return res.status(400).json({message: 'Post ID must be provided'});
    }

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({message: 'Internal server error getting database connection'});
        } else {
            // First, check if the user trying to star the post is the owner of the post
            connection.query('SELECT user_id FROM Post WHERE id = ?', [postId], (err, results) => {
                if (err) {
                    connection.release();
                    return res.status(500).json({message: 'Error querying the post owner'});
                }

                if (results.length === 0) {
                    connection.release();
                    return res.status(404).json({message: 'Post not found'});
                }

                const postOwnerId = results[0].user_id;
                if (postOwnerId === user_id) {
                    connection.release();
                    return res.status(403).json({message: 'You cannot star your own post'});
                }

                // Proceed to update the star count if the user is not the post owner
                const updateQuery = 'INSERT INTO StarPostRecord (user_id, post_id, star) VALUES (?, ?, true) ON DUPLICATE KEY UPDATE star = NOT star';
                connection.query(updateQuery, [user_id, postId], (err, result) => {
                    connection.release();  // Always release the connection back to the pool

                    if (err || result.affectedRows === 0) {
                        return res.status(500).json({message: 'Error updating post star count'});
                    }

                    res.json({message: 'Post starred successfully! The owner will be awarded one burger coin'});
                });
            });
        }
    });
});

router.post('/delete_post', async (req, res) => {
    const postId = req.body.postId;  // Ensure you have middleware to parse JSON bodies
    const userId = req.user; // Assuming `req.user` is set from authentication middleware

    if (!postId) {
        return res.status(400).json({ message: 'Post ID must be provided' });
    }

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error getting database connection' });
        } else {
            // First, check if the user trying to delete the post is the owner of the post
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
                if (postOwnerId !== userId) {
                    connection.release();
                    return res.status(403).json({ message: 'You can only delete your own posts' });
                }

                // Proceed to delete StarPostRecord entries before deleting the post
                connection.query('DELETE FROM StarPostRecord WHERE post_id = ?', [postId], (err, starDeleteResult) => {
                    if (err) {
                        connection.release();
                        return res.status(500).json({ message: 'Error deleting star records for the post' });
                    }

                    // Now proceed to delete the post
                    connection.query('DELETE FROM Post WHERE id = ?', [postId], (err, postDeleteResult) => {
                        connection.release();  // Always release the connection back to the pool

                        if (err || postDeleteResult.affectedRows === 0) {
                            return res.status(500).json({ message: 'Error deleting the post' });
                        }

                        res.json({ message: 'Post and all related star records deleted successfully' });
                    });
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

router.get('/advice/:portfolioid', async (req, res) => {
    try {
        const portfolioId = req.params.portfolioid;
        const query = `
          SELECT *
          FROM Hold
          WHERE portfolio_id = ?;
        `;
        let advice = '';
        db.getConnection((err, connection) => {
            if (err) {
                res.status(500).json({message: 'Internal server error'});
            } else {
                connection.query(query, [portfolioId], async (err, rows) => {
                    if (err) {
                        res.status(500).json({message: 'Internal server error'});
                    } else {
                        const prompt = rows.map(item => `asset: ${item.asset_id}, quantity: ${item.hold_quantity}`).join('; ');
                        advice = await genAdvice(prompt);
                        // console.log(advice)
                        const insert_q = `
                            INSERT INTO InvestmentAdvice VALUES(UUID(),?,?,NOW());
                        `;
                        db.getConnection((err1, connection1) => {
                            if (err1) {
                                res.status(500).json({message: 'Internal server error'});
                            } else {
                                connection1.query(insert_q, [advice, portfolioId], (err, _) => {
                                    if (err) {
                                        res.status(500).json({message: 'Internal server error'});
                                    } else {
                                        res.status(200).json({
                                            message: 'Advice inserted successfully',
                                            portfolio: portfolioId
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

            }
        });
    } catch (error) {
        console.error('Error while fetching advice:', error);
        res.status(500).send("An error occurred while generating advice.");
    }
});


module.exports = router;