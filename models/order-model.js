const mongoose = require('mongoose')
const orderModel = mongoose.Schema({
    totalPrice:{
        require:true,
        type:Number
    },
    address:{
        require:true,
        type:Array
    },
    size:{
        require:true,
        type:String,
    },
    createdOn: {
        required: true,
        type: Date,
        default: Date.now
    },
    date:{
        require:true,
        type:String
    },
    product:{
        require:true,
        type:Array
    },
    wallet:{
        default:0,
        type:Number
    },
    reason:{
        type:String,
        default:0
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        type:String
    },
    payment:{
        require:true,
        type:String
    },
    status:{
        require:true,
        type:String
    }
})

module.exports = mongoose.model("order",orderModel)
