// client/src/pages/HomePage.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import HomePage from "./HomePage";

// --- Mocks ---

// axios for network calls
jest.mock("axios");

// toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// cart context (keep variable name starting with "mock" for jest.mock safety)
const mockSetCart = jest.fn();
jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [[/* cart */], mockSetCart]),
}));

// Prices = plain array (not a component)
jest.mock("../components/Prices", () => ({
  Prices: [
    { _id: "pr1", name: "$0 - $50", array: [0, 50] },
    { _id: "pr2", name: "$51 - $100", array: [51, 100] },
  ],
}));

// Replace antd Checkbox & Radio with simple inputs so events are straightforward
jest.mock("antd", () => {
  const Checkbox = ({ children, onChange, ...rest }) => (
    <label>
      <input
        type="checkbox"
        onChange={(e) => onChange?.({ target: { checked: e.target.checked } })}
        {...rest}
      />
      {children}
    </label>
  );

  const Radio = ({ children, value, onChange }) => (
    <label>
      <input
        type="radio"
        name="__radio__"
        onChange={() => onChange?.({ target: { value } })}
      />
      {children}
    </label>
  );

  Radio.Group = ({ children, onChange }) => (
    <div onChange={(e) => onChange?.(e)}>{children}</div>
  );

  return { Checkbox, Radio };
});

// react-router: keep actual, override only useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Layout so tests focus on HomePage behavior (not Helmet/SEO details)
jest.mock("../components/Layout", () => (props) => (
  <div data-testid="mock-layout" data-title={props.title}>
    {props.children}
  </div>
));

// Helpers
const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );

