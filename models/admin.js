const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const adminSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        requird:true
    },
    isAdmin:{
        type:Boolean,
        default:true
    }
    
})
 
module.exports =mongoose.model('Admin',adminSchema)
