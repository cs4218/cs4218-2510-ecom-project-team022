/** @jest-environment jsdom */
// client/src/context/cart.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { CartProvider, useCart } from "./cart";

function TestConsumer() {
  const [cart, setCart] = useCart();
  return (
    <div>
      <span data-testid="cart">{JSON.stringify(cart)}</span>
      <button
        onClick={() =>
          setCart((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            { id: "x" },
          ])
        }
      >
        Add
      </button>
    </div>
  );
}

describe("Cart context", () => {
  beforeEach(() => {
    // Arrange
    localStorage.clear();
    jest.resetModules();
  });

  it("should throw a helpful error if useCart is used outside CartProvider", () => {
    // Arrange
    const Broken = () => {
      // Act
      useCart();
      return null;
    };

    // Assert
    expect(() => render(<Broken />)).toThrow(
      /useCart must be used within a CartProvider/i
    );
  });

  it("should load initial cart from localStorage", async () => {
    // Arrange
    const initial = [{ _id: "p1", name: "Alpha" }];
    localStorage.setItem("cart", JSON.stringify(initial));

    // Act
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    // Assert
    const span = await screen.findByTestId("cart");
    expect(span).toHaveTextContent("Alpha");
  });

  it("should initialise with an empty array when localStorage is empty", async () => {
    // Arrange
    localStorage.removeItem("cart");

    // Act
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    // Assert
    const span = await screen.findByTestId("cart");
    expect(span).toHaveTextContent("[]");
  });

  it("should update the cart via setCart", async () => {
    // Arrange + Act
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    // Assert
    await waitFor(() =>
      expect(screen.getByTestId("cart")).toHaveTextContent('"id":"x"')
    );
  });
});