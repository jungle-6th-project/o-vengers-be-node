import { Server } from "socket.io";
import { createServer } from "http";
import express, { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "ws://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("enter_room", (test) => {
    console.log(`server console: ${test}`);
    console.log(socket.id);
  });

  socket.on("enterRoom", (roomName) => {
    console.log("🚀 ~ file: server.ts:26 ~ socket.on ~ roomName:", roomName);
    socket.join(roomName); 
    console.log(socket.rooms);
  });
});

httpServer.listen(3000, () => console.log(`listen port 3000`));
