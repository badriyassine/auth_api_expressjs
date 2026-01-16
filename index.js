import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectdb, getdb } from "./db.js";

import dotenv from "dotenv";
dotenv.config();


const app = express();
const port = 3000;

app.use(express.json());

// register
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = getdb();

    // find user if exist
    const finduser = await db.collection("users").findOne({ username });
    if (finduser) {
      return res.status(400).send("user already exist");
    }

    // hashing password
    const hashpassword = await bcrypt.hash(password, 10);

    // adding user to db
    await db
      .collection("users")
      .insertOne({ username, password: hashpassword });
    res.status(201).send("user registered successfuly");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = getdb();

    // find user if exist
    const finduser = await db.collection("users").findOne({ username });
    if (!finduser) {
      res.status(400).send("user doesn't exist, Please register first");
    }

    // verfiy hashed code
    const isMatch = await bcrypt.compare(password, finduser.password);
    if (!isMatch) {
      return res.status(400).send("invalid username or password");
    }

    // generate token
    const token = jwt.sign(
      { userId: finduser._id, username: finduser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.status(200).send({ token, username });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// middleware to verify token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("access denied, no token provided");
  }
  const token = authHeader.split(" ")[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("invalid token");
  }
};

// profile
app.get("/profile", authMiddleware, async (req, res) => {
  res.json({ message: "welcome to your profile", user: req.user });
});

// start server
connectdb().then(() => {
  app.listen(port, () => {
    console.log(`server running in ${port}`);
  });
});
