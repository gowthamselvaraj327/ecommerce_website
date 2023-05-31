const express = require('express');
const app = express();
const errorMiddleware = require('./middlewares/Error');
const cookieParser = require('cookie-parser')
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({path:path.join(__dirname,"config/Config.env")});


app.use(express.json()); 
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname,'uploads')))


const products = require('./routes/Products');
const auth = require('./routes/Auth');
const order = require('./routes/Order');
const payment = require('./routes/Payment');


app.use('/api/v1/',products);
app.use('/api/v1/',auth);
app.use('/api/v1/',order);
app.use('/api/v1/',payment);

app.use(errorMiddleware)


module.exports = app;