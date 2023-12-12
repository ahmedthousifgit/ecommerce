const Order = require('../models/order-model')
const Product = require('../models/products-model')
const User = require('../models/user')
const Coupon = require('../models/coupon')

exports.coupon = async(req,res)=>{
    try{
      res.render('admin/coupon')
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
}