// backend/server.js
const express = require('express');
const cors = require('cors');
const products = require('./data/products');

const app = express();
app.use(cors());

// Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
