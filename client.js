import { io } from "socket.io-client";

const socket = io("http://localhost:3030");
socket.emit("joinRoom", 5050);

socket.on("joined", (code) => {
    console.log("succesfully joined room", code);
});