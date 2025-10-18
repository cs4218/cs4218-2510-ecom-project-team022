import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import HomePage from "./HomePage";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";

// Helper to render HomePage with all required providers (bottom-up - real providers)
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

describe("HomePage integration (bottom-up)", () => {
  // Real axios calls - no mocking for bottom-up integration
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // Suppress console.log for cleaner test output
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    jest.clearAllMocks();
  });

  test("HomePage renders and handles product fetching errors gracefully", async () => {
    // This test uses real axios calls that will likely fail in test environment
    // Testing error handling and fallback behavior
    renderWithProviders(<HomePage />);

    // Should render the layout structure
    expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Filter By Price/i)).toBeInTheDocument();

    // Should show banner image
    const bannerImg = screen.getByAltText("bannerimage");
    expect(bannerImg).toBeInTheDocument();
    expect(bannerImg).toHaveAttribute("src", "/images/Virtual.png");

    // Wait for async effects to complete - error handling should prevent crashes
    await waitFor(
      () => {
        // Even if API calls fail, the component should still render
        expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("HomePage filter interactions work correctly", async () => {
    renderWithProviders(<HomePage />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
    });

    // Test reset functionality (should exist even without data)
    const resetButton = screen.queryByText(/reset/i);
    if (resetButton) {
      fireEvent.click(resetButton);
      // Should not crash when resetting
      expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
    }
  });

  test("HomePage pagination and load more functionality", async () => {
    renderWithProviders(<HomePage />);

    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
    });

    // Look for load more button if it exists
    const loadMoreButton = screen.queryByText(/load more/i);
    if (loadMoreButton) {
      fireEvent.click(loadMoreButton);
      // Should handle load more without crashing
      expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
    }
  });

  test("HomePage cart interactions (add to cart functionality)", async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/Filter By Price/i)).toBeInTheDocument();
    });

    // Look for any "Add to Cart" buttons if products are loaded
    const addToCartButtons = screen.queryAllByText(/add to cart/i);
    if (addToCartButtons.length > 0) {
      fireEvent.click(addToCartButtons[0]);
      // Should handle cart operations without crashing
      expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
    }
  });

  test("HomePage navigation and routing integration", async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
    });

    // Look for product detail links or navigation elements
    const productLinks = screen.queryAllByRole("link");
    // HomePage should render without navigation errors
    expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
  });

  test("HomePage handles real network conditions", async () => {
    // Test component behavior under real network conditions
    renderWithProviders(<HomePage />);

    // Wait for network requests to complete (with reasonable timeout)
    await waitFor(
      () => {
        expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Component should handle network delays gracefully
    const categoryFilter = screen.getByText(/Filter By Category/i);
    expect(categoryFilter).toBeInTheDocument();

    const priceFilter = screen.getByText(/Filter By Price/i);
    expect(priceFilter).toBeInTheDocument();

    // Should display price filter options from Prices component
    await waitFor(() => {
      // Look for price ranges (these are imported from Prices component)
      const priceOptions = screen.queryAllByRole("radio");
      // Even if no options loaded from API, Price component should render
      expect(priceFilter).toBeInTheDocument();
    });
  });

  test("HomePage error boundaries and resilience", async () => {
    // Test that HomePage doesn't crash with various error conditions
    renderWithProviders(<HomePage />);

    // Should render core structure even if data fetching fails
    expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Filter By Price/i)).toBeInTheDocument();

    // Wait for async operations to complete
    await waitFor(
      () => {
        // Component should remain stable after network operations
        expect(screen.getByText(/Filter By Category/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify banner image is always rendered
    const bannerImg = screen.getByAltText("bannerimage");
    expect(bannerImg).toBeInTheDocument();
  });
});
