const Users = require("../models/users");
const Rooms = require("../models/rooms");

const createRoom = async (req, res) => {
  try {
    const { user_id_1, user_id_2, messages } = req.body;

    if (!user_id_1 || !user_id_2) {
      return res
        .status(400)
        .json({ message: "Invalid user_id_1 or user_id_2" });
    }

    const user = await Users.findById(req.user.id);

    const existingRoom = await Rooms.findOne({
      user_id_1: user_id_1,
      user_id_2: user_id_2,
    });
    if (existingRoom) {
      return res.status(500).json({ message: "Room already exists" });
    }
    if (user._id.equals(user_id_1) || user._id.equals(user_id_2)) {
      const room = await Rooms.create({
        user_id_1: user_id_1,
        user_id_2: user_id_2,
        messages: messages.map((message) => ({
          user_id: user.id,
          body: message.body,
        })),
      });

      if (!room) {
        return res.status(500).json({ message: "Failed to create room" });
      }

      // Send a response only when the room creation is successful
      return res.status(201).json(room);
    } else {
      return res.status(403).json({ message: "User not authorized" });
    }
  } catch (err) {
    res.status(400).send({ messages: err });
  }
};

const getRoom = async (req, res) => {
  console.log(req.params.id);
  const room = await Rooms.findById(req.params.id);
  const user = await Users.findById(req.user.id);

  if (!room) return res.status(403).json({ message: "no room found" });

  const authorized =
    user._id.equals(room.user_id_1) || user._id.equals(room.user_id_2);

  if (!authorized) {
    res.status(403).json({ message: "user not authorized" });
  }

  res.status(200).json(room);
};

const updateMessages = async (req, res) => {
  const room = await Rooms.findById(req.params.id);
  const user = await Users.findById(req.user.id);
  const { message } = req.body;
  
  if (!room) return res.status(403).json({ message: "no room found" });

  const authorized =
    user._id.equals(room.user_id_1) || user._id.equals(room.user_id_2);

  if (!authorized) {
    res.status(403).json({ message: "user not authorized" });
  }


  const updatedMessages = {
    $push: {
      messages: {
        user_id: user.id,
        body: message,
      },
    },
  };

  const info = await Rooms.findByIdAndUpdate(req.params.id, updatedMessages, {
    new: true,
  });

  if (!info) {
    res.status(403).json({ message: "failed to update" });
  }

  res.status(200).json(info);
};

module.exports = {
  createRoom,
  getRoom,
  updateMessages,
};
