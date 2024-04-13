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

router.get('/user', async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM User');
        res.json({ message: 'Data received', data: data });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});





module.exports = router;