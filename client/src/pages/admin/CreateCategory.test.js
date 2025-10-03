import React from "react";
import {render, screen, act, fireEvent} from "@testing-library/react"
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "antd";
import CreateCategory from "./CreateCategory";

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
}));
jest.mock("axios");
//the following mock has been created with the help of ai
jest.mock("antd", () => {
  const original = jest.requireActual("antd");
  return {
    ...original,
    Modal: ({ children, visible, onCancel }) =>
      visible ? (
        <div data-testid="modal">
          {children}
          <button data-testid="modal-cancel" onClick={onCancel}>Cancel</button>
        </div>
      ) : null,
  };
});
jest.mock("../../components/Form/CategoryForm", () => ({ handleSubmit, value, setValue }) => (
    <form onSubmit={handleSubmit} data-testid="category-form-mock">
        <input
            data-testid="category-input-mock"
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    <button type="submit" className="btn btn-primary">
          Submit
    </button>
 </form>
)
);
jest.mock("../../components/AdminMenu", () => () => <div>AdminMenu</div>);
jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>); 


describe("CreateCategory", () => {
    beforeEach(() => {
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.clearAllMocks();
        jest.resetAllMocks();

    });
    afterEach(() => {
        logSpy.mockRestore();
    });

    test("renders AdminMenu, Layout, CategoryForm", async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true } });

        await act(async () => {
            render(<CreateCategory/>);
        });

        expect(screen.getByText("AdminMenu")).toBeInTheDocument();
        expect(screen.getByText("Manage Category")).toBeInTheDocument();
        expect(screen.getByTestId("category-form-mock")).toBeInTheDocument();
    });

    test("handleSubmit - successful", async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true },});

        await act(async () => {
            render(<CreateCategory/>);
        });

        const input = screen.getAllByTestId("category-input-mock")[0];
        const form = screen.getAllByTestId("category-form-mock")[0];
        const value = "testCategory"

        fireEvent.change(input, {target: {value: value}});

        await act(async () => {
            fireEvent.submit(form);
        });

        expect(axios.post).toHaveBeenCalledWith(`/api/v1/category/create-category`, { name: value });
        expect(toast.success).toHaveBeenCalledWith("testCategory is created");
    });

    test("handleSubmit - handle error properly for failure create", async () => {
        axios.post.mockResolvedValueOnce({ data: { success: false, message: "message"}});

        await act(async () => {
            render(<CreateCategory/>);
        });

        const input = screen.getAllByTestId("category-input-mock")[0];
        const form = screen.getAllByTestId("category-form-mock")[0];
        const value = "testCategory"

        fireEvent.change(input, {target: {value: value}});

        await act(async () => {
            fireEvent.submit(form);
        });

        expect(toast.error).toHaveBeenCalledWith("message");
    });

    test("handleSubmit - handle error properly for general", async () => {
        const errorMessage = "There's an error";
        axios.post.mockRejectedValueOnce(new Error(errorMessage));

        await act(async () => {
            render(<CreateCategory/>);
        });

        const input = screen.getAllByTestId("category-input-mock")[0];
        const form = screen.getAllByTestId("category-form-mock")[0];
        const value = "testCategory"

        fireEvent.change(input, {target: {value: value}});

        await act(async () => {
            fireEvent.submit(form);
        });

        expect(toast.error).toHaveBeenCalledWith("Something went wrong in input form");
    });

    test("getAllCategory - successful", async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: [{_id: "001", name: "testCategory"}] },});

        await act(async () => {
            render(<CreateCategory/>);
        });

        expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
        expect(screen.getByText("testCategory")).toBeInTheDocument();
    });

    test("getAllCategory - handle error properly", async () => {
        axios.get.mockResolvedValueOnce({ data: { success: false, category: [{_id: "001", name: "testCategory"}]},});

        await act(async () => {
            render(<CreateCategory/>);
        });

        expect(screen.queryByText("testCategory")).not.toBeInTheDocument();
    });

    test("handleUpdate - successful", async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: [{_id: "001", name: "testCategory"}] },});
        axios.put.mockResolvedValueOnce({ data: { success: true}});

        await act(async () => {
            render(<CreateCategory/>);
        });

        const editButton = screen.getByText("Edit");

        fireEvent.click(editButton);

        expect(screen.getByTestId("modal")).toBeInTheDocument();

        const modalInput = screen.getAllByTestId("category-input-mock")[1];
        const modalForm = screen.getAllByTestId("category-form-mock")[1];
        const updatedValue = "testCategoryUpdated"

        fireEvent.change(modalInput, {target: {value: updatedValue}});

        await act(async () => {
            fireEvent.submit(modalForm);
        });

        expect(axios.put).toHaveBeenCalledWith(`/api/v1/category/update-category/001`, { name: updatedValue });
        expect(toast.success).toHaveBeenCalledWith("testCategoryUpdated is updated");
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

     test("handleUpdate - cancel modal", async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: [{_id: "001", name: "testCategory"}] },});

        await act(async () => {
            render(<CreateCategory/>);
        });

        const editButton = screen.getByText("Edit");

        fireEvent.click(editButton);

        expect(screen.getByTestId("modal")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("modal-cancel")); 

        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });


    test("handleUpdate - handle error properly for failure update", async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: [{_id: "001", name: "testCategory"}]},});
        axios.put.mockResolvedValueOnce({ data: { success: false, message: "message"}});

        await act(async () => {
            render(<CreateCategory/>);
        });

        const editButton = screen.getByText("Edit");

        fireEvent.click(editButton);

        const modalInput = screen.getAllByTestId("category-input-mock")[1];
        const modalForm = screen.getAllByTestId("category-form-mock")[1];
        const updatedValue = "testCategoryUpdated"

        fireEvent.change(modalInput, {target: {value: updatedValue}});

        await act(async () => {
            fireEvent.submit(modalForm);
        });
        
        expect(toast.error).toHaveBeenCalledWith("message");
    });

    test("handleUpdate - handle error properly for general", async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: [{_id: "001", name: "testCategory"}]},});
        const errorMessage = "There's an error";
        axios.put.mockRejectedValueOnce(new Error(errorMessage));

        await act(async () => {
            render(<CreateCategory/>);
        });

        const editButton = screen.getByText("Edit");

        fireEvent.click(editButton);

        const modalInput = screen.getAllByTestId("category-input-mock")[1];
        const modalForm = screen.getAllByTestId("category-form-mock")[1];
        const updatedValue = "testCategoryUpdated"

        fireEvent.change(modalInput, {target: {value: updatedValue}});

        await act(async () => {
            fireEvent.submit(modalForm);
        });
        
        expect(toast.error).toHaveBeenCalledWith("Something went wrong in updating category");
    });

    test("handleDelete - successful", async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: [{_id: "001", name: "testCategory"}] },})
        .mockResolvedValueOnce({ data: { success: true }});
        axios.delete.mockResolvedValueOnce({ data: { success: true}});

        await act(async () => {
            render(<CreateCategory/>);
        });

        const deleteButton = screen.getByText("Delete");

        await act(async () => {
            fireEvent.click(deleteButton);
        });

        expect(axios.delete).toHaveBeenCalledWith(`/api/v1/category/delete-category/001`);
        expect(toast.success).toHaveBeenCalledWith("category is deleted");
    });

    test("handleDelete - handle error properly for failure delete", async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: [{_id: "001", name: "testCategory"}] },})
        .mockResolvedValueOnce({ data: { success: true }});
        axios.delete.mockResolvedValueOnce({ data: { success: false, message: "message"}});

        await act(async () => {
            render(<CreateCategory/>);
        });

        const deleteButton = screen.getByText("Delete");

        await act(async () => {
            fireEvent.click(deleteButton);
        });
        
        expect(toast.error).toHaveBeenCalledWith("message");
    });

    test("handleDelete - handle error properly for general", async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: [{_id: "001", name: "testCategory"}] },});
        const errorMessage = "There's an error";
        axios.delete.mockRejectedValueOnce(new Error(errorMessage));

        await act(async () => {
            render(<CreateCategory/>);
        });

        const deleteButton = screen.getByText("Delete");

        await act(async () => {
            fireEvent.click(deleteButton);
        });
        
        expect(toast.error).toHaveBeenCalledWith("Something went wrong in deleting category");
    });

});