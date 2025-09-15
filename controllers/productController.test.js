import * as productControllers from './productController';
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from 'fs';
import slugify from 'slugify';
import braintree from "braintree";

jest.mock('../models/productModel', () => {
  const mockQueryChain = {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  };

  return {
    // Mock methods that return a query chain
    find: jest.fn(() => mockQueryChain),
    findOne: jest.fn(() => mockQueryChain),
    findById: jest.fn(() => mockQueryChain),
    
    // Mock methods that return a promise directly
    findByIdAndDelete: jest.fn().mockResolvedValue({}),
    findByIdAndUpdate: jest.fn().mockResolvedValue({}),
    estimatedDocumentCount: jest.fn().mockResolvedValue(0),
    
    // Mock the save method for creating new documents
    save: jest.fn().mockResolvedValue({}),
  };
});
jest.mock('../models/categoryModel', () => ({
  findOne: jest.fn().mockReturnThis(),
}));
jest.mock('../models/orderModel', () => ({
  save: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock('fs');
jest.mock('slugify');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock('braintree', () => ({
  BraintreeGateway: jest.fn(() => ({
    clientToken: {
      generate: jest.fn(() => ({})),
    },
    transaction: {
      sale: jest.fn(() => ({})),
    },
  })),
  Environment: {
    Sandbox: {},
  },
}));

/* ---------- ZANN : ADMIN VIEW PRODUCT ---------- */

// createProductController

// deleteProductController

// updateProductController


/* ---------- KRISTA : PRODUCT ---------- */

// getProductController
describe('getProductController', () => {
  let res;
  beforeEach(() => {
    res = mockResponse();
  });

  test('Success: return product list with status 200', async () => {
    const mockProducts = [{ name: 'Product A' }, { name: 'Product B' }];
    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    const req = {};
    await productControllers.getProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        counTotal: mockProducts.length,
        message: productControllers.successMessages.GET_PRODUCT,
        products: mockProducts,
      })
    );
  });

  test('Failure: return status 500 with error message', async () => {
    const mockError = new Error('Database connection failed');
    productModel.find.mockImplementation(() => {
      throw mockError;
    });

    const req = {};
    await productControllers.getProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: productControllers.errorMessages.GET_PRODUCT,
        error: mockError,
      })
    );
  });
});

// getSingleProductController
describe('getSingleProductController', () => {
  let res;
  beforeEach(() => {
    res = mockResponse();
  });

  test('Success: return single product with status 200', async () => {
    const mockProduct = { name: 'Test Product', slug: 'test-product' };
    productModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProduct),
    });

    const req = { params: { slug: 'test-product' } };
    await productControllers.getSingleProductController(req, res);

    expect(productModel.findOne).toHaveBeenCalledWith({ slug: req.params.slug });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: productControllers.successMessages.GET_SINGLE_PRODUCT,
        product: mockProduct,
      })
    );
  });

  test('Failure: return status 500 with error message', async () => {
    const mockError = new Error('Database connection failed');
    productModel.findOne.mockImplementation(() => {
      throw mockError;
    });

    const req = { params: { slug: 'invalid-slug' } };
    await productControllers.getSingleProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: productControllers.errorMessages.GET_SINGLE_PRODUCT,
        error: mockError,
      })
    );
  });
});

// productPhotoController
describe('productPhotoController', () => {
  let res;
  beforeEach(() => {
    res = mockResponse();
  });

  test('Success: return a product photo with status 200', async () => {
    const mockPhotoData = Buffer.from('mock photo data');
    const mockProduct = { photo: { data: mockPhotoData, contentType: 'image/jpeg' } };
    productModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockProduct)
    });

    const req = { params: { pid: '12345' } };
    await productControllers.productPhotoController(req, res);

    expect(productModel.findById).toHaveBeenCalledWith('12345');
    expect(res.set).toHaveBeenCalledWith('Content-type', 'image/jpeg');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockPhotoData);
  });

  test('Failure: return status 500 with error message', async () => {
    const mockError = new Error('Database connection failed');
    productModel.findById.mockImplementation(() => {
      throw mockError;
    });

    const req = { params: { pid: 'invalid-id' } };
    await productControllers.productPhotoController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: productControllers.errorMessages.PRODUCT_PHOTO,
        error: mockError,
      })
    );
  });
});

