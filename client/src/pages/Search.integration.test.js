import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Search from "./Search";
import SearchInput from "../components/Form/SearchInput";
import { SearchProvider } from "../context/search";

// Mock hooks
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [{ cart: [] }, jest.fn()]),
}));
jest.mock("../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(() => []),
}));

// Mock axios
jest.mock("axios");

describe("SearchInput → Search Integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders 'No Products Found' initially on Search page", () => {
    render(
        <SearchProvider>
        <MemoryRouter initialEntries={["/search"]}>
            <Routes>
            <Route path="/search" element={<Search />} />
            </Routes>
        </MemoryRouter>
        </SearchProvider>
    );

    expect(screen.getByText(/No Products Found/i)).toBeInTheDocument();
  });

  test("user can search and results are displayed", async () => {
    const mockResults = [
      { _id: "1", name: "Wheelchair A", description: "Comfortable wheelchair", price: 100 },
      { _id: "2", name: "Wheelchair B", description: "Lightweight folding", price: 150 },
    ];

    axios.get.mockResolvedValueOnce({ data: mockResults });

    render(
      <SearchProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<SearchInput />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </MemoryRouter>
      </SearchProvider>
    );

    // Get the SearchInput form and input
    const form = screen.getByRole("search");
    const input = screen.getByPlaceholderText("Search");

    // Type keyword and submit
    fireEvent.change(input, { target: { value: "wheelchair" } });
    fireEvent.submit(form);

    // Wait for Search page to render results
    await waitFor(() => {
      expect(screen.getByText(/Found 2/i)).toBeInTheDocument();

      mockResults.forEach((p) => {
        expect(screen.getByText(p.name)).toBeInTheDocument();
        expect(screen.getByText(`${p.description.substring(0, 30)}...`)).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes(`$ ${p.price}`))).toBeInTheDocument();
      });
    });
  });

  test("displays 'No Products Found' when search yields no results", async () => {
    axios.get.mockResolvedValueOnce({ data: [] }); // empty results

    render(
        <SearchProvider>
        <MemoryRouter initialEntries={["/"]}>
            <Routes>
            <Route path="/" element={<SearchInput />} />
            <Route path="/search" element={<Search />} />
            </Routes>
        </MemoryRouter>
        </SearchProvider>
    );

        const form = screen.getByRole("search");
        const input = screen.getByPlaceholderText("Search");

        fireEvent.change(input, { target: { value: "nonexistent item" } });
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/No Products Found/i)).toBeInTheDocument();
        });
    });

});
