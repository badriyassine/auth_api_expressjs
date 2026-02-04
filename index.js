import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectdb, getdb } from "./db.js";

import dotenv from "dotenv";
import { ObjectId } from "mongodb";
dotenv.config();

const app = express();
app.use(cors());
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
      return res.status(400).send("invalid username or password");
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

// delete account
app.delete("/users", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = getdb();

    // find user if exist
    const finduser = await db.collection("users").findOne({ username });
    if (!finduser) {
      return res.status(400).send("invalid username or password");
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

    // profile
    app.get("/profile", authMiddleware, async (req, res) => {
      res.json({ message: "welcome to your profile", user: req.user });
    });

    // delete account
    await db.collection("users").deleteOne({ username });

    res.status(200).send("account deleted");
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

// start server
connectdb().then(() => {
  app.listen(port, () => {
    console.log(`server running in ${port}`);
  });
});

// get clients
app.get("/clients", authMiddleware, async (req, res) => {
  const clients = await db.collection("clients").find().toArray();
  res.json(clients);
});

// add clients
app.post("/clients", authMiddleware, async (req, res) => {
  const result = await db.collection("clients").insertOne(req, body);
  res.json(result);
});

// delete clients
app.delete("/clients/:id", authMiddleware, async (req, res) => {
  await db.collection("clients").deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.json({ message: "clients deleted" });
});

// update clients
app.put("/clients/:id", authMiddleware, async (req, res) => {
  await db.collection("clients").updateOne(
    {
      _id: new ObjectId(req.params.id),
    },
    { $set: req.body },
  );
  res.json({ message: "clients upated" });
});

// get clients
app.get("/clients", authMiddleware, async (req, res) => {
  const clients = await db.collection("clients").find().toArray();
  res.json(clients);
});

// add clients
app.post("/clients", authMiddleware, async (req, res) => {
  const result = await db.collection("clients").insertOne(req, body);
  res.json(result);
});

// delete clients
app.delete("/clients/:id", authMiddleware, async (req, res) => {
  await db.collection("clients").deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.json({ message: "clients deleted" });
});

// update clients
app.put("/clients/:id", authMiddleware, async (req, res) => {
  await db.collection("clients").updateOne(
    {
      _id: new ObjectId(req.params.id),
    },
    { $set: req.body },
  );
  res.json({ message: "clients updated" });
});
