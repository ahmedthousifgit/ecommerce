const multer = require("multer");

const products = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "public/uploads/products");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

exports.update = multer({ storage: products });
