/** @jest-environment jsdom */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import Orders from "./Orders";
import { AuthProvider, useAuth } from "../../context/auth";
import { act } from "react-dom/test-utils";


// Mock axios
jest.mock("axios");

// Mock Layout to avoid rendering full app layout
jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

// Mock UserMenu
jest.mock("../../components/UserMenu", () => () => (
  <div data-testid="user-menu">UserMenu</div>
));

describe("Orders Integration (mocked axios)", () => {
  const mockUser = { name: "Alice" };
  const mockToken = "mock-token";

  const mockOrders = [
    {
      _id: "order1",
      status: "Pending",
      buyer: mockUser,
      createAt: "2025-10-19T10:00:00Z",
      products: [
        { _id: "prod1", name: "Product 1", description: "Description 1", price: 10 },
      ],
      payment: { success: true },
    },
    {
      _id: "order2",
      status: "Shipped",
      buyer: { name: "Bob" },
      createAt: "2025-10-18T12:00:00Z",
      products: [
        { _id: "prod2", name: "Product 2", description: "Description 2", price: 20 },
        { _id: "prod3", name: "Product 3", description: "Description 3", price: 30 },
      ],
      payment: { success: false },
    },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockOrders });
    localStorage.setItem(
      "auth",
      JSON.stringify({ token: mockToken, user: mockUser })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderOrders = () =>
    render(
      <MemoryRouter>
        <AuthProvider>
          <Orders />
        </AuthProvider>
      </MemoryRouter>
    );

  it("renders layout and UserMenu", async () => {
    await act(async () => {
      renderOrders();
    });
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  it("fetches and displays multiple orders and products", async () => {
    await act(async () => {
      renderOrders();
    });

    // Wait for orders to render
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Product 1")).toBeInTheDocument();

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Shipped")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText("Product 3")).toBeInTheDocument();
  });

  it("handles no orders gracefully", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    await act(async () => {
      renderOrders();
    });

    await waitFor(() => expect(screen.getByText("All Orders")).toBeInTheDocument());
    expect(screen.queryByText("Pending")).not.toBeInTheDocument();
  });

  it("calls axios.get exactly once", async () => {
    await act(async () => {
      renderOrders();
    });

    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
  });

  it("handles API errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    axios.get.mockRejectedValueOnce(new Error("API failure"));

    await act(async () => {
      renderOrders();
    });

    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)));
    consoleSpy.mockRestore();
  });
});
