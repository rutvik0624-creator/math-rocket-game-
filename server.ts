import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("game.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    score INTEGER,
    accuracy INTEGER,
    class INTEGER,
    difficulty INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add name column if it doesn't exist
try {
  db.prepare("ALTER TABLE users ADD COLUMN name TEXT").run();
} catch (e) {
  // Column already exists or other error
}

// Seed admin and analytics if not exists
try {
  const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin@gmail.com");
  if (!adminExists) {
    db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)").run("admin@gmail.com", "admin123", "admin", "System Administrator");
  }

  const analyticsExists = db.prepare("SELECT * FROM users WHERE username = ?").get("analytics@gmail.com");
  if (!analyticsExists) {
    db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)").run("analytics@gmail.com", "analytics123", "analytics", "Data Analyst");
  }
} catch (e) {
  console.error("Seeding error:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/signup", (req, res) => {
    const { email, password, name } = req.body;
    try {
      db.prepare("INSERT INTO users (username, password, name) VALUES (?, ?, ?)").run(email, password, name);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Gmail already registered" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(email, password);
    if (user) {
      res.json({ success: true, user: { email: user.username, role: user.role, name: user.name } });
    } else {
      res.status(401).json({ error: "Invalid Gmail or password" });
    }
  });

  // Game Results
  app.post("/api/game/results", (req, res) => {
    const { email, score, accuracy, studentClass, difficulty } = req.body;
    db.prepare("INSERT INTO results (username, score, accuracy, class, difficulty) VALUES (?, ?, ?, ?, ?)")
      .run(email, score, accuracy, studentClass, difficulty);
    res.json({ success: true });
  });

  // Admin Data
  app.get("/api/admin/data", (req, res) => {
    const results = db.prepare(`
      SELECT r.*, u.name as fullName, r.username as email
      FROM results r 
      LEFT JOIN users u ON r.username = u.username 
      ORDER BY r.timestamp DESC
    `).all();
    const users = db.prepare("SELECT username as email, role, name FROM users").all();
    res.json({ results, users });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
