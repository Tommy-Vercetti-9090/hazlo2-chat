import { io } from "socket.io-client";
const server = io("http://localhost:7002");

server.connect();

console.log("Connected");
