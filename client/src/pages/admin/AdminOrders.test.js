import React from "react";
import { render, screen, act, fireEvent} from "@testing-library/react"
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/auth";
import AdminOrders from "./AdminOrders";

jest.mock("axios");
jest.mock("../../components/AdminMenu", () => () => <div>AdminMenu</div>);
jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>); 
jest.mock("../../context/auth", () => ({useAuth: jest.fn()}));
// The following mock is created with the help of AI
jest.mock("antd", () => {
  const React = require("react");
  const antd = jest.requireActual("antd");

    const MockSelect = ({ children, onChange, value }) => (
    <select
        data-testid="mock-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
    >
        {React.Children.map(children, (child) => (
        <option value={child.props.value}>{child.props.children}</option>
        ))}
    </select>
  );

  return {
    ...antd,
    Select: MockSelect,
  };
});
                
const mockMultipleOrders = [
  {
    _id: "1",
    status: "Not Processed", //"Not Processed"", "Processing", "Shipped", "Delivered", "Cancelled"
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
    status: "Processing", //"Not Processed"", "Processing", "Shipped", "Delivered", "Cancelled"
    buyer: {name: "userB"},
    createdAt: "2025-12-14T13:22:16.741+00:00",
    payment: {success: false},
    products:[
        {_id: "1", name: "productC", description: "descriptionA", price: 1.99},
    ],
  },
];

describe("Admin Orders", () => {
    beforeEach(() => {
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.clearAllMocks();
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    test("if no auth token, does not get orders", async () => {
        useAuth.mockReturnValue([{}, jest.fn()]);

        await act(async () => {
        render(
            <MemoryRouter>
                <AdminOrders />
            </MemoryRouter>
        );
        });

        expect(screen.getByText("All Orders")).toBeInTheDocument();
        expect(axios.get).toHaveBeenCalledTimes(0);
    });

    test("if have auth token, gets multiple orders", async () => {
        useAuth.mockReturnValue([{token: "token1"}, jest.fn()]);
        axios.get.mockResolvedValueOnce({ data: mockMultipleOrders });

        await act(async () => {
        render(
            <MemoryRouter>
                <AdminOrders />
            </MemoryRouter>
        );
        });

        expect(screen.getByText("All Orders")).toBeInTheDocument();
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(screen.getByText("productA")).toBeInTheDocument();
        expect(screen.getByText("productB")).toBeInTheDocument();
    });

    test("handle error properly for getOrders", async () => {
        const errorMessage = "There's an error";
        axios.get.mockRejectedValueOnce(new Error(errorMessage));

        await act(async () => {
            render(
                <MemoryRouter>
                <AdminOrders />
                </MemoryRouter>
            );
        });

        expect(logSpy).toHaveBeenCalled();
        expect(logSpy.mock.calls[0][0].message).toBe(errorMessage);
    });

    //The following test is created with the help of AI
    test("handle change properly", async () => {
        useAuth.mockReturnValue([{token: "token1"}, jest.fn()]);
        axios.get.mockResolvedValueOnce({ data: mockMultipleOrders }).mockResolvedValueOnce({ data: mockMultipleOrders });
        axios.put.mockResolvedValueOnce({ data: { ok: true } });

        await act(async () => {
            render(
                <MemoryRouter>
                    <AdminOrders />
                </MemoryRouter>
            );
        });

        expect(screen.getByText("All Orders")).toBeInTheDocument();
        expect(screen.getByText("userA")).toBeInTheDocument();

        const selectFirstOrder = screen.getAllByTestId("mock-select")[0];
        await act(async () => {
            fireEvent.change(selectFirstOrder, { target: { value: "Processing" } });
        }); 
        expect(axios.put).toHaveBeenCalledWith(`/api/v1/auth/order-status/1`, {"status": "Processing"});
        expect(axios.get).toHaveBeenCalledTimes(2);
    });

    test("handle error properly for handle change", async () => {
        useAuth.mockReturnValue([{token: "token1"}, jest.fn()]);
        axios.get.mockResolvedValueOnce({ data: mockMultipleOrders });
        const errorMessage = "There's an error";
        axios.put.mockRejectedValueOnce(new Error(errorMessage));

        await act(async () => {
            render(
                <MemoryRouter>
                    <AdminOrders />
                </MemoryRouter>
            );
        });

        const selectSecondOrder = screen.getAllByTestId("mock-select")[1];
        await act(async () => {
            fireEvent.change(selectSecondOrder, { target: { value: "Shipped" } });
        }); 
        expect(logSpy).toHaveBeenCalled();
        expect(logSpy.mock.calls[0][0].message).toBe(errorMessage);
    });
});