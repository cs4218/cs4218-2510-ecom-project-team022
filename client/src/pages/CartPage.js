import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatMoney = (n) =>
    Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const totalPrice = () => {
    try {
      const total = (Array.isArray(cart) ? cart : []).reduce((sum, item) => {
        const price = Number(item?.price);
        return sum + (Number.isFinite(price) ? price : 0);
      }, 0);
      return formatMoney(total);
    } catch (error) {
      console.log(error);
      return formatMoney(0);
    }
  };

  const removeCartItem = (index) => {
    try {
      const myCart = Array.isArray(cart) ? [...cart] : [];
      if (index > -1 && index < myCart.length) {
        myCart.splice(index, 1);
        setCart(myCart);
        localStorage.setItem("cart", JSON.stringify(myCart));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getToken = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/braintree/token");
      setClientToken(data?.clientToken || "");
    } catch (error) {
      console.log(error);
      setClientToken("");
    }
  };

  useEffect(() => {
    getToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  const handlePayment = async () => {
    try {
      if (!instance) return;
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      await axios.post("/api/v1/product/braintree/payment", {
        nonce,
        cart,
      });
      setLoading(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Payment Completed Successfully");
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Payment failed. Please try again.");
    }
  };

  const userGreeting = !auth?.user
    ? "Hello Guest"
    : `Hello ${auth?.user?.name ?? ""}`.trim();

  return (
    <Layout title="Cart">
      <div className="cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {userGreeting}
              <p className="text-center mb-0">
                {Array.isArray(cart) && cart.length
                  ? `You Have ${cart.length} item${cart.length > 1 ? "s" : ""} in your cart${
                      auth?.token ? "" : " — please login to checkout!"
                    }`
                  : "Your Cart Is Empty"}
              </p>
            </h1>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-7 p-0 m-0">
              {(Array.isArray(cart) ? cart : []).map((p, index) => (
                <div className="row card flex-row" key={index}>
                  <div className="col-md-4">
                    <img
                      src={`/api/v1/product/product-photo/${p?._id}`}
                      className="card-img-top"
                      alt={p?.name || "Product photo"}
                      width="100%"
                      height="130"
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{p?.name || "Unnamed product"}</p>
                    <p>{(p?.description || "").substring(0, 30)}</p>
                    <p>Price: {formatMoney(p?.price)}</p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-md-5 cart-summary">
              <h2>Cart Summary</h2>
              <p>Total | Checkout | Payment</p>
              <hr />
              <h4>Total: {totalPrice()}</h4>

              {auth?.user?.address ? (
                <div className="mb-3">
                  <h4>Current Address</h4>
                  <h5>{auth?.user?.address}</h5>
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                </div>
              ) : (
                <div className="mb-3">
                  {auth?.token ? (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        navigate("/login", {
                          state: "/cart",
                        })
                      }
                    >
                      Please login to checkout
                    </button>
                  )}
                </div>
              )}

              <div className="mt-2">
                {!clientToken || !auth?.token || !(Array.isArray(cart) && cart.length) ? null : (
                  <>
                    <DropIn
                      options={{
                        authorization: clientToken,
                        paypal: { flow: "vault" },
                      }}
                      onInstance={(inst) => setInstance(inst)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handlePayment}
                      disabled={loading || !instance || !auth?.user?.address}
                    >
                      {loading ? "Processing ..." : "Make Payment"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;