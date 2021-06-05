import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    username: String,
    password: String,
    role: String,
    address1: String,
    address2: String,
    createdon: Date,
    createdby: String,
    updatedon: Date,
    updtedby: String
},
{ timestamps: true });

const User = mongoose.model('User', userSchema);

export {userSchema, User};