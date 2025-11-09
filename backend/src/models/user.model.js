import mongoose from "mongoose";

const  UserSchema = new mongoose.Schema({
    username: {type:String},
    email: {type:String, unique:true},
    password: {type:String},
    role: {type: String, enum:["Admin", "User"], default:"User"}
}, {versionKey:false, timestamps: true})


const userModel = new mongoose.model("user", UserSchema)

export default userModel;