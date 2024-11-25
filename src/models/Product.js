import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true },
      category: {
        type: String,
        required: true,
        enum: [
          'PS5', 'Xbox', 'PS4', 'Nintendo', 'PC', 'Accessories', 'Games', 'Merchandise',
          'PC Gaming', 'Subscriptions', 'Streaming Equipment', 'Sales & Bundles'
        ]
      },
      stock: { type: Number, required: true },
      imageUrl: { type: String, required: true },
    },
    {
      timestamps: true,
    }
  );
  

const Product = mongoose.model('Product', productSchema);

export default Product;
