const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please enter a name']
    },
    email : {
        type : String,
        required : [true, 'Please enter a email address'],
        unique : true,
        validate : [validator.isEmail, 'Please enter Valid Email Address']
    },
    password : {
        type : String,
        required : [true, 'Please enter a password'],
        minlength : [6, 'Password must be atleast 6 characters'],
        maxlength : [15, 'Password cannot exceed 15 characters'],
        select : false
    },
    avatar : {
        type : String,
    },
    role : {
        type : String,
        default : 'user'
    },
    resetPasswordToken : {
        type : String,

    },
    resetPasswordTokenExpire : {
        type : Date,    
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
})

UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.getJwtToken =function(){
    return jwt.sign({id:this.id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

UserSchema.methods.isValidPassword =async function(password){
    return bcrypt.compare(password, this.password);
}

UserSchema.methods.getResetToken = function(){
    // generate token
    const token = crypto.randomBytes(20).toString('hex');
    // generate hash and set reset passwordtoken
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    //  set token expire time
    this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;
    return token;
}

module.exports = mongoose.model('User', UserSchema);