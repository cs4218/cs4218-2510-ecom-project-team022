export default {
  displayName: "krista",
  rootDir: "..",
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  testMatch: [
    // Admin Dashboard
    "<rootDir>/client/src/AdminMenu.test.js",
    "<rootDir>/client/src/pages/admin/AdminDashboard.test.js",

    // Product
    "<rootDir>/client/src/pages/ProductDetails.test.js",
    "<rootDir>/client/src/pages/CategoryProduct.test.js",
    "<rootDir>/controllers/productController.test.js",

    // Integration Tests
    "<rootDir>/client/src/pages/CategoryProduct.integration.test.js",
    "<rootDir>/client/src/pages/HomePageProductProcessing.integration.test.js",
    "<rootDir>/client/src/pages/ProductDetails.integration.test.js",
  ],

  collectCoverage: true,
  collectCoverageFrom: [
    // Admin Dashboard
    "client/src/AdminMenu.js",
    "client/src/pages/admin/AdminDashboard.js",

    // Product
    "client/src/pages/ProductDetails.js",
    "client/src/pages/CategoryProduct.js",
    "controllers/productController.js",
  ],
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/client/src/setupTests.js"],
};
