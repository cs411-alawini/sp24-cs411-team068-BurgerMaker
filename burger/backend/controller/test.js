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
