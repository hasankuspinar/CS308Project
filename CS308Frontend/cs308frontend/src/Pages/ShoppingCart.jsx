import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const isLoggedIn = async () => {
  try {
    const res = await axios.get("/Auth/status");
    console.log(res);
    return !!res.data;
  } catch {
    return false;
  }
};

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartAndProducts = async () => {

      try {
        const cartRes = await axios.get("/cart");
        const cartData = cartRes.data;

        const productsPromises = cartData.map(async (item) => {
          try {
            const productRes = await axios.get(`/products/${item.productId}`);
            return { ...productRes.data, quantity: item.quantity };
          } catch (err) {
            console.error(`Failed to fetch product ${item.productId}`, err);
            return null;
          }
        });

        const products = await Promise.all(productsPromises);
        const validProducts = products.filter((p) => p !== null);
        setCartItems(validProducts);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setError("Failed to fetch cart");
      }

      setLoading(false);
    };

    fetchCartAndProducts();
  }, []);

  const handleIncrease = async (index) => {
    const updatedItems = [...cartItems];
    updatedItems[index].quantity += 1;
    setCartItems(updatedItems);

    try {
      await axios.put(`/cart/${updatedItems[index].id}`, updatedItems[index].quantity, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error("Failed to update cart quantity", err);
    }
  };

  const handleDecrease = async (index) => {
    const updatedItems = [...cartItems];
    if (updatedItems[index].quantity > 1) {
      updatedItems[index].quantity -= 1;
      setCartItems(updatedItems);

      try {
        await axios.put(`/cart/${updatedItems[index].id}`, updatedItems[index].quantity, {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error("Failed to update cart quantity", err);
      }
    } else {
      await handleDelete(index);
    }
  };

  const handleDelete = async (index) => {
    const productId = cartItems[index].id;
    setCartItems(cartItems.filter((_, i) => i !== index));

    try {
      await axios.delete(`/cart/${productId}`);
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await axios.get("/auth/status", { withCredentials: true });
      const loggedIn = res.status === 200 && res.data?.message === "Authenticated";
      if (loggedIn) {
        navigate("/checkout");
      } else {
        navigate("/login?redirectTo=checkout");
      }
    } catch {
      navigate("/login?redirectTo=checkout");
    }
  };


  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
  };

  if (loading) {
    return <div className="container py-5">Loading...</div>;
  }

  if (error) {
    return <div className="container py-5 text-danger">{error}</div>;
  }

  return (
    <section>
      <div className="container py-5">
        <div className="row d-flex justify-content-center align-items-center">
          <div className="col-12">
            <div className="card card-registration card-registration-2" style={{ borderRadius: "15px" }}>
              <div className="card-body p-0">
                <div className="row g-0">
                  <div className="col-lg-8">
                    <div className="p-5">
                      <div className="d-flex justify-content-between align-items-center mb-5">
                        <h1 className="fw-bold mb-0">Shopping Cart</h1>
                      </div>
                      <hr className="my-4" />
                      {cartItems.map((item, index) => (
                        <div key={item.id}>
                          <div className="row mb-4 d-flex justify-content-between align-items-center">
                            <div className="col-md-2 col-lg-2 col-xl-2">
                              <img src={item.imageURL} className="img-fluid rounded-3" alt={item.productName} />
                            </div>
                            <div className="col-md-3 col-lg-3 col-xl-3">
                              <h6 className="text-muted">Product</h6>
                              <h6 className="mb-0">{item.productName}</h6>
                              <a href={`/productpage/${item.id}`} className="btn btn-dark btn-sm mt-2">View Details</a>
                            </div>
                            <div className="col-md-3 col-lg-3 col-xl-2 d-flex align-items-center">
                              <button className="btn btn-outline-secondary btn-sm" onClick={() => handleDecrease(index)}>-</button>
                              <span className="mx-2">{item.quantity}</span>
                              <button className="btn btn-outline-secondary btn-sm" onClick={() => handleIncrease(index)}>+</button>
                            </div>
                            <div className="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                              <h6 className="mb-0">${(item.price * item.quantity).toFixed(2)}</h6>
                            </div>
                            <div className="col-md-1 col-lg-1 col-xl-1 text-end">
                              <button className="btn btn-link text-danger" onClick={() => handleDelete(index)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                          <hr className="my-4" />
                        </div>
                      ))}
                      <div className="pt-5">
                        <h6 className="mb-0">
                          <a href="/" className="text-body">
                            <i className="fas fa-long-arrow-alt-left me-2"></i>Back to shop
                          </a>
                        </h6>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="p-5">
                      <h3 className="fw-bold mb-5 mt-2 pt-1">Summary</h3>
                      <hr className="my-4" />
                      <div className="d-flex justify-content-between mb-5">
                        <h5 className="text-uppercase">Total price</h5>
                        <h5>${calculateTotal()}</h5>
                      </div>
                      <button onClick={handleCheckout} className="btn btn-dark btn-block btn-lg">
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShoppingCart;
