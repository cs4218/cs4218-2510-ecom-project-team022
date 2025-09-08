import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";

import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

export const fieldMessages = {
  NAME: 'Name is Required',
  DESCRIPTION: 'Description is Required',
  PRICE: 'Price is Required',
  CATEGORY: 'Category is Required',
  QUANTITY: 'Quantity is Required',
  PHOTO: 'Photo should be less then 1 MB'
}

export const successMessages = {
  // Zann - Admin View Products
  CREATE_PRODUCT: 'Product Created Successfully',
  DELETE_PRODUCT: 'Product Deleted Successfully',
  UPDATE_PRODUCT: 'Product Updated Successfully',

  // Krista - Product
  GET_PRODUCT: 'All Products Fetched Successfully',
  GET_SINGLE_PRODUCT: 'Single Product Fetched Successfully',
  PRODUCT_FILTER: 'Products Filtered Successfully',
  PRODUCT_COUNT: 'Products Counted Successfully.',
  PRODUCT_LIST: 'Products Listed Successfully',
  RELATED_PRODUCT: 'Related Products Fetched Successfully',
  PRODUCT_CATEGORY: 'Products Per Category Fetched Successfully',
}

export const errorMessages = {
  // Zann - Admin View Products
  CREATE_PRODUCT: 'Error Creating Product',
  DELETE_PRODUCT: 'Error Deleting Product',
  UPDATE_PRODUCT: 'Error Updating Product',

  // Krista - Product
  GET_PRODUCT: 'Error Fetching All Products',
  GET_SINGLE_PRODUCT: 'Error Fetching Single Product',
  PRODUCT_PHOTO: 'Error Fetching Product Photo',
  PRODUCT_FILTER: 'Error Filtering Products',
  PRODUCT_COUNT: 'Error Counting Products',
  PRODUCT_LIST: 'Error Listing Products',
  SEARCH_PRODUCT: 'Error In Search Product API',
  RELATED_PRODUCT: 'Error Fetching Related Products',
  PRODUCT_CATEGORY: 'Error Fetching Products Per Category',
}

// Payment Gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// Zann - Admin View Product
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //alidation
    switch (true) {
      case !name:
        return res.status(500).send({ error: fieldMessages.NAME });
      case !description:
        return res.status(500).send({ error: fieldMessages.DESCRIPTION });
      case !price:
        return res.status(500).send({ error: fieldMessages.PRICE });
      case !category:
        return res.status(500).send({ error: fieldMessages.CATEGORY });
      case !quantity:
        return res.status(500).send({ error: fieldMessages.QUANTITY });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: fieldMessages.PHOTO });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: successMessages.CREATE_PRODUCT,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: errorMessages.CREATE_PRODUCT,
    });
  }
};

// Krista - Product : Get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: successMessages.GET_PRODUCT,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: errorMessages.GET_PRODUCT,
      error: error.message,
    });
  }
};

// Krista - Product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: successMessages.GET_SINGLE_PRODUCT,
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: errorMessages.GET_SINGLE_PRODUCT,
      error,
    });
  }
};

// Krista - Product
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: errorMessages.PRODUCT_PHOTO,
      error,
    });
  }
};

// Zann - Admin View Product
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: successMessages.DELETE_PRODUCT,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: errorMessages.DELETE_PRODUCT,
      error,
    });
  }
};

// Zann - Admin View Product
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    // validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: fieldMessages.NAME });
      case !description:
        return res.status(500).send({ error: fieldMessages.DESCRIPTION });
      case !price:
        return res.status(500).send({ error: fieldMessages.PRICE });
      case !category:
        return res.status(500).send({ error: fieldMessages.CATEGORY });
      case !quantity:
        return res.status(500).send({ error: fieldMessages.QUANTITY });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: fieldMessages.PHOTO });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: successMessages.UPDATE_PRODUCT,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: errorMessages.UPDATE_PRODUCT,
    });
  }
};

// Krista - Product
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      message: successMessages.PRODUCT_FILTER,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: errorMessages.PRODUCT_FILTER,
      error,
    });
  }
};

// Krista - Product
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      message: successMessages.PRODUCT_COUNT,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: errorMessages.PRODUCT_COUNT,
      error,
    });
  }
};

// Krista - Product : Displays products per page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: successMessages.PRODUCT_LIST,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: errorMessages.PRODUCT_LIST,
      error,
    });
  }
};

// Krista - Product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: errorMessages.SEARCH_PRODUCT,
      error,
    });
  }
};

// Krista - Product
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      message: successMessages.RELATED_PRODUCT,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: errorMessages.RELATED_PRODUCT,
      error,
    });
  }
};

// Krista - Product : Get Product By Category
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      message: successMessages.PRODUCT_CATEGORY,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: errorMessages.PRODUCT_CATEGORY,
      error,
    });
  }
};

// Tzu Che - Payment : Payment Gateway API Token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// Tzu Che - Payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};