import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();


// const __dirname = path.dirname(new URL(import.meta.url).pathname);


const uploadsDir = path.join(process.cwd(), 'uploads');


app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));



connectDB();


app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);




app.get('/', (req, res) => {
  res.send('Welcome to the eCommerce API');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
