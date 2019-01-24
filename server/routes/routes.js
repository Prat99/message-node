// Use the express.Router class to create modular, mountable route handlers. 
// A Router instance is a complete middleware and routing system; for this reason, 
// it is often referred to as a “mini-app”.
// all the routes and middleware are specific to this module.

// For project architeture prespective, we shoud put all our controllers to seperate file
// and import it here to attach to specific routes.

const express = require('express');
const router = express.Router();
const db = require('../db/db');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');
const { check, validationResult, body } = require('express-validator/check');

let appNotes = [];
let id = 0;

router.get('/get-post', (req, res) => {
    let sql = `SELECT * FROM posts`;
    db.query(sql, (err, result, fields) => {
        if (err) {
            res.send({ 'error': 'An error has occurred', err });
        } else {
            console.log('res', result);
            let response = [];
            // console.log('fields', fields);
            // const response = {
            //     notes: result,
            //     status_code: 200,
            //     message: 'success',
            //     v: 1.0
            // }
            result.forEach(element => {
                let res =
                {
                    _id: element.id,
                    title: element.title,
                    content: element.content,
                    imageUrl: element.image,
                    creator: {
                        name: element.author,
                    },
                    createdAt: element.date
                }
                response.push(res);
            });
            res.status(200).json({ posts: response });
        }
    });
});


router.post('/create-post', [body('title').trim().isLength({ min: 5 }),
body('content').trim().isLength({ min: 5 })],
    (req, res, next) => {
        console.log('req.body', req.body);
        let error = validationResult(req);
        if (!error.isEmpty()) {
            // console.log('validation array', error.array());
            // res.status(422).json(
            //     {
            //         message: 'Validation failed, Entered data is incorrect',
            //         error: error.array()
            //     }
            // )
            /** General error throwing approach */
            const error = new Error('Validation failed, Entered data is incorrect');
            error.statusCode = 422;
            throw error;
        } 
        if(!req.file){
            const error = new Error('No image provided');
            error.statusCode = 422;
            throw error;
        }else {
            const imageUrl = req.file.path;
            console.log('imageUrl', imageUrl);
            const { title, author, date, content } = req.body;
            let sql = `INSERT INTO posts (title, content, author, date, image) VALUES (?, ?, ?, ?, ?)`;
            db.query(sql, [title, content, author, date, imageUrl], (err, result) => {
                if (err) {
                    res.send({ 'error': 'An error has occurred', err });
                } else {
                    console.log('res', result);
                    const response = {
                        post: {
                            _id: result.insertId,
                            title: title,
                            content: content,
                            imageUrl: result.image,
                            creator: { name: author },
                            createdAt: '24/12/2018',
                        },
                        message: 'Post created successfully'
                    }
                    res.status(201).json(response);
                }
            });
        }

    });

router.put('update-post/:id', (req, res, next) => {
    const id = Number(req.params.id);
    const { title, body } = req.body;
    let imageUrl = req.body.image;
    if(req.file) {
        imageUrl = req.file.path
    }
    if(!imageUrl) {
        const error = new Error('No file picked');
        error.statusCode  = 422;
        throw error;
    }
        const sql = `UPDATE notes SET title = ?, body = ?, image = ?, WHERE id = ?`
        db.query(sql, [title, body, imageUrl,  id], (err, result, fields) => {
            if (err) {
                res.send({ 'error': 'An error has occurred', err });
            } else {
                console.log('res', result);
                const response = {
                    title: title,
                    body: body,
                    status_code: 200,
                    message: 'successfully updated',
                    v: 1.0
                }
                res.status(200).send(response);
            }
        });
});

router.delete('/:id', (req, res, next) => {
    let id = Number(req.params.id);
    let response;
    const sql = `DELETE FROM posts WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            res.send({ 'error': 'An error has occurred', err });
        } else {
            console.log('res', result);
            if (result.affectedRows) {
                response = {
                    status_code: 200,
                    message: 'successfully deleted',
                    v: 1.0
                }
            } else {
                response = {
                    status_code: 400,
                    message: "id doesn't exists",
                    v: 1.0
                }
            }
            res.status(200).json(response);
        }
    });
});

/**fetch single post */
router.get('/single-post/:id', (req, res, next) => {
    const id = Number(req.params.id);
    const sql = `SELECT * FROM posts WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log('this is the error', err);
            err.statusCode = 404;
            err.message = 'Some error has occured, object not found';
            next(err);
        } else {
            if (result.length > 0) {
                console.log('single post result', result);
                const response = {
                    id: result[0].id,
                    title: result[0].title,
                    content: result[0].content,
                    author: result[0].author || 'Prateek',
                    date: result[0].date || Date.now(),
                    imageUrl: result[0].image,
                };
                res.status(200).json({post: response});
            } else {
                res.status(404).json({ message: 'resource not found' });
            }
        }
    });
});

/*** Auth Routes Start */

router.post('/signup', [
   body('email').isEmail().withMessage('Please enter a valid email').custom((value, { req }) => {
       console.log('custom value', value);
       return db.query('SELECT * FROM USERS WHERE email = ?', [value], (err, result) => {
        console.log('user returned from db', result);    
        if(err) {
                console.log('body => db error' , err);
            } else if(result) {
                return Promise.reject('Email already Exists');
            }
       })
   }),
   body('name').trim().not().isEmpty(),
   body('password').trim().isLength({min: 5})
], authController.signup );

router.post('/login', authController.signin);

module.exports = router;
