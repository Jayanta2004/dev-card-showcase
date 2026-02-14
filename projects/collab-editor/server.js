// Simple Express + Socket.IO server for real-time collaboration
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.static(__dirname));

let code = '// Start coding together!\n';
let users = {};

io.on('connection', (socket) => {
  let userName = '';

  socket.on('join', (data) => {
    userName = data.userName;
    users[socket.id] = userName;
    io.emit('user-list', { users: Object.values(users) });
    socket.emit('code-update', { code });
  });

  socket.on('code-update', (data) => {
    code = data.code;
    socket.broadcast.emit('code-update', { code });
  });

  socket.on('chat-message', (data) => {
    io.emit('chat-message', data);
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('user-list', { users: Object.values(users) });
  });
});

const PORT = process.env.PORT || 3050;
server.listen(PORT, () => {
  console.log('Collab Editor server running on port', PORT);
});
