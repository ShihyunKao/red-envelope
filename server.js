// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// 告诉服务器，网页文件都在 public 文件夹里
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('有新连接:', socket.id);

    // 监听手机端发来的 'throw' 事件
    socket.on('throw', (data) => {
        // 收到后，立刻广播给所有连接者（包括大屏幕）
        io.emit('new_envelope', data);
    });
});

// 使用 Render 分配的端口，或者是本地的 3000
const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log(`Server running on port ${port}`);
});