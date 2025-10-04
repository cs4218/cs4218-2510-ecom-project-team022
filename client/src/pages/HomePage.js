import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout";
import { AiOutlineReload } from "react-icons/ai";
import "../styles/Homepages.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(Array.isArray(data?.category) ? data.category : []);
      }
    } catch (error) {
      console.log(error);
      setCategories([]);
    }
  };

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setProducts(Array.isArray(data?.products) ? data.products : []);
    } catch (error) {
      console.log(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getTotal = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/product-count");
      setTotal(Number.isFinite(data?.total) ? data.total : 0);
    } catch (error) {
      console.log(error);
      setTotal(0);
    }
  };

  useEffect(() => {
    getAllCategory();
    getTotal();
    getAllProducts();
  }, []);

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      const next = Array.isArray(data?.products) ? data.products : [];
      setProducts((prev) => [...prev, ...next]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (value, id) => {
    setChecked((prev) => (value ? [...prev, id] : prev.filter((c) => c !== id)));
  };

  useEffect(() => {
    if (!checked.length && !radio.length) {
      if (page !== 1) setPage(1);
      getAllProducts();
    }
  }, [checked.length, radio.length]);

  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
  }, [checked, radio]);

  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setProducts(Array.isArray(data?.products) ? data.products : []);
      if (page !== 1) setPage(1);
    } catch (error) {
      console.log(error);
      setProducts([]);
    }
  };

  const handleReset = () => {
    setChecked([]);
    setRadio([]);
    if (page !== 1) setPage(1);
    getAllProducts();
  };

  return (
    <Layout title={"ALL Products - Best offers "}>
      {/* banner image */}
      <img
        src="/images/Virtual.png"
        className="banner-img"
        alt="bannerimage"
        width={"100%"}
      />
      {/* banner image */}
      <div className="container-fluid row mt-3 home-page">
        <div className="col-md-3 filters">
          <h4 className="text-center">Filter By Category</h4>
          <div className="d-flex flex-column">
            {categories?.map((c) => (
              <Checkbox
                key={c._id}
                onChange={(e) => handleFilter(e.target.checked, c._id)}
              >
                {c?.name ?? ""}
              </Checkbox>
            ))}
          </div>
          {/* price filter */}
          <h4 className="text-center mt-4">Filter By Price</h4>
          <div className="d-flex flex-column">
            <Radio.Group onChange={(e) => setRadio(e.target.value)}>
              {Prices?.map((p) => (
                <div key={p._id}>
                  <Radio value={p.array}>{p.name}</Radio>
                </div>
              ))}
            </Radio.Group>
          </div>
          <div className="d-flex flex-column">
            <button className="btn btn-danger" onClick={handleReset}>
              RESET FILTERS
            </button>
          </div>
        </div>

        <div className="col-md-9 ">
          <h1 className="text-center">All Products</h1>
          <div className="d-flex flex-wrap">
            {products?.map((p) => {
              const priceNumber = Number(p?.price);
              const priceText = Number.isFinite(priceNumber)
                ? priceNumber.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })
                : "$0.00";

              const desc =
                typeof p?.description === "string" ? p.description : "";
              return (
                <div className="card m-2" key={p._id}>
                  <img
                    src={`/api/v1/product/product-photo/${p._id}`}
                    className="card-img-top"
                    alt={p?.name || "product"}
                  />
                  <div className="card-body">
                    <div className="card-name-price">
                      <h5 className="card-title">{p?.name ?? ""}</h5>
                      <h5 className="card-title card-price">{priceText}</h5>
                    </div>
                    <p className="card-text ">
                      {desc.substring(0, 60)}...
                    </p>
                    <div className="card-name-price">
                      <button
                        className="btn btn-info ms-1"
                        onClick={() => navigate(`/product/${p.slug}`)}
                      >
                        More Details
                      </button>
                      <button
                        className="btn btn-dark ms-1"
                        onClick={() => {
                          const next = [...(Array.isArray(cart) ? cart : []), p];
                          setCart(next);
                          localStorage.setItem("cart", JSON.stringify(next));
                          toast.success("Item Added to cart");
                        }}
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="m-2 p-3">
            {Array.isArray(products) && products.length < total && (
              <button
                className="btn loadmore"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((prev) => prev + 1);
                }}
                disabled={loading}
              >
                {loading ? (
                  "Loading ..."
                ) : (
                  <>
                    {" "}
                    Load more <AiOutlineReload />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;