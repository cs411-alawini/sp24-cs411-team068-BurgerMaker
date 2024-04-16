const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const crypto = require('crypto');

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
        console.log('cur userid: ', req.user);
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
                        const listData = results.map(user => ({
                            id: user.id,
                            name: user.name || 'Unknown User',
                            email: user.email,
                            join_time: user.join_time,
                            balance: user.balance,
                            burger_coin: user.burger_coin
                        }));

                        res.json(listData);
                    }
                })
            }
        })
    }
});

module.exports = router;