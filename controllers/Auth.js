const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/Users');
const sendEmail = require('../utils/Email');
const ErrorHandler = require('../utils/ErrorHandler');
const sendToken = require('../utils/Jwt');
const crypto = require('crypto');


exports.registerUser = catchAsyncError(async (req, res,next)=> {
    const {name, email, password} = req.body;
    let avatar;
    if(req.file){
        avatar = `${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`
    }
    const user = await User.create({
        name,
        email,
        password,
        avatar
    });

    sendToken(user, 201, res)
})

exports.loginUser = catchAsyncError(async (req, res, next)=>{
    const {email, password} = req.body

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400));
    }

    // finding the user from database

    const user = await User.findOne({email}).select('+password');
    

    if(!user){
        return next(new ErrorHandler('Invalid email', 401));
    }

    if(!await user.isValidPassword(password)){
        return next(new ErrorHandler('Invalid password', 401));
    }

    sendToken(user, 201, res)

})


exports.logoutUser = (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    .status(200)
    .json({
        success: true,
        message: "Loggedout successfully"
    })
}

exports.forgotPassword = catchAsyncError(async (req, res, next)=>{
    const user = await User.findOne({email:req.body.email});
     if(!user){
        return next(new ErrorHandler('User not found with this email', 404));
     }

     const resetToken = user.getResetToken();
     await user.save({validateBeforeSave: false});

    //  create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    const message = `Your Password reset url is as follows \n\n ${resetUrl} \n\n If you have not requested this email, Ignore it!`;

    try{
        sendEmail({
            email:user.email,
            subject:'SAT Account Password Recovery',
            message:message
        })
        res.status(200).json({
            success: true,
            message : `Email Sent to ${user.email} successfully` 
        })
    }catch(e){
        user.resetPasswordToken= undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({validateBeforeSave: false});
        return next(new ErrorHandler(e.message),500);
    }
})

exports.resetPassword =  catchAsyncError(async (req, res, next)=>{
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire:{
            $gt : Date.now()
        }
    })
    if(!user){
        return next(new ErrorHandler('Password Reset token is invalid or expired'));
    }

    if (req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match'));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({validateBeforeSave: false});

    sendToken(user, 201, res)
})

// get user profile

exports.getUserProfile = catchAsyncError(async (req, res, next)=>{
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})

//  change password
exports.changePassword = catchAsyncError(async (req, res, next)=>{
    const user = await User.findById(req.user.id).select('+password');

    // check old password

    if(!await user.isValidPassword(req.body.oldPassword)){
        return next(new ErrorHandler('Old password is incorrect', 401));
    }

    //  assigning new password
    user.password = req.body.password;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    })
})

//  update profile 

exports.updateProfile =  catchAsyncError(async (req, res, next)=>{
    let newUserData ={
        name: req.body.name,
        email: req.body.email
    }

    let avatar;
    if(req.file){
        avatar = `${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`
        newUserData = {...newUserData, avatar}
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new : true,
        runValidators: true
    })
    res.status(200).json({
        success:true,
        user
    })
})

// getting all the users only admin
exports.getAllUsers =  catchAsyncError(async (req, res, next)=>{

    const users = await User.find();
    res.status(200).json({
        success:true,
        users
    })
})

// get specific users only admin

exports.getUser =  catchAsyncError(async (req, res, next)=>{

    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`, 401));
    }
    res.status(200).json({
        success:true,
        user
    })
})

//  admin : update user information

exports.updateUser =  catchAsyncError(async (req, res, next)=>{

    const newUserData ={
        name: req.body.name,
        email: req.body.email,
        role : req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new : true,
        runValidators: true
    })
    res.status(200).json({
        success:true,
        user
    })
})


//  delete user admin only

exports.deleteUser =  catchAsyncError(async (req, res, next)=>{

    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`, 401));
    }
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({
        success:true,
        message:"Deleted successfully"
    })
})