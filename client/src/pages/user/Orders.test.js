/** @jest-environment jsdom */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import Orders from "./Orders";

let mockAuth = { token: "", user: null };
jest.mock("../../context/auth", () => ({
  useAuth: () => [mockAuth, jest.fn()],
}));
jest.mock("axios");
jest.mock("moment", () => {
  const m = () => ({ fromNow: () => "2 days ago" });
  m.utc = jest.fn(() => m);
  m.defaultFormat = jest.fn(() => "2 days ago");
  return m;
});
jest.mock("../../components/UserMenu", () => () => (
  <div data-testid="user-menu">UserMenu</div>
));
jest.mock("../../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

const renderOrders = () => render(<Orders />);
const primeAuth = ({ token = "", user = null }) => {
  mockAuth = { token, user };
};

describe("Orders Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = { token: "", user: null };
  });

  it("renders layout and UserMenu safely", async () => {
    // Arrange
    primeAuth({ token: "mock-token", user: { name: "Alice" } });
    axios.get.mockResolvedValue({ data: [] });

    // Act
    renderOrders();

    // Assert
    expect(await screen.findByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  it("fetches and displays a single order with successful payment", async () => {
    // Arrange
    primeAuth({ token: "mock-token", user: { name: "Alice" } });
    axios.get.mockResolvedValue({
      data: [
        {
          _id: "order1",
          status: "Processing",
          buyer: { name: "Alice" },
          createAt: "2023-09-15T12:00:00Z",
          payment: { success: true },
          products: [
            { _id: "prod1", name: "Product 1", description: "Desc 1", price: 99 },
          ],
        },
      ],
    });

    // Act
    renderOrders();

    // Assert
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText(/Success/)).toBeInTheDocument();
    expect(screen.getByText("Product 1")).toBeInTheDocument();
  });

  it("renders 'Failed' when payment is unsuccessful", async () => {
    // Arrange
    primeAuth({ token: "mock-token", user: { name: "Bob" } });
    axios.get.mockResolvedValue({
      data: [
        {
          _id: "order2",
          status: "Shipped",
          buyer: { name: "Bob" },
          createAt: "2023-09-15T12:00:00Z",
          payment: { success: false },
          products: [
            { _id: "prod2", name: "Product 2", description: "Desc 2", price: 50 },
          ],
        },
      ],
    });

    // Act
    renderOrders();

    // Assert
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    expect(screen.getByText(/Failed/)).toBeInTheDocument();
  });

  it("renders multiple orders and multiple products correctly", async () => {
    // Arrange
    primeAuth({ token: "mock-token", user: { name: "Carol" } });
    axios.get.mockResolvedValue({
      data: [
        {
          _id: "order1",
          status: "Processing",
          buyer: { name: "Carol" },
          createAt: "2023-09-15T12:00:00Z",
          payment: { success: true },
          products: [
            { _id: "p1", name: "A", description: "x", price: 10 },
            { _id: "p2", name: "B", description: "y", price: 20 },
          ],
        },
        {
          _id: "order2",
          status: "Pending",
          buyer: { name: "Dan" },
          createAt: "2023-09-16T12:00:00Z",
          payment: { success: false },
          products: [{ _id: "p3", name: "C", description: "z", price: 30 }],
        },
      ],
    });

    // Act
    renderOrders();

    // Assert
    await waitFor(() => expect(screen.getByText("Carol")).toBeInTheDocument());
    expect(screen.getByText("Dan")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText(/Success/)).toBeInTheDocument();
    expect(screen.getByText(/Failed/)).toBeInTheDocument();
  });

  it("does not fetch orders if no token", () => {
    // Arrange
    primeAuth({ token: "", user: null });

    // Act
    renderOrders();

    // Assert
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("renders gracefully with no orders", async () => {
    // Arrange
    primeAuth({ token: "mock-token", user: { name: "Alice" } });
    axios.get.mockResolvedValue({ data: [] });

    // Act
    renderOrders();

    // Assert
    await waitFor(() => expect(screen.getByText("All Orders")).toBeInTheDocument());
    expect(screen.queryByText("Buyer")).not.toBeInTheDocument();
  });

  it("logs error when API call fails", async () => {
    // Arrange
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    primeAuth({ token: "mock-token", user: { name: "Alice" } });
    axios.get.mockRejectedValue(new Error("API error"));

    // Act
    renderOrders();

    // Assert
    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)));
    consoleSpy.mockRestore();
  });

  it("handles order with empty products array gracefully", async () => {
    // Arrange
    primeAuth({ token: "mock-token", user: { name: "Eve" } });
    axios.get.mockResolvedValue({
      data: [
        {
          _id: "order3",
          status: "Pending",
          buyer: { name: "Eve" },
          createAt: "2023-09-17T12:00:00Z",
          payment: { success: true },
          products: [],
        },
      ],
    });

    // Act
    renderOrders();

    // Assert
    await waitFor(() => expect(screen.getByText("Eve")).toBeInTheDocument());
    expect(screen.queryByText("Product")).not.toBeInTheDocument();
  });
});
