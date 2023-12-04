const Order = require('../models/order-model')
const product = require('../models/products-model')
const { formatDate } = require("../utility/formatDate");
const PDFDocument=require('pdfkit')


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
                    
                }).populate('userId')
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
        if (req.query.downloadPdf) {
            console.log('////////////////////');
            const doc = new PDFDocument();
            // Customize your PDF content here based on the sales report data
            doc.text('Sales Report', { align: 'center' });
            doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
            doc.moveDown();
            let orderCounter = 0;
            // Add your sales data to the PDF
            orders.forEach((order) => {
              doc.text(`Order ID: ORD${String(order._id.toString().slice(-4)).padStart(5, '0')}`, { fontSize: 12 });
              doc.text(`Customer Name: ${order.userId.name ? order.userId.name : 'N/A'}`, { fontSize: 12 });
              doc.text(`Price: ${order.totalPrice}`, { fontSize: 12 });
              doc.text(`Status: ${order.status}`, { fontSize: 12 });
              doc.text(`Date: ${order.createdOn ? order.createdOn.toLocaleDateString() : 'N/A'}`, { fontSize: 12 });
              doc.moveDown(); // Add spacing between entries
            });

            
            // Set the response headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"');
            // Pipe the PDF content to the response stream
            doc.pipe(res);
            doc.end();
          } else{
            
            res.render('admin/salesReport',{orders:currentProduct,formatDate,totalpages,currentpage})

          }
       
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
}

exports.downloadPdf = async (req, res) => {
    try {
       
        // ... Your existing sales report generation logic ...
  
        // Generate PDF using pdfkit
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
        doc.pipe(res);
  
        // Add PDF content here
        doc.text('Sales Report', { align: 'center', underline: true });
        // ... Add more content based on your requirements ...
  
        doc.end();
  
    } catch (error) {
        console.log('Error occurred in downloadPdf route:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
  };
