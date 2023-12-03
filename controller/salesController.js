const Order = require('../models/order-model')
const product = require('../models/products-model')
const { formatDate } = require("../utility/formatDate");



exports.salesReport = async (req,res)=>{
    try{
        const date = req.query.date
        let orders
        const currentDate = new Date()

        function getFirstDayOfMonth(date){
            return new Date(date.getFullYear(), date.getMonth(), 1);
        }
        function getFirstDayOfYear(date) {
            return new Date(date.getFullYear(), 0, 1);
        }
        switch(date){
            case 'today' :
                orders = await Order.find({
                    status:'delivered',
                    createdOn:  {
                        $gte: new Date().setHours(0, 0, 0, 0), // Start of today
                        $lt: new Date().setHours(23, 59, 59, 999), // End of today
                    }
                    
                })
                // console.log(orders,"++++++++++++++++++++++++");
                break;

            case 'week':
                const startOfWeek = new Date(currentDate);
                startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Set to the first day of the week (Sunday)
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to the last day of the week (Saturday)
                endOfWeek.setHours(23, 59, 59, 999);

                orders = await Order.find({
                    status: 'delivered',
                    createdOn: {
                        $gte: startOfWeek,
                        $lt: endOfWeek,
                    },
                }).populate('userId');
                break;
                case 'month':
                const startOfMonth = getFirstDayOfMonth(currentDate);
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

                orders = await Order.find({
                    status: 'delivered',
                    createdOn: {
                        $gte: startOfMonth,
                        $lt: endOfMonth,
                    },
                }).populate('userId');
                break;
            case 'year':
                const startOfYear = getFirstDayOfYear(currentDate);
                const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);

                orders = await Order.find({
                    status: 'delivered',
                    createdOn: {
                        $gte: startOfYear,
                        $lt: endOfYear,
                    },
                }).populate('userId');
               
                break;
            default:
                // Fetch all orders
                orders = await Order.find({ status: 'delivered' }).populate('userId');    

        }
        const itemsPerPage=3
        const currentpage=parseInt(req.query.page)||1;
        const startIndex=(currentpage-1)*itemsPerPage
        const endIndex=startIndex+itemsPerPage
        const totalpages=Math.ceil(orders.length/3)
        const currentProduct=orders.slice(startIndex,endIndex)

// console.log(orders,"+++++++++++++++++++");
       res.render('admin/salesReport',{orders:currentProduct,formatDate,totalpages,currentpage})
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
}