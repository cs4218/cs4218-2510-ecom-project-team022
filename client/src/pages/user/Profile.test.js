import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./Profile";
import axios from "axios";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

// mock useAuth
const mockSetAuth = jest.fn();
const mockUseAuth = jest.fn();
jest.mock("../../context/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// mock imported components
jest.mock("../../components/UserMenu", () => () => <div>UserMenu</div>);
jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

// mock localstorage
// set default return value to always return
const defaultUser = {
  user: {
    name: "Test User",
    email: "test@example.com",
    phone: "1234567890",
    address: "123 Test St",
  },
  token: "token",
};

describe("Profile page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for useAuth
    mockUseAuth.mockReturnValue([
      {
        user: {
          name: "Test User",
          email: "test@example.com",
          phone: "1234567890",
          address: "123 Test St",
        },
        token: "token",
      },
      mockSetAuth,
    ]);

    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    window.localStorage.getItem.mockReturnValue(JSON.stringify(defaultUser));

    // mock localstorage
    // window.localStorage.setItem("auth", JSON.stringify({ user: { name: "Test User", email: "test@example.com", phone: "1234567890", address: "123 Test St" }, token: "token" }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the form with correct initial values from auth context", () => {
    render(<Profile />);
    expect(screen.getByPlaceholderText("Enter Your Name").value).toBe(
      "Test User"
    );
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe(
      "test@example.com"
    );
    expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe(
      "1234567890"
    );
    expect(screen.getByPlaceholderText("Enter Your Address").value).toBe(
      "123 Test St"
    );
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeDisabled();
  });

  it("submits the form and updates context/localStorage on success", async () => {
    axios.put.mockResolvedValueOnce({
      data: {
        updatedUser: {
          name: "New Name",
          email: "test@example.com",
          phone: "1112223333",
          address: "New Address",
        },
      },
    });
    render(<Profile />);
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "New Name" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1112223333" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: "New Address" },
    });
    fireEvent.click(screen.getByText("UPDATE"));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(mockSetAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ name: "New Name" }),
      })
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "auth",
      expect.stringContaining("New Name")
    );
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });

  it("shows an error if the API call fails", async () => {
    axios.put.mockRejectedValueOnce(new Error("API Error"));
    render(<Profile />);
    fireEvent.click(screen.getByText("UPDATE"));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("shows error toast when API returns data.error", async () => {
    const errorMessage = "Password must be at least 6 characters long";
    axios.put.mockResolvedValueOnce({ data: { error: errorMessage } });
    render(<Profile />);
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByText("UPDATE"));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    expect(mockSetAuth).not.toHaveBeenCalled();
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
