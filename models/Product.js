const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    prod_name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    brand: { type: String, required: true },
    productCode: { type: String, required: true },
    model: { type: String, required: true },
    imageUrl: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category" }

  },
  { timestamps: true }
);

module.exports = Product = mongoose.model("Product", productSchema);
