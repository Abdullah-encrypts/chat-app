const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Baddie = require("bad-words");
const {generateMessage} = require('./utils/messages')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New websocket connection!");

  socket.emit("message", generateMessage('Welcome!'));
  socket.broadcast.emit("message", generateMessage("A new user has joined the chat babe!!!"));

  socket.on("sendMessage", (message, callback) => {
    const baddie = new Baddie();

    if (baddie.isProfane(message)) {
      return callback("No bad things allowed even for baddies!");
    }
    io.emit("message", generateMessage(message));
    callback("Message delivered!");
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("Perdon! A user has left the chat :("));
  });

  socket.on("sendLocation", (locationData, callback) => {
    io.emit(
      "message",
      `https://google.com/maps?q=${locationData.latitude},${locationData.longitude}`
    );
    callback('Location sent!')
  });
});

server.listen(port, () => {
  console.log(`The server is up and running on port ${port}!`);
});
