import { AccessToken } from 'livekit-server-sdk';
import type { AccessTokenOptions, VideoGrant } from 'livekit-server-sdk';
import { getLiveKitURL } from './utils/server-utils.js';
import http from 'http';
import { Server, Socket } from 'socket.io';
import express, { Request, Response } from 'express';
import cors from 'cors';

const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    userInfo
  );
  at.ttl = '5m';
  at.addGrant(grant);
  return at.toJwt();
};

const app = express();
app.use(cors());
const port = 5000;
const test =
  process.env.NODE_ENV === 'production'
    ? 'https://bbodogstudy.com'
    : 'http://localhost:5173';

console.log(test);
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://www.bbodogstudy.com'
        : 'http://localhost:5173',
    credentials: true,
  },
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

// video chat
//토큰 받아오기
app.get('/video/getToken', (req, res) => {
  const { identity, name, roomName, metadata } = req.query;

  if (typeof identity !== 'string' || typeof roomName !== 'string') {
    res.status(403).end();
    return;
  }

  if (Array.isArray(name)) {
    throw Error('provide max one name');
  }

  if (Array.isArray(metadata)) {
    throw Error('provide max one metadata string');
  }

  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };

  const token = createToken(
    {
      identity,
      name: name as string,
      metadata: metadata as string,
    },
    grant
  );
  const result = {
    identity,
    accessToken: token,
  };
  res.status(200).json(result);
});

//url 받아오기
app.get('/video/api/url', (req, res) => {
  try {
    const region = undefined;

    if (Array.isArray(region)) {
      throw Error('provide max one region string');
    }
    const url = getLiveKitURL(region);
    res.status(200).json({ url });
  } catch (e) {
    res.statusMessage = (e as Error).message;
    res.status(500).end();
  }
});

app.get('/video/health', (req, res) => {
  res.status(200).end();
});

//text chat
const chatRooms: { [roomId: string]: Socket[] } = {};

wsServer.of('/study').on('connection', (socket: Socket) => {
  let roomID: string;

  socket.on('enter-room', (data: string) => {
    roomID = data;
    socket.join(roomID);

    if (!chatRooms[roomID]) {
      chatRooms[roomID] = [socket];
    } else {
      chatRooms[roomID].push(socket);
    }
  });

  socket.on('sentMessage', (data: string) => {
    if (chatRooms[roomID]) {
      socket.to(roomID).emit('showMessage', data);
    }
  });

  socket.on('disconnect', () => {
    if (roomID && chatRooms[roomID]) {
      chatRooms[roomID] = chatRooms[roomID].filter(
        (clientSocket: Socket) => clientSocket !== socket
      );
      if (chatRooms[roomID].length === 0) {
        delete chatRooms[roomID];
      }
    }
  });
});

httpServer.listen(port, () => console.log(`listening on port: ${port}`));
