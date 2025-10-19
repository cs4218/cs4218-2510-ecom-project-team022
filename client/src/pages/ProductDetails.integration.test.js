import React from 'react';
import { render, screen, waitFor, act, within } from '@testing-library/react'; 
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import ProductDetails from './ProductDetails';
import CartPage from './CartPage';

const mockCategory = { _id: 'c1', name: 'Electronics', slug: 'electronics-slug' };
const mockMainProduct = { 
    _id: 'p101', name: 'Laptop', slug: 'laptop-slug', description: 'Full Laptop Details', 
    price: 1200.00, category: mockCategory,
    quantity: 15, photo: 'mock-photo-data-exists', 
};
const mockRelatedProduct = {
    _id: 'p201', name: 'Webcam', slug: 'webcam-slug', description: 'HD streaming webcam.',
    price: 75.00, category: mockCategory,
    quantity: 5, photo: 'mock-webcam-photo',
};
const mockNewProduct = { 
    ...mockRelatedProduct, 
    description: 'New Details for Webcam after Re-fetch',
};

var mockToastSuccess = jest.fn();
var mockCartState = [];
var mockSetCart = jest.fn((newCart) => {
    mockCartState = newCart; 
});

jest.mock('../components/Layout', () => ({ children, title }) => <div>{children}</div>);
jest.mock('braintree-web-drop-in-react', () => ({ children }) => <div>{children}</div>);
jest.mock('../context/auth', () => ({ 
    useAuth: () => [{ user: { name: 'TestUser', address: '123 Test St' }, token: 'mock-token' }] 
}));
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: (msg) => mockToastSuccess(msg),
        error: jest.fn(),
    },
    success: (msg) => mockToastSuccess(msg),
    error: jest.fn(),
}));
jest.mock('../context/cart', () => ({ 
    useCart: () => [ mockCartState, mockSetCart ] 
})); 
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value; }),
        clear: jest.fn(() => { store = {}; }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

jest.mock('axios', () => ({
    get: jest.fn((url) => {
        if (url.includes('/api/v1/product/get-product/laptop-slug')) {
            return Promise.resolve({ data: { success: true, product: mockMainProduct } });
        }
        if (url.includes('/api/v1/product/get-product/webcam-slug')) {
            return Promise.resolve({ data: { success: true, product: mockNewProduct } });
        }
        if (url.includes(`/api/v1/product/related-product/${mockMainProduct._id}/${mockMainProduct.category._id}`)) {
            return Promise.resolve({ data: { success: true, products: [mockRelatedProduct] } });
        }
        if (url.includes('/api/v1/product/braintree/token')) {
            return Promise.resolve({ data: { clientToken: 'mock-client-token' } });
        }
        return Promise.reject(new Error(`Unhandled GET request for URL: ${url}`));
    }),
    post: jest.fn(() => Promise.resolve({ data: {} })) 
}));

const setupTest = (initialPath = '/product/laptop-slug') => {
    mockCartState = []; 
    mockSetCart.mockClear();
    mockToastSuccess.mockClear();
    localStorage.clear();
    axios.get.mockClear(); 

    render(
        <MemoryRouter initialEntries={[initialPath]}>
            <nav>
                <Link to="/cart">Go to Cart</Link> 
            </nav>
            <Routes>
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/dashboard/user/orders" element={<div>Orders Page</div>} /> 
            </Routes>
        </MemoryRouter>
    );
};

describe('Integration: Product Details End-to-End Cart Flows', () => {

    test('Flow 1: Main product ADD TO CART and successful viewing on CartPage', async () => {
        setupTest();
        
        await waitFor(() => {
            expect(screen.getByText('Description : Full Laptop Details')).toBeInTheDocument();
        });

        const addToCartButtons = screen.getAllByRole('button', { name: 'ADD TO CART' });
        const mainAddToCartButton = addToCartButtons[0];
        await act(async () => {
            await userEvent.click(mainAddToCartButton);
        });

        expect(mockSetCart).toHaveBeenCalledWith([mockMainProduct]); 
        expect(mockToastSuccess).toHaveBeenCalledWith("Item Added to cart");

        await act(async () => {
             await userEvent.click(screen.getByRole('link', { name: 'Go to Cart' }));
        });
        await waitFor(() => {
            expect(screen.getByText('Hello TestUser')).toBeInTheDocument();
            expect(screen.getByText('Laptop')).toBeInTheDocument(); 
            expect(screen.getByText('Total: $1,200.00')).toBeInTheDocument(); 
        });
    });

    test('Flow 2: Related product ADD TO CART and successful viewing on CartPage', async () => {
        setupTest();
        
        await waitFor(() => {
            expect(screen.getByText('Webcam')).toBeInTheDocument();
        });

        const addToCartButtons = screen.getAllByRole('button', { name: 'ADD TO CART' });
        const relatedAddToCartButton = addToCartButtons.find(btn =>
            btn.className.includes('btn-dark') && btn.parentElement.parentElement.parentElement.textContent.includes('Webcam')
        );

        await act(async () => {
            await userEvent.click(relatedAddToCartButton);
        });
        
        expect(mockSetCart).toHaveBeenCalledWith([mockRelatedProduct]); 
        expect(mockToastSuccess).toHaveBeenCalledWith("Item Added to cart"); 

        await act(async () => {
             await userEvent.click(screen.getByRole('link', { name: 'Go to Cart' }));
        });
        await waitFor(() => {
            expect(screen.getByText('Webcam')).toBeInTheDocument();
            expect(screen.getByText('Total: $75.00')).toBeInTheDocument(); 
        });
    });


    test('Flow 3: Navigation to related product details re-fetches and updates component', async () => {
        setupTest();
        
        await waitFor(() => {
            expect(screen.getByText('Description : Full Laptop Details')).toBeInTheDocument();
        });

        const relatedProductCard = screen.getByText('Webcam').closest('.card');
        const moreDetailsButton = within(relatedProductCard).getByRole('button', { name: 'More Details' });

        await act(async () => {
            await userEvent.click(moreDetailsButton);
        });
        await waitFor(() => {
            expect(screen.queryByText('Description : Full Laptop Details')).not.toBeInTheDocument();
            expect(screen.getByText('Description : New Details for Webcam after Re-fetch')).toBeInTheDocument();
            expect(screen.getByText(/Name : Webcam/i)).toBeInTheDocument();
        }, { timeout: 1500 });
    });
});