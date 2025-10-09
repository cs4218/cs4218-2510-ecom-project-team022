import React from "react";
import {render, screen, act, fireEvent} from "@testing-library/react"
import {MemoryRouter} from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import MockAdapter from "axios-mock-adapter";
import {AuthProvider} from "../../context/auth";
import {CartProvider} from "../../context/cart";
import {SearchProvider} from "../../context/search";

const mock = new MockAdapter(axios);
jest.spyOn(toast, "success");

describe("CreateCategory", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("displays existing categories", async () => {
        mock.onGet("/api/v1/category/get-category").reply(200, {success: true, category: [{_id: "001", name: "testCategory"},],});
        
        await act(async () => {
            render(<MemoryRouter>
                        <SearchProvider>
                                <CartProvider>
                                    <AuthProvider>
                                         <CreateCategory />
                                    </AuthProvider>
                                </CartProvider>
                            </SearchProvider>
                        </MemoryRouter>);
        });

        expect(await screen.findByText("Manage Category")).toBeInTheDocument();
        expect(screen.getAllByText("testCategory")[0]).toBeInTheDocument();
    });

    test("handleSubmit - successful", async () => {
        mock.onPost("/api/v1/category/create-category").reply(200, {success: true});

         await act(async () => {
            render(<MemoryRouter>
                        <SearchProvider>
                                <CartProvider>
                                    <AuthProvider>
                                         <CreateCategory />
                                    </AuthProvider>
                                </CartProvider>
                            </SearchProvider>
                        </MemoryRouter>);
        });

        const inputs = screen.getAllByPlaceholderText("Enter new category");
        const input = inputs[0];
        const value = "testCategory";

        fireEvent.change(input, {target: {value: value}});

        const submitButton = screen.getByText("Submit");
        await act(async () => {
            fireEvent.click(submitButton)
        });

        expect(toast.success).toHaveBeenCalledWith("testCategory is created");
    });
});