import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import SearchInput from "./SearchInput";

// Mock useSearch and useNavigate hooks
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("axios");

describe("SearchInput component", () => {
  let mockSetValues;
  let mockNavigate;

  beforeEach(() => {
    mockSetValues = jest.fn();
    mockNavigate = jest.fn();

    const mockValues = { keyword: "", results: [] };

    require("../../context/search").useSearch.mockReturnValue([
      mockValues,
      mockSetValues,
    ]);

    require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders search input and button", () => {
    render(
      <MemoryRouter>
        <SearchInput />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  test("updates input value when typing", () => {
    render(
      <MemoryRouter>
        <SearchInput />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "wheelchair" } });

    expect(mockSetValues).toHaveBeenCalledWith({ keyword: "wheelchair", results: [] });
  });

  test("submits form, calls API, updates results, and navigates", async () => {
    const mockData = [{ id: 1, name: "Wheelchair Model A" }];

    axios.get.mockResolvedValueOnce({ data: mockData });

    const mockValues = { keyword: "wheelchair", results: [] };
    require("../../context/search").useSearch.mockReturnValue([
      mockValues,
      mockSetValues,
    ]);

    render(
      <MemoryRouter>
        <SearchInput />
      </MemoryRouter>
    );

    const form = screen.getByRole("search");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/wheelchair");
      expect(mockSetValues).toHaveBeenCalledWith({
        ...mockValues,
        results: mockData,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/search");
    });
  });

  test("handles API errors gracefully", async () => {
    console.log = jest.fn(); // suppress console output

    axios.get.mockRejectedValueOnce(new Error("Network error"));

    const mockValues = { keyword: "test", results: [] };
    require("../../context/search").useSearch.mockReturnValue([
      mockValues,
      mockSetValues,
    ]);

    render(
      <MemoryRouter>
        <SearchInput />
      </MemoryRouter>
    );

    const form = screen.getByRole("search");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/test");
      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
