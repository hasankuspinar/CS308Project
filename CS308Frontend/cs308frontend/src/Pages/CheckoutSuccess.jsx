import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const CheckoutSuccess = () => {
    const location = useLocation();
    const { orderId, firstName, lastName } = location.state || {};   

    const [orderDetails, setOrderDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [setFirstName] = useState("");  
    const [setLastName] = useState("");    
    const [userId, setUserId] = useState(null);


    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/purchases/orders/${orderId}`, { withCredentials: true });
                setOrderDetails(response.data);

                if (response.data.length > 0) {
                    const nameParts = response.data[0].deliveryAddress?.split(",") || [];
                    if (nameParts.length >= 2) {
                        setFirstName(nameParts[0].trim());
                        setLastName(nameParts[1].trim());
                    }
                }
            } catch (error) {
                console.error("Failed to fetch order details", error);
            }
            setIsLoading(false);
        };
        const fetchUserInfo = async () => {
            try {
                const res = await axios.get("/Auth/getuserdetails", { withCredentials: true });
                if (res.data && res.data.userId) {
                    setUserId(res.data.userId);
                }
            } catch (err) {
                console.error("Failed to fetch user info", err);
            }
        };
        fetchUserInfo();
        fetchOrderDetails();
    }, [orderId]);

    const calculateTotal = () => {
        return orderDetails.reduce((total, item) => total + (item.totalPrice || 0), 0).toFixed(2);
    };

    const handleDownloadInvoice = async () => {
        if (!userId) {
            alert("User ID not available. Please try again later.");
            return;
        }

        try {
            const response = await axios.post(
                "/purchases/invoice/by-order",
                { orderId, firstName, lastName, userId },
                { responseType: "blob", withCredentials: true }
            );

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "invoice.pdf");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to download invoice", error);
            alert("Failed to download invoice. Please try again.");
        }
    };


    if (isLoading) {
        return (
            <Container style={{ paddingTop: "120px" }} className="text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading your order info...</p>
            </Container>
        );
    }

    if (!orderId || orderDetails.length === 0) {
        return (
            <Container style={{ paddingTop: "120px" }} className="text-center">
                <h4>No order information found.</h4>
                <Link to="/home">
                    <Button className="mt-3">Go Back to Home</Button>
                </Link>
            </Container>
        );
    }

    return (
        <Container style={{ paddingTop: "120px" }}>
            <Card className="p-5 text-center shadow-lg rounded-4">
                <h1 className="fw-bold mb-3 text-success">🎉 Checkout Successful!</h1>
                <p className="mb-4 fs-5">Thank you for your purchase. Your order has been placed successfully.</p>

                <h4 className="mb-4">Order Summary:</h4>
                <div className="text-start">
                    {orderDetails.map((item, index) => (
                        <Card key={index} className="mb-3 p-3 border-0 bg-light">
                            <p><strong>Product Name:</strong> {item.productName}</p>
                            <p><strong>Quantity:</strong> {item.quantity}</p>
                            <p><strong>Delivery Address:</strong> {item.deliveryAddress || "N/A"}</p>
                            <p><strong>Total Price:</strong> €{item.totalPrice?.toFixed(2)}</p>
                            <p><strong>Status:</strong> {item.status}</p>
                        </Card>
                    ))}
                </div>

                <hr className="my-4" />
                <h4>Total Paid: €{calculateTotal()}</h4>

                <div className="d-flex justify-content-center gap-3 mt-4">
                    <Button variant="success" onClick={handleDownloadInvoice}>Download Invoice (PDF)</Button>
                    <Link to="/home">
                        <Button variant="outline-primary">Continue Shopping</Button>
                    </Link>
                    <Link to="/orders">
                        <Button variant="primary">View My Orders</Button>
                    </Link>
                </div>
            </Card>
        </Container>
    );
};

export default CheckoutSuccess;
