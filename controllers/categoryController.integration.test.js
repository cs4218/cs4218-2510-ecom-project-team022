import * as categoryControllers from './categoryController.js';
import categoryModel from "../models/categoryModel.js";
import {MongoMemoryServer} from 'mongodb-memory-server';
import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/v1/category/create-category', categoryControllers.createCategoryController);
app.put('/api/v1/category/update-category/:id', categoryControllers.updateCategoryController);
app.delete('/api/v1/category/delete-category/:id', categoryControllers.deleteCategoryController);
app.get('/api/v1/category/get-categories', categoryControllers.categoryControlller); // Get all categories
app.get('/api/v1/category/get-category/:slug', categoryControllers.singleCategoryController); // Get single category by slug

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await categoryModel.deleteMany({});
});

describe('createCategoryController, updateCategoryController, deleteCategoryController', () => {
    test('successfully create category' , async () => {
        const res = await request(app).post('/api/v1/category/create-category').send({ name: 'CategoryA' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', categoryControllers.successMessages.CREATE_CATEGORY);
        expect(res.body.category).toHaveProperty('name','CategoryA');
        expect(res.body.category).toHaveProperty('slug', 'categorya');
    
        const find = await categoryModel.findOne({name: 'CategoryA'});
        expect(find).not.toBeNull();
    });

    test('successfully update category' , async () => {
        const category = await categoryModel.create({ name: 'CategoryA', slug: 'categorya' });
        const res = await request(app).put(`/api/v1/category/update-category/${category._id}`).send({ name: 'CategoryB' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', categoryControllers.successMessages.UPDATE_CATEGORY);
        expect(res.body.category).toHaveProperty('name','CategoryB');
        expect(res.body.category).toHaveProperty('slug', 'categoryb');
    
        const findA = await categoryModel.findOne({name: 'CategoryA'});
        expect(findA).toBeNull();
        const findB = await categoryModel.findOne({name: 'CategoryB'});
        expect(findB).not.toBeNull();
    });


    test('successfully delete category' , async () => {
        const category = await categoryModel.create({ name: 'CategoryA', slug: 'categorya' });
        const res = await request(app).delete(`/api/v1/category/delete-category/${category._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', categoryControllers.successMessages.DELETE_CATEGORY);
    
        const find = await categoryModel.findOne({name: 'CategoryA'});
        expect(find).toBeNull();
    });
});

describe('getAllCategoriesController, singleCategoryController', () => {

  test('successfully get all categories', async () => {
    // Seed the DB with multiple categories
    await categoryModel.create([
      { name: 'CategoryA', slug: 'categorya' },
      { name: 'CategoryB', slug: 'categoryb' },
    ]);

    const res = await request(app).get('/api/v1/category/get-categories');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', categoryControllers.successMessages.GET_ALL_CATEGORIES);
    expect(res.body.category).toHaveLength(2);

    const names = res.body.category.map(c => c.name);
    expect(names).toContain('CategoryA');
    expect(names).toContain('CategoryB');
  });

  test('successfully get single category by slug', async () => {
    const category = await categoryModel.create({ name: 'CategoryA', slug: 'categorya' });

    const res = await request(app).get(`/api/v1/category/get-category/${category.slug}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', categoryControllers.successMessages.GET_SINGLE_CATEGORY);
    expect(res.body.category).toHaveProperty('name', 'CategoryA');
    expect(res.body.category).toHaveProperty('slug', 'categorya');
  });

    test('getAllCategoriesController returns 500 if server error occurs', async () => {
    // Mock find to throw an error
    jest.spyOn(categoryModel, 'find').mockRejectedValueOnce(new Error('Database failure'));

    const res = await request(app).get('/api/v1/category/get-categories');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(categoryControllers.errorMessages.GET_ALL_CATEGORIES);
    expect(res.body).not.toHaveProperty('category'); // no category field returned
  });
  
  // Non-existent slug → still returns 200 with null category
  test('returns 200 with null category if slug not found', async () => {
    const res = await request(app).get('/api/v1/category/get-category/nonexistent-slug');

    expect(res.statusCode).toBe(200);       
    expect(res.body.success).toBe(true);    
    expect(res.body.category).toBeNull();   
    expect(res.body.message).toBe(categoryControllers.successMessages.GET_SINGLE_CATEGORY);
  });

  // Server error → simulate a failure in the controller
  test('returns 500 if server error occurs', async () => {
    // Temporarily mock the findOne method to throw an error
    const mockError = new Error('Database failure');
    jest.spyOn(categoryModel, 'findOne').mockRejectedValueOnce(mockError);

    const res = await request(app).get('/api/v1/category/get-category/categorya');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(categoryControllers.errorMessages.GET_SINGLE_CATEGORY);
  });
});