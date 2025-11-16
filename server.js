const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// DB: PostgreSQL
const db = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }
});

// TEST DB
db.query("SELECT NOW()")
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ DB ERROR:", err));


// =======================
// PRODUCTS CRUD
// =======================

// CREATE product
app.post("/api/products", async (req, res) => {
  const { name, brand, price, image, tag, rating, description } = req.body;

  const sql = `
    INSERT INTO products (name, brand, price, image, tag, rating, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  try {
    const result = await db.query(sql, [name, brand, price, image, tag, rating, description]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const rows = await db.query("SELECT * FROM products");
    res.json(rows.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE product
app.put("/api/products/:id", async (req, res) => {
  const { name, brand, price, image, tag, rating, description } = req.body;

  const sql = `
    UPDATE products SET name=$1, brand=$2, price=$3, image=$4, tag=$5, rating=$6, description=$7
    WHERE id=$8;
  `;

  try {
    await db.query(sql, [name, brand, price, image, tag, rating, description, req.params.id]);
    res.json({ message: "updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id=$1", [req.params.id]);
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =======================
// AUTH
// =======================

// REGISTER — FIXED!
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const exists = await db.query("SELECT id FROM users WHERE email = $1", [email]);

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashed]
    );

    return res.json({
      message: "User registered!",
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


// LOGIN — stays same
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Email not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ error: "Wrong password" });

    res.json({
      message: "Login OK",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
