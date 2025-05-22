import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import banner1 from '/assets/banner1.png';
import banner2 from '/assets/banner2.png';
import banner3 from '/assets/banner3.png';

const bannerImages = [banner1, banner2, banner3];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/products'); 
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const fallbackImage = "/assets/images/bag1.png";


  return (
    <div>
<div className="mb-5">
  <div id="heroCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
    
    <div className="carousel-indicators">
      {bannerImages.map((_, idx) => (
        <button
          key={idx}
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide-to={idx}
          className={idx === 0 ? 'active' : ''}
          aria-label={`Slide ${idx + 1}`}
        />
      ))}
    </div>

    <div className="carousel-inner">
      {bannerImages.map((src, idx) => (
        <div
          className={`carousel-item ${idx === 0 ? 'active' : ''}`}
          key={idx}
        >
          <div
            className="d-flex align-items-center justify-content-center text-white text-center"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '60vh',
              position: 'relative',
            }}
          >
           
          </div>
        </div>
      ))}
    </div>

    <button
      className="carousel-control-prev"
      type="button"
      data-bs-target="#heroCarousel"
      data-bs-slide="prev"
    >
      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Previous</span>
    </button>
    <button
      className="carousel-control-next"
      type="button"
      data-bs-target="#heroCarousel"
      data-bs-slide="next"
    >
      <span className="carousel-control-next-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Next</span>
    </button>
  </div>
</div>


       {/* All Products */}
      <div className="container">
        <h2 className="mb-4 text-center">All Products</h2>
        <div className="row">
          {products.map(product => (
            <div key={product.id} className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm d-flex flex-column">
                <img
                  src={product.imageURL || fallbackImage}
                  className="card-img-top"
                  alt={product.productName}
                  style={{ objectFit: 'cover', height: '250px' }}
                  onError={(e) => e.target.src = fallbackImage}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-medium">{product.productName}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{product.model}</h6>
                  <p className="card-text text-secondary small flex-grow-1">{product.description}</p>

                  <div className="d-flex flex-column gap-2 mt-auto">
                    {product.price < product.oldPrice ? (
                      <div>
                        <span className="text-muted text-decoration-line-through me-2">
                          ${product.oldPrice.toFixed(2)}
                        </span>
                        <span className="badge bg-danger px-3 py-2">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="badge bg-secondary px-3 py-2">
                        ${product.price.toFixed(2)}
                      </span>
                    )}

                    <button
                      onClick={() => navigate(`/productpage/${product.id}`)}
                      className="btn w-100"
                      style={{ backgroundColor: '#333', color: '#fff', border: 'none' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 text-muted small text-end">
                  {product.distributor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light text-muted mt-5 pt-5">
        <div className="container text-center text-md-start">
          <div className="row">
            {/* About */}
            <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">Chanta</h6>
              <p>Premium. Minimal. Timeless. Discover high-quality bags and accessories made for everyday elegance.</p>
            </div>

            {/* Useful Links */}
            <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">Useful Links</h6>
              <p><a href="/about" className="text-reset">About Us</a></p>
              <p><a href="/products" className="text-reset">Products</a></p>
              <p><a href="/contact" className="text-reset">Contact</a></p>
              <p><a href="/faq" className="text-reset">FAQ</a></p>
            </div>

            {/* Contact Info */}
            <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mb-md-0 mb-4">
              <h6 className="text-uppercase fw-bold mb-4">Contact</h6>
              <p><i className="fas fa-home me-2"></i> 123 Main St, Istanbul, Turkey</p>
              <p><i className="fas fa-envelope me-2"></i> info@chanta.com</p>
              <p><i className="fas fa-phone me-2"></i> +90 555 123 4567</p>
            </div>
          </div>
        </div>

        <div className="text-center py-4" style={{ backgroundColor: '#f1f1f1' }}>
          © 2025 Chanta. All rights reserved. | Designed by Chanta Team
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
