import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

export const fieldMessages = {
  NAME: 'Name is Required',
}

export const successMessages = {
  // Zann - Admin Actions
  CREATE_CATEGORY: 'New Category Created Successfully',
  DELETE_CATEGORY: 'Category Deleted Successfully',
  UPDATE_CATEGORY: 'Category Updated Successfully',
  DUPLICATE_CATEGORY: 'Category Already Exist',

  // Yijing - Category
  GET_ALL_CATEGORIES: 'Get All Categories List Successfully',
  GET_SINGLE_CATEGORY: 'Get Single Category Successfully',
}

export const errorMessages = {
  // Zann - Admin Actions
  CREATE_CATEGORY: 'Error While Creating New Category',
  DELETE_CATEGORY: 'Error While Deleting Category',
  UPDATE_CATEGORY: 'Error While Updating Category',

  // Yijing - Category
  GET_ALL_CATEGORIES: 'Error While Getting All Categories List',
  GET_SINGLE_CATEGORY: 'Error While Getting Single Category',
}

  // Zann - Admin Actions
export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({ message: fieldMessages.NAME });
    }
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: true,
        message: successMessages.DUPLICATE_CATEGORY,
      });
    }
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      success: true,
      message: successMessages.CREATE_CATEGORY,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      errror,
      message: errorMessages.CREATE_CATEGORY,
    });
  }
};

  // Zann - Admin Actions
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    res.status(200).send({
      success: true,
      messsage: successMessages.UPDATE_CATEGORY,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: errorMessages.UPDATE_CATEGORY,
    });
  }
};

// Yijing - Category - get all categories
export const categoryControlller = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: successMessages.GET_ALL_CATEGORIES,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: errorMessages.GET_ALL_CATEGORIES,
    });
  }
};

// Yijing - Category
export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: successMessages.GET_SINGLE_CATEGORY,
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: errorMessages.GET_SINGLE_CATEGORY,
    });
  }
};

  // Zann - Admin Actions
export const deleteCategoryCOntroller = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: successMessages.DELETE_CATEGORY,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: errorMessages.DELETE_CATEGORY,
      error,
    });
  }
};