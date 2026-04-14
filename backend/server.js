const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Static JSON data
const staticData = {
  message: "Hello from Express!",
  timestamp: new Date().toISOString(),
  data: {
    users: [
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
      { id: 3, name: "Charlie", email: "charlie@example.com" }
    ],
    products: [
      { id: 1, name: "Widget", price: 29.99 },
      { id: 2, name: "Gadget", price: 49.99 },
      { id: 3, name: "Gizmo", price: 19.99 }
    ]
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the API",
    endpoints: {
      "/api": "Get all static data",
      "/api/users": "Get users list",
      "/api/products": "Get products list"
    }
  });
});

app.get('/api', (req, res) => {
  res.json({ success: true, data: staticData });
});

app.get('/api/users', (req, res) => {
  res.json({ success: true, data: staticData.data.users });
});

app.get('/api/users/:id', (req, res) => {
  const user = staticData.data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  res.json({ success: true, data: user });
});

app.get('/api/products', (req, res) => {
  res.json({ success: true, data: staticData.data.products });
});

app.get('/api/products/:id', (req, res) => {
  const product = staticData.data.products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }
  res.json({ success: true, data: product });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});