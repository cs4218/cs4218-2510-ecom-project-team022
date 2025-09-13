import React from "react";
import {render, screen, waitFor, act} from "@testing-library/react"
import {MemoryRouter} from "react-router-dom";
import Products from "./Products";
import axios from "axios";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
   success: jest.fn(),
   error: jest.fn(),
   loading: jest.fn(),
}));
jest.mock("../../components/Layout", () => ({children}) => <div>{children}</div>);

const mockZeroProducts = [];

const mockMultipleProducts = [
    {
   _id: "1",
   name: "nameA",
   slug: "slugA",
   description: "descriptionA",
   price: 1.99,
   // did not include category, quantity, false, createdAt, updatedAt, __v
    },
    {
   _id: "2",
   name: "nameB",
   slug: "slugB",
   description: "descriptionB",
   price: 2.99,
    },
];

describe("Products", () => {
   beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
   });
   
   afterEach(() => {
    logSpy.mockRestore();
   });

   test("renders zero products successfully", async () => {
       axios.get.mockResolvedValueOnce({data: {products: mockZeroProducts}});

        await act (async () => {
            render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
            );
        });

        expect(screen.getByText("All Products List")).toBeInTheDocument();
   });

   test("renders multiple products successfully", async () => {
       axios.get.mockResolvedValueOnce({data: {products: mockMultipleProducts}});

        await act (async () => {
            render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
            );
        });

        expect(screen.getByText("All Products List")).toBeInTheDocument();
        expect(screen.getByText("nameA")).toBeInTheDocument();
        expect(screen.getByText("nameB")).toBeInTheDocument();
   });

   test("handle error properly", async () => {
        const errorMessage = "There's an error";

        axios.get.mockRejectedValueOnce(new Error(errorMessage));

        await act (async () => {
            render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
            );
        });

        expect(toast.error).toHaveBeenCalledWith("Something Went Wrong");
        expect(logSpy).toHaveBeenCalled();
        expect(logSpy.mock.calls[0][0].message).toBe(errorMessage);
   });
});



