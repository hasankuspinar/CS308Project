import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const WishList = () => {
  const [wishlist, setWishlist] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await axios.get('/auth/status');
        setCurrentUser(res.data);
      } catch {
        setShowLoginModal(true);
      }
    };
    checkUserStatus();
  }, []);

  useEffect(() => {
    if (currentUser) {
      axios.get('/products/wishlist')
        .then(async (res) => {
          const wishlistData = res.data;

          const detailedProducts = await Promise.all(
            wishlistData.map(async (wishItem) => {
              try {
                const productRes = await axios.get(`/products/${wishItem.productId}`);
                return { ...wishItem, ...productRes.data };
              } catch (err) {
                console.error(`Failed to fetch product ${wishItem.productId}:`, err);
                return wishItem;
              }
            })
          );

          setWishlist(detailedProducts);
        })
        .catch(err => console.error('Failed to fetch wishlist:', err));
    }
  }, [currentUser]);

  const handleRemoveFromWishlist = (wishId) => {
    axios.delete(`/products/wishlist/${wishId}`)
      .then((res) => {
        console.log('Delete success:', res.data);
        setWishlist(prev => prev.filter(item => item.wishId !== wishId));
        setStatusMessage('✅ Product removed from wishlist.');
      })
      .catch((err) => {
        console.error('Failed to remove product from wishlist:', err.response?.data || err.message);
        setStatusMessage('❌ Failed to remove product from wishlist.');
      });
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center fw-bold">My Wishlist</h2>

      {statusMessage && (
        <div className="alert alert-info alert-dismissible fade show text-center" role="alert">
          {statusMessage}
          <button type="button" className="btn-close" onClick={() => setStatusMessage('')}></button>
        </div>
      )}

      {showLoginModal && (
        <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Login Required</h5>
                <button type="button" className="btn-close" onClick={() => setShowLoginModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <p>Please log in to access your wishlist.</p>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-outline-secondary" onClick={() => setShowLoginModal(false)}>Close</button>
                <button className="btn btn-dark" onClick={() => navigate('/login')}>Go to Login</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {wishlist.length > 0 ? (
          wishlist.map(item => (
            <div className="col-md-6 mb-4" key={item.wishId}>
              <div className="card shadow-sm h-100 rounded-4 border-0 hover-shadow">
                <div className="row g-0 align-items-center">
                  <div className="col-md-4">
                    <img
                      src={item.imageURL || '/assets/images/default-product.png'}
                      alt={item.productName || 'Unnamed Product'}
                      className="img-fluid rounded-start"
                      style={{ objectFit: 'cover', height: '100%' }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title fw-bold">{item.productName || 'Unnamed Product'}</h5>
                      <p className="card-text text-muted">{item.description || 'No description available.'}</p>
                                  {item.price < item.oldPrice ? (
                                      <p className="card-text fw-bold">
                                          <span className="text-muted text-decoration-line-through me-2">${item.oldPrice.toFixed(2)}</span>
                                          <span className="text-danger">${item.price.toFixed(2)}</span>
                                      </p>
                                  ) : (
                                      <p className="card-text fw-bold">
                                          ${item.price.toFixed(2)}
                                      </p>
                                  )}

                      <span className={`badge ${item.quantity > 0 ? 'bg-success' : 'bg-secondary'} mb-2`}>
                        {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <div className="d-grid gap-2">
                        <Link to={`/productpage/${item.productId}`} className="btn btn-outline-secondary btn-sm">
                          View Details
                        </Link>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveFromWishlist(item.wishId)}
                        >
                          <i className="bi bi-trash"></i> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p className="text-muted">No products in your wishlist.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishList;
