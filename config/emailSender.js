

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ahmedthousiii@gmail.com', 
    pass: 'iupw ienh llzx ikle'
  }
});
module.exports = transporter;