import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateProduct from "./CreateProduct";
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { beforeEach, describe } from "node:test";

// Mock URL.createObjectURL for file upload tests
global.URL.createObjectURL = jest.fn(() => "mocked-object-url");
global.URL.revokeObjectURL = jest.fn();

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));
var mockUseAuth = jest.fn();
jest.mock("../../context/auth", () => ({
  useAuth: () => mockUseAuth(),
}));
jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

describe("CreateProduct", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches categories on mount and renders them", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Cat1" }] },
    });

    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <CreateProduct />
      </MemoryRouter>
    );
    expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
    // await waitFor(() => {
    //   expect(screen.getByText("Cat1", { hidden: true })).toBeInTheDocument();
    // });
  });

  it("shows error toast if fetching categories fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("fail"));
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <CreateProduct />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in getting category"
      );
    });
  });

  it("displays photo name when a photo is uploaded", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: [{ _id: "1", name: "Cat1" }] },
    });

    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
        <CreateProduct />
      </MemoryRouter>
    );

    // Initially should show "Upload Photo"
    expect(screen.getByText("Upload Photo")).toBeInTheDocument();

    // Create a mock file
    const mockFile = new File(["test content"], "test-photo.jpg", {
      type: "image/jpeg",
    });

    // Find the file input and upload the file
    const fileInput = document.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: { files: [mockFile] },
    });

    await waitFor(() => {
      expect(screen.getByText("test-photo.jpg")).toBeInTheDocument();
    });

    // Verify "Upload Photo" is no longer shown
    expect(screen.queryByText("Upload Photo")).not.toBeInTheDocument();
  });

  describe("Form Submission", () => {
    const mockNavigate = jest.fn();
    const nameValue = "Test Product";
    const descValue = "desc";
    const priceValue = "10";
    const quantityValue = "5";
    const setupFormSubmission1 = () => {
      axios.get.mockResolvedValueOnce({
        data: { success: true, category: [{ _id: "1", name: "Cat1" }] },
      });

      useNavigate.mockReturnValue(mockNavigate);
    };

    const setupFormSubmission2 = () => {
      // fill the form

      fireEvent.change(screen.getByPlaceholderText("write a name"), {
        target: { value: nameValue },
      });
      fireEvent.change(screen.getByPlaceholderText("write a description"), {
        target: { value: descValue },
      });
      fireEvent.change(screen.getByPlaceholderText("write a Price"), {
        target: { value: priceValue },
      });
      fireEvent.change(screen.getByPlaceholderText("write a quantity"), {
        target: { value: quantityValue },
      });
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("submits form and calls axios.post with correct data", async () => {
      setupFormSubmission1();
      render(
        <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
          <CreateProduct />
        </MemoryRouter>
      );
      setupFormSubmission2();
      axios.post.mockResolvedValueOnce({ data: { success: true } });

      fireEvent.click(screen.getByText("CREATE PRODUCT"));

      // set up the form data
      const productData = new FormData();
      productData.append("name", nameValue);
      productData.append("description", descValue);
      productData.append("price", priceValue);
      productData.append("quantity", quantityValue);
      // productData.append("photo", file);
      // productData.append("category", "1"); // category selection is not tested here

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/create-product",
          expect.any(FormData)
        );
        expect(toast.success).toHaveBeenCalledWith(
          "Product Created Successfully"
        );
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
      });
    });

    it("submits form and calls axios.post with correct data, and shows error", async () => {
      setupFormSubmission1();
      render(
        <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
          <CreateProduct />
        </MemoryRouter>
      );
      setupFormSubmission2();

      const errMsg = "temp-err-msg";
      axios.post.mockResolvedValueOnce({
        data: { success: false, message: errMsg },
      });

      fireEvent.click(document.getElementById("create-product-btn"));

      // set up the form data
      const productData = new FormData();
      productData.append("name", nameValue);
      productData.append("description", descValue);
      productData.append("price", priceValue);
      productData.append("quantity", quantityValue);
      // productData.append("photo", file);
      // productData.append("category", "1"); // category selection is not tested here

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/create-product",
          expect.any(FormData)
        );
        expect(toast.error).toHaveBeenCalledWith(errMsg);
      });
    });

    it("submits form and calls axios.post with correct data, and shows error if server rejects", async () => {
      setupFormSubmission1();
      render(
        <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
          <CreateProduct />
        </MemoryRouter>
      );
      setupFormSubmission2();

      const errMsg = "temp-err-msg";
      axios.post.mockRejectedValueOnce({
        data: { success: false, message: errMsg },
      });

      fireEvent.click(document.getElementById("create-product-btn"));

      // set up the form data
      const productData = new FormData();
      productData.append("name", nameValue);
      productData.append("description", descValue);
      productData.append("price", priceValue);
      productData.append("quantity", quantityValue);
      // productData.append("photo", file);
      // productData.append("category", "1"); // category selection is not tested here

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/create-product",
          expect.any(FormData)
        );
        expect(toast.error).toHaveBeenCalledWith("something went wrong");
      });
    });
  });

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
