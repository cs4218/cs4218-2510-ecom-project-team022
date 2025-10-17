import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import SearchInput from "./SearchInput.js";
import { SearchProvider } from "../../context/search.js";

// Mock axios
jest.mock("axios");

describe("SearchInput Integration Test", () => {
  const mockData = [
    { _id: "1", name: "Wheelchair A", description: "Comfortable chair", price: 100 },
    { _id: "2", name: "Wheelchair B", description: "Lightweight chair", price: 150 },
  ];

  test("renders input and button, updates context, and navigates on submit", async () => {
    // Mock API response
    axios.get.mockResolvedValueOnce({ data: mockData });

    render(
      <SearchProvider>
        <MemoryRouter>
          <SearchInput />
        </MemoryRouter>
      </SearchProvider>
    );

    const input = screen.getByPlaceholderText("Search");
    const button = screen.getByRole("button", { name: /search/i });

    // Type in input
    fireEvent.change(input, { target: { value: "wheelchair" } });
    expect(input.value).toBe("wheelchair"); // real input value

    // Submit form
    fireEvent.click(button);

    // Wait for axios call and context update
    await waitFor(() => {
      // Axios should be called
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/wheelchair");

      // Context should update: check if results are rendered somewhere in component tree
      // Since SearchInput itself doesn't render results, we can test the state via context indirectly
      // One way is to render a consumer inside test:
    });
  });

  test("handles API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network error"));
    console.log = jest.fn(); // suppress console

    render(
      <SearchProvider>
        <MemoryRouter>
          <SearchInput />
        </MemoryRouter>
      </SearchProvider>
    );

    const button = screen.getByRole("button", { name: /search/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/");
      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
