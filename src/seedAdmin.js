import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    const adminEmail = 'jafferkimitei@gmail.com'; 
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: bcrypt.hashSync('admin123', 10),
        isAdmin: true, 
      });

      await adminUser.save();
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists!');
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
