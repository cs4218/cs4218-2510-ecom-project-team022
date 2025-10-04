import React from "react";
import { render, screen } from "@testing-library/react";
import Search from "./Search";

// Mock the Layout component to just render children
jest.mock("./../components/Layout", () => ({ title, children }) => (
  <div data-testid="layout">{children}</div>
));

// Mock the useSearch hook
jest.mock("../context/search", () => ({
  useSearch: jest.fn(),
}));

describe("Search Page", () => {
  const mockUseSearch = require("../context/search").useSearch;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders 'No Products Found' when results are empty", () => {
    mockUseSearch.mockReturnValue([{ keyword: "", results: [] }, jest.fn()]);

    render(<Search />);

    expect(screen.getByText("Search Resuts")).toBeInTheDocument();
    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  test("renders product cards when results exist", () => {
    const mockResults = [
      {
        _id: "1",
        name: "Wheelchair A",
        description: "Comfortable wheelchair for indoor use",
        price: 100,
      },
      {
        _id: "2",
        name: "Wheelchair B",
        description: "Lightweight folding wheelchair",
        price: 150,
      },
    ];

    mockUseSearch.mockReturnValue([{ keyword: "wheelchair", results: mockResults }, jest.fn()]);

    render(<Search />);

    // Heading shows correct number of results
    expect(screen.getByText("Found 2")).toBeInTheDocument();

    // Rendered product names
    mockResults.forEach((p) => {
      expect(screen.getByText(p.name)).toBeInTheDocument();
      expect(screen.getByText(`${p.description.substring(0, 30)}...`)).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes(`$ ${p.price}`))).toBeInTheDocument();
    });

    // Buttons exist
    expect(screen.getAllByText("More Details")).toHaveLength(2);
    expect(screen.getAllByText("ADD TO CART")).toHaveLength(2);
  });

  test("renders correct heading inside Layout", () => {
    mockUseSearch.mockReturnValue([{ keyword: "", results: [] }, jest.fn()]);

    render(<Search />);

    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });
});
