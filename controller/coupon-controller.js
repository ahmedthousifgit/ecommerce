const Order = require('../models/order-model')
const Product = require('../models/products-model')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const voucher_codes= require('voucher-code-generator')
const cron = require('node-cron')

cron.schedule('0 0 * * *', async () => {
  try {
    const currentDate = new Date();
    const expiredCoupons = await Coupon.find({
      expiry: { $lt: currentDate },
      status: 1,
    });

    if (expiredCoupons.length > 0) {
      await Coupon.updateMany(
        { _id: { $in: expiredCoupons.map((c) => c._id) } },
        { $set: { status: 2 } }
      );
    }
  } catch (error) {
    console.error('Error updating coupon status:', error);
  }
});

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
      const itemsperpage = 5;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(data.length / 5);
     res.render('admin/coupon',{data:data,totalpages,currentpage,err:"Coupon Already Exist"})
    })
   }
   else{
    const create = new Coupon({
       created:formattedStartDate,
       name:req.body.name,
       code:code,
       expiry:formattedEndDate,
       offerPrice:req.body.offerPrice,
       minimumPrice:req.body.minimumPrice,
       status: 1
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


exports.couponStatus=async (req,res)=>{
  const id=req.body.id
  const status=req.body.status
  await Coupon.findByIdAndUpdate(id,{status:status},{new:true}).lean()
  .then((data)=>{
      res.json(true)
  })
}
