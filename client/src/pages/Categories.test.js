/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";
import Layout from "../components/Layout";

// ✅ Mock the custom hook and Layout
jest.mock("../hooks/useCategory");
jest.mock("../components/Layout", () => ({ title, children }) => (
  <div data-testid="layout">
    <h1>{title}</h1>
    {children}
  </div>
));

describe("Categories component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with multiple categories", () => {
    const mockCategories = [
      { _id: "1", name: "Electronics", slug: "electronics" },
      { _id: "2", name: "Books", slug: "books" },
    ];
    useCategory.mockReturnValue(mockCategories);

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    // ✅ Layout renders with correct title
    expect(screen.getByText("All Categories")).toBeInTheDocument();

    // ✅ Category names are shown
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Books")).toBeInTheDocument();

    // ✅ Links are correct
    expect(screen.getByText("Electronics").closest("a")).toHaveAttribute(
      "href",
      "/category/electronics"
    );
    expect(screen.getByText("Books").closest("a")).toHaveAttribute(
      "href",
      "/category/books"
    );
  });

  it("renders nothing when there are no categories", () => {
    useCategory.mockReturnValue([]);

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    // ✅ Layout still renders, but no category links
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
