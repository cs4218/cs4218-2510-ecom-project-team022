import React from "react";
import { render, screen, act, fireEvent, waitFor} from "@testing-library/react"
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import MockAdapter from "axios-mock-adapter";
import { useAuth } from "../../context/auth";
import AdminOrders from "./AdminOrders";
import {AuthProvider} from "../../context/auth";
import {CartProvider} from "../../context/cart";
import {SearchProvider} from "../../context/search";

const mock = new MockAdapter(axios);
// The following mock is created with the help of AI
jest.mock("antd", () => {
  const actualAntd = jest.requireActual("antd");

  const MockSelect = ({ children, onChange, defaultValue, "data-testid": testId }) => (
    <select
      data-testid={testId}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );

  MockSelect.Option = ({ value, children }) => <option value={value}>{children}</option>;

  return {
    ...actualAntd,
    Select: MockSelect,
  };
});

const mockMultipleOrders = [
  {
    _id: "1",
    status: "Not Processed", //"Not Processed", "Processing", "Shipped", "Delivered", "Cancelled"
    buyer: {name: "userA"},
    createdAt: "2025-02-04T13:42:16.741+00:00",
    payment: {success: true},
    products:[
        {_id: "1", name: "productA", description: "descriptionA", price: 1.99},
        {_id: "2", name: "productB", description: "descriptionB", price: 2.99}, 
    ],
  },
  {
    _id: "2",
    status: "Processing", //"Not Processed", "Processing", "Shipped", "Delivered", "Cancelled"
    buyer: {name: "userB"},
    createdAt: "2025-12-14T13:22:16.741+00:00",
    payment: {success: false},
    products:[
        {_id: "1", name: "productC", description: "descriptionA", price: 1.99},
    ],
  },
];

jest.spyOn(toast, "error");

//renderWithAuth is created with the help of AI 
const renderWithAuth = (token = null) => {
  if (token) {
    localStorage.setItem(
      "auth",
      JSON.stringify({ user: { name: "Admin" }, token })
    );
  } else {
    localStorage.removeItem("auth");
  }

  return render(
        <SearchProvider>
            <CartProvider>
                <AuthProvider>
                    <MemoryRouter>
                        <AdminOrders />
                     </MemoryRouter>
                </AuthProvider>
            </CartProvider>
        </SearchProvider>
  );
};

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

describe("Admin Order - Integration Test", () => {
    beforeEach(() => {
        mock.reset();
        localStorage.clear();
    });

    test("if no auth token, does not get orders", async () => {
        mock.onGet("/api/v1/auth/all-orders").reply(200,mockMultipleOrders);

        await act(async () => {
            renderWithAuth(null);
        });

        expect(await screen.findByText("All Orders")).toBeInTheDocument();
        expect(screen.queryByText("userA")).not.toBeInTheDocument();
        expect(screen.queryByText("productA")).not.toBeInTheDocument();
        expect(screen.queryByText("productB")).not.toBeInTheDocument();
        expect(screen.queryByText("userB")).not.toBeInTheDocument();
        expect(screen.queryByText("productC")).not.toBeInTheDocument();
    });

    test("if have auth token, gets multiple orders", async () => {
        mock.onGet("/api/v1/auth/all-orders").reply(200,mockMultipleOrders);

        await act(async () => {
            renderWithAuth("token");
        });

        expect(await screen.findByText("All Orders")).toBeInTheDocument();
        expect(screen.queryByText("userA")).toBeInTheDocument();
        expect(screen.queryByText("productA")).toBeInTheDocument();
        expect(screen.queryByText("productB")).toBeInTheDocument();
        expect(screen.queryByText("userB")).toBeInTheDocument();
        expect(screen.queryByText("productC")).toBeInTheDocument();
    });

    test("handle error properly for getOrders", async () => {
        mock.onGet("/api/v1/auth/all-orders").reply(500, mockMultipleOrders); //internal server error

        await act(async () => {
            renderWithAuth("token");
        });

        expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting orders")
    });

    test("handle change properly", async () => {
        mock.onGet("/api/v1/auth/all-orders").reply(200, mockMultipleOrders)
            .onPut("/api/v1/auth/order-status/1").reply(200, { ok: true });

        await act(async () => {
            renderWithAuth("token");
        });

        const firstDropdown = await screen.findByTestId("status-1");
        expect(firstDropdown.value).toBe("Not Processed");
        fireEvent.change(firstDropdown, { target: { value: "Processing" } });

        await waitFor(() => {
            expect(mock.history.put.length).toBe(1);
            expect(mock.history.get.length).toBe(2);
            expect(mock.history.put[0].url).toBe("/api/v1/auth/order-status/1");
        });
    });

    test("handle error properly for handle change", async () => {
        mock.onGet("/api/v1/auth/all-orders").reply(200, mockMultipleOrders)
            .onPut("/api/v1/auth/order-status/1").reply(500);

        await act(async () => {
            renderWithAuth("token");
        });

        const firstDropdown = await screen.findByTestId("status-1");
        fireEvent.change(firstDropdown, { target: { value: "Shipped" } });

        await waitFor (() => {
            expect(mock.history.put.length).toBe(1);
            expect(toast.error).toHaveBeenCalledWith("Something went wrong in handling change");
        });
    });
});