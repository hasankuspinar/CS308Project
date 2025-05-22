import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [comments, setComments] = useState({ pending: [], processed: [] });
  const [tab, setTab] = useState('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  

  const navigate = useNavigate();

  const [newProduct, setNewProduct] = useState({
    productName: '',
    model: '',
    serialNumber: 0,
    description: '',
    quantity: 0,
    distributor: '',
    warrantyStatus: 0,
    imageURL: '',
    categoryId: 0,
  });

  useEffect(() => {
    const init = async () => {
      await fetchProducts();
      fetchCategories();
      fetchDeliveries();
    };
    init();
  }, []);
  
  useEffect(() => {
    if (products.length > 0) {
      fetchComments();
    }
  }, [products]);
  

  const fetchProducts = async () => {
    const res = await axios.get('/products');
    console.log("Fetched products:", res.data);
    setProducts(res.data);
  };
  

  const fetchCategories = async () => {
    const res = await axios.get('/products/categories');
    setCategories(res.data);
  };

  const fetchDeliveries = async () => {
  const mapStatusToCode = (statusStr) => {
    switch (statusStr) {
      case 'Processing': return 0;
      case 'InDelivery': return 1;
      case 'Delivered': return 2;
      case 'Cancelled': return 3;
      case 'RefundRequested': return 4;
      case 'Refunded': return 5;
      default: return 0;
    }
  };

  try {
    const res = await axios.get('/purchases/orders/all');
    const orderIds = Array.isArray(res.data) ? res.data : [];

    const orderDetails = await Promise.all(
      orderIds.map(async (orderId) => {
        try {
          const orderRes = await axios.get(`/purchases/orders/${orderId}`);
          const orderItems = Array.isArray(orderRes.data) ? orderRes.data : [];

          const firstItem = orderItems[0];
          const userId = firstItem?.userId;

          let customerEmail = 'N/A';

          if (userId !== undefined && userId !== null) {
            try {
              const userRes = await axios.get('/Auth/getuserdetailsbyuserid', {
                params: { userId, nocache: Date.now() },
              });
              console.log(`Fetched user details for userId ${userId}:`, userRes.data);
              customerEmail = userRes.data?.email || 'N/A';
            } catch (emailError) {
              console.warn(`❌ Failed to fetch email for userId ${userId}`, emailError);
            }
          }

          return {
            userId,
            orderId,
            deliveryAddress: firstItem?.deliveryAddress || 'N/A',
            status: mapStatusToCode(firstItem?.status),
            totalPrice: orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
            email: `${customerEmail}`,
          };
        } catch (orderError) {
          console.error(`❌ Failed to fetch order ${orderId}`, orderError);
          return {
            orderId,
            deliveryAddress: 'N/A',
            status: 0,
            totalPrice: 0,
            email: 'N/A',
          };
        }
      })
    );

    setDeliveries(orderDetails);
  } catch (error) {
    console.error('❌ Error fetching deliveries list:', error);
    setDeliveries([]);
  }
};

  
  const renderComment = (comment, showActions) => (
  <div key={comment.id} className="list-group-item border rounded shadow-sm mb-4 p-0">
    <div className="text-white px-3 py-2 d-flex justify-content-between flex-wrap" style={{ backgroundColor: '#314024' }}>
      <div><strong>ID:</strong> {comment.id}</div>
      <div><strong>Product:</strong> #{comment.productId}</div>
      <div><strong>User:</strong> {comment.userId}</div>
      <div><strong>Status:</strong> {comment.statusText}</div>
    </div>
    <div className="p-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
      <div className="flex-grow-1 w-100">
        <strong>Comment:</strong>
        <div className="border rounded p-2 mt-1 bg-light">{comment.productComment}</div>
      </div>
      {showActions && (
        <div className="d-flex flex-row gap-2 align-items-center">
          <button className="btn btn-outline-success" onClick={() => handleApproveComment(comment.id, true)}>
            <i className="bi bi-hand-thumbs-up me-1"></i> Approve
          </button>
          <button className="btn btn-outline-danger" onClick={() => handleApproveComment(comment.id, false)}>
            <i className="bi bi-hand-thumbs-down me-1"></i> Disapprove
          </button>
        </div>
      )}
    </div>
  </div>
);

  
  const fetchComments = async () => {
  try {
    const res = await axios.get('/products/comments', {
      headers: { 'Accept': 'application/json' }
    });

    let data = res.data;
    if (typeof data === 'string') data = JSON.parse(data);

    const mapStatus = (code) => {
      switch (code) {
        case 1: return 'Pending';
        case 2: return 'Approved';
        case 0: return 'Disapproved';
        default: return 'Unknown';
      }
    };

    const formatted = data.map(c => ({ ...c, statusText: mapStatus(c.status) }));

    const pending = formatted.filter(c => c.statusText === 'Pending');
    const processed = formatted.filter(c => c.statusText !== 'Pending');

    setComments({ pending, processed });
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    setComments({ pending: [], processed: [] });
  }
};

  
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const numericFields = ['serialNumber', 'quantity', 'warrantyStatus'];

    setNewProduct((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? value === '' ? '' : Number(value)
        : value,
    }));
  };


  const resetForm = () => {
    setNewProduct({
      productName: '',
      model: '',
      serialNumber: 0,
      description: '',
      quantity: 0,
      distributor: '',
      warrantyStatus: 0,
      imageURL: '',
      categoryId: 0,
    });
  };

  const showTempMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

    const statusMessages = {
    0: 'Processing',
    1: 'In Delivery',
    2: 'Delivered',
    3: 'Cancelled',
    4: 'Refund Requested',
    5: 'Refunded'
  };


  const handleAddProduct = async () => {
    const { productName, model, serialNumber, description, quantity, distributor, warrantyStatus, imageURL, categoryId } = newProduct;

    if (!productName || !model || !description || serialNumber <= 0 || quantity <= 0 || !distributor || warrantyStatus < 0 || !imageURL || categoryId <= 0) {
      alert('Please fill out all fields and select a valid category.');
      return;
    }


    try {
      await axios.post('/products', newProduct, {
        headers: { 'Content-Type': 'application/json' },
      });
      setShowAddModal(false);
      showTempMessage('✅ Product added successfully!');
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to add product. Please check your inputs.');
    }
  };



  const handleRemoveProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/products/${id}`);
      showTempMessage('🗑️ Product removed successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateStock = async () => {
    const quantityValue = Number(newQuantity);
    if (!newQuantity || isNaN(quantityValue) || quantityValue < 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    try {
      await axios.put(`/products/${selectedProductId}/quantity`, quantityValue, {
        headers: { 'Content-Type': 'application/json' },
      });
      setShowStockModal(false);
      setNewQuantity('');
      setSelectedProductId(null);
      showTempMessage('📦 Stock updated successfully!');
      fetchProducts();
    } catch (error) {
      console.error('❌ Error updating stock:', error.response?.data || error.message);
    }
  };

  const handleApproveComment = async (id, approve) => {
    const url = approve
      ? `/products/comments/${id}/approve`
      : `/products/comments/${id}/disapprove`;
    await axios.put(url);
    fetchComments();
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a valid category name.');
      return;
    }
  
    try {
      await axios.post('/products/categories', newCategoryName, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      showTempMessage('✅ Category added!');
      setNewCategoryName('');
      fetchCategories();
      window.dispatchEvent(new Event('categoriesUpdated')); 
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };
  
  
  const handleRemoveCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
  
    try {
      await axios.delete(`/products/categories/${id}`);
      showTempMessage('🗑️ Category removed!');
      fetchCategories();
      window.dispatchEvent(new Event('categoriesUpdated')); 
    } catch (error) {
      console.error('Error deleting product:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to delete product.');
    }
  
  };
  

  const handleOpenEditCategoryModal = (category) => {
    setSelectedCategory(category);
    setUpdatedCategoryName(category.name);
    setShowEditCategoryModal(true);
  };

  return (
    <div className="container mt-4">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow rounded mb-4">
        <div className="container-fluid">
          <span className="navbar-brand">📦 Product Manager Dashboard</span>
        </div>
      </nav>

     <ul className="nav nav-pills mb-4 d-flex justify-content-center">
      {['products', 'categories', 'deliveries', 'comments'].map((item) => (
        <li className="nav-item" key={item}>
          <button
            className="nav-link"
            style={{
              color: tab === item ? 'white' : '#28a745',
              backgroundColor: tab === item ? '#212529' : 'transparent',
              border: tab === item ? '1px solid transparent' : '1px solid #28a745',
              marginRight: '5px'
            }}
            onClick={() => setTab(item)}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        </li>
      ))}
    </ul>

      {message && (
        <div className="alert alert-success text-center" role="alert">
          {message}
        </div>
      )}

      {/* --- MODALS --- */}

     {showAddModal && (
        <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Product</h5>
                <button className="btn-close" onClick={() => { setShowAddModal(false); resetForm(); }}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {[
                    ['productName', 'Product Name'],
                    ['model', 'Model'],
                    ['serialNumber', 'Serial Number'],
                    ['description', 'Description'],
                    ['quantity', 'Quantity'],
                    ['distributor', 'Distributor'],
                    ['warrantyStatus', 'Warranty Status'],
                    ['imageURL', 'Image URL']
                  ].map(([key, label]) => (
                    <div className="col-md-6" key={key}>
                      <label className="form-label">{label}</label>
                          <input
                              type={
                                  ['serialNumber', 'quantity', 'warrantyStatus'].includes(key) ? 'text' : 'text'
                              }
                              inputMode={
                                  ['serialNumber', 'quantity', 'warrantyStatus'].includes(key) ? 'numeric' : undefined
                              }
                              pattern={
                                  ['serialNumber', 'quantity', 'warrantyStatus'].includes(key) ? '[0-9]*' : undefined
                              }
                              className="form-control"
                              name={key}
                              value={newProduct[key]}
                              onChange={handleInputChange}
                          />
                    </div>
                  ))}

                  {/* Category Dropdown by Name */}
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                    className="form-select"
                    name="categoryId"
                    value={newProduct.categoryId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a category</option>
                    {Array.isArray(categories) && categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.categoryName}</option>  
                    ))}
                  </select>
                  </div>

                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-dark" onClick={handleAddProduct}>Submit</button>
                <button className="btn btn-secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showStockModal && (
        <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Product Stock</h5>
                <button className="btn-close" onClick={() => setShowStockModal(false)}></button>
              </div>
              <div className="modal-body">
                <label className="form-label">New Stock Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-dark" onClick={handleUpdateStock}>Update</button>
                <button className="btn btn-secondary" onClick={() => setShowStockModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditCategoryModal && (
        <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <label className="form-label">New Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={updatedCategoryName}
                  onChange={(e) => setUpdatedCategoryName(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrderDetails && (
        <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Details (ID: {selectedOrderDetails.orderId})</h5>
                <button className="btn-close" onClick={() => setSelectedOrderDetails(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>Customer Email:</strong> {selectedOrderDetails.email}
                  </div>
                  <div className="col-md-6">
                    <strong>Delivery Address:</strong> {selectedOrderDetails.deliveryAddress}
                  </div>
                  <div className="col-md-6">
                    <strong>Total Price:</strong> ${selectedOrderDetails.totalPrice.toFixed(2)}
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong>{" "}
                    {selectedOrderDetails.status === 0
                      ? "Processing"
                      : selectedOrderDetails.status === 1
                      ? "In Delivery"
                      : "Delivered"}
                  </div>
                  {}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedOrderDetails(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* --- TABS --- */}

    {tab === 'products' && (
    <div className="card shadow p-4">
      <h4 className="mb-4 d-flex align-items-center gap-2">
        <span><i className="bi bi-box-seam"></i></span>
        Product List
      </h4>
      <button className="btn btn-dark mb-3" onClick={() => setShowAddModal(true)}>
        <i className="bi bi-plus-lg me-1"></i> Add Product
      </button>
      <div className="list-group">
      {products.map((p) => (
      <div key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>{p.productName}</strong> <span className="text-muted">| Stock: {p.quantity}</span>
        </div>
        <div>
          <button className="btn btn-dark btn-sm me-2" onClick={() => {
            setSelectedProductId(p.id);
            setNewQuantity(p.quantity);
            setShowStockModal(true);
          }}>
            <i className="bi bi-pencil-square me-1"></i> Update Stock
          </button>
          <button className="btn btn-dark btn-sm" onClick={() => handleRemoveProduct(p.id)}>
            <i className="bi bi-trash3 me-1"></i> Remove
          </button>
        </div>
      </div>
    ))}

      </div>
    </div>
    )}

    {tab === 'categories' && (
      <div className="card shadow p-4">
        <h4 className="mb-4 d-flex align-items-center gap-2">
          <span><i className="bi bi-tags"></i></span>
          Product Categories
        </h4>

        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter new category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button className="btn btn-dark" onClick={handleAddCategory}>
            <i className="bi bi-plus-circle me-1"></i> Add Category
          </button>
        </div>

        <div className="list-group">
          {categories.map((c) => (
            <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div><strong>{c.categoryName}</strong> <span className="text-muted">| ID: {c.id}</span></div>
              <div>
                <button className="btn btn-dark btn-sm" onClick={() => handleRemoveCategory(c.id)}>
                  <i className="bi bi-trash3 me-1"></i> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {tab === 'deliveries' && Array.isArray(deliveries) && (
      <div className="card shadow p-4">
        <h4 className="mb-4 text-start">
          <i className="bi bi-truck"></i> Delivery Orders
        </h4>

        {deliveries.length === 0 ? (
          <p className="text-muted text-start">No deliveries to show.</p>
        ) : (
          <div className="list-group">
            {deliveries.map((order, index) => (
              <div
                key={order.orderId}
                className="list-group-item mb-3 border rounded shadow-sm text-start"
              >
                <div className="row g-3">
                  <div className="col-md-8">
                    <p className="mb-1"><strong>Order ID:</strong> {order.orderId}</p>
                    <p className="mb-1"><strong>Email:</strong> {order.email || 'N/A'}</p>
                    <p className="mb-1"><strong>Address:</strong> {order.deliveryAddress}</p>
                    <p className="mb-1">
                      <strong>Status:</strong>{" "}
                      <span className={`badge fs-6 px-3 py-2 ${
                        Number(order.status) === 0 ? 'bg-warning text-dark' :
                        Number(order.status) === 1 ? 'bg-info text-dark' :
                        Number(order.status) === 2 ? 'bg-success' :
                        Number(order.status) === 3 ? 'bg-danger' :
                        Number(order.status) === 4 ? 'bg-primary' :
                        Number(order.status) === 5 ? 'bg-secondary' :
                        'bg-light text-dark'
                      }`}>
                        {(() => {
                          switch (Number(order.status)) {
                            case 0: return 'Processing';
                            case 1: return 'In Delivery';
                            case 2: return 'Delivered';
                            case 3: return 'Cancelled';
                            case 4: return 'Refund Requested';
                            case 5: return 'Refunded';
                            default: return 'Unknown';
                          }
                        })()}
                      </span>
                    </p>
                  </div>

                  <div className="col-md-4 d-flex flex-column justify-content-center">
                    <label className="form-label fw-bold">Update Status</label>
                    <select
                      className="form-select w-100 mb-2"
                      value={order.status}
                      onChange={async (e) => {
                        const newStatus = parseInt(e.target.value);
                        try {
                          await axios.put(`/purchases/orders/${order.orderId}/status/${newStatus}`);
                          setDeliveries((prev) =>
                            prev.map((d, i) =>
                              i === index ? { ...d, status: newStatus } : d
                            )
                          );
                          showTempMessage(`Status updated to ${statusMessages[newStatus]}`);
                        } catch (err) {
                          console.error("❌ Error updating delivery status:", err);
                        }
                      }}
                    >
                      <option value={0}>Processing</option>
                      <option value={1}>In Delivery</option>
                      <option value={2}>Delivered</option>
                    </select>

                    <button
                      className="btn btn-outline-dark mb-2"
                      onClick={() => navigate(`/product-manager/order/${order.orderId}`)}
                    >
                      <i className="bi bi-eye me-1"></i> View Details
                    </button>

                    <button
                                className="btn btn-outline-secondary"
                                onClick={async () => {
                                    const emailPrefix = order.email?.split('@')[0] || 'customer';
                                    const [firstName, lastName] = emailPrefix.includes('.')
                                        ? emailPrefix.split('.', 2)
                                        : [emailPrefix, emailPrefix]; 

                                    const body = {
                                        orderId: order.orderId,
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
                                        a.download = `invoice_${order.orderId}.pdf`;
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    } catch (err) {
                                        console.error("❌ Failed to download invoice:", err);
                                        alert("Failed to generate invoice.");
                                    }
                                }}
                            >
                                <i className="bi bi-file-earmark-pdf me-1"></i> View Invoice
                            </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}


      {tab === 'comments' && (
      <div className="card shadow p-4">
        <h4 className="mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-chat-left-text"></i>
          All Comments
        </h4>

        {(!comments.pending.length && !comments.processed.length) ? (
          <p className="text-muted">No comments available.</p>
        ) : (
          <>
           {comments.pending.length > 0 && (
            <>
              <h5 className="text-warning mb-2">
                <i className="bi bi-hourglass-split me-2"></i>Pending Comments
              </h5>
              <div className="list-group mb-4">
                {comments.pending.map(comment => renderComment(comment, true))}
              </div>
            </>
          )}

          {comments.processed.length > 0 && (
            <>
              <h5 className="text-secondary mb-2">
                <i className="bi bi-journal-text me-2"></i>Processed Comments
              </h5>
              <div className="list-group">
                {comments.processed.map(comment => renderComment(comment, false))}
              </div>
            </>
          )}

          </>
        )}

      </div>
    )}


    </div>
  );
};

export default ProductManager;
