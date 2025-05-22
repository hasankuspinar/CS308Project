import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";

const fallbackImage = "/assets/images/bag1.png";

const SearchResults = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get("search") || "";
    const sortBy = queryParams.get("sortBy") || "";
    const sortOrder = queryParams.get("sortOrder") || "asc";

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/products/search`, {
                    params: {
                        search,
                        sortBy: ["price", "popularity"].includes(sortBy) ? sortBy : "",
                        sortOrder: ["asc", "desc"].includes(sortOrder) ? sortOrder : "asc",
                    },
                });
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching search results", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [search, sortBy, sortOrder]);

    return (
        <Container className="py-5" style={{ paddingTop: "120px" }}>
            <div className="text-center mb-5">
                <h1 className="fw-bold display-5">Search Results</h1>
                <p className="text-muted fs-5">Explore filtered and sorted products</p>
                {(search || sortBy) && (
                    <Alert variant="light" className="mt-3">
                        {search && <span><strong>Keyword:</strong> {search}</span>}
                        {sortBy && (
                            <span className="ms-3">
                                <strong>Sort:</strong> {sortBy} ({sortOrder})
                            </span>
                        )}
                    </Alert>
                )}
            </div>

            {loading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : products.length === 0 ? (
                <p className="text-center">No products found.</p>
            ) : (
                <Row className="g-4">
                    {products.map((product) => (
                        <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
                            <Card className="h-100 shadow-sm border-0 rounded-4">
                                <Card.Img
                                    variant="top"
                                    src={product.imageURL || fallbackImage}
                                    onError={(e) => (e.target.src = fallbackImage)}
                                    alt={product.productName}
                                    style={{
                                        height: "250px",
                                        objectFit: "cover",
                                        borderTopLeftRadius: "1rem",
                                        borderTopRightRadius: "1rem"
                                    }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{product.productName}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {product.model || "No model"}
                                    </Card.Subtitle>
                                    <Card.Text className="text-secondary small flex-grow-1">
                                        {product.description || "No description available."}
                                    </Card.Text>
                                    {product.price < product.oldPrice ? (
                                        <div className="mb-2" style={{ alignSelf: "flex-start" }}>
                                            <span className="text-muted text-decoration-line-through me-2">${product.oldPrice.toFixed(2)}</span>
                                            <span className="badge bg-danger text-light px-3 py-2">${product.price.toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <span className="badge bg-secondary text-light px-3 py-2 mb-2" style={{ alignSelf: "flex-start" }}>
                                            ${product.price.toFixed(2)}
                                        </span>
                                    )}

                                    <Button
                                        variant="dark"
                                        className="w-100 mt-auto"
                                        onClick={() => navigate(`/productpage/${product.id}`)}
                                    >
                                        View Details
                                    </Button>
                                </Card.Body>
                                <Card.Footer className="bg-white border-0 text-muted small text-end">
                                    {product.distributor || "No distributor"}
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default SearchResults;
