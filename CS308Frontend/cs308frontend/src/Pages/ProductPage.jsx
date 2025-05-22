import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const fallbackImage = "/assets/images/bag1.png";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userEmails, setUserEmails] = useState({});
  const [wishlistMessage, setWishlistMessage] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const productRes = await axios.get(`/products/${id}`);
        setProduct(productRes.data);

        const commentsRes = await axios.get(`/products/${id}/comments`);
        setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);

        const ratingsRes = await axios.get(`/products/${id}/ratings`);
        setRatings(Array.isArray(ratingsRes.data) ? ratingsRes.data : []);

        await fetchEmailsForUsers(commentsRes.data, ratingsRes.data);

        const userStatusRes = await axios.get("/auth/status");
        setCurrentUser(userStatusRes.data);

        if (userStatusRes.data) {
          checkWishlistStatus();
        }
      } catch (err) {
        console.error("Failed to fetch some data:", err);
      }
    };

    fetchAll();
  }, [id]);

  const checkWishlistStatus = async () => {
    try {
      const res = await axios.get('/products/wishlist');
      const existingWish = res.data.find(w => w.productId === parseInt(id));
      if (existingWish) {
        setIsInWishlist(true);
        setWishlistId(existingWish.wishId);
      } else {
        setIsInWishlist(false);
        setWishlistId(null);
      }
    } catch (err) {
      console.error('Failed to check wishlist status:', err);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await axios.post(`/products/${id}/wishlist`);
      setIsInWishlist(true);
      setWishlistMessage('❤️ Added to wishlist!');
      setTimeout(() => setWishlistMessage(''), 3000);
      checkWishlistStatus();
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      setWishlistMessage('❌ Failed to add to wishlist.');
      setTimeout(() => setWishlistMessage(''), 3000);
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!wishlistId) return;
    try {
      await axios.delete(`/products/wishlist/${wishlistId}`);
      setIsInWishlist(false);
      setWishlistId(null);
      setWishlistMessage('🗑️ Removed from wishlist.');
      setTimeout(() => setWishlistMessage(''), 3000);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setWishlistMessage('❌ Failed to remove from wishlist.');
      setTimeout(() => setWishlistMessage(''), 3000);
    }
  };

  const fetchEmailsForUsers = async (commentsList, ratingsList) => {
    const commentUserIds = commentsList.map(c => c.userId);
    const ratingUserIds = ratingsList.map(r => r.userId);
    const uniqueUserIds = [...new Set([...commentUserIds, ...ratingUserIds])];
    const emailMap = {};

    for (const userId of uniqueUserIds) {
      try {
        const res = await axios.get(`/auth/getuserdetailsbyuserid`, { params: { userId } });
        const email = res.data?.email;
        if (email) {
          emailMap[userId] = email.split("@")[0];
        }
      } catch (err) {
        emailMap[userId] = `User ${userId}`;
      }
    }

    setUserEmails(emailMap);
  };

  const handleAddToCart = async () => {
  try {
    await axios.post("/cart", { productId: parseInt(id), quantity: 1 });
    alert("Added to cart!");

    window.dispatchEvent(new Event("cartUpdated"));
  } catch (err) {
    alert("Failed to add to cart.");
  }
};


  const getDisplayName = (userId) => userEmails[userId] || `User ${userId}`;
  const getRatingByUser = (userId) => ratings.find(r => r.userId === userId)?.productRating ?? null;
  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.productRating, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <div className="container py-5">
      {wishlistMessage && (
        <div className="alert alert-success text-center">{wishlistMessage}</div>
      )}

      {!product ? (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-md-6">
            <img
              src={product.imageURL || fallbackImage}
              onError={(e) => (e.target.src = fallbackImage)}
              alt={product.productName}
              className="img-fluid rounded border"
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="col-md-6">
            <div className="bg-light p-4 rounded shadow-sm mb-4">
              <div className="position-relative mb-3">
                <h2 className="fw-bold mb-0 text-center">{product.productName}</h2>

                {currentUser && (
                  <button
                    className={`btn position-absolute top-0 end-0 ${isInWishlist ? 'btn-danger' : 'btn-outline-dark'}`}
                    onClick={isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist}
                    title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <i className={`bi ${isInWishlist ? 'bi-heart-fill' : 'bi-heart'} text-dark`}></i>
                  </button>
                )}
              </div>

              {averageRating && (
                <div className="mb-3">
                  <strong>Average Rating:</strong>{" "}
                  <span className="text-warning me-2">{averageRating}/10</span>
                  {[...Array(10)].map((_, i) => (
                    <i
                      key={i}
                      className={`bi ${i < Math.round(averageRating) ? "bi-star-fill text-warning" : "bi-star text-muted"}`}
                    />
                  ))}
                </div>
              )}
              <p><strong>Model:</strong> {product.model}</p>
              <p><strong>Serial Number:</strong> {product.serialNumber}</p>
              <p><strong>Description:</strong> {product.description}</p>
              <p><strong>Distributor:</strong> {product.distributor}</p>
                <p><strong>Price:</strong> {product.price < product.oldPrice ? (
                    <>
                        <span className="text-muted text-decoration-line-through me-2">${product.oldPrice.toFixed(2)}</span>
                        <span className="text-danger fw-bold">${product.price.toFixed(2)}</span>
                    </>
                ) : (
                    <span>${product.price.toFixed(2)}</span>
                )}</p>

              <p>
              <strong>Status:</strong>{" "}
              <span className={`badge ${product.quantity > 0 ? "bg-success" : "bg-danger"}`}>
                {product.quantity > 0
                  ? `In Stock (${product.quantity} left)`
                  : "Out of Stock"}
              </span>
            </p>

              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="btn btn-dark btn-lg mt-3"
              >
                <i className="bi bi-cart-plus me-2" />
                Add to Cart
              </button>
            </div>

            <div>
              <h4 className="mb-3">Comments & Ratings</h4>

              {comments.length === 0 ? (
                <p className="text-muted">No comments yet.</p>
              ) : (
                comments.map((comment) => {
                  const rating = getRatingByUser(comment.userId);
                  return (
                    <div key={`comment-${comment.id}`} className="card mb-3 shadow-sm">
                      <div className="card-body d-flex">
                        <img
                          src="https://www.gravatar.com/avatar/?d=mp&s=50"
                          alt="user avatar"
                          className="rounded-circle me-3"
                          width="50"
                          height="50"
                        />
                        <div className="flex-grow-1">
                          <h6 className="fw-semibold mb-1">{getDisplayName(comment.userId)}</h6>
                          {rating !== null && (
                            <div className="mb-1">
                              {[...Array(10)].map((_, idx) => (
                                <i
                                  key={idx}
                                  className={`bi ${idx < rating ? "bi-star-fill text-warning" : "bi-star text-muted"}`}
                                  style={{ fontSize: "1rem" }}
                                />
                              ))}
                            </div>
                          )}
                          <p className="mb-0">{comment.productComment}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {ratings.filter(r => !comments.some(c => c.userId === r.userId)).map((rating) => (
                <div key={`rating-${rating.id}`} className="card mb-3 shadow-sm">
                  <div className="card-body d-flex">
                    <img
                      src="https://www.gravatar.com/avatar/?d=mp&s=50"
                      alt="user avatar"
                      className="rounded-circle me-3"
                      width="50"
                      height="50"
                    />
                    <div className="flex-grow-1">
                      <h6 className="fw-semibold mb-1">{getDisplayName(rating.userId)}</h6>
                      <div className="mb-1">
                        {[...Array(10)].map((_, idx) => (
                          <i
                            key={idx}
                            className={`bi ${idx < rating.productRating ? "bi-star-fill text-warning" : "bi-star text-muted"}`}
                            style={{ fontSize: "1rem" }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-end mt-5">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
      </div>
    </div>
  );
};

export default ProductPage;
