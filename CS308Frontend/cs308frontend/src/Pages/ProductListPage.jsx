import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ProductListPage = () => {
    const { category } = useParams(); 
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const navigate = useNavigate();
    const fallbackImage = "/assets/images/bag1.png";

    useEffect(() => {
        const fetchCategoryName = async () => {
            try {
                const res = await axios.get(`/products/categories/${category}`);
                setCategoryName(res.data.categoryName);
            } catch (err) {
                console.error("❌ Error fetching category name:", err);
                setCategoryName(`Category #${category}`);
            }
        };

        const fetchProducts = async () => {
            try {
                const res = await axios.get("/products");
                const filtered = res.data.filter(p => p.categoryId === parseInt(category));
                setProducts(filtered);
            } catch (err) {
                console.error("❌ Error fetching products:", err);
            }
        };

        fetchCategoryName();
        fetchProducts();
    }, [category]);

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center">Products in {categoryName}</h2>

            <div className="row">
                {products.map(product => (
                    <div key={product.id} className="col-md-4 mb-4">
                        <div className="card h-100 shadow-sm border-0">
                            <img
                                src={product.imageURL}
                                onError={(e) => e.target.src = fallbackImage}
                                className="card-img-top"
                                alt={product.productName}
                                style={{ objectFit: 'cover', height: '250px' }}
                            />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{product.productName}</h5>
                                <h6 className="card-subtitle text-muted">{product.model}</h6>
                                <p className="card-text text-secondary small">{product.description}</p>
                                {product.price < product.oldPrice ? (
                                    <div className="mb-3">
                                        <span className="text-muted text-decoration-line-through me-2">${product.oldPrice.toFixed(2)}</span>
                                        <span className="badge bg-danger px-3 py-2">${product.price.toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <span className="badge bg-secondary px-3 py-2">${product.price.toFixed(2)}</span>
                                )}

                                <button
                                    onClick={() => navigate(`/productpage/${product.id}`)}
                                    className="btn btn-dark mt-auto"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductListPage;
