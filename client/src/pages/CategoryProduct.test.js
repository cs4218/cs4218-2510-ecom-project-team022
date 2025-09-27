import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CategoryProduct from './CategoryProduct';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/cart';
import toast from 'react-hot-toast';

const setCartMock = jest.fn();
const mockInitialCart = [];
jest.mock('../context/cart', () => ({
  useCart: jest.fn(),
}));
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
}));
const localStorageSetItemSpy = jest.spyOn(window.localStorage.__proto__, 'setItem');

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('axios');

jest.mock('../components/Layout', () => ({ children }) => <div>{children}</div>);

const setTotalMock = jest.fn();
const setPageMock = jest.fn();
const setLoadingMock = jest.fn();

jest.spyOn(React, 'useState')
  .mockImplementationOnce(initialState => [initialState, jest.fn()]) // products
  .mockImplementationOnce(initialState => [initialState, jest.fn()]) // category
  .mockImplementationOnce(() => useCart()) // cart - handled by useCart mock
  .mockImplementationOnce(initialState => [initialState, setTotalMock]) // total
  .mockImplementationOnce(initialState => [initialState, setPageMock]) // page
  .mockImplementationOnce(initialState => [initialState, setLoadingMock]); // loading

const MOCK_SLUG = 'tech-gadgets-slug';
const MOCK_CATEGORY = { name: 'Tech Gadgets' };
const MOCK_PRODUCTS = [
  { _id: 'p1', slug: 'item-one', name: 'Item One', price: 100, description: 'Desc 1 for testing' },
  { _id: 'p2', slug: 'item-two', name: 'Item Two', price: 200, description: 'Desc 2 for testing' },
];
const MOCK_TOTAL_COUNT = 5;

const setupMocks = (products, total, category) => {
  axios.get.mockResolvedValue({
    data: {
      products,
      total,
      category,
    },
  });

  useParams.mockReturnValue({ slug: MOCK_SLUG });
};

describe('CategoryProduct', () => {
  let navigateMock;

  beforeEach(() => {
    axios.get.mockClear();
    setCartMock.mockClear();
    toast.success.mockClear();
    localStorageSetItemSpy.mockClear();
    setPageMock.mockClear();
    
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);
    useCart.mockReturnValue([mockInitialCart, setCartMock]);
  });

  test('should fetch and display category title and product list on mount', async () => {
    setupMocks(MOCK_PRODUCTS, MOCK_TOTAL_COUNT, MOCK_CATEGORY);

    render(<CategoryProduct />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/product-category/${MOCK_SLUG}`);
      expect(screen.getByText(`Category - ${MOCK_CATEGORY.name}`)).toBeInTheDocument(); 
    });

    expect(screen.getByText(`${MOCK_PRODUCTS.length} result found`)).toBeInTheDocument();
    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  test('should navigate to product details when "More Details" is clicked', async () => {
    setupMocks(MOCK_PRODUCTS, MOCK_TOTAL_COUNT, MOCK_CATEGORY);
    render(<CategoryProduct />);

    await waitFor(() => {
      expect(screen.getAllByText('More Details')).toHaveLength(MOCK_PRODUCTS.length);
    });

    const moreDetailsButtons = screen.getAllByText('More Details');
    userEvent.click(moreDetailsButtons[1]);

    expect(navigateMock).toHaveBeenCalledWith(`/product/${MOCK_PRODUCTS[1].slug}`);
  });

  test('should add product to cart and show toast when "ADD TO CART" is clicked', async () => {
    setupMocks(MOCK_PRODUCTS, MOCK_TOTAL_COUNT, MOCK_CATEGORY);
    render(<CategoryProduct />);

    await waitFor(() => {
      expect(screen.getAllByText('ADD TO CART')).toHaveLength(MOCK_PRODUCTS.length);
    });

    const addToCartButtons = screen.getAllByText('ADD TO CART');
    const productToAdd = MOCK_PRODUCTS[0];
    userEvent.click(addToCartButtons[0]);

    expect(setCartMock).toHaveBeenCalledWith([productToAdd]);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([productToAdd])
    );
    expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
  });
  
//   test('should display "Load More" button when current products count is less than total', async () => {
//     setupMocks(MOCK_PRODUCTS, MOCK_TOTAL_COUNT, MOCK_CATEGORY);
//     setTotalMock(MOCK_TOTAL_COUNT); 
    
//     render(<CategoryProduct />);

//     await waitFor(() => {
//         expect(screen.getByText('Item One')).toBeInTheDocument();
//     });
    
//     expect(screen.getByRole('button', { name: 'Load More' })).toBeInTheDocument();
//   });
  
//   test('should NOT display "Load More" button when current products count equals total', async () => {
//     setupMocks(MOCK_PRODUCTS, MOCK_PRODUCTS.length, MOCK_CATEGORY);
//     setTotalMock(MOCK_PRODUCTS.length);

//     render(<CategoryProduct />);

//     await waitFor(() => {
//         expect(screen.getByText('Item One')).toBeInTheDocument();
//     });
//     expect(screen.queryByRole('button', { name: 'Load More' })).not.toBeInTheDocument();
//   });

//   test('should display "Loading ..." when the loading state is true', async () => {
//     setupMocks(MOCK_PRODUCTS, MOCK_TOTAL_COUNT, MOCK_CATEGORY);
//     setTotalMock(MOCK_TOTAL_COUNT);

//     setLoadingMock(true); 

//     render(<CategoryProduct />);

//     await waitFor(() => {
//         expect(screen.getByText('Item One')).toBeInTheDocument();
//     });
//     expect(screen.getByRole('button', { name: 'Loading ...' })).toBeInTheDocument();
//   });
  
//   test('should call setPage on "Load More" button click', async () => {
//     setupMocks(MOCK_PRODUCTS, MOCK_TOTAL_COUNT, MOCK_CATEGORY);
//     setTotalMock(MOCK_TOTAL_COUNT);
    
//     render(<CategoryProduct />);

//     await waitFor(() => {
//         expect(screen.getByText('Load More')).toBeInTheDocument();
//     });
    
//     const loadMoreButton = screen.getByRole('button', { name: 'Load More' });
    
//     userEvent.click(loadMoreButton);
    
//     expect(setPageMock).toHaveBeenCalledWith(2); 
//     expect(setPageMock).toHaveBeenCalledTimes(1);
//   });
});