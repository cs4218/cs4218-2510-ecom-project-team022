import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import useCategory from "./useCategory";
import axios from "axios";

jest.mock("axios");

describe("useCategory hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with an empty array", () => {
    const { result } = renderHook(() => useCategory());
    expect(result.current).toEqual([]);
  });

  it("fetches and sets categories", async () => {
    const mockData = { category: ["Electronics", "Books"] };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual(mockData.category);
    });

    expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
  });

  it("logs an error on failure", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    renderHook(() => useCategory());

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
