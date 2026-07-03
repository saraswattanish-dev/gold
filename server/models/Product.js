import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Please add a unique SKU code'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a product description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Coins', 'Pendants', 'Others']
  },
  purity: {
    type: String,
    required: [true, 'Please select gold purity'],
    enum: ['18K', '22K', '24K']
  },
  weight: {
    type: Number,
    required: [true, 'Please enter weight in grams'],
    min: 0.01
  },
  images: [{
    type: String,
    required: [true, 'Please add at least one product image URL or path']
  }],
  stock: {
    type: Number,
    required: [true, 'Please enter quantity in stock'],
    min: 0,
    default: 10
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
