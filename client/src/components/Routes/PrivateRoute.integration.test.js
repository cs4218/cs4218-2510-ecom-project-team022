import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import PrivateRoute from "./Private";
import AdminRoute from "./AdminRoute";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";

// Test components to render inside protected routes
const ProtectedUserPage = () => <div>Protected User Content</div>;
const ProtectedAdminPage = () => <div>Protected Admin Content</div>;

// Helper to render routes with all required providers (bottom-up - real providers)
const renderWithProviders = (ui, { route = "/" } = {}) => {
  return render(
    <SearchProvider>
      <CartProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </AuthProvider>
      </CartProvider>
    </SearchProvider>
  );
};

describe("PrivateRoute Integration (bottom-up)", () => {
  const originalConsoleLog = console.log;

  beforeEach(() => {
    jest.useFakeTimers();
    // Suppress console.log for cleaner test output
    console.log = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    console.log = originalConsoleLog;
    jest.clearAllMocks();
  });

  test("PrivateRoute shows Spinner when user is not authenticated", async () => {
    // Test with no auth token - should show spinner
    renderWithProviders(
      <Routes>
        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route index element={<ProtectedUserPage />} />
        </Route>
      </Routes>,
      { route: "/dashboard" }
    );

    // Should render Spinner initially (no token)
    expect(
      screen.getByText(/redirecting you in 3 second/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Should not show protected content
    expect(
      screen.queryByText("Protected User Content")
    ).not.toBeInTheDocument();
  });

  test("PrivateRoute authentication flow with real context", async () => {
    // Test the full authentication flow
    renderWithProviders(
      <Routes>
        <Route path="/user/profile" element={<PrivateRoute />}>
          <Route index element={<ProtectedUserPage />} />
        </Route>
      </Routes>,
      { route: "/user/profile" }
    );

    // Initially should show spinner (loading state)
    expect(
      screen.getByText(/redirecting you in 3 second/i)
    ).toBeInTheDocument();

    // Wait for auth check to complete (will fail in test environment)
    await waitFor(
      () => {
        // Auth check will fail, so spinner should still be visible
        expect(
          screen.getByText(/redirecting you in 3 second/i)
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  test("AdminRoute shows Spinner when user is not admin", async () => {
    // Test AdminRoute without admin token
    renderWithProviders(
      <Routes>
        <Route path="/admin/dashboard" element={<AdminRoute />}>
          <Route index element={<ProtectedAdminPage />} />
        </Route>
      </Routes>,
      { route: "/admin/dashboard" }
    );

    // Should render Spinner (no admin auth)
    expect(
      screen.getByText(/redirecting you in 3 second/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Should not show admin content
    expect(
      screen.queryByText("Protected Admin Content")
    ).not.toBeInTheDocument();
  });

  test("PrivateRoute integrates with Spinner navigation", async () => {
    // Test that PrivateRoute properly integrates with Spinner's navigation behavior
    renderWithProviders(
      <Routes>
        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route index element={<ProtectedUserPage />} />
        </Route>
      </Routes>,
      { route: "/dashboard" }
    );

    // Should show spinner with countdown
    expect(
      screen.getByText(/redirecting you in 3 second/i)
    ).toBeInTheDocument();

    // Fast forward 1 second
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      // Should update countdown
      expect(
        screen.getByText(/redirecting you in 2 second/i)
      ).toBeInTheDocument();
    });
  });

  test("AdminRoute integrates with default Spinner behavior", async () => {
    // Test AdminRoute uses default Spinner (no path specified)
    renderWithProviders(
      <Routes>
        <Route path="/admin/users" element={<AdminRoute />}>
          <Route index element={<ProtectedAdminPage />} />
        </Route>
      </Routes>,
      { route: "/admin/users" }
    );

    // Should show spinner (AdminRoute uses default Spinner without path)
    expect(
      screen.getByText(/redirecting you in 3 second/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("Route protection handles network errors gracefully", async () => {
    // Test that route protection handles network failures without crashing
    renderWithProviders(
      <Routes>
        <Route path="/protected" element={<PrivateRoute />}>
          <Route index element={<ProtectedUserPage />} />
        </Route>
      </Routes>,
      { route: "/protected" }
    );

    // Should still render spinner even when network requests fail
    expect(
      screen.getByText(/redirecting you in 3 second/i)
    ).toBeInTheDocument();

    // Wait for potential network requests to fail
    await waitFor(
      () => {
        // Component should remain stable after network failures
        expect(
          screen.getByText(/redirecting you in 3 second/i)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("Multiple route types can coexist in routing structure", async () => {
    // Test that PrivateRoute and AdminRoute can work together in the same app
    renderWithProviders(
      <Routes>
        <Route path="/user/*" element={<PrivateRoute />}>
          <Route path="profile" element={<ProtectedUserPage />} />
        </Route>
        <Route path="/admin/*" element={<AdminRoute />}>
          <Route path="dashboard" element={<ProtectedAdminPage />} />
        </Route>
      </Routes>,
      { route: "/user/profile" }
    );

    // Should render user route spinner
    expect(
      screen.getByText(/redirecting you in 3 second/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Protected User Content")
    ).not.toBeInTheDocument();
  });

  test("Route authentication state management", async () => {
    // Test that routes properly manage authentication state
    renderWithProviders(
      <Routes>
        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route index element={<ProtectedUserPage />} />
        </Route>
      </Routes>,
      { route: "/dashboard" }
    );

    // Initially not authenticated, should show spinner
    expect(
      screen.getByText(/redirecting you in 3 second/i)
    ).toBeInTheDocument();

    // Test that the authentication state is properly managed by the component
    await waitFor(() => {
      // Even after waiting, without proper auth, should still show spinner
      expect(
        screen.getByText(/redirecting you in 3 second/i)
      ).toBeInTheDocument();
    });
  });
});
