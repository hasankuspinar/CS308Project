import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

const Checkout = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [availableStates, setAvailableStates] = useState([]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [selectedState, setSelectedState] = useState("");

    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCVV, setCardCVV] = useState("");

    const countryStates = {
        turkey: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Ordu"],
        united_states: ["California", "Texas", "Florida", "New York", "Illinois"],
        germany: ["Bavaria", "Berlin", "North Rhine-Westphalia", "Baden-Württemberg", "Hamburg"],
        france: ["Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur", "Nouvelle-Aquitaine", "Occitanie"],
        japan: ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka"],
    };

    useEffect(() => {
        const fetchCartAndProducts = async () => {
            try {
                const cartRes = await axios.get("/cart", { withCredentials: true });
                const cartData = cartRes.data;

                const productPromises = cartData.map(async (item) => {
                    try {
                        const productRes = await axios.get(`/products/${item.productId}`);
                        return { ...productRes.data, quantity: item.quantity };
                    } catch (err) {
                        console.error(`Failed to fetch product ${item.productId}`, err);
                        return null;
                    }
                });

                const products = await Promise.all(productPromises);
                const validProducts = products.filter(p => p !== null);
                setCartItems(validProducts);
            } catch (err) {
                console.error("Failed to fetch cart", err);
            }
        };
        fetchCartAndProducts();
    }, []);

    const handleCountryChange = (e) => {
        const country = e.target.value;
        setSelectedCountry(country);
        setAvailableStates(countryStates[country] || []);
    };

    const getTotalPrice = () =>
        cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !address || !selectedCountry || !selectedState ||
            !cardName || !cardNumber || !cardExpiry || !cardCVV) {
            alert("Please fill in all required fields.");
            return;
        }

        const deliveryAddress = `${address}, ${selectedState}, ${selectedCountry}`;
        const items = cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));

        try {
            const response = await axios.post(
                "/purchases/checkout",
                {
                    items,
                    deliveryAddress,
                    firstName,
                    lastName
                },
                { withCredentials: true }
            );

            const { data: orderId } = response;
            navigate("/checkout-success", {
                state: { orderId, firstName, lastName }
            });
        } catch (error) {
            console.error("Checkout failed", error);
            alert("Checkout failed. Please try again.");
        }
    };

    return (
        <div className="checkout-container">
            <Card className="checkout-card">
                <h2 className="text-center py-5">Checkout</h2>
                <div className="row g-5">
                    <div className="col-md-5 col-lg-5 order-md-last">
                        <h4 className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-primary">Your cart</span>
                            <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
                        </h4>
                        <ul className="list-group mb-3">
                            {cartItems.map((item) => (
                                <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center lh-sm">
                                    <img src={item.imageURL || "https://via.placeholder.com/50"} alt={item.productName} style={{ width: 50, height: 50 }} />
                                    <div>
                                        <h6 className="my-0">{item.productName}</h6>
                                        <small className="text-muted">Qty: {item.quantity}</small>
                                    </div>
                                    <span className="text-muted">€{(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                            <li className="list-group-item d-flex justify-content-between">
                                <span>Total (EUR)</span>
                                <strong>€{getTotalPrice().toFixed(2)}</strong>
                            </li>
                        </ul>
                    </div>

                    <div className="col-md-7 col-lg-7">
                        <h4 className="mb-3">Billing address</h4>
                        <form className="needs-validation" onSubmit={handleSubmit} noValidate>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <label className="form-label">First name</label>
                                    <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                </div>
                                <div className="col-sm-6">
                                    <label className="form-label">Last name</label>
                                    <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Address</label>
                                    <input type="text" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} required />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label">Country</label>
                                    <select className="form-select" value={selectedCountry} onChange={handleCountryChange} required>
                                        <option value="">Choose...</option>
                                        {Object.keys(countryStates).map((country) => (
                                            <option key={country} value={country}>{country.replace("_", " ")}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">State</label>
                                    <select className="form-select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} required disabled={!selectedCountry}>
                                        <option value="">Choose...</option>
                                        {availableStates.map((state, idx) => (
                                            <option key={idx} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Zip</label>
                                    <input type="text" className="form-control" required />
                                </div>
                            </div>

                            <hr className="my-4" />

                            <h4 className="mb-3">Payment</h4>
                            <div className="row gy-3">
                                <div className="col-md-6">
                                    <label className="form-label">Name on card</label>
                                    <input type="text" className="form-control" value={cardName} onChange={(e) => setCardName(e.target.value)} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Card number</label>
                                    <input type="text" className="form-control" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Exp</label>
                                    <input type="text" className="form-control" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} required />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">CVV</label>
                                    <input type="text" className="form-control" value={cardCVV} onChange={(e) => setCardCVV(e.target.value)} required />
                                </div>
                            </div>

                            <hr className="my-4" />
                            <button className="place-order-button" type="submit">Place Order</button>
                        </form>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Checkout;
