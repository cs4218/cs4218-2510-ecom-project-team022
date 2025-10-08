import React from "react";
import { render, screen, waitFor, act, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom";
import Users from "./Users";
import axios from "axios";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
}));
jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>);

const mockZeroUsers = [];

//only included fields that are displayed
const mockMultipleUsers = [
  {
    _id: "1",
    name: "userA",
    email: "userA@gmail.com",
    phone: "12345678",
    address: "addressA",
    role: 0,
  },
  {
     _id: "2",
    name: "adminB",
    email: "adminB@gmail.com",
    phone: "87654321",
    address: "addressB",
    role: 1,
  },
];

describe("Users Unit Testing", () => {
  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.clearAllMocks();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test("renders zero users successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: { users: mockZeroUsers } });

    await act(async () => {
      render(
        <MemoryRouter>
          <Users />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("All Users")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(1); //only header row
  });

  test("renders multiple users successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: { users: mockMultipleUsers } });

    await act(async () => {
      render(
        <MemoryRouter>
          <Users />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("All Users")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);

    const userARow = screen.getAllByRole("row")[1];
    expect(within(userARow).getByText("userA")).toBeInTheDocument();
    expect(within(userARow).getByText("User")).toBeInTheDocument();
    
    const adminBRow = screen.getAllByRole("row")[2];
    expect(within(adminBRow).getByText("adminB")).toBeInTheDocument();
    expect(within(adminBRow).getByText("Admin")).toBeInTheDocument();
  });

  test("handle error properly", async () => {
    const errorMessage = "There's an error";

    axios.get.mockRejectedValueOnce(new Error(errorMessage));

    await act(async () => {
      render(
        <MemoryRouter>
          <Users />
        </MemoryRouter>
      );
    });

    expect(toast.error).toHaveBeenCalledWith("View Users: Something Went Wrong");
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy.mock.calls[0][0].message).toBe(errorMessage);
  });
});



