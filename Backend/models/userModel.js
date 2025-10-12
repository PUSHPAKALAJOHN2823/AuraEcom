import mongoose from "mongoose";
import validator from 'validator';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter your Name"],
        maxLength:[25, "Inavlid name . Pease neter your name with fewer that 25 characters"],
        minLength:[3, "Name should be more thatn 3 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please enter valid email"]
    },
    password:{
        type:String,
        minLength:[8,"Password should be greater than 8 characters"],
        select:false

    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }

    },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
},{timestamps:true})

userSchema.pre("save" , async function(next){
    if(!this.isModified("password")){
        return next();
    }

    this.password=await bcryptjs.hash(this.password ,10)
    next();
})

userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

userSchema.methods.verifyPassword= async function(userEnteredPassword){
    return await bcryptjs.compare(userEnteredPassword,this.password)
}

userSchema.methods.generatePasswordResetToken=function(){
    const resetToken = crypto.randomBytes(20).toString('hex')
    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest('hex');
    this.resetPasswordExpire=Date.now()+30*60*1000;
    return resetToken;
}

export default mongoose.model("User", userSchema);