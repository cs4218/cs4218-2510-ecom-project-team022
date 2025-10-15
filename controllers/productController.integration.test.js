import * as productControllers from "./productController";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import {MongoMemoryServer} from 'mongodb-memory-server';
import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import formidable from 'express-formidable';

const app = express();
app.use(express.json());
//used formidable as advised by AI to ensure multipart/form-data are correctly parsed
app.use(formidable());
app.post('/api/v1/product/create-product', productControllers.createProductController);
app.put('/api/v1/product/update-product/:pid', productControllers.updateProductController);
app.delete('/api/v1/product/delete-product/:pid', productControllers.deleteProductController);

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
    await productModel.deleteMany({});
});

describe('createProductController, updateProductController, deleteProductController', () => {
    test('successfully create product' , async () => {
        const category = await categoryModel.create({ name: 'CategoryA', slug: 'categorya' });
        const res = await request(app).post('/api/v1/product/create-product')
        .field('name','ProductA')
        .field('description','descriptionA')
        .field('price',20)
        .field('category', category._id.toString())
        .field('quantity',10);
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', productControllers.successMessages.CREATE_PRODUCT);
        expect(res.body.products).toHaveProperty('name','ProductA');
    
        const find = await productModel.findOne({name: 'ProductA'});
        expect(find).not.toBeNull();
    });

    test('successfully update product' , async () => {
        const category = await categoryModel.create({ name: 'CategoryA', slug: 'categorya' });
        const product = await productModel.create({ name: 'ProductA', description: 'descriptionA', price: 20, category: category._id, quantity: 10, slug: 'producta' });
        const res = await request(app).put(`/api/v1/product/update-product/${product._id}`)
        .field('name','ProductB')
        .field('description','descriptionB')
        .field('price',10)
        .field('category', category._id.toString())
        .field('quantity',20);
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', productControllers.successMessages.UPDATE_PRODUCT);
        expect(res.body.products).toHaveProperty('name','ProductB');
    
        const findB = await productModel.findOne({name: 'ProductB'});
        expect(findB).not.toBeNull();
        const find = await productModel.findOne({name: 'ProductA'});
        expect(find).toBeNull();
    });

    test('successfully delete product' , async () => {
        const category = await categoryModel.create({ name: 'CategoryA', slug: 'categorya' });
        const product = await productModel.create({ name: 'ProductA', description: 'descriptionA', price: 20, category: category._id, quantity: 10, slug: 'producta' });
        const res = await request(app).delete(`/api/v1/product/delete-product/${product._id}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message', productControllers.successMessages.DELETE_PRODUCT);
    
        const find = await productModel.findOne({name: 'ProductA'});
        expect(find).toBeNull();
    });
});