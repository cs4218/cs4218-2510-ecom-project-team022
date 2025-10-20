import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router-dom";
import Spinner from "./Spinner";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

let mockAuth = { token: "", user: null };
jest.mock("../context/auth", () => ({
  useAuth: () => [mockAuth, jest.fn()],
}));

describe("Spinner Component (unit)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render loading UI with initial countdown (3)", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Spinner />
      </MemoryRouter>
    );

    // Act
    const heading = screen.getByRole("heading", { level: 1 });

    // Assert
    expect(heading).toHaveTextContent(/redirecting you in 3 second/i);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should reduce countdown timer by 1 each second (3 → 2 → 1 → 0)", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Spinner />
      </MemoryRouter>
    );

    const getHeading = () => screen.getByRole("heading", { level: 1 });

    // Act + Assert (tick 1s → 2)
    act(() => jest.advanceTimersByTime(1000));
    expect(getHeading()).toHaveTextContent(/in 2 seconds/i);

    // Act + Assert (tick 1s → 1)
    act(() => jest.advanceTimersByTime(1000));
    expect(getHeading()).toHaveTextContent(/in 1 second/i);

    // Act + Assert (tick 1s → 0)
    act(() => jest.advanceTimersByTime(1000));
    expect(getHeading()).toHaveTextContent(/in 0 second/i);
  });

  it("should navigate to /login with state=pathname when countdown reaches 0 (default path)", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Spinner />
      </MemoryRouter>
    );

    // Act
    act(() => jest.advanceTimersByTime(3000));

    // Assert
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      state: "/protected",
    });
  });

  it("should navigate to the provided custom path when countdown reaches 0", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Spinner path="cart" />
      </MemoryRouter>
    );

    // Act
    act(() => jest.advanceTimersByTime(3000));

    // Assert
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/cart", { state: "/protected" });
  });

  it("should clear the interval on unmount (no navigate after unmount)", () => {
    // Arrange
    const { unmount } = render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Spinner />
      </MemoryRouter>
    );

    // Act
    unmount();
    act(() => jest.advanceTimersByTime(5000));

    // Assert
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should navigate only once even if more time passes", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Spinner />
      </MemoryRouter>
    );

    // Act
    act(() => jest.advanceTimersByTime(3000));
    act(() => jest.advanceTimersByTime(2000));

    // Assert
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("should create exactly one interval for the countdown", () => {
    // Arrange
    const setIntervalSpy = jest.spyOn(global, "setInterval");
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Spinner />
      </MemoryRouter>
    );

    // Act
    act(() => jest.advanceTimersByTime(4000));

    // Assert
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(clearIntervalSpy).toHaveBeenCalled();

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it("should stop decrementing at 0 (never negative)", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Spinner />
      </MemoryRouter>
    );

    const getHeading = () => screen.getByRole("heading", { level: 1 });

    // Act:
    act(() => jest.advanceTimersByTime(6000));

    // Assert
    expect(getHeading()).toHaveTextContent(/in 0 second/i);
  });

  it("should use correct grammar for 'second(s)' and the bootstrap class 'text-center'", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Spinner />
      </MemoryRouter>
    );

    const heading = screen.getByRole("heading", { level: 1 });

    // Assert
    expect(heading).toHaveClass("text-center");
    expect(heading).toHaveTextContent(/redirecting you in 3 seconds/i);

    // Act
    act(() => jest.advanceTimersByTime(2000));

    // Assert
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /in 1 second\b/i
    );
  });
});
