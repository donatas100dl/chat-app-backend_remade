const Users = require("../models/user-rooms.js");
const Rooms = require("../models/rooms.js");
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
        return res.status(400).json({ message: "invalid password" });
      }
      await Rooms.find({
        $or: [
          { user_id_1: { $in: [user._id] } },
          { user_id_2: { $in: [user._id] } },
        ],
      }).then((rooms) => {
        res.status(200).json({
          message: "login successfully",
          name: user.name,
          _id: user._id,
          email: user.email,
          password: user.password,
          token: generateToken(user._id),
          rooms: rooms,
        });
      });
    }
  } catch (error) {
    console.error("Error loging in: " + error.message);
    return res.status(400).json({ message: error });
  }
};

const getCurrentUser = async (req, res) => {
  const user = await Users.findById(req.user.id);
  const rooms = await Rooms.find({
    $or: [
      { user_id_1: { $in: [user._id] } },
      { user_id_2: { $in: [user._id] } },
    ],
  });
  if (!user) {
    res.status(404).json({ message: "failed to find user" });
  }

  res.status(200).json({
    message: "login successfully",
    _id: user._id,
    name: user.name,
    email: user.email,
    password: user.password,
    rooms: rooms,
  });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json({
      users: 
        users.map((user) => {
          return {
            name: user.name,
            _id: user._id,
          };
        }),
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
};

const getAllUsersRooms = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.user.id });
    if (!user) return res.status(404).json({ message: "user not found" });

    const rooms = await Rooms.find({
      $or: [
        { user_id_1: { $in: [user._id] } },
        { user_id_2: { $in: [user._id] } },
      ],
    });

    res.status(200).json({ rooms: rooms });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err,
    });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = {
  registerUser,
  login,
  getCurrentUser,
  getAllUsers,
  getAllUsersRooms,
};
