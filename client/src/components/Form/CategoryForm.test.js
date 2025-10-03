import React from "react";
import { render, screen, fireEvent} from "@testing-library/react"
import CategoryForm from "./CategoryForm";

describe("CategoryForm", () => {
    let handleSubmitMock;
    let setValueMock;

    beforeEach(() => {
        jest.clearAllMocks();
        handleSubmitMock = jest.fn();
        setValueMock = jest.fn();

    });

    test("input and submit button in place", () => {
        render(<CategoryForm handleSubmit={handleSubmitMock} value="" setValue={setValueMock} />);

        expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /submit/i})).toBeInTheDocument();
        });

    test("handle input value correctly", () => {
        render(<CategoryForm handleSubmit={handleSubmitMock} value="TestCategory" setValue={setValueMock} />);
        const input = screen.getByPlaceholderText("Enter new category");

        expect(input.value).toBe("TestCategory");
        });

    test("handle input value change correctly", () => {
        render(<CategoryForm handleSubmit={handleSubmitMock} value="" setValue={setValueMock} />);
        const input = screen.getByPlaceholderText("Enter new category");
        const newValue = "NewTestCategory"

        fireEvent.change(input, {target:{value: newValue}});

        expect(setValueMock).toHaveBeenCalledWith(newValue);
        });


    test("handle submit form correctly", () => {
        render(<CategoryForm handleSubmit={handleSubmitMock} value="TestCategory" setValue={setValueMock} />);
        const button = screen.getByRole("button", {name: /submit/i});

        fireEvent.click(button);

        expect(handleSubmitMock).toHaveBeenCalled();
        });
});