import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesManager = () => {
    const [products, setProducts] = useState([]);
    const [pricelessProducts, setPricelessProducts] = useState([]);
    const [newPrices, setNewPrices] = useState({});
    const [message, setMessage] = useState('');
    const [tab, setTab] = useState('pricing');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [itemDiscounts, setItemDiscounts] = useState({});
    const [revenueData, setRevenueData] = useState(null);
    const [refunds, setRefunds] = useState([]);

    const [selectedOrder, setSelectedOrder] = useState(null);

    const openOrderDetails = async (orderId) => {
    try {
        const res = await axios.get(`/purchases/orders/${orderId}`);
        setSelectedOrder(res.data);
    } catch (err) {
        console.error("Failed to fetch order details", err);
        alert("Could not load order details.");
    }
    };


    useEffect(() => { fetchProducts(); }, []);
    useEffect(() => { if (tab === 'refunds') fetchRefunds(); }, [tab]);
    useEffect(() => { if (tab === 'set-prices') fetchPricelessProducts(); }, [tab]);

    const fetchProducts = async () => {
        try { const res = await axios.get('/products'); setProducts(res.data); }
        catch (err) { console.error('Error fetching products:', err); }
    };

    const fetchPricelessProducts = async () => {
        try {
            const res = await axios.get('/products/priceless');
            setPricelessProducts(res.data);
        } catch (err) {
            console.error('Error fetching priceless products:', err);
        }
    };

    const fetchInvoices = async () => {
        try {
            const res = await axios.get('/purchases/invoices', { params: { startDate, endDate } });
            setInvoices(res.data);
            showTempMessage(`Found ${res.data.length} invoice(s).`);
        } catch (err) {
            console.error('Error fetching invoices:', err);
            showTempMessage('❌ Failed to fetch invoices.');
        }
    };

    const fetchRevenueData = async () => {
        try {
            const res = await axios.get('/purchases/revenue', { params: { startDate, endDate } });
            setRevenueData(res.data);
        } catch (err) {
            console.error('Failed to fetch revenue data:', err);
        }
    };

    const fetchRefunds = async () => {
        try {
            const res = await axios.get('/purchases/refund/requested-orders');
            setRefunds(res.data);
        } catch (err) {
            console.error('Error fetching refunds:', err);
            showTempMessage('❌ Failed to fetch refunds.');
        }
    };

    const handleRefundDecision = async (orderId, approve = true) => {
        try {
            const url = approve 
                ? `/purchases/refund/approve/${orderId}`
                : `/purchases/refund/${orderId}`;
            await axios.put(url);
            setRefunds(refunds.filter(r => r !== orderId));
            showTempMessage(`Refund ${approve ? 'approved' : 'rejected'} (#${orderId})`);
        } catch (err) {
            console.error('Error processing refund:', err);
            showTempMessage('❌ Operation failed.');
        }
    };

    const showTempMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(''), 3000);
    };

    const applyDiscountToItem = async (id) => {
        const discountValue = parseFloat(itemDiscounts[id]);
        if (isNaN(discountValue) || discountValue <= 0 || discountValue >= 100) {
            showTempMessage('Enter a valid discount (1-99%).');
            return;
        }
        try {
            await axios.post('/products/discount', { productIds: [id], discountPercentage: discountValue });
            showTempMessage(`Applied ${discountValue}% discount to product ID ${id}.`);
            fetchProducts();
        } catch (err) {
            console.error('Error applying discount:', err);
        }
    };

    const setPriceForProduct = async (productId) => {
        const price = parseFloat(newPrices[productId]);
        if (isNaN(price) || price <= 0) {
            showTempMessage('Enter a valid price greater than 0.');
            return;
        }

        try {
            await axios.put('/products/setprice', {
                productId,
                newPrice: price
            });
            showTempMessage(`Price set for product ID ${productId}.`);
            fetchPricelessProducts(); 
        } catch (err) {
            console.error('Error setting price with /setprice:', err);
            showTempMessage('❌ Failed to set price.');
        }
    };

    const [selectedProducts, setSelectedProducts] = useState([]);

