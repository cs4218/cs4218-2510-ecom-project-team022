import React from "react";
import { render, screen } from "@testing-library/react";

// Mock Spinner
jest.mock("../Spinner", () => () => <div>Loading Spinner</div>);

jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [{
    user: null,
    token: "",
  }, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));




import AdminRoute from "./AdminRoute";

describe("AdminRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders <Spinner /> when user is null (not signed in)", () => {
    // Mock useAuth to return null user


    render(<AdminRoute />);
    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
  });

  // todo
  // it('renders <Outlet /> when user is admin and authenticated', () => {
  //   const mockSetAuth = jest.fn();
  //   const mockUseAuth = require('../../context/auth').useAuth;
  //   mockUseAuth.mockReturnValue([{
  //     user: { name: "Admin User", role: 1 },
  //     token: "valid-admin-token",
  //   }, mockSetAuth]);

  //   // Mock axios.get to simulate admin-auth endpoint returning ok: true
  //   jest.spyOn(require('axios'), 'get').mockResolvedValue({ data: { ok: true } });

  //   const { container } = render(<AdminRoute />);
  //   // Since Outlet renders nothing by default, we check that Spinner is not rendered
  //   expect(screen.queryByText("Loading Spinner")).not.toBeInTheDocument();

  //   // Clean up mock
  //   require('axios').get.mockRestore();
  // });

});

