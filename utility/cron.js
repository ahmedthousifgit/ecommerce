const cron = require('node-cron')
const Coupon = require('../models/coupon')
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

module.exports = cron