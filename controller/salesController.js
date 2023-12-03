const order = require('../models/order-model')
const product = require('../models/products-model')


exports.salesReport = async (req,res)=>{
    try{
       res.render('admin/salesReport')
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
}