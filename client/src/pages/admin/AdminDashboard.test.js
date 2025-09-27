import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../../context/auth';
import Layout from '../../components/Layout';
import AdminMenu from '../../components/AdminMenu';

jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/AdminMenu', () => () => <div>Admin Menu</div>);

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(),
}));

describe('AdminDashboard', () => {
  test('Display admin user information on the dashboard', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
    };

    useAuth.mockReturnValue([{ user: mockUser }]);
    render(<AdminDashboard />);

    expect(screen.getByText(`Admin Name : ${mockUser.name}`)).toBeInTheDocument();
    expect(screen.getByText(`Admin Email : ${mockUser.email}`)).toBeInTheDocument();
    expect(screen.getByText(`Admin Contact : ${mockUser.phone}`)).toBeInTheDocument();
  });

  test('Handle missing user data', () => {
    const mockUser = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: undefined,
    };

    useAuth.mockReturnValue([{ user: mockUser }]);
    render(<AdminDashboard />);

    expect(screen.getByText(`Admin Name : ${mockUser.name}`)).toBeInTheDocument();
    expect(screen.getByText(`Admin Email : ${mockUser.email}`)).toBeInTheDocument();
    expect(screen.getByText(`Admin Contact :`)).toBeInTheDocument();
  });
});