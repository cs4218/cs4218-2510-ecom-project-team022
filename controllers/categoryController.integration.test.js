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