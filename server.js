const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname)); // allow html, js, images

// DB CONNECTION
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});


db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL Connected");
});

// =======================
// PRODUCTS CRUD
// =======================

// CREATE product
app.post("/api/products", (req, res) => {
  const { name, brand, price, image, tag, rating, description } = req.body;
  const sql =
    "INSERT INTO products (name, brand, price, image, tag, rating, description) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.query(sql, [name, brand, price, image, tag, rating, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, ...req.body });
  });
});

// GET all products
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// UPDATE product
app.put("/api/products/:id", (req, res) => {
  const { name, brand, price, image, tag, rating, description } = req.body;
  const sql =
    "UPDATE products SET name=?, brand=?, price=?, image=?, tag=?, rating=?, description=? WHERE id=?";

  db.query(sql, [name, brand, price, image, tag, rating, description, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "updated" });
  });
});

// DELETE product
app.delete("/api/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "deleted" });
  });
});

// =======================
// AUTH SYSTEM
// =======================

// REGISTER
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashed],
    (err, result) => {
      if (err) {
        return res.status(400).json({ error: "Email already exists" });
      }

      res.json({ message: "User registered!" });
    }
  );
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, rows) => {
    if (err || rows.length === 0)
      return res.status(400).json({ error: "Email not found" });

    const user = rows[0];

    // compare hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    // return safe data
    res.json({
      message: "Login OK",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