// productFiltersController
describe('productFiltersController', () => {
  let req, res;
  const mockRequest = (body = {}) => ({
    body,
  });
  beforeEach(() => {
    res = mockResponse();
  });

  test('Success: filter products by price range, return status 200', async () => {
    const mockProducts = [{ name: 'Expensive Watch' }];
    productModel.find.mockResolvedValue(mockProducts);

    req = mockRequest({ checked: [], radio: [500, 1000] });
    await productControllers.productFiltersController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      price: { $gte: 500, $lte: 1000 },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        products: mockProducts ,
        message: productControllers.successMessages.PRODUCT_FILTER,
      }),
    );
  });

  test('Failure: return status 500 with error message', async () => {
    const mockError = new Error('Database find operation failed');
    productModel.find.mockImplementation(() => {
      throw mockError;
    });

    req = mockRequest({ checked: ['123'], radio: [] });
    await productControllers.productFiltersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: productControllers.errorMessages.PRODUCT_FILTER,
        error: mockError,
      }),
    );
  });
});

// productCountController
describe('productCountController', () => {
  let res;
  beforeEach(() => {
    res = mockResponse();
  });

  test('Success: return total product count with status 200', async () => {
    const mockTotal = 15;
    productModel.find.mockReturnValue({
      estimatedDocumentCount: jest.fn().mockResolvedValue(mockTotal),
    });

    const req = {};
    await productControllers.productCountController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        total: mockTotal,
        message: productControllers.successMessages.PRODUCT_COUNT,
      }),
    );
  });

  test('Failure: return status 400 with error message', async () => {
    const mockError = new Error('Database count failed');
    productModel.find.mockReturnValue({
      estimatedDocumentCount: jest.fn().mockImplementation(() => {
        throw mockError;
      }),
    });

    const req = {};
    await productControllers.productCountController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: productControllers.errorMessages.PRODUCT_COUNT,
        error: mockError,
      }),
    );
  });
});

// productListController
describe('productListController', () => {
  let req, res;
  const mockRequest = (params = {}) => ({
    params,
  });
  beforeEach(() => {
    res = mockResponse();
  });

  test('Success: return page 1 products with status 200', async () => {
    const mockProducts = [{ name: 'Product 1' }, { name: 'Product 2' }];
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    });

    req = mockRequest({ page: 1 });
    await productControllers.productListController(req, res);

    expect(productModel.find().skip).toHaveBeenCalledWith(0);
    expect(productModel.find().limit).toHaveBeenCalledWith(6);
    expect(productModel.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        products: mockProducts,
      }),
    );
  });

  test('Success: return page 3 products with status 200', async () => {
    const mockProducts = [{ name: 'Product 13' }];
    const mockFind = productModel.find(); 
    mockFind.sort.mockResolvedValue(mockProducts);

    req = mockRequest({ page: 3 });
    await productControllers.productListController(req, res);
    expect(req.params.page).toBe(3);

    expect(mockFind.skip).toHaveBeenCalledWith((3 - 1) * 6);
    expect(mockFind.limit).toHaveBeenCalledWith(6);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        products: mockProducts,
      }),
    );
  });

  test('Failure: return status 400 with error message', async () => {
    const mockError = new Error('Database list failed');
    productModel.find.mockImplementation(() => {
      throw mockError;
    });

    req = mockRequest({ params: { page: 1 } });
    await productControllers.productListController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: productControllers.errorMessages.PRODUCT_LIST,
        error: mockError,
      }),
    );
  });
});

