import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Contact from "./Contact";

jest.mock("../components/Layout", () => (props) => (
  <div data-testid="mock-layout" data-title={props.title || ""}>
    {props.children}
  </div>
));

describe("Contact page", () => {
  it("should wrap content in Layout with the correct title", () => {
    // Arrange & Act
    render(<Contact />);

    // Assert
    const shell = screen.getByTestId("mock-layout");
    expect(shell).toBeInTheDocument();
    expect(shell).toHaveAttribute("data-title", "Contact us");
  });

  it("should render the hero image with proper src and alt", () => {
    // Arrange & Act
    render(<Contact />);

    // Assert
    const img = screen.getByAltText(/contactus/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/contactus.jpeg");
  });

  it("should display the CONTACT US heading and supporting copy", () => {
    // Arrange & Act
    render(<Contact />);

    // Assert
    expect(
      screen.getByRole("heading", { name: /contact us/i })
    ).toBeInTheDocument();

    // copy text snippets
    expect(
      screen.getByText(/For any query or info about product/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/available 24\/7/i)).toBeInTheDocument();
  });

  it("should expose accessible icons and correct contact links", () => {
    // Arrange & Act
    render(<Contact />);

    // Assert
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/support/i)).toBeInTheDocument();

    // Assert: links
    const emailLink = screen.getByRole("link", {
      name: /help@ecommerceapp\.com/i,
    });
    expect(emailLink).toHaveAttribute("href", "mailto:help@ecommerceapp.com");

    const phoneLink = screen.getByRole("link", { name: "012-3456789" });
    expect(phoneLink).toHaveAttribute("href", "tel:0123456789");

    const supportLink = screen.getByRole("link", { name: /1800-0000-0000/i });
    expect(supportLink).toHaveAttribute("href", "tel:18000000000");
  });
});