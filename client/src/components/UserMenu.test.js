import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserMenu from "./UserMenu";

describe("UserMenu", () => {
  const renderUserMenu = () => {
    return render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );
  };

  it("renders without crashing", () => {
    renderUserMenu();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders profile link with correct attributes", () => {
    renderUserMenu();
    const profileLink = screen.getByTestId("profile-link");

    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute("href", "/dashboard/user/profile");
    expect(profileLink).toHaveTextContent("Profile");
  });

  it("renders orders link with correct attributes", () => {
    renderUserMenu();
    const ordersLink = screen.getByTestId("orders-link");

    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute("href", "/dashboard/user/orders");
    expect(ordersLink).toHaveTextContent("Orders");
  });

  it("renders both navigation links", () => {
    renderUserMenu();

    // Test for existence of both links using test IDs
    expect(screen.getByTestId("profile-link")).toBeInTheDocument();
    expect(screen.getByTestId("orders-link")).toBeInTheDocument();
  });
});
