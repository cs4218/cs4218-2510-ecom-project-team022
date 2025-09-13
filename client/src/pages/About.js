import React from "react";
import Layout from "./../components/Layout";

const About = () => {
  return (
    <Layout title={"About us - Ecommerce app"}>
      <div className="row about">
        <div className="col-md-6 ">
          <img
            src="/images/about.jpeg"
            alt="about us"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-6">
          <p className="mt-2" style={{ textAlign: "justify" }}>
            Add text
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;