// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Tell the server that all the web files are in the public folder.
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('有新连接:', socket.id);

    // Listen for the 'throw' event sent from the mobile phone end
    socket.on('throw', (data) => {
        // Upon receipt, immediately broadcast to all connected parties (including the large screen)
        io.emit('new_envelope', data);
    });
});

// Use the port assigned by Render, or the local port 3000
const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log(`Server running on port ${port}`);
});