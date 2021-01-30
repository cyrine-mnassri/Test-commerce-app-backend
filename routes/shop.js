const fs = require("fs");
const express = require("express");
const router = express.Router();
const multer = require("multer");

const Product = require("../models/Product"); 
const Category = require("../models/Category");

const validateCategoryInput = require("../validation/category"); 
const validateProductInput = require("../validation/product"); 




// Multer configuration
const MIME_TYPE_MAP = { "image/png": "png", "image/jpg": "jpg", "image/jpeg": "jpg" };
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValidFile = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValidFile) error = null;
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-")
      .split(".")
      .slice(0, -1)
      .join(".");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});





//Get products
router.get("/products", (req, res) => {
  Product.find()
    .populate("category", "cat_name")
    .sort({ updatedAt: -1 })
    .then(products => res.json({ success: true, products }))
    .catch(err => res.status(404).json({ success: false, message: "No products found" }));
});


// Get product by id
router.get("/products/:id", (req, res) => {
  Product.findById(req.params.id)
    .then(product => res.json({ success: true, product }))
    .catch(err => res.status(404).json({ success: false, message: "No product found with that ID" }));
});




// Get products by category
router.get("/category/:category", (req, res) => {
  Category.find({ cat_name: req.params.category })
    .populate({ path: "products", select: "-category" })
    .sort({ updatedAt: -1 })
    .then(products => res.json({ success: true, products: products[0].products }))
    .catch(err => res.status(404).json({ success: false, message: "No products found for this category" }));
});



//Get products by product name
router.get("/search/:prod_name", (req, res) => {
  Product.find({ prod_name: { $regex: req.params.prod_name, $options: "i" } })
    .populate("category")
    .sort({ updatedAt: -1 })
    .then(products => res.json({ success: true, products }))
    .catch(err => res.status(404).json({ success: false, message: "No products found by this name" }));
});


// Get categories
router.get("/category", (req, res) => {
  Category.find()
    .then(categories => res.json({ success: true, categories }))
    .catch(err => res.status(404).json({ success: false, message: "No categories found" }));
});



// Create category
router.post("/category", (req, res) => {
  const { errors, isValid } = validateCategoryInput(req.body);
  if (!isValid) return res.status(400).json({ success: false, message: errors.cat_name });
  Category.findOne({ cat_name: req.body.cat_name })
    .then(category => {
      if (category) {
        errors.cat_name = "Category already exists";
        return res.status(400).json({ success: false, message: errors.cat_name });
      } else {
        const newCategory = new Category(req.body);
        return newCategory.save().then(category => res.json({ success: true, category }));
      }
    })
    .catch(err => res.status(404).json({ success: false, message: "Could not create new category" }));
});




//Create product
router.post("/", multer({ storage: storage }).single("imageUrl"), (req, res) => {
  const { errors, isValid } = validateProductInput(req.body);
  if (!isValid) return res.status(400).json({ success: false, errors });
  // Constructing a url to the server
  const url = req.protocol + "://" + req.get("host");
  Category.findOne({ cat_name: req.body.category })
    .then(category => {
      if (!category) {
        const newCategory = new Category({ cat_name: req.body.category });
        return newCategory.save();
      } else return category;
    })
    .then(category => {
      const newProduct = new Product({
        prod_name: req.body.prod_name,
        price: req.body.price,
        model: req.body.model,
        brand: req.body.brand,
        quantity: req.body.quantity,
        productCode: req.body.productCode,
        imageUrl: url + "/images/" + req.file.filename,
        category: category._id
      });
      return newProduct.save();
    })
    .then(product => {
      Category.findById(product.category).then(category => {
        category.products.push(product._id);
        category.save().then(category => res.json({ success: true, product, category }));
      });
    })
    .catch(err => res.status(404).json({ success: false, message: "Could not create new product" }));
});



router.put('/update/:id',(req, res, next) => {
  Product.findByIdAndUpdate(req.params.id, {
  $set: req.body
}, (error, data) => {
  if (error) {
    return next(error);
    console.log(error)
  } else {
    res.json(data)
    console.log('Data updated successfully')
  }
})
})



// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndRemove(req.params.id);
    const category = await Category.findById(product.category);
    const removeIndex = category.products.indexOf(req.params.id);
    category.products.splice(removeIndex, 1);
    const updatedCategory = await category.save();
    res.json({ success: true, message:   " was deleted" });
  } catch {
    res.status(404).json({ success: false, message: "Failed to delete product" });
  }
});


// Delete category
router.delete("/delete/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndRemove(req.params.id); 
    res.json({ success: true, message:  "deleted" });
  } catch {
    res.status(404).json({ success: false, message: "Failed to delete " });
  }
});




module.exports = router;
