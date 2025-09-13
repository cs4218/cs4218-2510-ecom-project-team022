import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router-dom";
import PageNotFound from "./PageNotFound";

jest.mock("../components/Layout", () => (props) => (
  <div data-testid="mock-layout" data-title={props.title}>
    {props.children}
  </div>
));

describe("PageNotFound page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render inside Layout with title "404 - Page Not Found"', () => {
    // Arrange + Act
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    // Assert
    const layout = screen.getByTestId("mock-layout");
    expect(layout).toBeInTheDocument();
    expect(layout).toHaveAttribute("data-title", "404 - Page Not Found");
  });

  it("should render the 404 heading and the message", () => {
    // Arrange + Act
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    // Assert
    const h1 = screen.getByRole("heading", { level: 1, name: "404" });
    expect(h1).toBeInTheDocument();

    // Ensure *no* space before '!' and correct casing
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2).toHaveTextContent(/^Oops! Page Not Found$/);
  });

  it('should render a "Go Back" link pointing to "/"', () => {
    // Arrange + Act
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    // Assert
    const link = screen.getByRole("link", { name: /go back/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("should include the expected CSS hooks for styling", () => {
    // Arrange + Act
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    const container = screen.getByLabelText(/page not found/i);
    expect(container).toHaveClass("page-not-found");

    const title = screen.getByRole("heading", { level: 1, name: "404" });
    expect(title).toHaveClass("page-not-found__title");

    const message = screen.getByRole("heading", { level: 2 });
    expect(message).toHaveClass("page-not-found__heading");

    const back = screen.getByRole("link", { name: /go back/i });
    expect(back).toHaveClass("page-not-found__btn");
  });

  it("should render elements in this order, H1 → H2 → link", () => {
    // Arrange + Act
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    // Assert DOM order
    const h1 = screen.getByRole("heading", { level: 1, name: "404" });
    const h2 = screen.getByRole("heading", { level: 2 });
    const link = screen.getByRole("link", { name: /go back/i });

    expect(h1.compareDocumentPosition(h2)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(h2.compareDocumentPosition(link)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});
