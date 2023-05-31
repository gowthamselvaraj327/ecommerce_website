const Order = require('../models/Order');
const Product = require('../models/Products');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');

// create new order

exports.newOrder =  catchAsyncError(async(req, res, next) =>{
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt : Date.now(),
        user : req.user.id
    })

    res.status(200).json({
        success : true,
        order
    })
})

// get single order

exports.getSingleOrder =  catchAsyncError(async(req, res, next) =>{
    const order = await Order.findById(req.params.id).populate('user','name email');
    if(!order){
        return next(new ErrorHandler(`Order not found with this id ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        order
    })
})


//  get loggedin users order

exports.myOrders =  catchAsyncError(async(req, res, next) =>{
    const orders = await Order.find({user: req.user.id});
    res.status(200).json({
        success: true,
        orders
    })
})


// Admin get all orders 

exports.Orders =  catchAsyncError(async(req, res, next) =>{
    const orders = await Order.find();

    let totalAmount = 0;
    
    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})


// Admin : update order status and product stocks

exports.updateOrder =  catchAsyncError(async(req, res, next) =>{
    const order = await Order.findById(req.params.id);

    if(order.orderStatus == 'Delivered'){
        return next(new ErrorHandler('Order has already been delivered',400));
    }

    order.orderItems.forEach(async orderItem =>{
       await updateStock(orderItem.product, orderItem.quantity)
    })

    order.orderStatus = req.body.orderStatus;
    order.deliveredAt = Date.now();
    await order.save();

    res.status(200).json({
        success: true,
        order
    })
})

// updating the product stock of each item

async function updateStock(productId, quantity ){
    const product = await Product.findById(productId);
    product.stock = product.stock - quantity;
    product.save({validateBeforeSave: false});
}


//Admin: Delete Order - api/v1/order/:id
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404))
    }

    await order.deleteOne({ _id: req.params.id });
    res.status(200).json({
        success: true
    })
})