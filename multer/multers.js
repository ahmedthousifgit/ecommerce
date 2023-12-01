const multer = require("multer");

const storage= multer.diskStorage({
  destination:(req,res,cb)=>{
    return cb(null, "public/uploads/categories");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
})


const products = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "public/uploads/products");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

exports.update = multer({ storage: products });
exports.upload = multer({ storage: storage });
