const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult, body } = require('express-validator/check');
const db = require('../db/db');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    console.log('isErrors', errors.isEmpty());
    if(!errors.isEmpty()) {
        console.log('errors if any', errors.array());
        const err = new Error('Error, Validation failed');
        err.statusCode = 422;
        throw(err);
    }
    const { email, name, password } = req.body;
    bcrypt.hash(password, 12).then( hashedpwd => {
        let sql = `INSERT INTO USERS (email, name, password ) VALUES (?, ?, ?)`;
        db.query(sql, [email, name, hashedpwd], (err, result) => {
            if (err) {
              //  res.send({ 'error': 'An error has occurred', err });
            } else {
               // console.log('res', result);
                res.status(201).json({message: 'user register successfully'});
            }
        });
    })
    .catch( err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}