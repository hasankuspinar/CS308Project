import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container, Card, Spinner, Alert, Badge, ListGroup, Button, Row, Col, Table,
} from "react-bootstrap";
import axios from "axios";

const fallbackImage = "/assets/images/bag1.png";

const getStatusBadge = (status) => {
  switch (status) {
    case "Delivered":
      return <Badge bg="success">Delivered</Badge>;
    case "InDelivery":
      return <Badge bg="info">In Delivery</Badge>;
    case "Processing":
      return <Badge bg="warning" text="dark">Processing</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

const OrderDetailManager = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          productId: item.productId,
        }))
      );
      const products = await Promise.all(productPromises);

      let customerEmail = 'N/A';
      const userId = firstItem.userId;

      if (userId) {
        try {
          const userRes = await axios.get('/auth/getuserdetailsbyuserid', {
            params: { userId, nocache: Date.now() },
          });
          customerEmail = userRes.data?.email || 'N/A';
        } catch (emailError) {
          console.warn(`Failed to fetch email for userId ${userId}`, emailError);
        }
      }

      const deliveryDetails = items.map((item) => ({
        deliveryId: item.purchaseId,
        customerId: item.userId,
        productId: item.productId,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        deliveryAddress: item.deliveryAddress,
        status: item.status,
      }));

      setOrder({
        id: orderId,
        date,
        status: firstItem.status,
        address: firstItem.deliveryAddress,
        email: customerEmail,
        userId: firstItem.userId,
        products,
      });

      setDeliveries(deliveryDetails);
    } catch (err) {
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="mt-5 text-center">{error}</Alert>;

  const totalPayment = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <Container className="py-5">
      <Card className="shadow p-4 mb-4 border-0">
        <Card.Body>
          <h3 className="fw-bold mb-3 text-center">Delivery Information</h3>
          <Row className="mb-3">
            <Col md={6}><strong>Order ID:</strong> {order.id}</Col>
            <Col md={6}><strong>Date:</strong> {order.date}</Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}><strong>Customer Email:</strong> {order.email}</Col>
            <Col md={6}><strong>Delivery Address:</strong> {order.address}</Col>
          </Row>

          {deliveries.length > 0 && (
            <>
              <hr />
              <Row className="mb-2">
                <Col md={6}><strong>Delivery ID:</strong> {deliveries[0].deliveryId}</Col>
                <Col md={6}><strong>Customer ID:</strong> {deliveries[0].customerId}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Product ID:</strong> {deliveries[0].productId}</Col>
                <Col md={6}><strong>Quantity:</strong> {deliveries[0].quantity}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}><strong>Total Price:</strong> ${deliveries[0].totalPrice.toFixed(2)}</Col>
                <Col md={6}><strong>Delivery Status:</strong> {getStatusBadge(deliveries[0].status)}</Col>
              </Row>
            </>
          )}

          <div className="text-center mt-4">
                      <Button
                          className="btn btn-dark"
                          onClick={async () => {
                              const emailPrefix = order.email?.split('@')[0] || 'customer';
                              const [firstName, lastName] = emailPrefix.includes('.')
                                  ? emailPrefix.split('.', 2)
                                  : [emailPrefix, emailPrefix];

                              const body = {
                                  orderId: order.id, 
                                  userId: order.userId,
                                  firstName,
                                  lastName
                              };

                              try {
                                  const res = await axios.post('/purchases/invoice/by-order', body, {
                                      responseType: 'blob',
                                      headers: { 'Content-Type': 'application/json' }
                                  });

                                  const blob = new Blob([res.data], { type: 'application/pdf' });
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `invoice_${order.id}.pdf`;
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                              } catch (err) {
                                  console.error("❌ Failed to download invoice:", err);
                                  alert("Failed to generate invoice.");
                              }
                          }}
                      >
                          <i className="bi bi-file-earmark-pdf me-1"></i> View Invoice
                      </Button>


          </div>
        </Card.Body>
      </Card>

      <h4 className="mb-4 text-center">Products</h4>
      <Table striped bordered hover responsive className="align-middle">
        <thead className="table-dark">
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {order.products.map((product) => (
            <tr key={product.productId}>
              <td>
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={product.imageURL}
                    onError={(e) => (e.target.src = fallbackImage)}
                    alt={product.productName}
                    width="60"
                    height="60"
                    className="rounded border"
                  />
                  <span className="fw-semibold">{product.productName}</span>
                </div>
                  </td>
                  <td>{product.quantity}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>${(product.price * product.quantity).toFixed(2)}</td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      href={`/productpage/${product.productId}`}
                      target="_blank"
                    >
                      View Product
                    </Button>
                  </td>
               </tr>
          ))}
        </tbody>
      </Table>


    </Container>
  );
};

export default OrderDetailManager;
