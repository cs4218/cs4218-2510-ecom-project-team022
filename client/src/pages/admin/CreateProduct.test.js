
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateProduct from "./CreateProduct";
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter, useNavigate } from "react-router-dom";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));
var mockUseAuth = jest.fn();
jest.mock('../../context/auth', () => ({
  useAuth: () => mockUseAuth()
}));
jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>);

describe("CreateProduct", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // it("fetches categories on mount and renders them", async () => {
  //   axios.get.mockResolvedValueOnce({
  //     data: { success: true, category: [{ _id: "1", name: "Cat1" }] },
  //   });


  //   render(<MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
  //     <CreateProduct />
  //   </MemoryRouter>);
  //   expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
  //   await waitFor(() => {
  //     expect(screen.getByText("Cat1", { hidden: true })).toBeInTheDocument();
  //   });
  // });

  it("shows error toast if fetching categories fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("fail"));
    render(<MemoryRouter initialEntries={["/dashboard/admin/create-product"]}><CreateProduct /></MemoryRouter>);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in getting category"
      );
    });
  });

  // it("submits form and calls axios.post with correct data", async () => {
  //   axios.get.mockResolvedValueOnce({
  //     data: { success: true, category: [{ _id: "1", name: "Cat1" }] },
  //   });
  //   axios.post.mockResolvedValueOnce({ data: { success: false } });
  //   const mockNavigate = jest.fn();
  //   useNavigate.mockReturnValue(mockNavigate);

  //   render(<MemoryRouter initialEntries={["/dashboard/admin/create-product"]}><CreateProduct /></MemoryRouter>);
  //   // await waitFor(() => screen.getByText("Cat1"));

  //   fireEvent.change(screen.getByPlaceholderText("write a name"), {
  //     target: { value: "Test Product" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText("write a description"), {
  //     target: { value: "desc" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText("write a Price"), {
  //     target: { value: "10" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
  //     target: { value: "5" },
  //   });
  //   // Select category
  //   const categorySelect = document.getElementById('category-select-input')
  //   fireEvent.mouseDown(categorySelect);
  //   fireEvent.click(screen.getByText("Cat1"));
  //   // Simulate file upload
  //   const file = new File(["img"], "photo.png", { type: "image/png" });
  //   fireEvent.change(screen.getByLabelText(/upload photo/i), {
  //     target: { files: [file] },
  //   });
  //   fireEvent.click(screen.getByText("CREATE PRODUCT"));
  //   await waitFor(() => {
  //     expect(axios.post).toHaveBeenCalledWith(
  //       "/api/v1/product/create-product",
  //       expect.any(FormData)
  //     );
  //     expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
  //     expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
  //   });
  // });

  // it("shows error toast if product creation fails", async () => {
  //   const errorMessageFromBackend = "temp-message";
  //   axios.get.mockResolvedValueOnce({
  //     data: { success: true, category: [{ _id: "1", name: "Cat1" }] },
  //   });
  //   axios.post.mockResolvedValueOnce({ data: { error: errorMessageFromBackend } });
  //   const { debug } = render(<MemoryRouter initialEntries={["/dashboard/admin/create-product"]}><CreateProduct /></MemoryRouter>);
  //   // await waitFor(() => screen.getByText("Cat1"));
  //   // get by id=create-product-btn
  //   const btn = document.getElementById("create-product-btn");
  //   fireEvent.click(btn);
  //   console.log(btn)
  //   debug()
  //   await waitFor(() => {
  //     expect(toast.error).toHaveBeenCalledWith(errorMessageFromBackend);
  //   });
  // });
});
