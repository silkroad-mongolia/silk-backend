const express = require('express');
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/user');
const productRoutes = require('./routes/product');

const app = express();




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

app.use('/api/user', usersRoutes);
app.use('/api/product', productRoutes);



module.exports = app;

