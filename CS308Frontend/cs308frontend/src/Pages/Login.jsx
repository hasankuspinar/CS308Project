import React, { useState } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await axios.post("/auth/login", { email, password });
            setMessage(response.data.message);

            const roleRes = await axios.get("/auth/getuserrole");
            const role = roleRes.data.role;

            localStorage.setItem("userRole", role);
            sessionStorage.setItem("userRole", role);

            const redirectTo = new URLSearchParams(location.search).get("redirectTo");

        if (role === "ProductManager") {
            navigate("/product-manager");
        } else if (role === "SalesManager") {
            navigate("/sales-manager");
        } else if (redirectTo) {
            navigate(`/${redirectTo}`);
        } else {
            navigate("/home");
        }

    } catch (err) {
        setError(err.response?.data?.message || "Invalid credentials!");
    } finally {
        setLoading(false);
    }
};



    return (
        <div className="login-container">
            <Card className="login-card">
                <h3 className="text-center mb-4">Login</h3>

                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleLogin}>
                    <Form.Group controlId="formEmail" className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="formPassword" className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button
                        variant="success"
                        type="submit"
                        className="login-button w-100"
                        disabled={loading}
                    >
                        {loading ? (
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        ) : (
                            "Login"
                        )}
                    </Button>

                    <p className="text-center text-muted mt-3">
                        Don't have an account?{" "}
                        <Link to="/register" className="login-link">
                            Register here
                        </Link>
                    </p>
                </Form>
            </Card>
        </div>
    );
};

export default Login;