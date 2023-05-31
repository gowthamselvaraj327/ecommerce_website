const Product = require('../models/Products')
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ApiFeatures = require('../utils/ApiFeatures');



exports.getProducts = catchAsyncError(async(req, res, next) =>{
    const resPerPage =3;
    let buildQuery = () => {
        return new ApiFeatures(Product.find(), req.query).search().filter()
    }
    const filteredProductsCount = await  buildQuery().query.countDocuments({})
    const totalProductsCount = await Product.countDocuments({})
    let productsCount = totalProductsCount;

    if(filteredProductsCount !== totalProductsCount) {
        productsCount = filteredProductsCount; 
    }


    const products = await buildQuery().paginate(resPerPage).query;
    await new Promise(resolve => setTimeout(resolve, 500))

    res.status(200).json({
        success: true,
        count: productsCount,
        message: 'Products fetched successfully',
        resPerPage,
        products
        
    })
})

exports.getProductsbyId = catchAsyncError(async(req, res, next) =>{
    const product = await Product.findById(req.params.id).populate('reviews.user','name email');
    if(!product){
        return next(new ErrorHandler(400, 'Product not found'));
    }
    res.status(201).json({
        success: true,
        count: product.length,
        message: 'Products fetched successfully',
        product
        
    })
})

exports.newProduct =catchAsyncError( async(req, res, next) =>{
    let images = []

    if(req.files.length > 0){
        req.files.forEach( file => {
            let url = `${process.env.BACKEND_URL}/uploads/product/${file.originalname}`
            images.push({image : url})
        })
    }
    req.body.images = images;

    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
    })
})

exports.updateProducts = catchAsyncError(async(req, res, next) =>{
    const products = await Product.findById(req.params.id);

    // uploading images
    let images = []

    //  if images not cleared we keep the existing images
    if(req.body.imagesCleared === 'false'){
        images = products.images;
    }

    if(req.files.length > 0){
        req.files.forEach( file => {
            let url = `${process.env.BACKEND_URL}/uploads/product/${file.originalname}`
            images.push({image : url})
        })
    }
    req.body.images = images;

    if(!products){
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    const updatedproducts = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators: true,

    })
    res.status(201).json({
        success: true,
        message: 'Products Updated successfully',
        updatedproducts
        
    })
})

exports.deleteProducts = catchAsyncError(async(req, res, next) =>{
    const products = await Product.findById(req.params.id);
    if(!products){
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
    await Product.deleteOne({ _id: req.params.id });
    res.status(201).json({
        success: true,
        message: 'Products deleted successfully',        
    })
})

//  create Review 

exports.createReview = catchAsyncError(async (req, res, next) =>{
    const  { productId, rating, comment } = req.body;

    const review = {
        user : req.user.id,
        rating,
        comment
    }

    const product = await Product.findById(productId);
   //finding user review exists
    const isReviewed = product.reviews.find(review => {
       return review.user.toString() == req.user.id.toString()
    })

    if(isReviewed){
        //updating the  review
        product.reviews.forEach(review => {
            if(review.user.toString() == req.user.id.toString()){
                review.comment = comment
                review.rating = rating
            }

        })

    }else{
        //creating the review
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    //find the average of the product reviews
    product.ratings = product.reviews.reduce((acc, review) => {
        return review.rating + acc;
    }, 0) / product.reviews.length;
    product.ratings = isNaN(product.ratings)?0:product.ratings;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    })


})

//Get Reviews - api/v1/reviews?id={productId}
exports.getReviews = catchAsyncError(async (req, res, next) =>{
    const product = await Product.findById(req.query.id).populate('reviews.user','name email').populate('reviews.user','name email');

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})


//Delete Review - api/v1/review
exports.deleteReview = catchAsyncError(async (req, res, next) =>{
    const product = await Product.findById(req.query.productId);
    
    //filtering the reviews which does match the deleting review id
    const reviews = product.reviews.filter(review => {
       return review._id.toString() !== req.query.id.toString()
    });
    //number of reviews 
    const numOfReviews = reviews.length;

    //finding the average with the filtered reviews
    let ratings = reviews.reduce((acc, review) => {
        return review.rating + acc;
    }, 0) / reviews.length;
    ratings = isNaN(ratings)?0:ratings;

    //save the product document
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        numOfReviews,
        ratings
    })
    res.status(200).json({
        success: true
    })


});

// /admin: get all products

exports.getAdminProducts = catchAsyncError(async(req, res, next) => {
    const products = await Product.find();
    res.status(200).send({
        success: true,
        products
    })
});