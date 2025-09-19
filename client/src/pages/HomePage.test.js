import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import * as toast from "react-hot-toast";
import HomePage from "./HomePage";

jest.mock("axios");

jest.mock("../components/Prices", () => ({
  Prices: [
    { _id: "p1", name: "Under £50", array: [0, 50] },
    { _id: "p2", name: "£50 to £200", array: [50, 200] },
  ],
}));

jest.mock("../components/Layout", () => (props) => (
  <div data-testid="layout" data-title={props.title || ""}>
    {props.children}
  </div>
));

let mockCartState = [];
const mockSetCart = jest.fn();
jest.mock("../context/cart", () => ({
  useCart: () => [mockCartState, mockSetCart],
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

const categoryOK = {
  data: {
    success: true,
    category: [{ _id: "c1", name: "Books" }, { _id: "c2", name: "Toys" }],
  },
};
const countOK = { data: { total: 5 } };
const listPage1 = {
  data: {
    products: [
      { _id: "p-a1", name: "Alpha", price: 10, description: "alpha desc", slug: "alpha" },
      { _id: "p-b2", name: "Beta",  price: 15, description: "beta desc",  slug: "beta"  },
    ],
  },
};
const listPage2 = {
  data: {
    products: [{ _id: "p-c3", name: "Gamma", price: 20, description: "gamma desc", slug: "gamma" }],
  },
};

/* Helpers */
const primeMountGets = () => {
  axios.get.mockReset();
  axios.get
    .mockResolvedValueOnce(categoryOK)
    .mockResolvedValueOnce(countOK)
    .mockResolvedValueOnce(listPage1)
    .mockResolvedValueOnce(listPage1);
};

const renderHomePrimed = (...extraGets) => {
  primeMountGets();
  extraGets.forEach((val) => axios.get.mockResolvedValueOnce(val));
  mockCartState = [];
  mockSetCart.mockClear();
  toast.success.mockClear();
  localStorage.clear();
  return render(<HomePage />);
};

const awaitInitialUI = async () => {
  await screen.findByTestId("layout");
  await screen.findByText("Books");
  await screen.findByText("Toys");
  await screen.findByText("Alpha");
  await screen.findByText("Beta");
};

const getCardByTitle = (name) => screen.getByText(name).closest(".card");

/* Tests */
describe("HomePage", () => {
  it("should render categories and first-page products", async () => {
    renderHomePrimed();
    await awaitInitialUI();
    await screen.findByText("$10.00");
    expect(screen.getByText("$15.00")).toBeInTheDocument();
  });

  it("should append new products when clicking Loadmore", async () => {
    renderHomePrimed(listPage2); // 5th GET
    await screen.findByText("Alpha");

    fireEvent.click(screen.getByRole("button", { name: /loadmore/i }));

    expect(await screen.findByText("Gamma")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("should handle non-numeric price and non-string description safely", async () => {
    // Replace all 4 mount GETs just for this test
    axios.get.mockReset();
    axios.get
      .mockResolvedValueOnce(categoryOK)
      .mockResolvedValueOnce(countOK)
      .mockResolvedValueOnce({
        data: { products: [{ _id: "x1", name: "Weird", price: "oops", description: 123, slug: "weird" }] },
      })
      .mockResolvedValueOnce({
        data: { products: [{ _id: "x1", name: "Weird", price: "oops", description: 123, slug: "weird" }] },
      });

    render(<HomePage />);

    expect(await screen.findByText("Weird")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /more details/i })).toBeInTheDocument();
  });

  it("should navigate to product route when clicking More Details", async () => {
    renderHomePrimed();
    await screen.findByText("Alpha");

    within(getCardByTitle("Alpha")).getByRole("button", { name: /more details/i }).click();

    expect(mockNavigate).toHaveBeenCalledWith("/product/alpha");
  });

  it("should add item to cart, persist to storage, and toast when clicking ADD TO CART", async () => {
    renderHomePrimed();
    await screen.findByText("Alpha");

    within(getCardByTitle("Alpha")).getByRole("button", { name: /add to cart/i }).click();

    expect(mockSetCart).toHaveBeenCalledTimes(1);

    const saved = JSON.parse(localStorage.getItem("cart"));
    expect(saved.some((p) => p._id === "p-a1")).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it("should replace list with filtered results when ticking a category", async () => {
    renderHomePrimed();
    axios.post = jest.fn().mockResolvedValueOnce({
      data: { products: [{ _id: "f1", name: "Filtered One", price: 42, description: "f", slug: "f1" }] },
    });

    await screen.findByText("Books");
    fireEvent.click(screen.getByText("Books"));

    expect(await screen.findByText("Filtered One")).toBeInTheDocument();
  });

  it("should fetch filtered results when picking a price radio", async () => {
    renderHomePrimed();
    axios.post = jest.fn().mockResolvedValueOnce({
      data: { products: [{ _id: "f2", name: "Under 50", price: 25, description: "d", slug: "u50" }] },
    });

    await screen.findByText("Under £50");
    fireEvent.click(screen.getByText("Under £50"));

    expect(await screen.findByText("Under 50")).toBeInTheDocument();
  });

  it("should refetch first page when clicking RESET FILTERS", async () => {
    // One extra GET for the immediate handleReset() refetch is enough to see the new list
    renderHomePrimed({
      data: { products: [{ _id: "r1", name: "Refetched", price: 9, description: "x", slug: "r1" }] },
    });

    await screen.findByText("Alpha");
    fireEvent.click(screen.getByRole("button", { name: /reset filters/i }));

    expect(await screen.findByText("Refetched")).toBeInTheDocument();
  });

  it("should keep UI stable and hide Loadmore when mount GETs all fail", async () => {
    axios.get.mockReset();
    axios.get
      .mockRejectedValueOnce(new Error("cat fail"))
      .mockRejectedValueOnce(new Error("count fail"))
      .mockRejectedValueOnce(new Error("list fail"))
      .mockRejectedValueOnce(new Error("list fail (no-filters)"));

    render(<HomePage />);

    expect(await screen.findByTestId("layout")).toBeInTheDocument();
    expect(screen.getByText(/all products/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /loadmore/i })).not.toBeInTheDocument();
  });

  it("should show 'Loading ...' while fetching page 2 and then render the new items", async () => {
    renderHomePrimed();

    // 5th GET is delayed
    let resolveGet;
    const delayed = new Promise((resolve) => (resolveGet = resolve));
    axios.get.mockResolvedValueOnce(delayed);

    await screen.findByText("Alpha");
    const loadBtn = screen.getByRole("button", { name: /loadmore/i });
    fireEvent.click(loadBtn);

    expect(loadBtn).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    resolveGet(listPage2);
    await waitFor(() => expect(screen.getByText("Gamma")).toBeInTheDocument());
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });
  it("should render no category checkboxes when category API returns success=false", async () => {
    // Prime the 4 mount GETs with a 'success: false' categories payload
    axios.get.mockReset();
    axios.get
      .mockResolvedValueOnce({ data: { success: false, category: [{ _id: "ignored", name: "Ignored" }] } }) // categories
      .mockResolvedValueOnce({ data: { total: 0 } }) // count
      .mockResolvedValueOnce({ data: { products: [] } }) // list/1 (mount)
      .mockResolvedValueOnce({ data: { products: [] } }); // list/1 (no-filters effect)

    render(<HomePage />);

    // Layout renders, but there should be no category labels because success=false => categories=[]
    await screen.findByTestId("layout");
    expect(screen.queryByText("Books")).not.toBeInTheDocument();
    expect(screen.queryByText("Toys")).not.toBeInTheDocument();
  });

  it("should guard when product-list returns a non-array (no product cards)", async () => {
    // Prime mount calls, but make products a non-array (e.g. null / object)
    axios.get.mockReset();
    axios.get
      .mockResolvedValueOnce({
        data: { success: true, category: [{ _id: "c1", name: "Books" }] },
      }) // categories
      .mockResolvedValueOnce({ data: { total: 3 } }) // count
      .mockResolvedValueOnce({ data: { products: null } }) // list/1 (mount) -> non-array
      .mockResolvedValueOnce({ data: { products: {} } }); // list/1 (no-filters effect) -> non-array

    render(<HomePage />);

    // We still render layout and headings, but no product cards should appear
    await screen.findByTestId("layout");
    expect(screen.getByText(/all products/i)).toBeInTheDocument();
    // No card titles present
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    // And since products=[], Loadmore should not show (products.length < total could be true,
    // but with empty list and no subsequent appends, the button is not rendered by your UI)
    expect(screen.queryByRole("button", { name: /loadmore/i })).not.toBeInTheDocument();
  });
});