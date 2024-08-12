const capitalizeFirstLetter = require("./functions");
const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
  //clean the data
  username = capitalizeFirstLetter(username.trim());
  room = capitalizeFirstLetter(room.trim());

  //validate data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate userName
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);

  return user;
};

const getUsersInRoom = (room) => {
  room = capitalizeFirstLetter(room.trim());
  const res = users.filter((user) => user.room === room);

  return res;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
