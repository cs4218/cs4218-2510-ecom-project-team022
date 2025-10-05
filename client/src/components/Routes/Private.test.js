import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import PrivateRoute from "./Private";

// Mock Spinner
jest.mock("../Spinner", () => () => <div>Loading Spinner</div>);

jest.mock("axios");
var mockUseAuth = jest.fn();
jest.mock("../../context/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("PrivateRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // double=Mock | type=Unit
  it("renders <Spinner /> when user is null (not signed in)", () => {
    // Mock useAuth to return null user
    mockUseAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);

    render(<PrivateRoute />);
    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
  });

  // current behaviour means that invalid token users actually never get a response from the user. It simply
  // lets the spinner spin for 3 seconds, and if no response is received, it will then redirect to login.
  it("renders <Spinner /> when user logged in with an invalid token", async () => {
    mockUseAuth.mockReturnValue([
      { user: { name: "notadmin", role: 0 }, token: "invalid-token" },
      jest.fn(),
    ]);
    axios.get.mockImplementation(() => new Promise(() => {})); // stub that never resolves. This simulates an invalid token response on server
    // TODO: fix this on server

    render(<PrivateRoute />);
    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
  });

  // double=Mock,Stub | type=Unit
  it("renders <Outlet /> when user is logged in", async () => {
    // mock /api/v1/auth/user-auth to return { ok: true }
    axios.get.mockResolvedValue({ data: { ok: true } });

    // override the mock use auth to have a token
    mockUseAuth.mockReturnValue([
      { user: { name: "user", role: 0 }, token: "valid-user-token" },
      jest.fn(),
    ]);

    render(<PrivateRoute />);
    // Since Outlet renders nothing by default, we check that Spinner is not rendered
    // expect(screen.queryByText("Loading Spinner")).not.toBeInTheDocument();
    // expect axios get to be called
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth")
    );

    // the mock should have called setOk to be true
    await waitFor(() => {
      expect(screen.queryByText("Loading Spinner")).not.toBeInTheDocument();
    });
    // Clean up mock
    require("axios").get.mockRestore();
  });

  it("renders <Spinner /> when auth check fails", async () => {
    // mock /api/v1/auth/user-auth to return { ok: false }
    axios.get.mockResolvedValue({ data: { ok: false } });

    // override the mock use auth to have a token
    mockUseAuth.mockReturnValue([
      { user: { name: "user", role: 0 }, token: "invalid-token" },
      jest.fn(),
    ]);

    render(<PrivateRoute />);

    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/user-auth")
    );

    // Should still render spinner when auth check fails
    await waitFor(() => {
      expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
    });

    require("axios").get.mockRestore();
  });
});
