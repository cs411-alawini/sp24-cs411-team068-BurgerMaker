const express = require('express');
const jwt = require("jsonwebtoken");
const db = require('../db/connection');
const CryptoJS = require("crypto-js");
const router = express.Router();

router.post('/', (req, res) => {
    const {email, password} = req.body;
    let userId = '';
    db.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({message: 'Internal server error'});
        } else {
            const pwdMD5 = CryptoJS.MD5(password).toString();
            connection.query(`SELECT id, password FROM dev.User WHERE email = ? AND password = ?`, [email, pwdMD5], (err, rows) => {
                if (err) {
                    res.status(500).json({message: 'Internal server error'});
                } else if (rows.length !== 1) {
                    res.status(401).json({message: `Login failed: ${email}`});
                } else {
                    userId = rows[0].id;
                }

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