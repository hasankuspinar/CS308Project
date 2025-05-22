# 🛒 E-Commerce Platform

An advanced, full-stack e-commerce web application. This platform supports product browsing, shopping cart functionality, user registration and login, order processing, role-based administration, and invoice generation — all within a secure, containerized architecture.

## ✅ Features Summary

### 🧑‍💻 Users
- Browse products by category
- Add products to cart (even when not logged in)
- Register/login to place orders
- View order history and delivery statuses (processing, in-transit, delivered)
- Rate and comment on delivered products
- Cancel or request refunds for eligible orders
- Maintain a wishlist of desired products

### 🧑‍💼 Product Managers
- Add/remove products and categories
- Manage product stock and delivery status
- Approve/disapprove user comments
- View and manage delivery list and invoices

### 💼 Sales Managers
- Set product prices and apply discounts
- Notify users about discounted wishlist items
- View invoices within a date range (PDF export supported)
- Calculate revenue, cost, and profit metrics with chart visualization

### 🛡️ Security & Compliance
- Passwords and sensitive data encrypted
- Access restricted by role-based authentication
- Credit card info simulated (no real processing)
- Concurrency-aware and designed for scalability

---


## 📧 Invoice & Email Functionality

- PDF invoices generated with QuestPDF
- Emails simulated or configurable with SMTP

---

## 📌 Notes

- Comments require approval; ratings do not.
- New products appear only after being priced by a sales manager.
- Refunds allowed within 30 days if delivered.
- Refunded amount reflects the purchase-time discount.

---


## 🔒 Security Highlights

- SHA-512 password hashing
- Cookie-based authentication
- Role-based API protection
- HTTPS redirection and encrypted invoice data

---

## 🐳 Containerized Architecture

This project is fully containerized using Docker Compose and includes:

- `frontend` – React with Bootstrap
- `backend` – ASP.NET Core Web API
- `mysql` – MySQL 8 with seeded schema & data

### 📁 Project Structure

```
project-root/
│
├── CS308Frontend/
│   └── cs308frontend/       # React app with admin and user pages
|       └── Dockerfile(frontend)
│
├── CS308Backend/            # ASP.NET Core backend
│   └── Dockerfile(backend)
├── mysql/
│   └── init.sql             # Self-contained schema and seed data
│
├── docker-compose.yml       # Compose configuration for all services
```

---

## 🚀 Getting Started

### 1. Prerequisites

- Docker installed: https://www.docker.com/products/docker-desktop
- Docker Compose (typically included with Docker Desktop)

### 2. Run the Application

> **📦 Setup and run everything from the project root:**

```bash
docker-compose up --build
```

