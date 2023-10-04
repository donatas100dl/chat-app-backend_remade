const dotenv = require("dotenv")
const express = require("express");
const { createServer } = require('node:http');
const mongoose = require("mongoose");
const cors = require("cors");
const port = 4000;
const userRouter = require("./routers/user-router");
const roomsRouter = require("./routers/rooms-router");
const bodyParser = require('body-parser');
const { Server } = require("socket.io")

const app = express();
const server = createServer(app);
const io = new Server(server, {cors: {
  origin: ["http://localhost:3000","*"],
  credentials: true
}}
)


app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on("sendMessage", (data, callback) => {
    callback("we got your msg")
    socket.broadcast.emit("brodcastMessage", data)
  })
});

server.listen(4000, () => {
  console.log(`server running at http://localhost:${port}`);
});

dotenv.config()

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const url = process.env.DATABASE_URL;

mongoose.set("strictQuery", false);
 mongoose
  .connect(("mongodb+srv://donatas100dl:I8mMQSCzvMMXKCou@cluster0.am9rlsv.mongodb.net/realtime-chat-app"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    // Successfully connected
    console.log("Connected to mongoose");
  })
  .catch((err) => {
    console.log("Unable to connect to MongoDB. Error: " + err);
  });

  app.use("/user", userRouter);
  app.use("/chat", roomsRouter);