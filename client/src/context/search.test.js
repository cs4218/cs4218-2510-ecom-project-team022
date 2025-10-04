import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { useSearch, SearchProvider } from "./search";

// A simple test component that consumes the context
const TestComponent = () => {
  const [search, setSearch] = useSearch();

  return (
    <div>
      <p data-testid="keyword">{search.keyword}</p>
      <p data-testid="results">{JSON.stringify(search.results)}</p>
      <button
        onClick={() =>
          setSearch({ keyword: "wheelchair", results: ["A", "B"] })
        }
      >
        Update
      </button>
    </div>
  );
};

describe("SearchContext and useSearch", () => {
  test("provides default search state", () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    expect(screen.getByTestId("keyword").textContent).toBe("");
    expect(screen.getByTestId("results").textContent).toBe("[]");
  });

  test("updates context state when setSearch is called", async () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    const button = screen.getByText("Update");

    // ✅ Wrap state-changing action in act()
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByTestId("keyword").textContent).toBe("wheelchair");
    expect(screen.getByTestId("results").textContent).toBe(
      JSON.stringify(["A", "B"])
    );
  });

  test("throws error when useSearch is used outside of provider", () => {
    const consoleError = console.error;
    console.error = jest.fn();

    const BadComponent = () => {
      useSearch();
      return <div />;
    };

    expect(() => render(<BadComponent />)).toThrow();

    console.error = consoleError;
  });
});
