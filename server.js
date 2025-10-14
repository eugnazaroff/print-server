const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // ← для разработки; в продакшене укажите конкретные домены
        methods: ["GET", "POST"]
    }
});

// Serve health check
app.get('/', (req, res) => {
    res.send('✅ Print Socket.IO Server is running');
});

// При подключении клиента
io.on('connection', (socket) => {
    console.log('📱 Mobile client connected:', socket.id);

    // Можно добавить аутентификацию по токену:
    // const token = socket.handshake.auth.token;
    // if (token !== 'YOUR_SECRET') return socket.disconnect(true);

    socket.on('disconnect', () => {
        console.log('📱 Client disconnected:', socket.id);
    });

    // Опционально: клиент может подписаться на комнату
    socket.on('join-print-room', (room) => {
        socket.join(room);
        console.log(`📱 Client ${socket.id} joined room: ${room}`);
    });
});

// Функция для отправки EZPL всем клиентам (или в комнату)
function sendEzplToAll(ezplString) {
    io.emit('print-ezpl', { ezpl: ezplString });
}

// Функция для отправки в конкретную комнату
function sendEzplToRoom(room, ezplString) {
    io.to(room).emit('print-ezpl', { ezpl: ezplString });
}

// Опциональный HTTP-эндпоинт для теста
app.post('/print', express.text({ type: '*/*' }), (req, res) => {
    sendEzplToAll(req.body);
    res.json({ status: 'EZPL sent to all clients' });
});

// Запуск
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Socket.IO server running on port ${PORT}`);
});

module.exports = { sendEzplToAll, sendEzplToRoom };