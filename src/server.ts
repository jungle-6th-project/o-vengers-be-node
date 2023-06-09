import  {  WebSocketServer } from "ws";
import http from "http";
import express, { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  console.log("Connected to Browser");
  socket.on("close", ()=> console.log("Disconnected"))
  socket.on("message", (message)=> console.log(message))
  socket.send("hello");
});

server.listen(3000, () => console.log(`listen port 3000`));
