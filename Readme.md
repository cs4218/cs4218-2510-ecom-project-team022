# CS4218 Project - Virtual Vault

## 1. Project Introduction

Virtual Vault is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce website, offering seamless connectivity and user-friendly features. The platform provides a robust framework for online shopping. The website is designed to adapt to evolving business needs and can be efficiently extended.

## 2. Website Features

- **User Authentication**: Secure user authentication system implemented to manage user accounts and sessions.
- **Payment Gateway Integration**: Seamless integration with popular payment gateways for secure and reliable online transactions.
- **Search and Filters**: Advanced search functionality and filters to help users easily find products based on their preferences.
- **Product Set**: Organized product sets for efficient navigation and browsing through various categories and collections.

## 3. Your Task

- **Unit and Integration Testing**: Utilize Jest for writing and running tests to ensure individual components and functions work as expected, finding and fixing bugs in the process.
- **UI Testing**: Utilize Playwright for UI testing to validate the behavior and appearance of the website's user interface.
- **Code Analysis and Coverage**: Utilize SonarQube for static code analysis and coverage reports to maintain code quality and identify potential issues.
- **Load Testing**: Leverage JMeter for load testing to assess the performance and scalability of the ecommerce platform under various traffic conditions.

## 4. Setting Up The Project

### 1. Installing Node.js

