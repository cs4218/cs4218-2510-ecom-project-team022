import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Layout from "./Layout";

// Mock Header and Footer so tests don’t depend on their implementation
jest.mock("./Header", () => () => <div data-testid="mock-header">Header</div>);
jest.mock("./Footer", () => () => <div data-testid="mock-footer">Footer</div>);

describe("Layout Component", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "";
    jest.clearAllMocks();
  });

  it("should render Header, Footer, and children", () => {
    const childText = "Children text";

    render(
      <Layout>
        <p>{childText}</p>
      </Layout>
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  it("should set the document title and meta tags from props", async () => {
    const props = {
      title: "Test Title",
      description: "Test description",
      keywords: "mern,react",
      author: "Tester",
    };

    render(<Layout {...props}>Content</Layout>);

    await waitFor(() => {
      expect(document.title).toBe("Test Title");
    });

    expect(document.querySelector('meta[name="description"]'))
      .toHaveAttribute("content", "Test description");
    expect(document.querySelector('meta[name="keywords"]'))
      .toHaveAttribute("content", "mern,react");
    expect(document.querySelector('meta[name="author"]'))
      .toHaveAttribute("content", "Tester");
  });

  it("should use defaultProps when no props are provided", async () => {
    render(<Layout>Default Props Test</Layout>);

    await waitFor(() => {
      expect(document.title).toBe("Ecommerce app - shop now");
    });

    expect(document.querySelector('meta[name="description"]'))
      .toHaveAttribute("content", "mern stack project");
    expect(document.querySelector('meta[name="keywords"]'))
      .toHaveAttribute("content", "mern,react,node,mongodb");
    expect(document.querySelector('meta[name="author"]'))
      .toHaveAttribute("content", "Techinfoyt");
  });

  it("should update head tags when props change", async () => {
    const { rerender } = render(
      <Layout title="T1" description="D1" keywords="K1" author="A1">
        X
      </Layout>
    );

    await waitFor(() => expect(document.title).toBe("T1"));

    rerender(
      <Layout title="T2" description="D2" keywords="K2" author="A2">
        X
      </Layout>
    );

    await waitFor(() => expect(document.title).toBe("T2"));
    expect(document.querySelector('meta[name="description"]'))
      .toHaveAttribute("content", "D2");
    expect(document.querySelector('meta[name="keywords"]'))
      .toHaveAttribute("content", "K2");
    expect(document.querySelector('meta[name="author"]'))
      .toHaveAttribute("content", "A2");
  });

  it("should render children between Header and Footer in order", () => {
    render(
      <Layout>
        <div data-testid="child">Child</div>
      </Layout>
    );

    const header = screen.getByTestId("mock-header");
    const child = screen.getByTestId("child");
    const footer = screen.getByTestId("mock-footer");

    expect(header.compareDocumentPosition(child))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(child.compareDocumentPosition(footer))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("should apply minHeight style to <main>", () => {
    render(<Layout>Child</Layout>);

    const main = document.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveStyle({ minHeight: "70vh" });
  });

  it("should render multiple children without issue", () => {
    render(
      <Layout>
        <>
          <span>One</span>
          <span>Two</span>
        </>
      </Layout>
    );

    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });
});