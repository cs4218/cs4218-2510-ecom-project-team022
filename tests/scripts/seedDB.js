// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import User from "../../models/userModel.js";
// import Product from "../../models/productModel.js"; 
// import Category from "../../models/categoryModel.js";
// import { hashPassword } from "../../helpers/authHelper.js";


// dotenv.config();

// async function seed() {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);

//     // ---------- Seed Users ---------
//     const adminExists = await User.findOne({ email: "admin@gmail.com" });
//     if (!adminExists) {
//       const admin = new User({
//         name: "admin",
//         email: "admin@gmail.com",
//         password: await hashPassword("password"),
//         role: 1,
//       });
//       await admin.save();
//     }

//     const userExists = await User.findOne({ email: "user@gmail.com" });
//     if (!userExists) {
//       const user = new User({
//         name: "user",
//         email: "user@gmail.com",
//         password: await hashPassword("password"),
//       });
//       await user.save();
//     }

//     // ----- Seed Categories -----
//     const categoriesData = ["Books", "Electronics", "Clothing"];
//     const categories = {};

//     for (const name of categoriesData) {
//       let cat = await Category.findOne({ name });
//       if (!cat) {
//         cat = new Category({ name });
//         await cat.save();
//       }
//       categories[name] = cat._id; // save ObjectId for products
//     }

//     // ----- Seed Products -----
//     const products = [
//       { name: "Book A", price: 10, description: "A great book", slug: "book-a", quantity: 50, category: categories["Books"] },
//       { name: "Book B", price: 15, description: "Another great book", slug: "book-b", quantity: 30, category: categories["Books"] },
//       { name: "Laptop 1", price: 1000, description: "Good laptop", slug: "laptop-1", quantity: 10, category: categories["Electronics"] },
//       { name: "T-Shirt", price: 5, description: "Plain T-Shirt", slug: "tshirt-1", quantity: 100, category: categories["Clothing"] },
//     ];


//     for (const p of products) {
//       const exists = await Product.findOne({ slug: p.slug });
//       if (!exists) {
//         const product = new Product(p);
//         await product.save();
//       }
//     }

//     console.log("Seeding complete");
//     await mongoose.disconnect();
//     process.exit(0); // ensure script exits
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// }

// seed();
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../../models/userModel.js";
import Product from "../../models/productModel.js"; 
import Category from "../../models/categoryModel.js";
import { hashPassword } from "../../helpers/authHelper.js";

dotenv.config();

export default async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected for seeding");

    // ---------- Seed Users ---------
    const adminExists = await User.findOne({ email: "admin@gmail.com" });
    if (!adminExists) {
      const admin = new User({
        name: "admin",
        email: "admin@gmail.com",
        password: await hashPassword("password"),
        role: 1,
      });
      await admin.save();
    }

    const userExists = await User.findOne({ email: "user@gmail.com" });
    if (!userExists) {
      const user = new User({
        name: "user",
        email: "user@gmail.com",
        password: await hashPassword("password"),
      });
      await user.save();
    }

    // ----- Seed Categories -----
    const categoriesData = ["Books", "Electronics", "Clothing"];
    const categories = {};

    for (const name of categoriesData) {
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = new Category({ name });
        await cat.save();
      }
      categories[name] = cat._id;
    }

    // ----- Seed Products -----
    const products = [
      { name: "Book A", price: 10, description: "A great book", slug: "book-a", quantity: 50, category: categories["Books"] },
      { name: "Book B", price: 15, description: "Another great book", slug: "book-b", quantity: 30, category: categories["Books"] },
      { name: "Laptop 1", price: 1000, description: "Good laptop", slug: "laptop-1", quantity: 10, category: categories["Electronics"] },
      { name: "T-Shirt", price: 5, description: "Plain T-Shirt", slug: "tshirt-1", quantity: 100, category: categories["Clothing"] },
    ];

    for (const p of products) {
      const exists = await Product.findOne({ slug: p.slug });
      if (!exists) {
        const product = new Product(p);
        await product.save();
      }
    }

    console.log("Seeding complete");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Seeding failed:", err);
    await mongoose.disconnect();
    throw err;
  }
}
