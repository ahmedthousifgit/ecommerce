const Order = require('../models/order-model')
const Product = require('../models/products-model')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const voucher_codes= require('voucher-code-generator')

exports.coupon = async(req,res)=>{
    try{
      await Coupon.find()
      .then((data)=>{
        data.reverse()
        const itemsperpage = 5;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(data.length / 5);
        const currentCoupons = data.slice(startindex,endindex);
        res.render('admin/coupon',{data:currentCoupons,totalpages,currentpage})
      })
      
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
}

exports.addCoupon = async(req,res)=>{
  try{
   const formattedStartDate = req.body.startDate.split('-').reverse().join('/')
   const formattedEndDate = req.body.endDate.split('-').reverse().join('/')
   let code = voucher_codes.generate({
    prefix:"promo-",
    postfix:"-2015"
   })
   let exist = await Coupon.find({name:req.body.name})
   if(exist.length){
    await Coupon.find().lean()
    .then((data)=>{
     res.render('admin/coupon',{data:data,err:"Coupon Already Exist"})
    })
   }
   else{
    const create = new Coupon({
       name:req.body.name,
       code:code,
       created:formattedStartDate,
       expiry:formattedEndDate,
       offerPrice:req.body.offerPrice,
       minimumPrice:req.body.minimumPrice,
       status:1
    })
    create.save()
    res.redirect('/admin/coupon')
   }
  }
  catch(error){
    console.log(error)
    res.status(500).json({error:"An error occured"})
  }
}