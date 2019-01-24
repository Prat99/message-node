const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult, body } = require('express-validator/check');
const db = require('../db/db');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    console.log('isErrors', errors.isEmpty());
    if (!errors.isEmpty()) {
        console.log('errors if any', errors.array());
        const err = new Error('Error, Validation failed');
        err.statusCode = 422;
        throw (err);
    }
    const { email, name, password } = req.body;
    bcrypt.hash(password, 12).then(hashedpwd => {
        let sql = `INSERT INTO USERS (email, name, password ) VALUES (?, ?, ?)`;
        db.query(sql, [email, name, hashedpwd], (err, result) => {
            if (err) {
                //  res.send({ 'error': 'An error has occurred', err });
            } else {
                // console.log('res', result);
                res.status(201).json({ message: 'user register successfully' });
            }
        });
    })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}


exports.signin = (req, res, next) => {
    const { email, password } = req.body;
    let sql = `SELECT * FROM USERS WHERE email = ?`;
    db.query(sql, [email], (err, result) => {
        console.log('sigin user', result);
        if (err) {
            err.message = 'some error occured',
                err.statusCode = 404;
            next(err);
        } else if (!result.length > 0) {
            const err = new Error('user not found');
            err.statusCode = 404;
            next(err);
        } else {
            loadedUser = result[0];
            console.log('loaded user', loadedUser);
            console.log(bcrypt.compareSync(password, loadedUser.password));
            bcrypt.compare(password, loadedUser.password, (err, res1) => {
                if (err) {
                    err.message = 'some error occured',
                        err.statusCode = 404;
                    next(err);
                } else if (res1) {
                    jwt.sign({email: email}, 'mam mammal key to the road', {expiresIn: '1h'}, (err, token) => {
                        if(err) {
                            err.message = 'some error occured',
                            err.statusCode = 404;
                        next(err);     
                        } else {
                            res.status(200).json({ message: 'sigin successfully', token: token });
                        }
                    })
                } else {
                    const err = new Error('password is incorrect');
                    err.statusCode = 401;
                    next(err);
                }
            })
        }
    });
}