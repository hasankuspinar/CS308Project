import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Spinner,
  Alert,
  Badge,
  Button,
  ListGroup,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

const fallbackImage = "/assets/images/bag1.png";

const getStatusBadge = (status) => {
  switch (status) {
    case "Delivered":
      return <Badge bg="success" pill>Delivered</Badge>;
    case "InDelivery":
      return <Badge bg="info" pill>In Delivery</Badge>;
    case "Processing":
      return <Badge bg="warning" text="dark" pill>Processing</Badge>;
    default:
      return <Badge bg="secondary" pill>{status}</Badge>;
  }
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForms, setShowForms] = useState({});
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  const toggleForm = (productId) => {
    setShowForms((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const submitRating = async (productId) => {
    const rating = ratings[productId];

    if (rating === undefined) {
      alert("Please select a rating before submitting.");
      return;
    }

    try {
      const res = await axios.post(`/products/${productId}/ratings`, {
        productRating: rating,
      });
      alert(res.data?.message || "Thanks for your rating!");
    } catch (error) {
      console.error("Rating submission failed:", error);
      alert(error.response?.data?.message || "Failed to submit rating.");
    }
  };


  const submitComment = async (productId) => {
    const comment = comments[productId];

    if (!comment || comment.trim() === "") {
      alert("Please enter a comment before submitting.");
      return;
    }

    try {
      const res = await axios.post(`/products/${productId}/comments`, {
        productComment: comment.trim(),
      });
      alert(res.data?.message || "Thanks for your comment!");
      setComments((prev) => ({ ...prev, [productId]: "" }));
    } catch (error) {
      console.error("Comment submission failed:", error);
      alert(error.response?.data?.message || "Failed to submit comment.");
    }
  };


  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/purchases/orders/${orderId}`);
      const items = response.data;

      if (!Array.isArray(items) || items.length === 0)
        throw new Error("Order not found");

      const firstItem = items[0];
      const date = firstItem.date
        ? new Date(firstItem.date).toISOString().split("T")[0]
        : "Unknown Date";

      const productPromises = items.map((item) =>
        axios.get(`/products/${item.productId}`).then((res) => ({
          ...res.data,
          quantity: item.quantity,
          price: item.totalPrice,
        }))
      );
      const products = await Promise.all(productPromises);

      setOrder({
        id: orderId,
        date,
        status: firstItem.status,
        address: firstItem.deliveryAddress,
        products,
      });
    } catch (err) {
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" className="mt-5 text-center">
        {error}
      </Alert>
    );

  const totalPayment = order.products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  return (
    <Container className="py-5">
      <Card className="shadow p-4 mb-4 border-0">
        <Card.Body>
          <h3 className="fw-bold mb-3">Order Details</h3>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {order.date}</p>
          <p><strong>Status:</strong> {getStatusBadge(order.status)}</p>
          <p><strong>Delivery Address:</strong> {order.address}</p>
        </Card.Body>
      </Card>

      <h4 className="mb-4">Products</h4>
      <ListGroup>
        {order.products.map((product) => (
          <ListGroup.Item
            key={product.id}
            className="mb-3 p-3 rounded shadow-sm border-0"
          >
            <div className="d-flex align-items-center">
              <img
                src={product.imageURL}
                onError={(e) => (e.target.src = fallbackImage)}
                alt={product.productName}
                width="100"
                height="100"
                className="me-4 rounded"
              />
              <div className="flex-grow-1">
                <h5 className="mb-1">{product.productName}</h5>
                <p className="mb-1 text-muted">Quantity: {product.quantity}</p>
                <p className="mb-1 text-muted">
                  Unit Price: ${product.price.toFixed(2)}
                </p>
                <p className="mb-2 fw-semibold">
                  Total: ${(product.price * product.quantity).toFixed(2)}
                </p>
              </div>
              <div className="d-flex flex-column">
                <Button
                  variant="dark"
                  className="mb-2"
                  onClick={() => navigate(`/productpage/${product.id}`)}
                >
                  View Product
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => toggleForm(product.id)}
                >
                  Rate & Comment
                </Button>
              </div>
            </div>

            {showForms[product.id] && (
              <section
                style={{ backgroundColor: "#f5f5f5" }}
                className="rounded mt-3 p-3"
              >
                <div className="card">
                  <div className="card-body p-4">
                    <div className="d-flex flex-start w-100">
                      <img
                        className="rounded-circle shadow-1-strong me-3"
                        src="https://www.gravatar.com/avatar/?d=mp&s=65"
                        alt="avatar"
                        width="65"
                        height="65"
                      />
                      <div className="w-100">
                        <h5 className="mb-3">Leave a Review</h5>

                        <div className="text-center">
                          <div className="d-flex justify-content-center flex-wrap gap-1 mb-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                              <i
                                key={star}
                                className={`bi ${
                                  ratings[product.id] >= star
                                    ? "bi-star-fill text-warning"
                                    : "bi-star text-muted"
                                }`}
                                style={{
                                  fontSize: "1.3rem",
                                  cursor: "pointer",
                                }}
                                title={`${star} star`}
                                onClick={() =>
                                  setRatings((prev) => ({
                                    ...prev,
                                    [product.id]: star,
                                  }))
                                }
                              ></i>
                            ))}
                          </div>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => submitRating(product.id)}
                          >
                            Submit Rating
                          </Button>
                        </div>

                        <div className="form-outline mb-3 mt-3">
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="What is your view?"
                            value={comments[product.id] || ""}
                            onChange={(e) =>
                              setComments((prev) => ({
                                ...prev,
                                [product.id]: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <Button
                          variant="danger"
                          onClick={() => submitComment(product.id)}
                        >
                          Submit Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <div className="text-end mt-4">
        <h5 className="fw-bold">
          Total Payment: ${totalPayment.toFixed(2)}
        </h5>
      </div>
    </Container>
  );
};

export default OrderDetails;
