import React from "react";
import { render, screen, act } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom";
import Products from "./Products";
import axios from "axios";
import toast from "react-hot-toast";
import {Toaster} from "react-hot-toast";
import MockAdapter from "axios-mock-adapter";
import {AuthProvider} from "../../context/auth";
import {CartProvider} from "../../context/cart";
import {SearchProvider} from "../../context/search";

const mock = new MockAdapter(axios);
jest.spyOn(toast, "error");

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

describe("Products", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    test("renders zero products successfully", async () => {
        mock.onGet("/api/v1/product/get-product").reply(200, {products: mockZeroProducts});

        await act(async () => {
            render(
                <SearchProvider>
                    <CartProvider>
                        <AuthProvider>
                            <MemoryRouter>
                                <Toaster/>
                                <Products />
                            </MemoryRouter>
                        </AuthProvider>
                    </CartProvider>
                </SearchProvider>
            );
        });
    
        expect(await screen.findByText("All Products List")).toBeInTheDocument();
    });

    test("renders multiple products successfully", async () => {
        mock.onGet("/api/v1/product/get-product").reply(200, {products: mockMultipleProducts});

        await act(async () => {
            render(
                <SearchProvider>
                    <CartProvider>
                        <AuthProvider>
                            <MemoryRouter>
                                <Toaster/>
                                <Products />
                            </MemoryRouter>
                        </AuthProvider>
                    </CartProvider>
                </SearchProvider>
            );
        });
       
        expect(screen.getByText("All Products List")).toBeInTheDocument();
        expect(screen.queryByText("nameA")).toBeInTheDocument();
        expect(screen.queryByText("nameB")).toBeInTheDocument();
    });

    test("handle error properly", async () => {
        mock.onGet("/api/v1/product/get-product").reply(500);

        await act(async () => {
            render(
                <SearchProvider>
                    <CartProvider>
                        <AuthProvider>
                            <MemoryRouter>
                                <Toaster/>
                                <Products />
                            </MemoryRouter>
                        </AuthProvider>
                    </CartProvider>
                </SearchProvider>
            );
        });
     
        expect(toast.error).toHaveBeenCalledWith("View Products: Something Went Wrong");
    });
});