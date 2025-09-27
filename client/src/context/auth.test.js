import React from "react";
import { render, act } from "@testing-library/react";
import { useAuth, AuthProvider } from "./auth";

// Helper test component to consume the context
function TestComponent() {
  const [auth] = useAuth();
  return <div data-testid="auth-value">{JSON.stringify(auth)}</div>;
}

describe("correct functioning of AuthProvider and useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage
    window.localStorage.clear();
  });

  it("returns the correct initial auth value when localStorage auth is empty", () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(getByTestId("auth-value").textContent).toBe(
      JSON.stringify({ user: null, token: "" })
    );
  });

  it("returns the correct context auth value that matches with localStorage", () => {
    const fakeAuth = { user: { name: "Test" }, token: "abc123" };
    window.localStorage.setItem("auth", JSON.stringify(fakeAuth));
    let getByTestId;
    act(() => {
      ({ getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      ));
    });
    // The effect runs after mount, so we need to check after act
    expect(getByTestId("auth-value").textContent).toBe(
      JSON.stringify(fakeAuth)
    );
  });
});
