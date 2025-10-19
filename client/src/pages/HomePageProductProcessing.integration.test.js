import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react'; 
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import HomePage from './HomePage';
import Header from '../components/Header';
import ProductDetails from './ProductDetails';
import { Prices } from '../components/Prices';

const mockCategory = { _id: 'c1', name: 'Electronics', slug: 'electronics-slug' };
const mockCategories = [mockCategory, { _id: 'c2', name: 'Books' }];

const mockProductDetails = {
    _id: 'p101', name: 'Detailed Product', slug: 'detailed-product-slug', 
    description: 'Full Product Details', price: 1000, 
    category: mockCategory,
    quantity: 10,
    shipping: true,
    photo: 'mock-photo-data',
};

const mockProductsPage1 = [
    { _id: 'p1', name: 'Laptop Pro', slug: 'laptop-pro-slug', description: 'desc 1', price: 1000, category: mockCategory },
    { _id: 'p2', name: 'Smartphone Z', slug: 'smartphone-z-slug', description: 'desc 2', price: 500, category: mockCategory },
    { _id: 'p3', name: 'Headphones X', slug: 'headphones-x-slug', description: 'desc 3', price: 100, category: mockCategory },
];
const mockProductsPage2 = [
    { _id: 'p4', name: 'E-Reader', slug: 'e-reader-slug', description: 'desc 4', price: 200, category: mockCategory },
];

const mockFilteredProduct = [
    { _id: 'p1', name: 'Filtered Laptop', slug: 'laptop-pro-slug', description: 'Filtered Laptop Details', price: 1500, category: mockCategory },
];


// --- I. AXIOS MOCK SETUP ---
jest.mock('axios', () => ({
    get: jest.fn((url) => {
        if (url.includes('/api/v1/category/get-category')) {
            return Promise.resolve({ data: { success: true, category: mockCategories } });
        }
        if (url.includes('/api/v1/product/product-list/1')) {
            return Promise.resolve({ data: { success: true, products: mockProductsPage1 } });
        }
        if (url.includes('/api/v1/product/product-list/2')) {
            return Promise.resolve({ data: { success: true, products: mockProductsPage2 } });
        }
        if (url.includes('/api/v1/product/product-count')) {
            return Promise.resolve({ data: { success: true, total: 4 } });
        }
        if (url.includes('/api/v1/product/get-product/')) {
             return Promise.resolve({
                data: { success: true, product: mockProductDetails } 
            });
        }
        return Promise.reject(new Error(`Unhandled GET request for URL: ${url}`));
    }),
    post: jest.fn((url, data) => {
        if (url.includes('/api/v1/product/product-filters')) {
            if (data.radio.length > 0 || data.checked.length > 0) {
                return Promise.resolve({ data: { success: true, products: mockFilteredProduct } });
            }
        }
        return Promise.reject(new Error(`Unhandled POST request for URL: ${url}`));
    }),
}));

jest.mock('../components/Layout', () => ({ children, title }) => <div><h1>{title}</h1>{children}</div>);
jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));
jest.mock('../context/auth', () => ({ useAuth: () => [{ user: { name: 'TestUser', role: 0 } }] }));
const mockSetCart = jest.fn();
jest.mock('../context/cart', () => ({ useCart: () => [ [], mockSetCart ] })); 
jest.mock('../hooks/useCategory', () => () => mockCategories);

const mockSetSearch = jest.fn();
jest.mock('../context/search', () => ({ 
    useSearch: () => [
        { keyword: '', results: [] }, 
        mockSetSearch,
    ],
}));

const setupTest = () => {
  Prices.length = 0;
  Prices.push({ _id: 0, name: '₹0 to ₹1000', array: [0, 1000] }); 
  Prices.push({ _id: 1, name: '₹1000 to ₹1500', array: [1000, 1500] }); 

  render(
    <MemoryRouter initialEntries={['/']}>
      <Header /> 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/search" element={<div>Search Results Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Integration: Home Page Flows', () => {

  test('Flow 1: Home -> View Product Details (Simulated Search Navigation)', async () => {
    setupTest();
    
    await waitFor(() => {
        expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
        expect(screen.getByText('All Products')).toBeInTheDocument();
    });

    const laptopProDetailsButtons = screen.getAllByRole('button', { name: 'More Details' });
    
    await act(async () => {
        await userEvent.click(laptopProDetailsButtons[0]);
    });
    await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Product Details' })).toBeInTheDocument();
    });
  });
  
  test('Flow 2: Home -> Filter by Price -> View Product Details', async () => {
    setupTest();

    await waitFor(() => {
        expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    });

    const priceRadio = screen.getByLabelText('₹1000 to ₹1500');
    
    await act(async () => {
        await userEvent.click(priceRadio);
    });
    await waitFor(() => {
        expect(screen.getByText('Filtered Laptop')).toBeInTheDocument();
        expect(screen.queryByText('Smartphone Z')).not.toBeInTheDocument();
    });

    const detailsButton = screen.getByRole('button', { name: 'More Details' });
    
    await act(async () => {
        await userEvent.click(detailsButton);
    });
    await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument();
    });
  });
  
  test('Flow 3: Home -> Load More Products -> View Product Details', async () => {
    setupTest();
    
    await waitFor(() => {
        expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
        expect(screen.queryByText('E-Reader')).not.toBeInTheDocument();
    });
    
    const loadMoreButton = screen.getByRole('button', { name: /Load more/i });

    await act(async () => {
        await userEvent.click(loadMoreButton);
    });
    await waitFor(() => {
        expect(screen.getByText('E-Reader')).toBeInTheDocument();
    });

    const eReaderButton = screen.getAllByRole('button', { name: 'More Details' }).find(
        btn => btn.closest('.card').querySelector('.card-title').textContent.includes('E-Reader')
    );
    
    await act(async () => {
        if (eReaderButton) {
            await userEvent.click(eReaderButton);
        } else {
             throw new Error("Could not find 'More Details' button for E-Reader.");
        }
    });
    await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument();
    });
  });
});