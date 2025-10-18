import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";

// Import pages and layout
import Layout from "../components/Layout";
import About from "./About";
import Contact from "./Contact";
import Policy from "./Policy";
import HomePage from "./HomePage";
import PageNotFound from "./PageNotFound";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";

// Helper to render any page wrapped with app providers and router
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

// Mock Header and Footer at Layout-level (top-down)
jest.mock("../components/Header", () => () => (
  <div data-testid="mock-header">Header</div>
));
jest.mock("../components/Footer", () => () => (
  <div data-testid="mock-footer">Footer</div>
));

describe("General pages integration (top-down)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.title = "";
    document.head.innerHTML = "";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("About page renders inside Layout and sets title/meta", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/about" element={<About />} />
      </Routes>,
      { route: "/about" }
    );

    // Check Layout mocks are present
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();

    // Content
    expect(await screen.findByText(/Add text/i)).toBeInTheDocument();

    // Title
    await waitFor(() =>
      expect(document.title).toMatch(/About us - Ecommerce app/)
    );
  });

  test("Contact page renders inside Layout and sets title", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/contact" element={<Contact />} />
      </Routes>,
      { route: "/contact" }
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();

    expect(await screen.findByText(/CONTACT US/i)).toBeInTheDocument();
    await waitFor(() => expect(document.title).toMatch(/Contact us/));
  });

  test("Policy page renders inside Layout and contains privacy text", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/policy" element={<Policy />} />
      </Routes>,
      { route: "/policy" }
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();

    // Policy page has a region labelled 'Privacy policy content'
    const policyRegion = await screen.findByRole("region", {
      name: /privacy policy content/i,
    });
    expect(policyRegion).toBeInTheDocument();
    expect(policyRegion).toHaveTextContent(/add privacy policy/i);
    await waitFor(() => expect(document.title).toMatch(/Privacy Policy/));
  });

  test("HomePage renders and displays fetched products", async () => {
    // Mock axios.get for product list
    jest.spyOn(axios, "get").mockResolvedValue({
      data: {
        products: [
          { _id: "p1", name: "Product One", description: "desc1", price: 10 },
          { _id: "p2", name: "Product Two", description: "desc2", price: 20 },
        ],
      },
    });

    renderWithProviders(
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>,
      { route: "/" }
    );

    // Wait for product names to appear
    expect(await screen.findByText(/Product One/)).toBeInTheDocument();
    expect(await screen.findByText(/Product Two/)).toBeInTheDocument();

    // Title check (HomePage might set title via Layout default)
    await waitFor(() =>
      expect(document.title).toMatch(/ALL Products|Ecommerce app - shop now/)
    );
  });

  test("PageNotFound shows 404 content inside Layout", async () => {
    renderWithProviders(
      <Routes>
        <Route path="*" element={<PageNotFound />} />
      </Routes>,
      { route: "/some/unknown/path" }
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();

    expect(await screen.findByText(/404/)).toBeInTheDocument();
    await waitFor(() => expect(document.title).toMatch(/404 - Page Not Found/));
  });
});
