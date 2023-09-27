require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const port = 4000;
const userRouter = require("./routers/user-router");
const roomsRouter = require("./routers/rooms-router");
const bodyParser = require('body-parser');


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.use('/', router);

// router.get('/', (req, res) => {
//   res.send('Hello, Express!');
// });
app.use(bodyParser.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DATABASE_URL, {
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