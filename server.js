import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./models/Message.js";

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server , {

    maxHttpBufferSize: 1e8

});

app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

io.on("connection", async (socket) => {

    console.log("User Connected");

    socket.on("join-room", async (room) => {

        socket.join(room);

        const messages = await Message
        .find({ room })
        .sort({ createdAt: 1 });

        socket.emit("load-messages", messages);

    });

    socket.on("send-message", async (data) => {

        await Message.create({

            room:data.room,
            message:data.message,
            type:"text"

        });

        socket
        .to(data.room)
        .emit("receive-message", data.message);

    });

    socket.on("send-image", async (data) => {

        await Message.create({

            room:data.room,
            image:data.image,
            type:"image"

        });

        socket
        .to(data.room)
        .emit("receive-image", data.image);

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT , () => {

    console.log(`Server Running On ${PORT}`);

});