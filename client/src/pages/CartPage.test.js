/** @jest-environment jsdom */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import CartPage from "./CartPage";
import { CartProvider } from "../context/cart";

jest.mock("axios");

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

jest.mock("../components/Layout", () => (props) => (
  <div data-testid="mock-layout" data-title={props.title || ""}>
    {props.children}
  </div>
));

let mockAuth = { token: "", user: null };
jest.mock("../context/auth", () => ({
  useAuth: () => [mockAuth, jest.fn()],
}));

const mockDropInInstance = {
  requestPaymentMethod: jest.fn().mockResolvedValue({ nonce: "fake-nonce" }),
};
jest.mock("braintree-web-drop-in-react", () => (props) => {
  props?.onInstance?.(mockDropInInstance);
  return <div data-testid="dropin" />;
});

const renderWithProviders = (ui) => render(<CartProvider>{ui}</CartProvider>);

const primeAuthCart = ({
  token = "",
  user = null,
  cart = [],
  tokenOk = true,
  clientToken = "ctok",
}) => {
  mockAuth = { token, user };
  localStorage.setItem("cart", JSON.stringify(cart));
  if (tokenOk) {
    axios.get.mockResolvedValueOnce({ data: { clientToken } });
  } else {
    axios.get.mockRejectedValueOnce(new Error("boom"));
  }
  // Always reset post mock to ensure clean state
  axios.post.mockReset();
  axios.post.mockResolvedValue({ data: { ok: true } });
};

const renderPage = () => renderWithProviders(<CartPage />);

