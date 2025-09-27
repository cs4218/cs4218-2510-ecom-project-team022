import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminMenu from './AdminMenu';

jest.mock('react-router-dom', () => ({
  NavLink: ({ to, children, ...rest }) => <a href={to}{...rest}>{children}</a>,
}));

describe('AdminMenu', () => {

  test('render the Admin Panel title', () => {
    render(<AdminMenu />);
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
  
  test('render all admin navigation links with correct text and paths', () => {
    render(<AdminMenu />);
    
    const links = [
      { text: 'Create Category', path: '/dashboard/admin/create-category' },
      { text: 'Create Product', path: '/dashboard/admin/create-product' },
      { text: 'Products', path: '/dashboard/admin/products' },
      { text: 'Orders', path: '/dashboard/admin/orders' },
      { text: 'Users', path: '/dashboard/admin/users' },
    ];

    links.forEach(({ text, path }) => {
      const linkElement = screen.getByText(text);

      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', path);
      expect(linkElement).toHaveClass('list-group-item list-group-item-action');
    });
  });
  
  test('render the correct structure and number of links', () => {
    render(<AdminMenu />);

    const linkElements = screen.getAllByRole('link');
    expect(linkElements).toHaveLength(5);

    const container = screen.getByText('Admin Panel').closest('div.text-center');
    expect(container).toBeInTheDocument();
  });
});