import * as categoryControllers from './categoryController.js';
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
console.log(categoryControllers);

jest.mock('../models/categoryModel', () => {
  const mockQueryChain = {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  };

  const MockCategoryModel = jest.fn().mockImplementation((fields) => ({
    ...fields,
    slug: fields.name && 'slugA',
    save: jest.fn().mockResolvedValue({_id: '123456', name: 'A', slug: 'slugA'}),
  }));

  // Mock methods that return a query chain
  MockCategoryModel.find = jest.fn(() => mockQueryChain);
  MockCategoryModel.findOne = jest.fn(() => mockQueryChain);
  MockCategoryModel.findById = jest.fn(() => mockQueryChain);

  // Mock methods that return a promise directly
  MockCategoryModel.findByIdAndDelete = jest.fn().mockResolvedValue({});
  MockCategoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});
  MockCategoryModel.estimatedDocumentCount = jest.fn().mockResolvedValue(0);

  // Mock the save method for creating new documents
  MockCategoryModel.save = jest.fn().mockResolvedValue({});

  return MockCategoryModel;
});

jest.mock('../models/orderModel', () => ({
  save: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock('slugify');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

// Zann - createCategoryController 
describe('createCategoryController', () => {
  let req;
  let res;
  beforeEach(() => {
    res = mockResponse();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.clearAllMocks();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

    test('return error when name missing', async () => {
        const req = {body: {}};

        await categoryControllers.createCategoryController(req, res);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send.mock.calls[0][0].message).toBe(categoryControllers.fieldMessages.NAME);
    });
  
    test('successfully create category', async () => {
        const req = {
            body: {name: 'A'}, 
            params: {id: '123456'}
        };
        const mockCategory = { _id: '123456', name: 'A', slug: 'slugA' }
        categoryModel.findOne.mockResolvedValue(null);
        slugify.mockReturnValue('slugA');
        
        await categoryControllers.createCategoryController(req, res);
        
        expect(slugify).toHaveBeenCalledWith(req.body.name);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
            success: true,
            message: categoryControllers.successMessages.CREATE_CATEGORY,
            category: mockCategory
            })
        );
    });
    
  test('successfully create category - duplicate category', async () => {
    const req = {
      body: {name: 'A'}, 
      params: {id: '123456'}
    };
    const exisitingCategory = { _id: '123456', name: 'A', slug: 'slugA' }
    categoryModel.findOne.mockResolvedValue(exisitingCategory);
    
    await categoryControllers.createCategoryController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
     expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: categoryControllers.successMessages.DUPLICATE_CATEGORY,
        })
      );
    });

  test("handle error properly", async () => {
      const errorMessage = "There's an error";
      const mockError = new Error(errorMessage);
      categoryModel.findOne.mockRejectedValue(mockError);
      const req = {
        body: {name: 'A'}, 
        params: {id: '123456'}
     };
  
      await categoryControllers.createCategoryController(req, res); 
      
      expect(logSpy).toHaveBeenCalled();
      expect(logSpy.mock.calls[0][0].message).toBe(errorMessage);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
          success: false,
          error: mockError,
          message: categoryControllers.errorMessages.CREATE_CATEGORY,
        });
    });
});

// Zann - updateCategoryController 
describe('updateCategoryController', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {params: {id: '123456'}};
    res = mockResponse();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.clearAllMocks();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });
  
  test('successfully update category', async () => {
    const req = {
      body: {name: 'A'}, 
      params: {id: '123456'}
    };
    const mockCategory = {
        _id: req.params.id,
        name: req.body.name, 
        slug: 'slugA',
    };
    categoryModel.findByIdAndUpdate.mockResolvedValue(mockCategory);
    
    await categoryControllers.updateCategoryController(req, res);
    
    expect(slugify).toHaveBeenCalledWith(req.body.name);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: categoryControllers.successMessages.UPDATE_CATEGORY,
        category: mockCategory
        })
      );
    });

  test('handle error properly', async () => {
    const req = {
      body: {name: 'A'}, 
      params: {id: '123456'}
    };

    const errorMessage = "There's an error";
    const mockError = new Error(errorMessage);
    categoryModel.findByIdAndUpdate.mockRejectedValueOnce(mockError);

    await categoryControllers.updateCategoryController(req, res);
    
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy.mock.calls[0][0].message).toBe(errorMessage);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: mockError,
        message: categoryControllers.errorMessages.UPDATE_CATEGORY,
        })
      );
    });
});

// Yijing - categoryControlller

// Yijing - singleCategoryController

// Zann - deleteCategoryController
describe('deleteCategoryController', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {params: {id: '123456'}};
    res = mockResponse();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.clearAllMocks();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test('successfully delete category', async () => {
    categoryModel.findByIdAndDelete.mockReturnValue({
      select: jest.fn().mockResolvedValue({_id: '123456'}),
    });

    await categoryControllers.deleteCategoryController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: categoryControllers.successMessages.DELETE_CATEGORY,
        })
      );
    });

  test('handle error properly', async () => {
    const errorMessage = "There's an error";
    const mockError = new Error(errorMessage);
    categoryModel.findByIdAndDelete.mockRejectedValueOnce(mockError);

    await categoryControllers.deleteCategoryController(req, res);
    
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy.mock.calls[0][0].message).toBe(errorMessage);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: categoryControllers.errorMessages.DELETE_CATEGORY,
        error: mockError,
        })
      );
    });
});