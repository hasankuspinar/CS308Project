import React, { useState, useEffect } from "react";
import {
  Navbar, Nav, Container, Offcanvas, Button, Modal, Form, Alert
} from "react-bootstrap";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaShoppingCart,
  FaBars,
  FaSearch,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaUserCircle,
  FaChartLine,
  FaHeart
} from "react-icons/fa";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "/assets/logo.png";

const storage = sessionStorage;

let initialRole = storage.getItem("userRole") || null;

const NavigationBar = () => {
  const [userRole, setUserRole] = useState(initialRole);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [show, setShow] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showProfileWarning, setShowProfileWarning] = useState(false);  
  const navigate = useNavigate();
  const location = useLocation();
  const [showWishlistWarning, setShowWishlistWarning] = useState(false);
  
  const handleWishlistClick = () => {
    if (!userRole) {
      setShowWishlistWarning(true);
    } else {
      navigate("/wishlist");
    }
  };

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await axios.get('/cart');
        const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      } catch (err) {
        console.error("Failed to fetch cart count", err);
      }
    };

    fetchCartCount(); 

    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [location]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/products/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();

    const role = storage.getItem("userRole");
    if (role) {
      setUserRole(role);
    }

    const handleStorageChange = () => {
      const updatedRole = storage.getItem("userRole");
      setUserRole(updatedRole);
    };

    const handleCategoriesUpdated = () => {
      fetchCategories();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("categoriesUpdated", handleCategoriesUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("categoriesUpdated", handleCategoriesUpdated);
    };
  }, []);

  useEffect(() => {
    const role = storage.getItem("userRole");
    setUserRole(role);
  }, [location]);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    }
    storage.removeItem("userRole");
    setUserRole(null);
    navigate("/home");
  };

  const handleProfileClick = () => {
    if (!userRole) {
      setShowProfileWarning(true);
    } else {
      navigate("/profile");
      setShow(false);
    }
  };

  return (
    <>
      <Navbar expand="lg" fixed="top" className="shadow-sm" style={{ background: "#fff", padding: "20px 10", fontSize: "20px", borderBottom: "1px solid #000" }}>
        <Container>
          <div className="d-flex w-100 justify-content-between align-items-center">
            <Navbar.Brand as={NavLink} to="/home" className="fw-bold d-flex align-items-center">
              <img src={logo} height={100} className="me-2" alt="CHANTA Logo" />
              CHANTA
            </Navbar.Brand>

            <div className="d-flex justify-content-center flex-grow-1 gap-4">
              {categories.map(category => (
                <Button
                  key={category.id}
                  as={NavLink}
                  to={`/category/${category.id}`}
                  className="px-5 py-2 fw-bold"
                  variant="outline-dark"
                >
                  {category.categoryName}
                </Button>
              ))}
            </div>

            <div className="d-flex align-items-center">
              <Nav.Link onClick={() => setShowSearch(true)} className="me-3 text-dark">
                <FaSearch size={24} />
              </Nav.Link>
              <Nav.Link onClick={handleWishlistClick} className="me-3 text-dark" style={{ cursor: "pointer" }}>
                <FaHeart size={24} />
              </Nav.Link>
             <Nav.Link as={NavLink} to="/shoppingcart" className="me-3 text-dark position-relative">
              <FaShoppingCart size={24} />
              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.65rem' }}
                >
                  {cartCount}
                </span>
              )}
            </Nav.Link>
              <Button variant="light" onClick={() => setShow(true)} className="border-0">
                <FaBars size={28} />
              </Button>
            </div>
          </div>
        </Container>
      </Navbar>

      <Offcanvas show={show} onHide={() => setShow(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-bold fs-4">Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column text-center">
            <Nav.Link as={NavLink} to="/login" onClick={() => setShow(false)} className="fs-5 py-3 text-black border-bottom d-flex justify-content-center align-items-center">
              <FaSignInAlt className="me-2" /> Login
            </Nav.Link>
            <Nav.Link as={NavLink} to="/register" onClick={() => setShow(false)} className="fs-5 py-3 text-black border-bottom d-flex justify-content-center align-items-center">
              <FaUserPlus className="me-2" /> Register
            </Nav.Link>
            <Nav.Link as={NavLink} to="/home" onClick={() => { setShow(false); handleLogout(); }} className="fs-5 py-3 text-black border-bottom d-flex justify-content-center align-items-center">
              <FaSignOutAlt className="me-2" /> Logout
            </Nav.Link>
            <Nav.Link
              as="button"
              onClick={handleProfileClick}
              className="fs-5 py-3 text-black border-bottom d-flex justify-content-center align-items-center bg-transparent border-0"
              style={{ cursor: "pointer" }}
            >
              <FaUserCircle className="me-2" /> Profile
            </Nav.Link>
            <Nav.Link as={NavLink} to="/myorders" onClick={() => setShow(false)} className="fs-5 py-3 text-black border-bottom d-flex justify-content-center align-items-center">
              My Orders
            </Nav.Link>

            {userRole === "ProductManager" && (
              <Nav.Link
                as={NavLink}
                to="/product-manager"
                onClick={() => setShow(false)}
                className="fs-5 py-3 text-black border-bottom d-flex justify-content-center align-items-center"
              >
                🛠 Product Manager Dashboard
              </Nav.Link>
            )}

            {userRole === "SalesManager" && (
              <Nav.Link
                as={NavLink}
                to="/sales-manager"
                onClick={() => setShow(false)}
                className="fs-5 py-3 text-black border-bottom d-flex justify-content-center align-items-center"
              >
                <FaChartLine className="me-2" /> Sales Manager Dashboard
              </Nav.Link>
            )}

            <Nav.Link as={NavLink} to="/about" onClick={() => setShow(false)} className="fs-5 py-3 text-black">
              About Chanta
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Search Modal */}
      <Modal show={showSearch} onHide={() => setShowSearch(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Search & Sort Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. leather bag"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sort By</Form.Label>
              <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="">None</option>
                <option value="price">Price</option>
                <option value="popularity">Popularity</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sort Order</Form.Label>
              <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="">Select</option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </Form.Select>
            </Form.Group>
            <Button
              variant="dark"
              className="w-100"
              onClick={() => {
                const query = `?search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
                navigate(`/search${query}`);
                setShowSearch(false);
              }}
            >
              Search
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showProfileWarning} onHide={() => setShowProfileWarning(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Access Denied</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>You must be logged in to access your profile.</p>
          <Button
            variant="dark"
            onClick={() => {
              setShowProfileWarning(false);
              setShow(false);  
              navigate("/login");
            }}
          >
            Go to Login
          </Button>
        </Modal.Body>
      </Modal>

      <Modal show={showWishlistWarning} onHide={() => setShowWishlistWarning(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Access Denied</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>You must be logged in to view your wishlist.</p>
          <Button
            variant="dark"
            onClick={() => {
              setShowWishlistWarning(false);
              navigate("/login");
            }}
          >
            Go to Login
          </Button>
        </Modal.Body>
      </Modal>

    </>
  );
};

export default NavigationBar;