describe("HomePage (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default GET mocks for initial mount useEffects:
    // 1) categories
    // 2) product-count
    // 3) product-list/1
    axios.get
      .mockResolvedValueOnce({
        data: {
          success: true,
          category: [
            { _id: "c1", name: "Books" },
            { _id: "c2", name: "Games" },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: { total: 3 },
      })
      .mockResolvedValueOnce({
        data: {
          products: [
            {
              _id: "p1",
              name: "Alpha",
              slug: "alpha",
              price: 10,
              description: "alpha desc",
            },
            {
              _id: "p2",
              name: "Beta",
              slug: "beta",
              price: 20,
              description: "beta desc",
            },
          ],
        },
      });

    axios.post.mockResolvedValue({ data: { products: [] } });

    // localStorage.setItem spy
    jest
      .spyOn(window.localStorage.__proto__, "setItem")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render layout, banner image, filters, and initial products", async () => {
    // Arrange + Act
    renderHome();

    // Assert layout title
    const layout = await screen.findByTestId("mock-layout");
    expect(layout).toHaveAttribute("data-title", "ALL Products - Best offers ");

    // Banner image
    const banner = screen.getByAltText(/bannerimage/i);
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass("banner-img");

    // Filter headings
    expect(
      screen.getByRole("heading", { name: /filter by category/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /filter by price/i })
    ).toBeInTheDocument();

    // Category options
    expect(screen.getByLabelText(/books/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/games/i)).toBeInTheDocument();

    // Price ranges
    expect(screen.getByLabelText(/\$0 - \$50/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/\$51 - \$100/i)).toBeInTheDocument();

    // Initial products + formatted prices
    expect(await screen.findByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText(/\$10\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$20\.00/)).toBeInTheDocument();
  });

  it("should call categories, total count, and first page products on mount", async () => {
    // Arrange + Act
    renderHome();
    await screen.findByText("Alpha");

    // Assert call order/args
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      "/api/v1/category/get-category"
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      "/api/v1/product/product-count"
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      3,
      "/api/v1/product/product-list/1"
    );
  });

  it("should filter by category and render filtered products", async () => {
    // Arrange
    axios.post.mockResolvedValueOnce({
      data: {
        products: [
          {
            _id: "p3",
            name: "Filtered Book",
            slug: "filtered-book",
            price: 33,
            description: "filtered desc",
          },
        ],
      },
    });

    renderHome();
    await screen.findByText("Alpha");

    // Act: choose Books
    fireEvent.click(screen.getByLabelText(/books/i));

    // Assert request payload and result
    expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
      checked: ["c1"],
      radio: [],
    });

    expect(await screen.findByText("Filtered Book")).toBeInTheDocument();
    expect(screen.getByText(/\$33\.00/)).toBeInTheDocument();
  });

  it("should filter by price range and render filtered products", async () => {
    // Arrange
    axios.post.mockResolvedValueOnce({
      data: {
        products: [
          {
            _id: "p4",
            name: "Priced In Range",
            slug: "priced-in-range",
            price: 45,
            description: "priced desc",
          },
        ],
      },
    });

    renderHome();
    await screen.findByText("Alpha");

    // Act: select $0 - $50
    fireEvent.click(screen.getByLabelText(/\$0 - \$50/i));

    // Assert payload and result
    expect(axios.post).toHaveBeenCalledWith("/api/v1/product/product-filters", {
      checked: [],
      radio: [0, 50],
    });
    expect(await screen.findByText("Priced In Range")).toBeInTheDocument();
    expect(screen.getByText(/\$45\.00/)).toBeInTheDocument();
  });

  it("should append more products when clicking Loadmore", async () => {
    // Arrange: next page GET
    axios.get.mockResolvedValueOnce({
      data: {
        products: [
          {
            _id: "p5",
            name: "Gamma",
            slug: "gamma",
            price: 30,
            description: "gamma desc",
          },
        ],
      },
    });

    renderHome();
    await screen.findByText("Alpha");

    // products total=3, initial 2 → loadmore should be visible
    const loadMore = screen.getByRole("button", { name: /loadmore/i });

    // Act
    fireEvent.click(loadMore);

    // Assert GET page 2 and combined render
    expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/2");
    expect(await screen.findByText("Gamma")).toBeInTheDocument();
  });

  it("should navigate to product details on 'More Details'", async () => {
    // Arrange + Act
    renderHome();
    await screen.findByText("Alpha");

    // Act
    fireEvent.click(
      screen.getAllByRole("button", { name: /more details/i })[0]
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/product/alpha");
  });

  it("should add to cart, persist to localStorage, and toast on 'ADD TO CART'", async () => {
    // Arrange
    const toast = require("react-hot-toast");
    renderHome();
    await screen.findByText("Alpha");

    // Act: click ADD TO CART for Alpha
    fireEvent.click(screen.getAllByRole("button", { name: /add to cart/i })[0]);

    // Assert setCart called with appended Alpha
    expect(mockSetCart).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ _id: "p1" })])
    );

    // localStorage
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      expect.stringContaining('"name":"Alpha"')
    );

    // toast
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it("should reload on 'RESET FILTERS' click (without crashing JSDOM)", async () => {
    // Arrange: redefine location with mock reload (read-only in JSDOM by default)
    const originalLocation = window.location;
    delete window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, reload: jest.fn() },
      writable: true,
      configurable: true,
    });

    renderHome();
    await screen.findByText("Alpha");

    // Act
    fireEvent.click(screen.getByRole("button", { name: /reset filters/i }));

    // Assert
    expect(window.location.reload).toHaveBeenCalled();

    // Cleanup restore
    window.location = originalLocation;
  });

  it("should render filtered result safely when server returns valid primitives", async () => {
    // Arrange
    axios.post.mockResolvedValueOnce({
      data: {
        products: [
          {
            _id: "p7",
            name: "Valid Name",
            slug: "valid-name",
            price: 12,
            description: "valid desc",
          },
        ],
      },
    });

    renderHome();
    await screen.findByText("Alpha");

    // Act
    fireEvent.click(screen.getByLabelText(/books/i));

    // Assert
    expect(await screen.findByText("Valid Name")).toBeInTheDocument();
    expect(screen.getByText(/\$12\.00/)).toBeInTheDocument();
  });
});