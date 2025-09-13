import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import About from "./About";

jest.mock("../components/Layout", () => (props) => (
  <div data-testid="mock-layout" data-title={props.title}>
    {props.children}
  </div>
));

describe("About Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render within Layout and pass title "About us - Ecommerce app"', () => {
// Arrange + Act
    render(<About />);

    // Assert
    const layout = screen.getByTestId("mock-layout");
    expect(layout).toBeInTheDocument();
    expect(layout).toHaveAttribute("data-title", "About us - Ecommerce app");
  });

  it("should render the about image with correct src and alt", () => {
    // Arrange + Act
    render(<About />);

    // Assert
    const img = screen.getByAltText(/about us/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/about.jpeg");
    expect(img).toHaveStyle({ width: "100%" });
  });

  it('should render the body text "Add text"', () => {
    // Arrange + Act
    render(<About />);

    // Assert
    expect(screen.getByText(/add text/i)).toBeInTheDocument();
  });

  it("should render the two-column layout", () => {
    // Arrange + Act
    render(<About />);

    // Assert
    const columns = document.querySelectorAll(".row.about > .col-md-6");
    expect(columns.length).toBe(2);
  });
});