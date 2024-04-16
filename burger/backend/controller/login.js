const express = require('express');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require('../db/connection');
const router = express.Router();

router.post('/', (req, res) => {
    const {email, password} = req.body;
    let userId = '';
    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({message: 'Internal server error'});
        } else {
            connection.query(`SELECT id, password FROM dev.User WHERE email = ?`, [email], (err, rows) => {
                if (err) {
                    res.status(500).json({message: 'Internal server error'});
                } else if (!rows) {
                    res.status(401).json({message: `Can not find the user: ${email}`});
                } else if (rows[0].password !== password) {
                    res.status(401).json({message: `Password not match: ${email}`});
                } else {
                    console.log(rows)
                    userId = rows[0].id;
                }
                console.log('now:', email, password, userId)

                const token = jwt.sign({userId: userId}, "yunchao", {expiresIn: '1y'});
                res.json({
                    status: 'ok',
                    token: token
                });
            });
        }
    });

});


module.exports = router;