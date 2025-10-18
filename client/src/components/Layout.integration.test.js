import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Layout from "./Layout";

// Mock Header and Footer so tests don’t depend on their implementation (top-down)
jest.mock("./Header", () => () => <div data-testid="mock-header">Header</div>);
jest.mock("./Footer", () => () => <div data-testid="mock-footer">Footer</div>);

describe("Layout Integration (top-down)", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "";
    jest.clearAllMocks();
  });

  test("renders Header, Footer, and children and sets head tags from props", async () => {
    const props = {
      title: "Integration Title",
      description: "Integration description",
      keywords: "integration,test",
      author: "Integration Author",
    };

    render(
      <Layout {...props}>
        <div data-testid="child">Child Content</div>
      </Layout>
    );

    // Header and Footer should be present (mocked)
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();

    // Child should render inside main
    const child = screen.getByTestId("child");
    expect(child).toBeInTheDocument();

    // Document title should be set via Helmet
    await waitFor(() => expect(document.title).toBe("Integration Title"));

    // Meta tags should be present
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "Integration description"
    );
    expect(document.querySelector('meta[name="keywords"]')).toHaveAttribute(
      "content",
      "integration,test"
    );
    expect(document.querySelector('meta[name="author"]')).toHaveAttribute(
      "content",
      "Integration Author"
    );
  });

  test("uses default props when none provided", async () => {
    render(
      <Layout>
        <div>Default Content</div>
      </Layout>
    );

    await waitFor(() =>
      expect(document.title).toBe("Ecommerce app - shop now")
    );
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "mern stack project"
    );
    expect(document.querySelector('meta[name="keywords"]')).toHaveAttribute(
      "content",
      "mern,react,node,mongodb"
    );
    expect(document.querySelector('meta[name="author"]')).toHaveAttribute(
      "content",
      "Techinfoyt"
    );
  });
});
