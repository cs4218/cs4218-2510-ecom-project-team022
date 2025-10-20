import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Spinner from "./Spinner";

// Mock useNavigate for integration test (top-down with mocks)
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock useauth
let mockAuth = { token: "", user: null };
jest.mock("../context/auth", () => ({
  useAuth: () => [mockAuth, jest.fn()],
}));

describe("Spinner integration (top-down)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("Spinner renders with countdown and navigates to login after timeout", async () => {
    // Render Spinner in router context
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Spinner />
      </MemoryRouter>
    );

    // Initial state: should show 3 seconds
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /redirecting you in 3 second/i
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // After 1 second: should show 2 seconds
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /redirecting you in 2 seconds/i
    );

    // After 2 seconds: should show 1 second
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /redirecting you in 1 second/i
    );

    // After 3 seconds: should navigate to login
    act(() => jest.advanceTimersByTime(1000));
    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      state: "/protected",
    });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /redirecting you in 0 second/i
    );
  });

  test("Spinner navigates to custom path when provided", async () => {
    // Render Spinner with custom path
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Spinner path="dashboard" />
      </MemoryRouter>
    );

    // Should start with 3 seconds countdown
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /redirecting you in 3 second/i
    );

    // Fast forward to navigation
    act(() => jest.advanceTimersByTime(3000));

    // Should navigate to custom path with current location state
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { state: "/cart" });
  });

  test("Spinner uses correct grammar for seconds (singular/plural)", async () => {
    render(
      <MemoryRouter initialEntries={["/test"]}>
        <Spinner />
      </MemoryRouter>
    );

    // 3 seconds (plural)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /3 seconds/i
    );

    // 2 seconds (plural)
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /2 seconds/i
    );

    // 1 second (singular)
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /1 second/i
    );

    // 0 second (singular)
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /0 second/i
    );
  });

  test("Spinner cleans up interval when unmounted", async () => {
    const setIntervalSpy = jest.spyOn(global, "setInterval");
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");

    const { unmount } = render(
      <MemoryRouter initialEntries={["/test"]}>
        <Spinner />
      </MemoryRouter>
    );

    // Verify interval was created
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    // Unmount component
    unmount();

    // Verify interval was cleared
    expect(clearIntervalSpy).toHaveBeenCalled();

    // Advance time after unmount - should not navigate
    act(() => jest.advanceTimersByTime(5000));
    expect(mockNavigate).not.toHaveBeenCalled();

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  test("Spinner state component integrates with router navigation", async () => {
    // Test that Spinner correctly integrates with React Router's navigation system
    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <Spinner path="login" />
      </MemoryRouter>
    );

    // Verify countdown starts correctly
    expect(
      screen.getByText(/redirecting you in 3 second/i)
    ).toBeInTheDocument();

    // Complete countdown
    act(() => jest.advanceTimersByTime(3000));

    // Verify navigation was called with correct parameters
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      state: "/admin/users",
    });
  });
});
