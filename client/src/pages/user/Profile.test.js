import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "../../pages/user/Profile";
import { useAuth } from "../../context/auth";
import axios from "axios";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("../../context/auth");
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../../components/Layout", () => ({ children, title }) => (
  <div data-testid="layout">{children}</div>
));

jest.mock("../../components/UserMenu", () => () => <div>UserMenu</div>);

describe("Profile Page", () => {
  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    address: "123 Main St",
  };

  const mockSetAuth = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue([{ user: mockUser }, mockSetAuth]);
    jest.clearAllMocks();

    // Mock localStorage
    const auth = { user: mockUser, token: "dummy-token" };
    window.localStorage.setItem("auth", JSON.stringify(auth));
  });

  test("renders profile page with user data", () => {
    render(<Profile />);
    expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.phone)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.address)).toBeInTheDocument();
  });

  test("updates all input fields including name, password, phone, address, and email", () => {
    render(<Profile />);

    const nameInput = screen.getByPlaceholderText("Enter Your Name");
    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    expect(nameInput.value).toBe("Jane Doe");

    const passwordInput = screen.getByPlaceholderText("Enter Your Password");
    fireEvent.change(passwordInput, { target: { value: "newpassword" } });
    expect(passwordInput.value).toBe("newpassword");

    const phoneInput = screen.getByPlaceholderText("Enter Your Phone");
    fireEvent.change(phoneInput, { target: { value: "9876543210" } });
    expect(phoneInput.value).toBe("9876543210");

    const addressInput = screen.getByPlaceholderText("Enter Your Address");
    fireEvent.change(addressInput, { target: { value: "456 Elm St" } });
    expect(addressInput.value).toBe("456 Elm St");

    // Disabled email input: use getByDisplayValue to cover onChange
    const emailInput = screen.getByDisplayValue(mockUser.email);
    fireEvent.change(emailInput, { target: { value: "newemail@example.com" } });
    expect(emailInput.value).toBe("newemail@example.com");
  });

  test("submits form and updates profile successfully (without password)", async () => {
    const updatedUser = { ...mockUser, name: "Jane Doe" };
    axios.put.mockResolvedValue({ data: { updatedUser } });

    render(<Profile />);

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "Jane Doe" },
    });

    const form = screen.getByTestId("profile-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: "Jane Doe",
        email: mockUser.email,
        password: "",
        phone: mockUser.phone,
        address: mockUser.address,
      });
      expect(mockSetAuth).toHaveBeenCalledWith({ user: updatedUser });
      expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
    });
  });

  test("submits form successfully with password", async () => {
    const updatedUser = { ...mockUser, name: "Jane Doe" };
    axios.put.mockResolvedValue({ data: { updatedUser } });

    render(<Profile />);

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "mypassword" },
    });

    const form = screen.getByTestId("profile-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: "Jane Doe",
        email: mockUser.email,
        password: "mypassword",
        phone: mockUser.phone,
        address: mockUser.address,
      });
      expect(mockSetAuth).toHaveBeenCalledWith({ user: updatedUser });
      expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
    });
  });

  test("handles API error correctly", async () => {
    axios.put.mockRejectedValue(new Error("Network Error"));

    render(<Profile />);
    const form = screen.getByTestId("profile-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("displays toast error if API returns error message", async () => {
    axios.put.mockResolvedValue({ data: { error: "Invalid data" } });

    render(<Profile />);
    const form = screen.getByTestId("profile-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid data");
    });
  });

  test("handles empty localStorage gracefully", async () => {
    window.localStorage.removeItem("auth");

    const updatedUser = { ...mockUser, name: "Jane Doe" };
    axios.put.mockResolvedValue({ data: { updatedUser } });

    render(<Profile />);

    const form = screen.getByTestId("profile-form");
    fireEvent.submit(form);

    await waitFor(() => {
      const ls = JSON.parse(window.localStorage.getItem("auth"));
      expect(ls.user).toEqual(updatedUser); // tests || {} fallback
      expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
    });
  });
});
