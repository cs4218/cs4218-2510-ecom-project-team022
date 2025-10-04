/** @jest-environment node */
import mongoose from "mongoose";
import Category from "./categoryModel.js";

describe("Category Model", () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should define the correct schema fields", () => {
    const schemaPaths = Category.schema.paths;

    expect(schemaPaths.name).toBeDefined();
    expect(schemaPaths.name.instance).toBe("String");

    expect(schemaPaths.slug).toBeDefined();
    expect(schemaPaths.slug.instance).toBe("String");
    expect(schemaPaths.slug.options.lowercase).toBe(true);
  });

  it("should create a Category document correctly", () => {
    const category = new Category({
      name: "Electronics",
      slug: "ELECTRONICS",
    });

    // Name remains as provided
    expect(category.name).toBe("Electronics");

    // Slug is automatically lowercased by Mongoose
    expect(category.slug).toBe("electronics");
  });

  it("should be a valid Mongoose model", () => {
    expect(Category.modelName).toBe("Category");
    expect(Category.prototype instanceof mongoose.Model).toBe(true);
  });
});
