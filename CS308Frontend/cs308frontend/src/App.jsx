import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import NavigationBar from "./Pages/NavigationBar"; 
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import ShoppingCart from "./Pages/ShoppingCart";
import Checkout from "./Pages/Checkout";
import About from "./Pages/About";
import MyOrders from "./Pages/MyOrders";
import Home from "./Pages/Home";
import CheckoutSuccess from "./Pages/CheckoutSuccess";
import ProductPage from "./Pages/ProductPage";
import OrderDetails from "./Pages/OrderDetails";
import SearchResults from "./Pages/SearchResults";
import ProductListPage from "./Pages/ProductListPage";
import ProductManager from "./Pages/ProductManager";  
import SalesManager from "./Pages/SalesManager";  
import OrderDetailManager from "./Pages/OrderDetailManager";
import Profile from "./Pages/ProfilePage";
import Wishlist from "./Pages/Wishlist";
import "bootstrap/dist/css/bootstrap.min.css";

const ProtectedRoute = ({ element, allowedRole }) => {
  const role = sessionStorage.getItem("userRole"); 
  if (role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

function App() {
  const location = useLocation();
  const noPaddingPaths = ["/login", "/register"];
  const needsPadding = !noPaddingPaths.includes(location.pathname);

  return (
    <>
      <NavigationBar />
      <div style={{ paddingTop: needsPadding ? "120px" : "0" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shoppingcart" element={<ShoppingCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} /> 
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/productpage/:id" element={<ProductPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/category/:category" element={<ProductListPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />

          <Route
            path="/product-manager"
            element={<ProtectedRoute element={<ProductManager />} allowedRole="ProductManager" />}
          />
          <Route
            path="/product-manager/order/:orderId"
            element={<ProtectedRoute element={<OrderDetailManager />} allowedRole="ProductManager" />}
          />

          <Route
            path="/sales-manager"
            element={<ProtectedRoute element={<SalesManager />} allowedRole="SalesManager" />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
