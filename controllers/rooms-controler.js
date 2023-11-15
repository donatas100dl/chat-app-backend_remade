const Users = require("../models/users");
const Rooms = require("../models/rooms");

const getRoom = async (req, res) => {
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
  const { messages } = req.body;


  if (!room) return res.status(403).json({ message: "no room found" });

  const authorized =
    user._id.equals(room.user_id_1) || user._id.equals(room.user_id_2);

  if (!authorized) {
    res.status(403).json({ message: "user not authorized" });
  }

  const updatedMessages = {
    $push: {
      messages: {
        $each: messages.map(message => ({
          user_id: user.id,
          body: message.body
        }))
      }
    }
  };

  const info = await Rooms.findByIdAndUpdate(req.params.id, updatedMessages, {
    new: true,
  });

  if (!info) {
    res.status(500).json({ message: "failed to update" });
  }


  res.status(200).json(info);
};

const getYourRoom = async (req, res) => {
  try {
    const rooms = await Rooms.find({
      $or: [{ user_id_1: req.user._id }, { user_id_2: req.user._id }],
    });

    if (!rooms || rooms.length === 0) {
      return res.status(202).json({ message: "No rooms found for the user." });
    }

    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const callRoom = async (user_id_1, user_id_2, userID) => {
  const room = await Rooms.findOne({
    $or: [
      { user_id_1: userID, user_id_2: user_id_2 },
      { user_id_1: user_id_1, user_id_2: userID },
      { user_id_1: user_id_2, user_id_2: userID },
      { user_id_1: userID, user_id_2: user_id_1 },
    ],
  });

  // getting id of !user_id
  let user_2_id = user_id_1 !== userID ? user_id_1 : user_id_2

  let newMessages = room.messages.map(message => {
    if (message.user_id.equals(user_2_id)) {
      return { ...message.toObject(), read: true };
    }
    return message.toObject();
  });

  console.log("user ", userID, " has read users", user_2_id ," its messages")

  await Rooms.updateOne(
    { _id: room._id },
    { $set: { messages: newMessages } }
  );

  return room;
};

const createRoom = async (user_id_1, user_id_2, user, userID) => {
  var roomData = {
    message: "",
    errorMessage: "",
    status: 500,
  };

  if (!user_id_1 || !user_id_2) {
    roomData.errorMessage = "Invalid user_id_1 or user_id_2";
    roomData.status = 404;
    return roomData;
  }

  const existingRoom = await Rooms.findOne({
    $or: [
      { user_id_1: user_id_1, user_id_2: user_id_2 },
      { user_id_1: user_id_2, user_id_2: user_id_1 },
    ],
  });

  if (existingRoom) {
    roomData.errorMessage = "Room already exists";
    roomData.status = 500;
    return roomData;
  }

  if (user._id.equals(user_id_1) || user._id.equals(user_id_2)) {
    const room = await Rooms.create({
      user_id_1: user_id_1,
      user_id_2: user_id_2,
    });

    if (!room) {
      roomData.errorMessage = "Failed to create room";
      roomData.status = 500;
      return roomData;
    }

    if (room) {
      roomData.message = "Succesful to  create room";
      roomData.status = 200;
      return roomData;
    }
  } else {
    roomData.errorMessage = "User not authorized";
    roomData.status = 403;
    return roomData;
  }
};
const loadRoom = async (req, res) => {
  try {
    var room;
    const { user_id_1, user_id_2 } = await req.body;
    if (!user_id_1 || !user_id_2) {
      res.status(404).json({ message: "missing user_id_1 or user_id_1" });
    }

    const user = await Users.findOne(req.user._id);

    if (!user) {
      res.status(404).json({ message: "user not found" });
    }
    room = await callRoom(user_id_1, user_id_2, req.user.id);

    if (!room) {
      const newRoom = await createRoom(user_id_1, user_id_2, user, req.user.id);
      if (newRoom.message !== "") {
        room = await callRoom(user_id_1, user_id_2, req.user.id);
      } else if (newRoom.errorMessage !== "") {
        console.error(newRoom.errorMessage);
        res.status(newRoom.status).json({ message: newRoom.errorMessage });
      }
    }

    if (room) {
      res.status(200).json({ message: "successfully loaded room", room });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getRoomInfo = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    const rooms = await Rooms.find({
      $or: [{ user_id_1: req.user._id }, { user_id_2: req.user._id }],
    });
    var roomsinfo = []
    await Promise.all(rooms.map(async (room) => {
      // finding user2
      let userId = room.user_id_1 !== req.user.id ? room.user_id_1 : room.user_id_2;
      let user2 = await Users.findById(userId);
    
      // geting last meesage
      let lastMessage = 0;
      room.messages.forEach((message) => {
        if (message.user_id.equals(user2._id)) {
          lastMessage = message.date;
        }
      });

      // getting unread messages

      let unreadMessages = 0;
      room.messages.forEach((message) => {
        if(message.user_id.equals(user2._id) && message.read === false) {
          unreadMessages = unreadMessages + 1
        }
      })

    
      let roominfo = {
        name: user2.name,
        lastMessage: lastMessage,
        unreadMessages: unreadMessages
      };
      roomsinfo.push(roominfo);
    }));
    res.status(200).json({roomsinfo: roomsinfo});
  }
  catch (err) {
    return res.status(500).json({message: err});
  }
}

module.exports = {
  getRoom,
  updateMessages,
  getYourRoom,
  loadRoom,
  getRoomInfo,
};
