import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Footer from "./Footer";

describe("Footer Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display the rights-reserved line", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Footer />} />
        </Routes>
      </MemoryRouter>
    );
    // Act
    const phrase = screen.getByText(/all rights reserved/i);
    // Assert
    expect(phrase).toBeInTheDocument();
  });

  it('should display the company name "TestingComp"', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Footer />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/testingcomp/i)).toBeInTheDocument();
  });

  it("should render the About link pointing to /about", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Footer />} />
        </Routes>
      </MemoryRouter>
    );

    const about = screen.getByText(/^about$/i); // <a>About</a>
    expect(about).toBeInTheDocument();
    expect(about).toHaveAttribute("href", "/about");
  });

  it("should render the Contact link pointing to /contact", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Footer />} />
        </Routes>
      </MemoryRouter>
    );

    const contact = screen.getByText(/^contact$/i);
    expect(contact).toBeInTheDocument();
    expect(contact).toHaveAttribute("href", "/contact");
  });

  it("should render the Privacy Policy link pointing to /policy", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Footer />} />
        </Routes>
      </MemoryRouter>
    );

    const policy = screen.getByText(/privacy policy/i);
    expect(policy).toBeInTheDocument();
    expect(policy).toHaveAttribute("href", "/policy");
  });
});
