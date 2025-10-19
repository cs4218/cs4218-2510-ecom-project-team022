import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react'; 
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';

const mockLaptopProduct = { 
    _id: 'p101', name: 'Laptop', slug: 'laptop-slug', description: 'Full Laptop Details', 
    price: 1200.00, category: { _id: 'c1', name: 'Electronics', slug: 'electronics-slug' },
    quantity: 15, photo: 'mock-photo-data-exists', 
};

jest.mock('axios', () => ({
    get: jest.fn((url) => {
        if (url.includes('/api/v1/product/product-category/electronics-slug')) {
            return Promise.resolve({
                data: {
                    success: true,
                    products: [
                        mockLaptopProduct, 
                        { _id: 'p102', name: 'Mouse', slug: 'mouse-slug', description: 'desc', price: 50.00, category: { name: 'Electronics' } }
                    ],
                    category: { name: 'Electronics' }, 
                    total: 2 
                }
            });
        }
        if (url.includes('/api/v1/product/get-product/laptop-slug')) {
             return Promise.resolve({
                data: {
                    success: true,
                    product: mockLaptopProduct
                }
            });
        }
        if (url.includes('/api/v1/product/related-product/')) {
            return Promise.resolve({
                data: { success: true, products: [] } 
            });
        }
        return Promise.reject(new Error(`Unhandled request for URL: ${url}`));
    }),
    post: jest.fn(() => Promise.resolve({ data: {} })) 
}));

import Header from '../components/Header';
import CategoryProduct from './CategoryProduct';
import ProductDetails from './ProductDetails'
import Categories from './Categories'

jest.mock('../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));
jest.mock('../context/auth', () => ({ useAuth: () => [{ user: { name: 'TestUser', role: 0 } }] }));
const mockSetCart = jest.fn();
jest.mock('../context/cart', () => ({ useCart: () => [ [], mockSetCart ] })); 
jest.mock('../hooks/useCategory', () => () => [
    { _id: 'c1', name: 'Electronics', slug: 'electronics-slug' },
    { _id: 'c2', name: 'Books', slug: 'books-slug' },
]);
jest.mock('../context/search', () => ({ 
    useSearch: () => [
        { keyword: '', results: [] }, 
        jest.fn()                      
    ],
}));

const setupTest = () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Header /> 
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<CategoryProduct />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Integration: Category Navigation Flows', () => {

  test('Flow 1: Header Dropdown -> CategoryProduct -> ProductDetails', async () => {
    setupTest();

    const categoriesDropdown = screen.getByRole('button', { name: 'Categories' });
    userEvent.click(categoriesDropdown);
    
    const electronicsLink = screen.getByRole('link', { name: 'Electronics', hidden: true });
    
    await act(async () => {
        await userEvent.click(electronicsLink); 
    });
    
    await waitFor(() => {
        expect(screen.getByText('Category - Electronics')).toBeInTheDocument();
        expect(screen.getByText('2 result found')).toBeInTheDocument();
    });
    
    const allDetailsButtons = screen.getAllByRole('button', { name: 'More Details' });
    const laptopDetailsButton = allDetailsButtons[0]; 
    
    await act(async () => {
        await userEvent.click(laptopDetailsButton);
    });
    await waitFor(() => {
        // Assert on the correct format from ProductDetails.js: 'Description : Full Laptop Details'
        expect(screen.getByText('Description : Full Laptop Details')).toBeInTheDocument(); 
        expect(screen.getByRole('heading', { name: 'Product Details' })).toBeInTheDocument();
        expect(screen.getByText(/Name : Laptop/i)).toBeInTheDocument();
        expect(screen.getByText(/Price : \$1,200\.00/i)).toBeInTheDocument();
    });
  });

  test('Flow 2: Header All Categories -> Categories Page -> CategoryProduct -> ProductDetails', async () => {
    setupTest();

    const categoriesDropdown = screen.getByRole('button', { name: 'Categories' });
    userEvent.click(categoriesDropdown);
    
    const allCategoriesLink = screen.getByRole('link', { name: 'All Categories' });
    
    await act(async () => {
        await userEvent.click(allCategoriesLink);
    });
    await waitFor(() => {
        expect(screen.getAllByRole('link', { name: 'Electronics' })).toHaveLength(2); // Header link + Page link
    });
    
    const electronicsLinkOnCategoryPage = screen.getAllByRole('link', { name: 'Electronics' })
        .find(link => link.classList.contains('btn-primary'));

    await act(async () => {
        await userEvent.click(electronicsLinkOnCategoryPage);
    });
    await waitFor(() => {
        expect(screen.getByText('Category - Electronics')).toBeInTheDocument();
        expect(screen.getByText('2 result found')).toBeInTheDocument();
    });
    
    const allDetailsButtons = screen.getAllByRole('button', { name: 'More Details' });
    const laptopDetailsButton = allDetailsButtons[0]; 

    await act(async () => {
        await userEvent.click(laptopDetailsButton);
    });
    await waitFor(() => {
        expect(screen.getByText('Description : Full Laptop Details')).toBeInTheDocument(); 
        expect(screen.getByRole('heading', { name: 'Product Details' })).toBeInTheDocument();
        expect(screen.getByText(/Name : Laptop/i)).toBeInTheDocument();
        expect(screen.getByText(/Price : \$1,200\.00/i)).toBeInTheDocument();
    });
  });
});