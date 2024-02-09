"use strict";

import express, { json } from "express";
import { createConnection } from "mysql";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors());
app.use(json());

const JWT_SECRET = "ice_cream";

const db = createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (error, results) => {
    if (error) {
      console.error("Error retrieving users:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json(results);
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (error, results) => {
      if (error) {
        console.error("Error verifying user credentials:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const user = results[0];

      // Create JWT token
      const token = jwt.sign(
        {
          email: user.email,
          name: user.name,
          dob: user.dob,
          contact: user.contact,
          age: user.age,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      console.log(token);

      res.json({ message: "Login successful", token, redirectUrl: "/profile" });
    }
  );
});

app.post("/update", (req, res) => {
  const { name, contact, dob, age, password } = req.body;
  if (!name || !contact || !dob || !age) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const userEmail = req.query.email;
  const updateUserQuery =
    "UPDATE users SET name=?, contact=?, dob=?, age=?, password=? WHERE email=?";

  db.query(
    updateUserQuery,
    [name, contact, dob, age, password, userEmail],
    (error, results) => {
      if (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      const updatedUserData = { name, contact, dob, age, email: userEmail };
      const token = jwt.sign(updatedUserData, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ message: "User data updated successfully", token });
    }
  );
});

app.post("/register", (req, res) => {
  const { name, email, contact, dob, age, password } = req.body;

  if (!name || !email || !contact || !dob || !age || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const insertUserQuery =
    "INSERT INTO users (name, email, contact, dob, age, password) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    insertUserQuery,
    [name, email, contact, dob, age, password],
    (error, results) => {
      if (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json({
        message: "User registered successfully",
        redirectUrl: "/login",
      });
    }
  );
});

app.listen(process.env.DB_PORT, () => {
  console.log(`listening...`);
});
