const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Baddie = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("../src/utils/messages");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("../src/utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New websocket connection!");

  socket.on("join", (options, callback) => {
    const { user, error } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined the chat babe!!!`)
      );

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    const baddie = new Baddie();

    if (baddie.isProfane(message)) {
      return callback("No bad things allowed even for baddies!");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback("Message delivered!");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(
          "Admin",
          `Perdon! ${user.username} has left the chat :(`
        )
      );

      io.to(user.room).emit('roomData', {
        room: user.room,
        users:getUsersInRoom(user.room) 
      })
    }
  });

  socket.on("sendLocation", (locationData, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${locationData.latitude},${locationData.longitude}`
      )
    );
    callback("Location sent!");
  });
});

server.listen(port, () => {
  console.log(`The server is up and running on port ${port}!`);
});
