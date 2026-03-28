import express from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

const PORT = 3000;
const JWT_SECRET = "dropshipping-secret-key";

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

async function startServer() {
  console.log("Starting server...");
  try {
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use("/uploads", express.static("uploads"));

    console.log("Initializing database...");
    // Database initialization
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    console.log("Database initialized.");
    console.log("NODE_ENV:", process.env.NODE_ENV);

    app.get("/api/debug", (req, res) => {
      res.json({
        NODE_ENV: process.env.NODE_ENV,
        PORT: PORT,
        cwd: process.cwd(),
      });
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'seller',
      wallet_balance REAL DEFAULT 0,
      store_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      short_description TEXT,
      long_description TEXT,
      price REAL,
      stock INTEGER,
      image TEXT,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      amount REAL,
      payment_method TEXT,
      screenshot TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      total_price REAL,
      shipping_label TEXT,
      delivery_partner TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      category TEXT,
      message TEXT,
      status TEXT DEFAULT 'open',
      reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      product_id INTEGER,
      order_id INTEGER,
      rating INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Seed Admin if not exists
  const admin = await db.get("SELECT * FROM users WHERE role = 'admin'");
  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@example.com", hashedPassword, "admin"]
    );
  }

  // Seed Categories
  const categoryCount = await db.get("SELECT COUNT(*) as count FROM categories");
  if (categoryCount.count === 0) {
    await db.run("INSERT INTO categories (name) VALUES ('Electronics')");
    await db.run("INSERT INTO categories (name) VALUES ('Fashion')");
    await db.run("INSERT INTO categories (name) VALUES ('Home & Kitchen')");
  }

  // Seed Products
  const productCount = await db.get("SELECT COUNT(*) as count FROM products");
  if (productCount.count === 0) {
    const electronics = await db.get("SELECT id FROM categories WHERE name = 'Electronics'");
    await db.run(
      "INSERT INTO products (title, short_description, long_description, price, stock, category_id) VALUES (?, ?, ?, ?, ?, ?)",
      ["Wireless Headphones", "High-quality noise-canceling headphones.", "Experience premium sound quality with these wireless headphones. Features 30-hour battery life and active noise cancellation.", 99.99, 50, electronics.id]
    );
    await db.run(
      "INSERT INTO products (title, short_description, long_description, price, stock, category_id) VALUES (?, ?, ?, ?, ?, ?)",
      ["Smart Watch", "Track your fitness and stay connected.", "A sleek smart watch with heart rate monitoring, GPS, and water resistance. Compatible with iOS and Android.", 149.99, 30, electronics.id]
    );
  }

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // API Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, store_name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.run(
        "INSERT INTO users (name, email, password, store_name) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, store_name]
      );
      res.json({ message: "User registered successfully" });
    } catch (err) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, wallet_balance: user.wallet_balance, store_name: user.store_name } });
  });

  app.get("/api/user/profile", authenticate, async (req: any, res) => {
    const user = await db.get("SELECT id, name, email, role, wallet_balance, store_name FROM users WHERE id = ?", [req.user.id]);
    res.json(user);
  });

  // Products
  app.get("/api/products", async (req, res) => {
    const products = await db.all("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id");
    res.json(products);
  });

  app.post("/api/admin/products", authenticate, upload.single("image"), async (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const { title, short_description, long_description, price, stock, category_id } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    await db.run(
      "INSERT INTO products (title, short_description, long_description, price, stock, image, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, short_description, long_description, price, stock, image, category_id]
    );
    res.json({ message: "Product added" });
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const categories = await db.all("SELECT * FROM categories");
    res.json(categories);
  });

  app.post("/api/admin/categories", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const { name } = req.body;
    await db.run("INSERT INTO categories (name) VALUES (?)", [name]);
    res.json({ message: "Category added" });
  });

  // Deposits
  app.post("/api/seller/deposits", authenticate, upload.single("screenshot"), async (req: any, res) => {
    const { amount, payment_method } = req.body;
    const screenshot = req.file ? `/uploads/${req.file.filename}` : null;
    await db.run(
      "INSERT INTO deposits (user_id, amount, payment_method, screenshot) VALUES (?, ?, ?, ?)",
      [req.user.id, amount, payment_method, screenshot]
    );
    res.json({ message: "Deposit request submitted" });
  });

  app.get("/api/admin/deposits", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const deposits = await db.all("SELECT d.*, u.name as user_name FROM deposits d JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC");
    res.json(deposits);
  });

  app.post("/api/admin/deposits/:id/approve", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const deposit = await db.get("SELECT * FROM deposits WHERE id = ?", [req.params.id]);
    if (deposit && deposit.status === "pending") {
      await db.run("UPDATE deposits SET status = 'approved' WHERE id = ?", [req.params.id]);
      await db.run("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [deposit.amount, deposit.user_id]);
      res.json({ message: "Deposit approved" });
    } else {
      res.status(400).json({ error: "Invalid deposit" });
    }
  });

  app.post("/api/admin/deposits/:id/reject", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    await db.run("UPDATE deposits SET status = 'rejected' WHERE id = ?", [req.params.id]);
    res.json({ message: "Deposit rejected" });
  });

  // Orders
  app.post("/api/seller/orders", authenticate, upload.single("shipping_label"), async (req: any, res) => {
    const { product_id, quantity, delivery_partner } = req.body;
    const product = await db.get("SELECT * FROM products WHERE id = ?", [product_id]);
    const user = await db.get("SELECT * FROM users WHERE id = ?", [req.user.id]);
    const total_price = product.price * quantity;

    if (user.wallet_balance < total_price) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const shipping_label = req.file ? `/uploads/${req.file.filename}` : null;
    await db.run(
      "INSERT INTO orders (user_id, product_id, quantity, total_price, shipping_label, delivery_partner) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, product_id, quantity, total_price, shipping_label, delivery_partner]
    );
    await db.run("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?", [total_price, req.user.id]);
    await db.run("UPDATE products SET stock = stock - ? WHERE id = ?", [quantity, product_id]);
    res.json({ message: "Order placed successfully" });
  });

  app.get("/api/seller/orders", authenticate, async (req: any, res) => {
    const orders = await db.all("SELECT o.*, p.title as product_title FROM orders o JOIN products p ON o.product_id = p.id WHERE o.user_id = ? ORDER BY o.created_at DESC", [req.user.id]);
    res.json(orders);
  });

  app.get("/api/admin/orders", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const orders = await db.all("SELECT o.*, p.title as product_title, u.name as user_name FROM orders o JOIN products p ON o.product_id = p.id JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC");
    res.json(orders);
  });

  // Tickets
  app.post("/api/seller/tickets", authenticate, async (req: any, res) => {
    const { category, message } = req.body;
    await db.run("INSERT INTO tickets (user_id, category, message) VALUES (?, ?, ?)", [req.user.id, category, message]);
    res.json({ message: "Ticket created" });
  });

  app.get("/api/seller/tickets", authenticate, async (req: any, res) => {
    const tickets = await db.all("SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
    res.json(tickets);
  });

  app.get("/api/admin/tickets", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const tickets = await db.all("SELECT t.*, u.name as user_name FROM tickets t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC");
    res.json(tickets);
  });

  app.post("/api/admin/tickets/:id/reply", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const { reply } = req.body;
    await db.run("UPDATE tickets SET reply = ?, status = 'replied' WHERE id = ?", [reply, req.params.id]);
    res.json({ message: "Reply sent" });
  });

  // Stats
  app.get("/api/admin/stats", authenticate, async (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const totalUsers = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'seller'");
    const totalOrders = await db.get("SELECT COUNT(*) as count FROM orders");
    const totalDeposits = await db.get("SELECT SUM(amount) as sum FROM deposits WHERE status = 'approved'");
    const pendingOrders = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
    const partnerStats = await db.all("SELECT delivery_partner, COUNT(*) as count FROM orders GROUP BY delivery_partner");
    
    res.json({
      totalUsers: totalUsers.count,
      totalOrders: totalOrders.count,
      totalDeposits: totalDeposits.sum || 0,
      pendingOrders: pendingOrders.count,
      partnerStats
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Integrating Vite middleware...");
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware integrated.");
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "index.html"));
    });
  } else {
    console.log("Serving static files from dist.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Ready to serve requests.");
  });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