describe("CartPage page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockAuth = { token: "", user: null };
    mockDropInInstance.requestPaymentMethod.mockResolvedValue({
      nonce: "fake-nonce",
    });
    axios.get.mockResolvedValue({ data: { clientToken: "ctok" } });
    axios.post.mockResolvedValue({ data: { ok: true } });
    // Reset axios.post to ensure clean state
    axios.post.mockClear();
  });

  it("should render guest and empty cart state safely", async () => {
    // Arrange
    primeAuthCart({ token: "", user: null, cart: [] });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByTestId("mock-layout")).toBeInTheDocument();
    expect(screen.getByText(/hello guest/i)).toBeInTheDocument();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/total\s*:/i)).toHaveTextContent("$0.00");
    expect(screen.queryByTestId("dropin")).not.toBeInTheDocument();
  });

  it("should render user greeting, items, line prices, and formatted total", async () => {
    // Arrange
    primeAuthCart({
      token: "t123",
      user: { name: "Alice" },
      cart: [
        { _id: "p1", name: "Alpha", price: 10, description: "alpha desc" },
        { _id: "p2", name: "Beta", price: 15, description: "beta desc" },
      ],
    });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText(/hello\s+alice/i)).toBeInTheDocument();
    expect(screen.getByText(/you have 2 items/i)).toBeInTheDocument();

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText(/Price:\s*\$10\.00/i)).toBeInTheDocument();

    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText(/Price:\s*\$15\.00/i)).toBeInTheDocument();

    expect(screen.getByText(/Total\s*:\s*\$25\.00/i)).toBeInTheDocument();
    expect(await screen.findByTestId("dropin")).toBeInTheDocument();
  });

  it("should remove a specific item and update storage + total", async () => {
    // Arrange
    primeAuthCart({
      token: "t123",
      user: { name: "Bob" },
      cart: [
        { _id: "p1", name: "Alpha", price: 10, description: "alpha" },
        { _id: "p2", name: "Beta", price: 20, description: "beta" },
      ],
    });
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    // Act
    renderPage();

    // capture
    const alphaNode = await screen.findByText("Alpha");

    const alphaCard =
      alphaNode.closest(".row.card.flex-row") || alphaNode.parentElement;
    within(alphaCard)
      .getByRole("button", { name: /remove/i })
      .click();

    // Assert
    await waitForElementToBeRemoved(alphaNode);
    expect(await screen.findByText("Beta")).toBeInTheDocument();
    expect(screen.getByText(/Total\s*:\s*\$20\.00/i)).toBeInTheDocument();
    expect(setItemSpy).toHaveBeenCalledWith(
      "cart",
      expect.stringContaining('"name":"Beta"')
    );
  });

  it("should enable payment when token+address+items present and complete happy path", async () => {
    // Arrange
    const toast = require("react-hot-toast");
    primeAuthCart({
      token: "t123",
      user: { name: "Dana", address: "123 Main" },
      cart: [{ _id: "p1", name: "Alpha", price: 10, description: "x" }],
      clientToken: "ctok-1",
    });
    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    // Act
    renderPage();

    // Assert
    expect(await screen.findByTestId("dropin")).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /make payment/i });
    await waitFor(() => expect(btn).toBeEnabled());

    // Act
    fireEvent.click(btn);

    // Assert - wait for all async operations to complete
    await waitFor(
      () => expect(mockDropInInstance.requestPaymentMethod).toHaveBeenCalled(),
      { timeout: 5000 }
    );

    await waitFor(
      () =>
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/braintree/payment",
          expect.objectContaining({
            nonce: "fake-nonce",
            cart: [{ _id: "p1", name: "Alpha", price: 10, description: "x" }],
          })
        ),
      { timeout: 5000 }
    );

    await waitFor(() => expect(removeItemSpy).toHaveBeenCalledWith("cart"), {
      timeout: 5000,
    });

    await waitFor(
      () =>
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/^Payment Completed Successfully/)
        ),
      { timeout: 5000 }
    );

    await waitFor(
      () => expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders"),
      { timeout: 5000 }
    );
  });

  test.each`
    title                                   | token     | user                                       | cart                                         | tokenOk
    ${"no token"}                           | ${""}     | ${{ name: "Zed", address: "X" }}           | ${[{ _id: "p1", name: "Alpha", price: 10 }]} | ${true}
    ${"token present but empty cart"}       | ${"t123"} | ${{ name: "NoItems User" }}                | ${[]}                                        | ${true}
    ${"token fetch fails (no clientToken)"} | ${"t123"} | ${{ name: "ClientTokFail", address: "A" }} | ${[{ _id: "p1", name: "Alpha", price: 10 }]} | ${false}
  `(
    "should not render DropIn when $title",
    async ({ token, user, cart, tokenOk }) => {
      // Arrange
      primeAuthCart({ token, user, cart, tokenOk });

      // Act
      renderPage();

      // Assert
      if (cart.length) {
        expect(await screen.findByText(cart[0].name)).toBeInTheDocument();
      }
      expect(screen.queryByTestId("dropin")).not.toBeInTheDocument();
    }
  );

  it("should disable Make Payment button when user has no address", async () => {
    // Arrange
    primeAuthCart({
      token: "t123",
      user: { name: "NoAddr" }, // missing address
      cart: [{ _id: "p1", name: "Alpha", price: 10 }],
    });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByTestId("dropin")).toBeInTheDocument();
    const payBtn = screen.getByRole("button", { name: /make payment/i });
    expect(payBtn).toBeDisabled();
  });

  it("should navigate to login when pressing 'Please login to checkout' button", async () => {
    // Arrange
    primeAuthCart({
      token: "",
      user: null,
      cart: [{ _id: "p1", name: "Alpha", price: 10 }],
    });

    // Act
    renderPage();

    // Assert
    const btn = await screen.findByRole("button", {
      name: /please login to checkout/i,
    });
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/cart" });
  });

  it("should compute total ignoring non-numeric prices", async () => {
    // Arrange
    primeAuthCart({
      token: "t123",
      user: { name: "Mix", address: "Addr" },
      cart: [
        { _id: "p1", name: "A", price: 10 },
        { _id: "p2", name: "B", price: "oops" },
        { _id: "p3", name: "C", price: 5.5 },
      ],
    });

    // Act
    renderPage();

    // Assert
    expect(
      await screen.findByText(/total\s*:\s*\$15\.50/i)
    ).toBeInTheDocument();
  });

  it("should handle payment failure (toast error, no navigate, cart unchanged)", async () => {
    // Arrange
    const toast = require("react-hot-toast");
    const initialCart = [{ _id: "p1", name: "Alpha", price: 10 }];
    primeAuthCart({
      token: "t123",
      user: { name: "FailUser", address: "123 Main" },
      cart: initialCart,
    });
    // Reset and setup failure mock after primeAuthCart
    axios.post.mockReset();
    axios.post.mockRejectedValueOnce(new Error("payment failed"));

    // Act
    renderPage();
    expect(await screen.findByTestId("dropin")).toBeInTheDocument();

    // Ensure button is ready before clicking
    const paymentBtn = screen.getByRole("button", { name: /make payment/i });
    await waitFor(() => expect(paymentBtn).toBeEnabled());
    fireEvent.click(paymentBtn);

    // Assert
    await waitFor(
      () =>
        expect(toast.error).toHaveBeenCalledWith(
          "Payment failed. Please try again."
        ),
      { timeout: 5000 }
    );

    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled(), {
      timeout: 2000,
    });

    await waitFor(
      () => {
        const cartData = localStorage.getItem("cart");
        expect(cartData ? JSON.parse(cartData) : []).toEqual(initialCart);
      },
      { timeout: 2000 }
    );
  });

  it("should greet with fallback 'Hello' when user object exists without name", async () => {
    // Arrange
    primeAuthCart({
      token: "t123",
      user: {}, // user present but no name
      cart: [{ _id: "p1", name: "Alpha", price: 10 }],
    });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText(/^Hello$/i)).toBeInTheDocument();
  });
});