// searchProductController
describe('searchProductController', () => {
  let req, res;
  const mockRequest = (keyword) => ({
    params: { keyword },
  });
  beforeEach(() => {
    res = mockResponse();
  });

  test('Success: return a products matching keyword', async () => {
    const mockProducts = [{ name: 'Laptop' }, { name: 'Wireless Mouse' }];
    const mockFindChain = {
      select: jest.fn().mockResolvedValue(mockProducts),
    };
    productModel.find.mockReturnValue(mockFindChain);
  
    req = mockRequest('lap');
    await productControllers.searchProductController(req, res);
  
    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: 'lap', $options: 'i' } },
        { description: { $regex: 'lap', $options: 'i' } },
      ],
    });
    expect(mockFindChain.select).toHaveBeenCalledWith('-photo');
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });

  test('Failure: return status 400 with error message', async () => {
    const mockError = new Error('Database search failed');
    productModel.find.mockImplementation(() => {
      throw mockError;
    });
  
    req = mockRequest('invalid-keyword');
    await productControllers.searchProductController(req, res);
  
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: productControllers.errorMessages.SEARCH_PRODUCT,
        error: mockError,
      }),
    );
  });
});

// relatedProductController
describe('relatedProductController', () => {
  let req, res;
  const mockRequest = (pid, cid) => ({
    params: { pid, cid },
  });
  beforeEach(() => {
    res = mockResponse();
  });

  test('Success: return related products with status 200', async () => {
    const mockProducts = [
      { name: 'Related Product 1', category: '456' },
      { name: 'Related Product 2', category: '456' },
    ];
    const mockFindChain = {
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProducts),
    };
    productModel.find.mockReturnValue(mockFindChain);
  
    req = mockRequest('123', '456');
    await productControllers.relatedProductController(req, res);
  
    expect(productModel.find).toHaveBeenCalledWith({
      category: '456',
      _id: { $ne: '123' },
    });
    expect(mockFindChain.select).toHaveBeenCalledWith('-photo');
    expect(mockFindChain.limit).toHaveBeenCalledWith(3);
    expect(mockFindChain.populate).toHaveBeenCalledWith('category');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: productControllers.successMessages.RELATED_PRODUCT,
        products: mockProducts,
      }),
    );
  });

  test('Failure: return status 400 with error message', async () => {
    const mockError = new Error('Database query failed');
    productModel.find.mockImplementation(() => {
      throw mockError;
    });
  
    req = mockRequest('invalid-pid', 'invalid-cid');
    await productControllers.relatedProductController(req, res);
  
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: productControllers.errorMessages.RELATED_PRODUCT,
        error: mockError,
      }),
    );
  });
});

// productCategoryController
describe('productCategoryController', () => {
  let req, res;
  const mockRequest = (slug) => ({
    params: { slug },
  });
  beforeEach(() => {
    res = mockResponse();
  });

  test('Success: return products by category with status 200', async () => {
    const mockCategory = { _id: '123', name: 'Electronics', slug: 'electronics' };
    const mockProducts = [{ name: 'Laptop', category: mockCategory }, { name: 'Phone', category: mockCategory }];
    const mockFindChain = {
      populate: jest.fn().mockResolvedValue(mockProducts),
    };
    productModel.find.mockReturnValue(mockFindChain);
    categoryModel.findOne.mockResolvedValue(mockCategory);
  
    const req = { params: { slug: 'electronics' } };
    const res = mockResponse();
    await productControllers.productCategoryController(req, res);
  
    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'electronics' });
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
    expect(mockFindChain.populate).toHaveBeenCalledWith('category');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: productControllers.successMessages.PRODUCT_CATEGORY,
        category: mockCategory,
        products: mockProducts,
      }),
    );
  });

  test('Failure: return status 400 with error message', async () => {
    const mockError = new Error('Category find failed');
    categoryModel.findOne.mockImplementation(() => {
      throw mockError;
    });
  
    const req = mockRequest('invalid-slug');
    await productControllers.productCategoryController(req, res);
  
    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: 'invalid-slug' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: productControllers.errorMessages.PRODUCT_CATEGORY,
        error: mockError,
      }),
    );
  });
});

/* ---------- TZU CHE : PAYMENT GATEWAY ---------- */

// braintreeTokenController

// brainTreePaymentController

