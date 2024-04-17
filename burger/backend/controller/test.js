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
    // Retrieve the search parameter from the query string
    const { search } = req.query;

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error getting database connection' });
        } else {
            // Initialize the base query
            let query = `
                SELECT p.id, p.title, p.description, p.create_time, p.update_time, p.thumbs_up_num, p.content,
                       u.name AS owner, u.id AS user_id
                FROM Post p
                LEFT JOIN User u ON p.user_id = u.id
            `;

            // Initialize the parameters array
            const params = [];

            // If a search term is provided, modify the query to include a WHERE clause
            if (search) {
                query += ' WHERE p.title LIKE ? OR p.description LIKE ?';
                params.push(`%${search}%`, `%${search}%`);
            }

            // Add ordering and limiting
            query += ' ORDER BY p.create_time DESC LIMIT ?';
            params.push(count);

            connection.query(query, params, (err, results) => {
                connection.release(); // Always release the connection back to the pool

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






module.exports = router;
