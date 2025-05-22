import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import axios from "axios";
import "./Register.css"; 
import "../App.css";
import { Link, useNavigate } from "react-router-dom"; // Import Link


const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            setMessage(null);
            return;
        }

        try {
            const response = await axios.post("/auth/register", { email, password });
            setMessage(response.data.message);
            navigate("/login");
            setError(null);
        } catch (err) {
            setError(err.response?.data || "Something went wrong!");
            setMessage(null);
        }
    };

    return (
        <div className="register-container">
            <Card className="register-card">
                <h3 className="text-center mb-4">Registration</h3>

                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleRegister}>
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

                    <Form.Group controlId="formConfirmPassword" className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button
                        variant="success"
                        type="submit"
                        className="register-button w-100"
                    >
                        Register
                    </Button>

                    <p className="text-center text-muted mt-3">
                        Already have an account?{" "}
                        <Link to="/login" className="register-link">
                            Login here
                        </Link>
                    </p>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
