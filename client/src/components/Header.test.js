import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Header from './Header';

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../context/cart', () => ({
  useCart: jest.fn(),
}));
jest.mock('../hooks/useCategory', () => jest.fn());
jest.mock('react-hot-toast', () => ({ success: jest.fn() }));
jest.mock('../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]),
}));

jest.mock('antd', () => ({
  Badge: ({ children, count }) => <span data-testid="badge" data-count={count}>{children}</span>,
}));

const { useAuth } = require('../context/auth');
const { useCart } = require('../context/cart');
const useCategory = require('../hooks/useCategory');
const toast = require('react-hot-toast');

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Arrange defaults (shared): logged out, empty cart, no categories
    useAuth.mockReturnValue([{ user: null, token: '' }, jest.fn()]);
    useCart.mockReturnValue([[]]);
    useCategory.mockReturnValue([]);
  });

  it('renders the brand link to home (/) with label "Virtual Vault"', () => {
    // Arrange
    renderHeader();
    // Act
    const brand = screen.getByRole('link', { name: /virtual vault/i });

    // Assert
    expect(brand).toBeInTheDocument();
    expect(brand).toHaveAttribute('href', '/');
  });

  it('renders the Home link to "/"', () => {
    // Arrange
    renderHeader();

    // Act
    const home = screen.getByRole('link', { name: /^home$/i });

    // Assert
    expect(home).toBeInTheDocument();
    expect(home).toHaveAttribute('href', '/');
  });

  it('shows Categories toggle and "All Categories" link to /categories', () => {
    // Arrange
    renderHeader();

    // Act
    const toggle = screen.getByRole('button', { name: /^categories$/i });
    const all = screen.getByRole('link', { name: /^all categories$/i });

    // Assert
    expect(toggle).toBeInTheDocument();
    expect(toggle.tagName).toBe('BUTTON');
    expect(all).toHaveAttribute('href', '/categories');
  });

  it('renders category links based on useCategory()', () => {
    // Arrange
    useCategory.mockReturnValue([
      { name: 'Books', slug: 'books' },
      { name: 'Games', slug: 'games' },
    ]);
    renderHeader();

    // Act
    const books = screen.getByRole('link', { name: 'Books' });
    const games = screen.getByRole('link', { name: 'Games' });

    // Assert
    expect(books).toHaveAttribute('href', '/category/books');
    expect(games).toHaveAttribute('href', '/category/games');
  });

  it('shows Register and Login when there is no user', () => {
    // Arrange
    useAuth.mockReturnValue([{ user: null, token: '' }, jest.fn()]);
    renderHeader();

    // Act
    const register = screen.getByRole('link', { name: /register/i });
    const login = screen.getByRole('link', { name: /login/i });

    // Assert
    expect(register).toHaveAttribute('href', '/register');
    expect(login).toHaveAttribute('href', '/login');
  });

  it('shows username and dashboard link for role=1 as admin', () => {
    // Arrange
    useAuth.mockReturnValue([{ user: { name: 'Tester', role: 1 }, token: 't' }, jest.fn()]);
    renderHeader();

    // Act
    const username = screen.getByText('Tester');
    const dashboard = screen.getByRole('link', { name: /dashboard/i });

    // Assert
    expect(username).toBeInTheDocument();
    expect(dashboard).toHaveAttribute('href', '/dashboard/admin');
  });

  it('shows username and dashboard link for role!=1 as user', () => {
    // Arrange
    useAuth.mockReturnValue([{ user: { name: 'Bob', role: 0 }, token: 't' }, jest.fn()]);
    renderHeader();

    // Act
    const username = screen.getByText('Bob');
    const dashboard = screen.getByRole('link', { name: /dashboard/i });

    // Assert
    expect(username).toBeInTheDocument();
    expect(dashboard).toHaveAttribute('href', '/dashboard/user');
  });

  it('calls setAuth, clears localStorage and shows toast on Logout click', () => {
    // Arrange
    const setAuth = jest.fn();
    useAuth.mockReturnValue([{ user: { name: 'Carol', role: 0 }, token: 't' }, setAuth]);
    const removeItemSpy = jest
      .spyOn(window.localStorage.__proto__, 'removeItem')
      .mockImplementation(() => {});
    renderHeader();

    // Act
    const logout = screen.getByRole('link', { name: /logout/i });
    fireEvent.click(logout);

    // Assert
    expect(setAuth).toHaveBeenCalledWith(expect.objectContaining({ user: null, token: '' }));
    expect(removeItemSpy).toHaveBeenCalledWith('auth');
    expect(toast.success).toHaveBeenCalledWith('Logout Successfully');

    removeItemSpy.mockRestore();
  });

  it('shows cart count from useCart()', () => {
    // Arrange
    useCart.mockReturnValue([[{}, {}]]); // length 2
    renderHeader();

    // Act
    const badge = screen.getByTestId('badge');
    const cartLink = screen.getByRole('link', { name: /cart/i });

    // Assert
    expect(badge).toHaveAttribute('data-count', '2');
    expect(cartLink).toHaveAttribute('href', '/cart');
  });

  it('uses a real button (not a link) for the user dropdown toggle', () => {
    // Arrange
    useAuth.mockReturnValue([{ user: { name: 'Tom', role: 1 }, token: 't' }, jest.fn()]);
    renderHeader();

    // Act
    const buttonToggle = screen.getByRole('button', { name: /tom/i });
    const linkToggle = screen.queryByRole('link', { name: /tom/i });

    // Assert
    expect(buttonToggle).toBeInTheDocument();
    expect(buttonToggle.tagName).toBe('BUTTON');
    expect(linkToggle).toBeNull();
  });

});
