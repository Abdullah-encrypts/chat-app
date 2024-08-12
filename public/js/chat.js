const socket = io();

const $form = document.querySelector("#message-form");
const $formInput = $form.querySelector("input");
const $formButton = $form.querySelector("button");
const $locationButton = document.querySelector("#sendLocation");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //New message Element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message 
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container 
  const containerHeight = $messages.scrollHeight

  // How far have i scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on("message", (message) => {
  // console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
});

socket.on("locationMessage", (location) => {
  // console.log(location);
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll()
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room, 
    users
  })
  document.querySelector("#sidebar").innerHTML = html
});

$form.addEventListener("submit", (e) => {
  e.preventDefault();

  $formButton.setAttribute("disabled", "matters?");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    $formButton.removeAttribute("disabled");
    $formInput.focus();
    if (error) {
      return console.log(error);
    }

    console.log("Message delivered...");
  });

  $formInput.value = "";
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser!");
  }

  $locationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const { longitude, latitude } = position.coords;
    const locationData = {
      longitude,
      latitude,
    };
    socket.emit("sendLocation", locationData, (message) => {
      $locationButton.removeAttribute("disabled");
      return console.log(message);
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
