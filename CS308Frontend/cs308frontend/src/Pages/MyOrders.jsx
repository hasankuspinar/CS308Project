import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const fallbackImage = "/assets/images/bag1.png";

const getStatusBadge = (status) => {
  switch (status) {
    case "Delivered":
      return <Badge bg="success" pill>Delivered</Badge>;
    case "InDelivery":
      return <Badge bg="info" pill>In Delivery</Badge>;
    case "Processing":
      return <Badge bg="warning" text="dark" pill>Processing</Badge>;
    case "Cancelled":
      return <Badge bg="secondary" pill>Cancelled</Badge>;
    default:
      return <Badge bg="secondary" pill>{status}</Badge>;
  }
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`/purchases/orders/${orderId}`);
      const items = response.data;
      if (!Array.isArray(items) || items.length === 0) return null;

      const firstItem = items[0];
      const formattedDate = firstItem.date
        ? new Date(firstItem.date).toISOString().split("T")[0]
        : "Unknown Date";

      const latestPurchaseDate = items
        .map((item) => new Date(item.date))
        .filter((d) => !isNaN(d))
        .sort((a, b) => b - a)[0] || new Date(0);

      const productPromises = items.map((item) =>
        axios.get(`/products/${item.productId}`).then((res) => ({
          ...res.data,
          quantity: item.quantity,
          price: item.totalPrice,
          status: item.status,
        }))
      );
      const products = await Promise.all(productPromises);

      return {
        id: orderId,
        date: formattedDate,
        address: firstItem.deliveryAddress,
        status: firstItem.status,
        products,
        latestPurchaseDate,
      };
    } catch (err) {
      console.error(`Failed to fetch details for order ${orderId}`, err);
      return null;
    }
  };

  const fetchOrders = async () => {
    try {
      const statusCheck = await axios.get("/auth/status");
      if (!statusCheck?.data) {
        setShowLoginModal(true);
        return;
      }
    } catch {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await axios.get("/purchases/orders", { withCredentials: true });
      const orderIds = response.data;

      const orderDetails = await Promise.all(orderIds.map(fetchOrderDetails));
      const validOrders = orderDetails.filter((order) => order !== null);
      validOrders.sort((a, b) => new Date(b.latestPurchaseDate) - new Date(a.latestPurchaseDate));
      setOrders(validOrders);
    } catch (err) {
      console.error("Failed to fetch order list", err);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await axios.put(`/purchases/cancel/${orderId}`, {}, { withCredentials: true });
      alert("Order cancelled successfully!");
      fetchOrders();
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel the order.");
    }
  };

  const handleRefund = async (orderId) => {
    try {
      await axios.put(`/purchases/refund/${orderId}`, {}, { withCredentials: true });
      alert("Refund requested successfully!");
      fetchOrders();
    } catch (error) {
      console.error("Refund failed:", error);
      alert("Refund request failed. Order must be delivered and within 30 days.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Container className="py-5" style={{ paddingTop: "120px" }}>
      <div className="text-center mb-5">
        <h1 className="fw-bold display-5">Orders</h1>
        <p className="text-muted fs-5">Track your recent purchases and delivery status</p>
      </div>

      {showLoginModal && (
        <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Access Denied</h5>
                <button type="button" className="btn-close" onClick={() => setShowLoginModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <p>Please log in to access your orders.</p>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-outline-secondary" onClick={() => setShowLoginModal(false)}>Close</button>
                <button className="btn btn-dark" onClick={() => navigate('/login')}>Go to Login</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {orders.map((order) => {
        const totalPayment = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        return (
          <Card className="mb-4 shadow-sm border-0 rounded-4 px-4 py-3" key={`order-${order.id}`}>
            <Row className="align-items-center justify-content-between mb-3">
              <Col className="d-flex align-items-center flex-wrap gap-3">
                {order.products.slice(0, 4).map((product, i) => (
                  <div key={`product-${order.id}-${i}`} className="text-center">
                    <img
                      src={product.imageURL}
                      onError={(e) => (e.target.src = fallbackImage)}
                      alt={`Product ${product.id}`}
                      style={{
                        height: "50px",
                        width: "50px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                ))}
              </Col>
              <Col xs="auto" className="text-end">
                <Badge bg="secondary" className="text-uppercase mb-2" style={{ fontSize: "0.75rem" }}>
                  Order ID: {order.id}
                </Badge>
              </Col>
            </Row>

            <Row className="align-items-center" style={{ minHeight: "120px" }}>
              <Col md={8} className="d-flex flex-column justify-content-center h-100 text-md-start text-center">
                <div className="mb-2"><strong>Total Payment:</strong> ${totalPayment.toFixed(2)}</div>
                <div className="mb-2"><strong>Date:</strong> {order.date}</div>
                <div className="mb-2"><strong>Address:</strong> {order.address}</div>
              </Col>
              <Col md={4} className="d-flex flex-column justify-content-center align-items-md-end align-items-center h-100">
                {order.status === "Delivered" && (
                  <Button variant="outline-danger" className="mb-2" onClick={() => handleRefund(order.id)}>
                    Request Refund
                  </Button>
                )}
                {(order.status === "Processing") && (
                  <Button variant="danger" className="mb-2" onClick={() => handleCancel(order.id)}>
                    Cancel Order
                  </Button>
                )}
                <div className="mb-2"><strong>Status:</strong> {getStatusBadge(order.status)}</div>
                <Button variant="dark" onClick={() => navigate(`/orders/${order.id}`)}>
                  View Details
                </Button>
              </Col>
            </Row>
          </Card>
        );
      })}
    </Container>
  );
};

export default MyOrders;
