import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

require ("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());

// register
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // find user if exist
    const finduser = users.find((i) => i.username === username);
    if (finduser) {
      res.status(400).send("user already exist");
    }

    // hashing password
    const hashpassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashpassword });
    res.status(201).send("user registered successfuly");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});


// login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // find user if exist
    const finduser = users.find((i) => i.username === username);
    if (!finduser) {
      res.status(400).send("user doesn't exist, Please register first");
    }

    // verfiy hashed code
    const isMatch = await bcrypt.compare(password, finduser.password);
    if (isMatch) {
      res.status(200).send(`welcome back ${username}`);
    }
    res.status(400).send("username or password incorecct");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});



// start server
app.listen(port, () => {
  console.log(`server running in ${port}`);
});
