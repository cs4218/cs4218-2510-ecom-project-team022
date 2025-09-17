import React from "react";
import Layout from "../components/Layout";

const Policy = () => {
  return (
    <Layout title="Privacy Policy">
      <div className="row policy">
        <div className="col-md-6">
          <img
            src="/images/contactus.jpeg"
            alt="Privacy policy illustration"
            style={{ width: "100%" }}
            loading="lazy"
          />
        </div>
        <div className="col-md-6" role="region" aria-label="Privacy policy content">
          <h1 className="h4">Privacy Policy</h1>
          <p>add privacy policy</p>
          <p>add privacy policy</p>
          <p>add privacy policy</p>
          <p>add privacy policy</p>
          <p>add privacy policy</p>
          <p>add privacy policy</p>
          <p>add privacy policy</p>
        </div>
      </div>
    </Layout>
  );
};

export default Policy;