const toggleProductSelection = (id) => {
    setSelectedProducts(prev =>
        prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
};

const applyDiscountToMultiple = async (ids) => {
    const pct = parseFloat(itemDiscounts['batch']);
    if (isNaN(pct) || pct <= 0 || pct >= 100) {
        showTempMessage('Enter a valid discount (1-99%).');
        return;
    }
    try {
        await axios.post('/products/discount', { productIds: ids, discountPercentage: pct });
        showTempMessage(`Applied ${pct}% discount to selected products.`);
        fetchProducts();
        setSelectedProducts([]);
    } catch (err) {
        console.error('Error applying batch discount:', err);
    }
};

    return (
        <div className="container mt-4 ">
            <nav className="navbar navbar-dark bg-dark mb-4 p-3 rounded">
                <span className="navbar-brand">🏷️ Sales Manager Dashboard</span>
            </nav>

            {message && <div className="alert alert-success text-center">{message}</div>}

            <ul className="nav nav-pills mb-4 d-flex justify-content-center">
  {['pricing', 'invoices', 'charts', 'refunds', 'set-prices'].map(tabName => (
    <li className="nav-item" key={tabName}>
      <button
        className="nav-link"
        style={{
          color: tab === tabName ? 'white' : '#28a745',
          backgroundColor: tab === tabName ? '#212529' : 'transparent',
          border: tab === tabName ? '1px solid transparent' : '1px solid #28a745',
          marginRight: '5px'
        }}
        onClick={() => setTab(tabName)}
      >
        {tabName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </button>
    </li>
  ))}
</ul>

            {/* Pricing Tab */}
            {tab === 'pricing' && (
    <div className="card shadow p-4 mb-4">
        <h4>Product Pricing</h4>

        <div className="d-flex flex-column gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
            <input
            type="number"
            placeholder="Discount % for Selected"
            className="form-control w-auto"
            value={itemDiscounts['batch'] || ''}
            onChange={e => setItemDiscounts({ ...itemDiscounts, batch: e.target.value })}
            />
            <button
            className="btn btn-dark"
            onClick={() => applyDiscountToMultiple(selectedProducts)}
            disabled={selectedProducts.length === 0}
            >
            Apply Discount to Selected
            </button>
        </div>

  {/* Show message only in Pricing tab */}
  {message && (
    <div className="alert alert-info text-center py-2 px-3 mb-0">
      {message}
    </div>
  )}
</div>


        <div className="list-group">
            {products.map(p => (
                <div key={p.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <input
                                type="checkbox"
                                className="form-check-input me-2"
                                checked={selectedProducts.includes(p.id)}
                                onChange={() => toggleProductSelection(p.id)}
                            />
                            <strong>{p.productName}</strong> | ${p.price} | Stock: {p.quantity}
                        </div>
                        <div>
                            <input
                                type="number"
                                placeholder="Discount %"
                                className="form-control d-inline-block w-auto me-2"
                                value={itemDiscounts[p.id] || ''}
                                onChange={e => setItemDiscounts({ ...itemDiscounts, [p.id]: e.target.value })}
                            />
                            <button className="btn btn-dark btn-sm" onClick={() => applyDiscountToItem(p.id)}>Apply</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
            )}


            {/* Invoices Tab */}
            {tab === 'invoices' && (
                <div className="card shadow p-4 mb-4">
                    <h4>View Invoices</h4>
                    <div className="d-flex mb-3">
                        <input type="date" className="form-control w-auto me-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type="date" className="form-control w-auto me-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <button className="btn btn-dark" onClick={fetchInvoices}>Search</button>
                    </div>

                    {invoices.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Total Price</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv.orderId}>
                                            <td>{inv.orderId}</td>
                                            <td>{inv.productName}</td>
                                            <td>{inv.quantity}</td>
                                            <td>${!isNaN(inv.totalPrice) ? Number(inv.totalPrice).toFixed(2) : 'N/A'}</td>
                                            <td>{new Date(inv.date).toLocaleDateString()}</td>
                                            <td>{inv.status}</td>
                                            <td>
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={async () => {
                                                        try {
                                                            const orderRes = await axios.get(`/purchases/orders/${inv.orderId}`);
                                                            const orderItems = Array.isArray(orderRes.data) ? orderRes.data : [];
                                                            const firstItem = orderItems[0];
                                                            const userId = firstItem?.userId;

                                                            let firstName = 'Unknown';
                                                            let lastName = 'User';

                                                            if (userId !== undefined && userId !== null) {
                                                                try {
                                                                    const userRes = await axios.get('/Auth/getuserdetailsbyuserid', {
                                                                        params: { userId, nocache: Date.now() },
                                                                    });

                                                                    const emailPrefix = userRes.data?.email?.split('@')[0] || 'customer';
                                                                    [firstName, lastName] = emailPrefix.includes('.')
                                                                        ? emailPrefix.split('.', 2)
                                                                        : [emailPrefix, emailPrefix];
                                                                } catch (userErr) {
                                                                    console.warn(`⚠️ Could not fetch user details for userId ${userId}`, userErr);
                                                                }
                                                            }

                                                            const res = await axios.post('/purchases/invoice/by-order', {
                                                                orderId: inv.orderId,
                                                                userId,
                                                                firstName,
                                                                lastName
                                                            }, { responseType: 'blob' });

                                                            const blob = new Blob([res.data], { type: 'application/pdf' });
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = `invoice_${inv.orderId}.pdf`;
                                                            a.click();
                                                            window.URL.revokeObjectURL(url);
                                                        } catch (err) {
                                                            console.error('Download failed:', err);
                                                            alert("Invoice generation failed.");
                                                        }
                                                    }}
                                                >
                                                    <i className="bi bi-file-earmark-pdf me-1"></i>Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Charts Tab */}
            {tab === 'charts' && (
                <div className="card shadow p-4 mb-4">
                    <h4>Revenue Report</h4>
                    <div className="d-flex mb-3">
                        <input type="date" className="form-control w-auto me-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type="date" className="form-control w-auto me-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <button className="btn btn-dark" onClick={fetchRevenueData}>Generate Chart</button>
                    </div>
                    {revenueData && (
                        <Bar
                            data={{
                                labels: ['Revenue', 'Cost', 'Profit'],
                                datasets: [{
                                    label: 'Amount ($)',
                                    data: [revenueData.totalRevenue, revenueData.totalCost, revenueData.profit],
                                    backgroundColor: ['#0d6efd', '#6c757d', '#198754']
                                }]
                            }}
                            options={{
                                responsive: true,
                                plugins: { legend: { display: false }, title: { display: true, text: `Revenue Report (${startDate} to ${endDate})` } }
                            }}
                        />
                    )}
                </div>
            )}

            {/* Refunds Tab */}
            {tab === 'refunds' && (
            <div className="card shadow p-4 mb-4">
                <h4>Pending Refund Requests</h4>

                {refunds.length === 0 ? (
                <p className="text-muted">No pending requests.</p>
                ) : (
                <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                    <thead className="table-dark">
                        <tr>
                        <th style={{ width: '40%' }}>Order ID</th>
                        <th style={{ width: '60%' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {refunds.map((orderId) => (
                        <React.Fragment key={orderId}>
                            <tr>
                            <td>{orderId}</td>
                            <td>
                                <div className="d-flex justify-content-center gap-2">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() =>
                                    selectedOrder?.[0]?.orderId === orderId
                                        ? setSelectedOrder(null)
                                        : openOrderDetails(orderId)
                                    }
                                >
                                    {selectedOrder?.[0]?.orderId === orderId ? "Hide Details" : "View Details"}
                                </button>
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleRefundDecision(orderId, true)}
                                >
                                    Approve
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRefundDecision(orderId, false)}
                                >
                                    Reject
                                </button>
                                </div>
                            </td>
                            </tr>

                            {selectedOrder?.[0]?.orderId === orderId && (
                            <tr>
                                <td colSpan="2" className="bg-light">
                                <div className="p-3">
                                    <p><strong>Date:</strong> {new Date(selectedOrder[0].date).toLocaleDateString()}</p>
                                    <p><strong>Delivery Address:</strong> {selectedOrder[0].deliveryAddress}</p>
                                    <hr />
                                    {selectedOrder.map((item, index) => (
                                    <div key={index} className="mb-3 border-bottom pb-2">
                                        <p><strong>Product:</strong> {item.productName}</p>
                                        <p><strong>Quantity:</strong> {item.quantity}</p>
                                        <p><strong>Unit Price:</strong> ${item.totalPrice.toFixed(2)}</p>
                                        <p><strong>Status:</strong> {item.status}</p>
                                    </div>
                                    ))}

                                    <div className="text-end mt-3">
                                    <h5 className="text-center">
                                        Total Payment: $
                                        {selectedOrder
                                        .reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)
                                        .toFixed(2)}
                                    </h5>
                                    </div>
                                </div>
                                </td>
                            </tr>
                            )}
                        </React.Fragment>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
            )}

            {/* Set Prices Tab */}
            {tab === 'set-prices' && (
                <div className="card shadow p-4 mb-4">
                    <h4>Set Prices for Priceless Products</h4>
                    {pricelessProducts.length === 0 ? (
                        <p className="text-muted">No products without price.</p>
                    ) : (
                        <div className="list-group">
                            {pricelessProducts.map(p => (
                                <div key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <span><strong>{p.productName}</strong> (Current Price: $0)</span>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="New Price"
                                            className="form-control w-auto"
                                            value={newPrices[p.id] || ''}
                                            onChange={e => setNewPrices({ ...newPrices, [p.id]: e.target.value })}
                                        />
                                        <button className="btn btn-dark btn-sm" onClick={() => setPriceForProduct(p.id)}>Set Price</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default SalesManager;
