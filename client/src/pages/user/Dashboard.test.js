import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";

// Mock useAuth
const mockUseAuth = jest.fn();
jest.mock("../../context/auth", () => ({
  useAuth: () => mockUseAuth()
}));

// Mock UserMenu and Layout to avoid rendering their internals
jest.mock("../../components/UserMenu", () => () => <div>UserMenu</div>);
jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>);

describe("Dashboard page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue([
      {
        user: {
          name: "Test User",
          email: "test@example.com",
          address: "123 Test St"
        },
        token: "token"
      }
    ]);
  });

  it("renders the user's name, email, and address", () => {
    render(<Dashboard />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("123 Test St")).toBeInTheDocument();
  });
});
