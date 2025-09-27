import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProductDetails from './ProductDetails';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/cart';
import toast from 'react-hot-toast';

const localStorageSetItemSpy = jest.spyOn(window.localStorage.__proto__, 'setItem');

jest.mock('../context/cart', () => ({
  useCart: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
}));

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));
jest.mock('./../components/Layout', () => ({ children }) => <div>{children}</div>);

const mockProduct = {
  _id: 'product-id-123',
  slug: 'cool-gadget',
  name: 'Cool Gadget Pro',
  description: 'A fantastic new device.',
  price: 500.5,
  category: {
    _id: 'cat-id-456',
    name: 'Electronics',
  },
};

const mockRelatedProducts = [
  {
    _id: 'related-id-1',
    slug: 'small-accessory',
    name: 'Small Accessory',
    description: 'A useful small device that goes with the gadget.',
    price: 10.0,
  },
  {
    _id: 'related-id-2',
    slug: 'large-accessory',
    name: 'Large Accessory',
    description: 'Another useful item for the product line.',
    price: 50.0,
  },
];

const setupMocks = (productData, relatedData) => {
  axios.get.mockImplementation(url => {
    if (url === `/api/v1/product/get-product/${mockProduct.slug}`) {
      return Promise.resolve({ data: { product: productData } });
    }
    if (url === `/api/v1/product/related-product/${productData._id}/${productData.category._id}`) {
      return Promise.resolve({ data: { products: relatedData } });
    }
    return Promise.reject(new Error('Unknown API call'));
  });

  useParams.mockReturnValue({ slug: mockProduct.slug });
};

describe('ProductDetails', () => {
  let navigateMock;
  let setCartMock;
  let mockInitialCart;

  beforeEach(() => {
    axios.get.mockClear();
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    setCartMock = jest.fn();
    mockInitialCart = [];

    useCart.mockReturnValue([mockInitialCart, setCartMock]);
    toast.success.mockClear();
    localStorageSetItemSpy.mockClear();
  });

  beforeEach(() => {
    axios.get.mockClear();
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);
  });

  test('should fetch and display main product details and related products successfully', async () => {
    setupMocks(mockProduct, mockRelatedProducts);
    render(<ProductDetails />);

    await waitFor(() => {
      expect(screen.getByText('Name : Cool Gadget Pro')).toBeInTheDocument();
      expect(screen.getByText(/A fantastic new device\./i)).toBeInTheDocument();
      expect(screen.getByText('Price : $500.50')).toBeInTheDocument();
      expect(screen.getByText('Category : Electronics')).toBeInTheDocument();

      expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${mockProduct.slug}`);
      expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`);

      const mainImage = screen.getByAltText(mockProduct.name);
      expect(mainImage).toHaveAttribute('src', `/api/v1/product/product-photo/${mockProduct._id}`);
    });

    expect(screen.getByText('Similar Products ➡️')).toBeInTheDocument();
    expect(screen.getByText('Small Accessory')).toBeInTheDocument();
    expect(screen.getByText('A useful small device that goes with the gadget....')).toBeInTheDocument();
  });

  test('should display "No Similar Products found" if related products array is empty', async () => {
    setupMocks(mockProduct, []);
    render(<ProductDetails />);

    await waitFor(() => {
      expect(screen.getByText('Name : Cool Gadget Pro')).toBeInTheDocument();
    });

    expect(screen.getByText('No Similar Products found')).toBeInTheDocument();
    expect(screen.queryByText('Small Accessory')).not.toBeInTheDocument();
  });

  test('should navigate to the correct product slug when "More Details" is clicked', async () => {
    setupMocks(mockProduct, mockRelatedProducts);
    render(<ProductDetails />);

    await waitFor(() => {
      expect(screen.getByText('Small Accessory')).toBeInTheDocument();
    });

    const moreDetailsButtons = screen.getAllByText('More Details');
    userEvent.click(moreDetailsButtons[0]);

    expect(navigateMock).toHaveBeenCalledWith(`/product/${mockRelatedProducts[0].slug}`);
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  test('should handle API error during getProduct call', async () => {
    useParams.mockReturnValue({ slug: mockProduct.slug });
    const mockError = new Error('Product fetch failed');

    axios.get.mockRejectedValueOnce(mockError);

    render(<ProductDetails />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Cool Gadget Pro')).not.toBeInTheDocument();
    });

    expect(axios.get).not.toHaveBeenCalledWith(expect.stringContaining('/related-product/'));
  });

  test('should add the main product to cart and show success toast when button is clicked', async () => {
    setupMocks(mockProduct, mockRelatedProducts);

    render(<ProductDetails />);

    await waitFor(() => {
      expect(screen.getByText('Name : Cool Gadget Pro')).toBeInTheDocument();
    });
    const addToCartButtons = screen.getAllByRole('button', { name: /ADD TO CART/i });
    const mainAddToCartButton = addToCartButtons[0]; userEvent.click(mainAddToCartButton);

    expect(setCartMock).toHaveBeenCalledWith([mockProduct]);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([mockProduct])
    );
    expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
  });

  test('should add a related product to cart and show success toast when its button is clicked', async () => {
    setupMocks(mockProduct, mockRelatedProducts);

    render(<ProductDetails />);

    await waitFor(() => {
      expect(screen.getByText('Small Accessory')).toBeInTheDocument();
    });

    const addToCartButtons = screen.getAllByRole('button', { name: /ADD TO CART/i });
    const relatedProductButton = addToCartButtons.find(btn =>
      btn.className.includes('btn-dark') && btn.parentElement.parentElement.parentElement.textContent.includes('Small Accessory')
    );

    userEvent.click(relatedProductButton);

    const expectedProduct = mockRelatedProducts[0];

    expect(setCartMock).toHaveBeenCalledWith([expectedProduct]);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([expectedProduct])
    );
    expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
  });
});