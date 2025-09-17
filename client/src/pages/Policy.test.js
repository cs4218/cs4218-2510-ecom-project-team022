import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router-dom";
import Policy from "./Policy";

jest.mock("../components/Layout", () => (props) => (
  <div data-testid="mock-layout" data-title={props.title}>
    {props.children}
  </div>
));

describe("Policy Page", () => {
  it("should render the Layout with correct title", () => {
    // Arrange + Act
    render(
      <MemoryRouter>
        <Policy />
      </MemoryRouter>
    );

    // Assert
    const layout = screen.getByTestId("mock-layout");
    expect(layout).toHaveAttribute("data-title", "Privacy Policy");
  });

  it("should display an image with meaningful alt text for privacy policy", () => {
    // Arrange + Act
    render(
      <MemoryRouter>
        <Policy />
      </MemoryRouter>
    );

    // Assert
    const img = screen.getByRole("img", { name: /privacy policy/i });
    expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
  });

  it("should render structured privacy policy content instead of placeholders", () => {
    // Arrange + Act
    render(
      <MemoryRouter>
        <Policy />
      </MemoryRouter>
    );

    const heading = screen.getByRole("heading", { name: /privacy policy/i });
    expect(heading).toBeInTheDocument();

    const paras = screen.getAllByText(/policy/i);
    expect(paras.length).toBeGreaterThan(0);
  });

  it("should use a page-specific CSS hook (not 'contactus')", () => {
    // Arrange + Act
    render(
      <MemoryRouter>
        <Policy />
      </MemoryRouter>
    );

    // Assert
    const container = screen.getByTestId("mock-layout").querySelector("div.row");
    expect(container).toHaveClass("policy");
    expect(container).not.toHaveClass("contactus");
  });
});