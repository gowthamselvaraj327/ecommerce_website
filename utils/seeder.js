const products = require('../data/products');
const Product = require('../models/Products');
const dotenv = require('dotenv');
const connectDatabase = require('../config/database');
dotenv.config({path: 'Backend/config/Config.env'});

connectDatabase();

const seedProducts = async () => {
    try{
        await Product.deleteMany();
        console.log('Products deleted');
        await Product.insertMany(products);
        console.log('Products seeded');
    }catch(e){
        console.log(e.message);
    }
    process.exit(); 
}

seedProducts();