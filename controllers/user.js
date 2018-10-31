const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
        const user = {
            email: req.body.email,
            password: hash
        };
        User.create(user)
            .then(result => {
                res.status(201).json({
                    message: 'User created!',
                    result: result
                });
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Invalid authentication credentials!',
                    error: err
                });
            });
    });
};

exports.userLogin = (req, res, next) => {
    let fetchedUser;
    User.findOne({where: { email: req.body.email }})
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'Email not found!'
                });
            }

            fetchedUser = user;
            bcrypt.compare(req.body.password, user.password).then(result => {
                if (!result) {
                    return res.status(401).json({
                        message: 'Password not right!'
                    });
                }
                const token = jwt.sign(
                    { email: fetchedUser.email, userId: fetchedUser.id },
                    process.env.JWT_KEY,
                    { expiresIn: '1h' }
                );
                return res.status(200).json({
                    token: token,
                    expiresIn: 3600,
                    userId: fetchedUser.id
                });
            }).catch(err => {
                return res.status(401).json({
                    message: 'Encryption system failed',
                    error: err
                });
            })
        }).catch(err => {
        return res.status(401).json({
            message: 'Invalid authentication credentials!',
            error: err
        });
    });
};
