const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, 'Please enter a product name'],
        trim : true,
        maxlength: [70, 'Product name must be less than 50 characters long']
    },
    price: {
        type: Number,
        required:[true, 'Please enter a product price'],
        default:0.0,
    },
    description: {
        type: String,
        required:[true, 'Please enter a product description'],
        maxlength: [200, 'Product description must be less than 200 characters long']
    },
    ratings: {
        type: String,
        required:[true, 'Please enter a product rating'],
        default:0
    },
    images:[
        {
            image:{
                type: String,
                required:[true, 'Please enter a product image']
            }
        }
    ],
    category: {
        type: String,
        required:[true, 'Please enter a product category'],
        enum:{
            values:[
            'Clothing',
            'Electronics',
            'Furniture',
            'Home',
            'Kitchen',
            'Sports',
            'Headphones',
            'Laptops',
            'Accessories',
            'Mobile Phones'
        ],
        message: 'Please enter a valid product category'
    }
    },
    seller:{
        type: String,
        required:[true, 'Please enter a seller name']
    },
    stock:{
        type: Number,
        required:[true, 'Please enter a product stock'],
        maxlength:[25, 'max stock is 25 only'],
    },
    numOfReviews: {
        type: Number,
        default:0
    },
    reviews: [
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            rating: {
                type: String,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user:{
        type: mongoose.Schema.Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', ProductSchema);