import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchInput, {ERROR_MESSAGE} from "./SearchInput.js";
import { SearchProvider, useSearch } from "../../context/search.js";
import toast from "react-hot-toast";

// Mock axios
jest.mock("axios");

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("react-hot-toast");

describe("SearchInput Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const mockData = [
    { _id: "1", name: "Wheelchair A", description: "Comfortable chair", price: 100 },
    { _id: "2", name: "Wheelchair B", description: "Lightweight chair", price: 150 },
  ];
    
  // Helper component to read SearchContext
  const ContextChecker = () => {
    const [values] = useSearch();
      return (
        <div data-testid="context-results">
          {values?.results?.length > 0 ? `Results: ${values.results.length}` : "No results"}
        </div>
      );
    };


  test("renders input and button, updates context, and navigates on submit", async () => {
    // Mock API response
    axios.get.mockResolvedValueOnce({ data: mockData });

    render(
      <SearchProvider>
        <MemoryRouter>
          <SearchInput />
          <ContextChecker />
        </MemoryRouter>
      </SearchProvider>
    );

    const input = screen.getByPlaceholderText("Search");
    const button = screen.getByRole("button", { name: /search/i });

    // Type in input
    fireEvent.change(input, { target: { value: "wheelchair" } });
    // Submit form
    fireEvent.click(button);

    // Wait for axios call, context update, and navigation
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/wheelchair");
        expect(screen.getByTestId("context-results").textContent).toBe("Results: 2");
        expect(mockNavigate).toHaveBeenCalledWith("/search");
    });
  });

  test("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));
    console.log = jest.fn(); // suppress console

    render(
      <SearchProvider>
        <MemoryRouter>
          <SearchInput />
          <ContextChecker />
        </MemoryRouter>
      </SearchProvider>
    );

    const button = screen.getByRole("button", { name: /search/i });
    fireEvent.click(button);

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/");
        expect(console.log).toHaveBeenCalledWith(expect.any(Error));
        expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
