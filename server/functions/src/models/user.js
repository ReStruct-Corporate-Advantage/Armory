import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
      address1: String,
      address2: String,
      createdby: String,
      createdon: Date,
      email: String,
      image: String,
      firstname: String,
      lastname: String,
      password: String,
      role: String,
      updatedon: Date,
      updtedby: String,
      username: String,
    },
    {timestamps: true},
);

const User = mongoose.model("User", userSchema);

export {userSchema, User};
