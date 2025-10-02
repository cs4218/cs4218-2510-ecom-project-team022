import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";

// Mock Spinner
jest.mock("../Spinner", () => () => <div>Loading Spinner</div>);



jest.mock('axios');
var mockUseAuth = jest.fn();
jest.mock('../../context/auth', () => ({
  useAuth: () => mockUseAuth()
}));


import AdminRoute from "./AdminRoute";

describe("AdminRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // double=Mock | type=Unit
  it("renders <Spinner /> when user is null (not signed in)", () => {
    // Mock useAuth to return null user
    mockUseAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);

    render(<AdminRoute />);
    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
  });

  // double=Mock,Stub | type=Unit
  // note: role = 0 is regular user, role = 1 is admin
  it("renders <Spinner /> when user is not admin", async () => {
    mockUseAuth.mockReturnValue([{ user: { name: "notadmin", role: 0 }, token: "valid-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: false } }); // stub

    render(<AdminRoute />);
    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();

  });

  // double=Mock,Stub | type=Unit
  it('renders <Outlet /> when user is admin and authenticated', async () => {
    // mock /api/v1/auth/admin-auth to return { ok: true }
    axios.get.mockResolvedValue({ data: { ok: true } });

    // override the mock use auth to have a token
    mockUseAuth.mockReturnValue([{ user: { name: "admin", role: 1 }, token: "valid-admin-token" }, jest.fn()]);


    render(<AdminRoute />);
    // Since Outlet renders nothing by default, we check that Spinner is not rendered
    // expect(screen.queryByText("Loading Spinner")).not.toBeInTheDocument();
    // expect axios get to be called
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/admin-auth"));

    // the mock should have called setOk to be true 
    await waitFor(() => {
      expect(screen.queryByText("Loading Spinner")).not.toBeInTheDocument();
    });
    // Clean up mock
    require('axios').get.mockRestore();


  });

});

