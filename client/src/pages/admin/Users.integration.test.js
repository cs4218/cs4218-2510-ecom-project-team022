import React from "react";
import { render, screen, waitFor, act, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom";
import Users from "./Users";
import axios from "axios";
import {Toaster} from "react-hot-toast";
import MockAdapter from "axios-mock-adapter";
import {AuthProvider} from "../../context/auth";
import {CartProvider} from "../../context/cart";
import {SearchProvider} from "../../context/search";

const mock = new MockAdapter(axios);

const mockZeroUsers = [];

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

//the following beforeAll block is created with the help of AI to solve ReferenceError: matchMedia is not defined
beforeAll(() => {
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };
});

describe("Users - Integration Testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mock.reset();
  });

  test("renders zero users successfully - empty table", async () => {
    mock.onGet("/api/v1/auth/all-users").reply(200, {users:mockZeroUsers});

    await act(async () => {
      render(
        <SearchProvider>
            <CartProvider>
                <AuthProvider>
                    <MemoryRouter>
                        <Toaster/>
                        <Users />
                     </MemoryRouter>
                </AuthProvider>
            </CartProvider>
        </SearchProvider>
      );
    });

    expect(screen.getByText("All Users")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(1); //only header row
  });

  test("renders multiple users successfully", async () => {
    mock.onGet("/api/v1/auth/all-users").reply(200, {users:mockMultipleUsers});

    await act(async () => {
      render(
        <SearchProvider>
            <CartProvider>
                <AuthProvider>
                    <MemoryRouter>
                        <Toaster/>
                        <Users />
                     </MemoryRouter>
                </AuthProvider>
            </CartProvider>
        </SearchProvider>
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
    const errorMessage = "Request failed with status code 404";
    mock.onGet("/api/v1/auth/all-users").reply(404, errorMessage);

    await act(async () => {
      render(
        <SearchProvider>
            <CartProvider>
                <AuthProvider>
                    <MemoryRouter>
                        <Toaster />
                        <Users />
                     </MemoryRouter>
                </AuthProvider>
            </CartProvider>
        </SearchProvider>
      );
    });

    //expect( screen.getByText("View Users: Something Went Wrong")).toBeInTheDocument();
    expect(screen.getAllByText(/something went wrong/i)[0]).toBeInTheDocument();
  });
});