1. **Download and Install Node.js**:

   - Visit [nodejs.org](https://nodejs.org) to download and install Node.js.

2. **Verify Installation**:
   - Open your terminal and check the installed versions of Node.js and npm:
     ```bash
     node -v
     npm -v
     ```

### 2. MongoDB Setup

1. **Download and Install MongoDB Compass**:

   - Visit [MongoDB Compass](https://www.mongodb.com/products/tools/compass) and download and install MongoDB Compass for your operating system.

2. **Create a New Cluster**:

   - Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
   - After logging in, create a project and within that project deploy a free cluster.

3. **Configure Database Access**:

   - Create a new user for your database (if not alredy done so) in MongoDB Atlas.
   - Navigate to "Database Access" under "Security" and create a new user with the appropriate permissions.

4. **Whitelist IP Address**:

   - Go to "Network Access" under "Security" and whitelist your IP address to allow access from your machine.
   - For example, you could whitelist 0.0.0.0 to allow access from anywhere for ease of use.

5. **Connect to the Database**:

   - In your cluster's page on MongoDB Atlas, click on "Connect" and choose "Compass".
   - Copy the connection string.

6. **Establish Connection with MongoDB Compass**:
   - Open MongoDB Compass on your local machine, paste the connection string (replace the necessary placeholders), and establish a connection to your cluster.

### 3. Application Setup

To download and use the MERN (MongoDB, Express.js, React.js, Node.js) app from GitHub, follow these general steps:

1. **Clone the Repository**

   - Go to the GitHub repository of the MERN app.
   - Click on the "Code" button and copy the URL of the repository.
   - Open your terminal or command prompt.
   - Use the `git clone` command followed by the repository URL to clone the repository to your local machine:
     ```bash
     git clone <repository_url>
     ```
   - Navigate into the cloned directory.

2. **Install Frontend and Backend Dependencies**

   - Run the following command in your project's root directory:

     ```
     npm install && cd client && npm install && cd ..
     ```

3. **Add database connection string to `.env`**

   - Add the connection string copied from MongoDB Atlas to the `.env` file inside the project directory (replace the necessary placeholders):
     ```env
     MONGO_URL = <connection string>
     ```

4. **Adding sample data to database**

   - Download “Sample DB Schema” from Canvas and extract it.
   - In MongoDB Compass, create a database named `test` under your cluster.
   - Add four collections to this database: `categories`, `orders`, `products`, and `users`.
   - Under each collection, click "ADD DATA" and import the respective JSON from the extracted "Sample DB Schema".

5. **Running the Application**
   - Open your web browser.
   - Use `npm run dev` to run the app from root directory, which starts the development server.
   - Navigate to `http://localhost:3000` to access the application.

## 5. Unit Testing with Jest

Unit testing is a crucial aspect of software development aimed at verifying the functionality of individual units or components of a software application. It involves isolating these units and subjecting them to various test scenarios to ensure their correctness.  
Jest is a popular JavaScript testing framework widely used for unit testing. It offers a simple and efficient way to write and execute tests in JavaScript projects.

### Getting Started with Jest

To begin unit testing with Jest in your project, follow these steps:

1. **Install Jest**:  
   Use your preferred package manager to install Jest. For instance, with npm:

   ```bash
   npm install --save-dev jest

   ```

2. **Write Tests**  
   Create test files for your components or units where you define test cases to evaluate their behaviour.

3. **Run Tests**  
   Execute your tests using Jest to ensure that your components meet the expected behaviour.  
   You can run the tests by using the following command in the root of the directory:

   - **Frontend tests**

     ```bash
     npm run test:frontend
     ```

   - **Backend tests**

     ```bash
     npm run test:backend
     ```

   - **All the tests**
     ```bash
     npm run test
     ```

## Milestone 1

### 1. CI Github workflow link: https://github.com/cs4218/cs4218-2510-ecom-project-team022/actions/runs/18260418232/job/51987577012

### 2. Members' Contributions

The following shows the scope of our individal unit testing and bug fixing.

#### Krista

| Feature         | Client Related Files (/client/src/)                            | Server Related Files (./)                                                                                                                                                                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin Dashboard | - components/AdminMenu.js <br> - pages/admin/AdminDashboard.js |                                                                                                                                                                                                                                                                                                                                                                  |
| Product         | - pages/ProductDetails.js <br> - pages/CategoryProduct.js      | - controllers/productController.js <br> 1. getProductController <br> 2. getSingleProductController <br> 3. productPhotoController <br> 4. productFiltersController <br> 5. productCountController <br> 6. productListController <br> 7. searchProductController <br> 8. relatedProductController <br> 9. productCategoryController <br> - models/ProductModel.js |

#### Zann

| Feature             | Client Related Files (/client/src/)                                    | Server Related Files (./)                                                                                                              |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Admin Actions       | - components/Form/CategoryForm.js <br> - pages/admin/CreateCategory.js | - controllers/categoryController.js <br> 1. createCategoryController <br> 2. updateCategoryController <br> 3. deleteCategoryController |
| Admin View Orders   | - pages/admin/AdminOrders.js                                           |                                                                                                                                        |
| Admin View Products | - pages/admin/Products.js                                              | - controllers/productController.js <br> 1. createProductController <br> 2. deleteProductController <br> 3. updateProductController     |
| Admin View Users    | - pages/admin/Users.js                                                 |                                                                                                                                        |

#### Marcus

| Feature          | Client Related Files (/client/src/)                                                         | Server Related Files (./)                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Protected Routes | - context/auth.js                                                                           | - helpers/authHelper.js <br> - middlewares/authMiddleware.js                                                             |
| Registration     | - pages/Auth/Register.js                                                                    | - controllers/authController.js <br> 1. registerController <br> 2. loginController <br> 3. forgotPasswordController <br> |
| Login            | - pages/Auth/Login.js                                                                       | (same as above)                                                                                                          |
| General          | - components/Routes/Private.js <br> - components/UserMenu.js <br> - pages/user/Dashboard.js | - models/userModel.js                                                                                                    |
| Profile          | - pages/user/Profile.js                                                                     |                                                                                                                          |
| Admin Actions    | - pages/admin/CreateProduct.js <br> - pages/admin/UpdateProduct.js                          |                                                                                                                          |

#### Yi Jing

| Feature  | Client Related Files (/client/src/)                                              | Server Related Files (./)                                                                                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Order    | - pages/user/Orders.js                                                           | - Controllers/authController.js <br>&nbsp;&nbsp;1. updateProfileController <br>&nbsp;&nbsp;2. getOrdersController <br>&nbsp;&nbsp;3. getAllOrdersController <br>&nbsp;&nbsp;4. orderStatusController <br> - models/orderModel.js |
| Search   | - components/Form/SearchInput.js <br> - context/search.js <br> - pages/Search.js |                                                                                                                                                                                                                                  |
| Category | - hooks/useCategory.js <br> - pages/Categories.js                                | - controllers/categoryController.js <br>&nbsp;&nbsp;1. categoryController <br>&nbsp;&nbsp;2. singleCategoryController <br> - models/categoryModel.js                                                                             |

#### Tzu Che

| Feature | Client Related Files (/client/src/)                                                                                                                            | Server Related Files (./)                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Contact | - pages/Contact.js                                                                                                                                             |                                                                                                                              |
| Policy  | - pages/Policy.js                                                                                                                                              |                                                                                                                              |
| General | - components/Footer.js <br> - components/Header.js <br> - components/Layout.js <br> - components/Spinner.js <br> - pages/About.js <br> - pages/Pagenotfound.js | - config/db.js                                                                                                               |
| Home    | - pages/Homepage.js                                                                                                                                            |                                                                                                                              |
| Cart    | - context/cart.js <br> - pages/CartPage.js                                                                                                                     |                                                                                                                              |
| Payment |                                                                                                                                                                | - controllers/productController.js <br>&nbsp;&nbsp;1. braintreeTokenController <br>&nbsp;&nbsp;2. brainTreePaymentController |

## Milestone 2

### 1. Members' Contributions - Integration Testing and Bug Fixing

#### Krista

| Feature         | Client Related Files (/client/src/)                            | Server Related Files (./)                                                                                                                                                                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin Dashboard | - components/AdminMenu.js <br> - pages/admin/AdminDashboard.js |                                                                                                                                                                                                                                                                                                                                                                  |
| Product         | - pages/ProductDetails.js <br> - pages/CategoryProduct.js      | - controllers/productController.js <br> 1. getProductController <br> 2. getSingleProductController <br> 3. productPhotoController <br> 4. productFiltersController <br> 5. productCountController <br> 6. productListController <br> 7. searchProductController <br> 8. relatedProductController <br> 9. productCategoryController <br> - models/ProductModel.js |

#### Zann

| Feature             | Client Related Files (/client/src/)                                    | Server Related Files (./)                                                                                                              |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Admin Actions       | - components/Form/CategoryForm.js <br> - pages/admin/CreateCategory.js | - controllers/categoryController.js <br> 1. createCategoryController <br> 2. updateCategoryController <br> 3. deleteCategoryController |
| Admin View Orders   | - pages/admin/AdminOrders.js                                           |                                                                                                                                        |
| Admin View Products | - pages/admin/Products.js                                              | - controllers/productController.js <br> 1. createProductController <br> 2. deleteProductController <br> 3. updateProductController     |
| Admin View Users    | - pages/admin/Users.js                                                 |                                                                                                                                        |

#### Marcus

| Feature          | Client Related Files (/client/src/)                                                         | Server Related Files (./)                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Protected Routes | - context/auth.js                                                                           | - helpers/authHelper.js <br> - middlewares/authMiddleware.js                                                             |
| Registration     | - pages/Auth/Register.js                                                                    | - controllers/authController.js <br> 1. registerController <br> 2. loginController <br> 3. forgotPasswordController <br> |
| Login            | - pages/Auth/Login.js                                                                       | (same as above)                                                                                                          |
| General          | - components/Routes/Private.js <br> - components/UserMenu.js <br> - pages/user/Dashboard.js | - models/userModel.js                                                                                                    |
| Profile          | - pages/user/Profile.js                                                                     |                                                                                                                          |
| Admin Actions    | - pages/admin/CreateProduct.js <br> - pages/admin/UpdateProduct.js                          |                                                                                                                          |

#### Yi Jing

| Feature  | Client Related Files (/client/src/)                                              | Server Related Files (./)                                                                                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Order    | - pages/user/Orders.js                                                           | - Controllers/authController.js <br>&nbsp;&nbsp;1. updateProfileController <br>&nbsp;&nbsp;2. getOrdersController <br>&nbsp;&nbsp;3. getAllOrdersController <br>&nbsp;&nbsp;4. orderStatusController <br> - models/orderModel.js |
| Search   | - components/Form/SearchInput.js <br> - context/search.js <br> - pages/Search.js |                                                                                                                                                                                                                                  |
| Category | - hooks/useCategory.js <br> - pages/Categories.js                                | - controllers/categoryController.js <br>&nbsp;&nbsp;1. categoryController <br>&nbsp;&nbsp;2. singleCategoryController <br> - models/categoryModel.js                                                                             |

#### Tzu Che

| Feature | Client Related Files (/client/src/)                                                                                                                            | Server Related Files (./)                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Contact | - pages/Contact.js                                                                                                                                             |                                                                                                                              |
| Policy  | - pages/Policy.js                                                                                                                                              |                                                                                                                              |
| General | - components/Footer.js <br> - components/Header.js <br> - components/Layout.js <br> - components/Spinner.js <br> - pages/About.js <br> - pages/Pagenotfound.js | - config/db.js                                                                                                               |
| Home    | - pages/Homepage.js                                                                                                                                            |                                                                                                                              |
| Cart    | - context/cart.js <br> - pages/CartPage.js                                                                                                                     |                                                                                                                              |
| Payment |                                                                                                                                                                | - controllers/productController.js <br>&nbsp;&nbsp;1. braintreeTokenController <br>&nbsp;&nbsp;2. brainTreePaymentController |

### 2. Members' Contributions - UI Testing

#### Krista

##### User Actions - Products per Category

- Categories -> Choose Category -> Product Per Category -> View Product Details 
- Categories -> All Categories -> Categories Page -> Choose Category -> Product Per Category -> View Product Details 

##### User Actions - Home Page Product Processing

- Home -> Search Product(s) -> View Product Details
- Home -> Filter Product(s) by Price -> View Product Details
- Home -> Load More Products -> View Product Details

##### User Actions - Product Detail Page Functionalites

- View Product Details -> Add Product to Cart -> Cart (product added to cart)
- View Product Details -> Add Related Product to Cart -> Cart (related product added to cart)
- View Product Details -> View Related Product Details

#### Zann

##### Admin View Users

- Admin login -> navigates to dashboard -> click Users -> verifies that admin appears in the user list
- Admin login and finds no user -> a new user registers -> admin refreshes and verifies that the new user is in user list

##### Admin Actions - Category (Admin login -> navigates to dashboard -> click Create Category)

- Admin creates a blank Category -> verify that category not created and error message appears
- Admin creates a valid new Category -> verify category created successfully
- Admin edits an existing Category -> verify category edited successfully
- Admin deletes an existing Category -> verify category deleted successfully

##### Admin Actions - Products (Admin login -> navigates to dashboard -> click Create Product )

- Admin creates a blank Product -> verify that product not created and error message appears
- Admin creates a valid Product -> verify product created successfully

##### Admin View Products - View, Update, and Delete Products (Admin login -> navigates to dashboard -> click Products)

- Admin views an empty list of Products
- Admin views product list and verifies product details.
- Admin edits an existing Product -> verify product updated successfully
- Admin deletes an existing Product -> verify product deleted successfully

#### Marcus

#### Yi Jing

#### Tzu Che
