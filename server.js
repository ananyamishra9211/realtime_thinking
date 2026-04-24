const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    users.set(socket.id, { username, id: socket.id });
    io.emit('user_list', Array.from(users.values()));
    
    // Welcome message
    socket.emit('message', {
      user: 'System',
      text: `Welcome to the Nexus, ${username}.`,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on('send_message', (message) => {
    const user = users.get(socket.id);
    io.emit('message', {
      user: user ? user.username : 'Unknown',
      text: message,
      time: new Date().toLocaleTimeString(),
      senderId: socket.id
    });
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('user_list', Array.from(users.values()));
    console.log('User disconnected');
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
