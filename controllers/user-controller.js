const Users = require("../models/users");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("please fill all the fields");
    }

    const userExists = await Users.findOne({ email });

    if (userExists) {
      throw new Error("User already exists", userExists);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Users.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        message: "new user created",
        _id: user._id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("wrong user data");
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      res.status(404).json({
        message: "user not found",
      });
    }

    if (user && user.email === email) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(404).json({ message: "invalid password"});
      }
      res.status(200).json({
        message: "login successfully",
        _id: user._id,
        email: user.email,
        password: user.password,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

const getCurrentUser = async (req, res) => {
  const user = await Users.findById(req.user.id);
  if (!user) {
    res.status(404).json({ message: "failed to find user"})
  }

  res.status(200).json({
    message: "login successfully",
    _id: user._id,
    email: user.email,
    password: user.password,
  })

};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = {
  registerUser,
  login,
  getCurrentUser,
};
