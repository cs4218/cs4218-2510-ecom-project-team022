import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

const PageNotFound = () => {
  return (
    <Layout title={"404 - Page Not Found"}>
      <div className="page-not-found" aria-label="page not found">
        <h1 className="page-not-found__title">404</h1>
        <h2 className="page-not-found__heading">Oops! Page Not Found</h2>
        <Link to="/" className="page-not-found__btn">
          Go Back
        </Link>
      </div>
    </Layout>
  );
};

export default PageNotFound;
