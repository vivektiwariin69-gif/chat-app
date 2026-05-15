const socket = io({

    transports: ["websocket", "polling"]

});
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const chatBox = document.getElementById("chatBox");

const emojiBtn = document.getElementById("emojiBtn");

const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");

const profileUpload = document.getElementById("profileUpload");
const profilePic = document.getElementById("profilePic");

let currentRoom = "";

joinBtn.addEventListener("click", () => {

    const room = roomInput.value.trim();

    if(room === "") return;

    currentRoom = room;

    socket.emit("join-room", room);

    addSystemMessage(`Joined Room : ${room}`);

});

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {

    if(e.key === "Enter"){
        sendMessage();
    }

});

emojiBtn.addEventListener("click", () => {

    messageInput.value += "😀";

});

imageBtn.addEventListener("click", () => {

    imageInput.click();

});

profileUpload.addEventListener("change", () => {

    const file = profileUpload.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = () => {

        profilePic.src = reader.result;

    };

    reader.readAsDataURL(file);

});

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = () => {

        const imageData = reader.result;

        addImageMessage(imageData , "sent");

        socket.emit("send-image", {

            room: currentRoom,

            image: imageData

        });

    };

    reader.readAsDataURL(file);

});

function sendMessage(){

    const message = messageInput.value.trim();

    if(message === "") return;

    if(currentRoom === ""){

        alert("Join A Room First");

        return;

    }

    addMessage(message , "sent");

    socket.emit("send-message" , {

        room: currentRoom,

        message: message

    });

    messageInput.value = "";

    scrollBottom();

}

socket.on("receive-message" , (message) => {

    addMessage(message , "received");

    scrollBottom();

});

socket.on("receive-image" , (image) => {

    addImageMessage(image , "received");

    scrollBottom();

});

socket.on("load-messages" , (messages) => {

    chatBox.innerHTML = "";

    messages.forEach((msg) => {

        if(msg.type === "text"){

            addMessage(msg.message , "received");

        }

        if(msg.type === "image"){

            addImageMessage(msg.image , "received");

        }

    });

});

function addMessage(message , type){

    const div = document.createElement("div");

    div.classList.add("message");

    div.classList.add(type);

    div.innerText = message;

    chatBox.appendChild(div);

}

function addImageMessage(image , type){

    const div = document.createElement("div");

    div.classList.add("message");

    div.classList.add(type);

    const img = document.createElement("img");

    img.src = image;

    img.classList.add("image-message");

    div.appendChild(img);

    chatBox.appendChild(div);

}

function addSystemMessage(message){

    const div = document.createElement("div");

    div.classList.add("system-message");

    div.innerText = message;

    chatBox.appendChild(div);

}

function scrollBottom(){

    chatBox.scrollTop = chatBox.scrollHeight;

}