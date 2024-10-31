const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { 
        type: String,
         required: true
         },
    productId: { 
        type: String,
         required: true,
          unique: true
         },
    price: { type: Number,
         required: true
         },
    category: { 
        type: String,
         required: true
         },
    quantity:{
        type: Number,
        required:true,
    },
    imageUrl: { 
        type: String
     }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
