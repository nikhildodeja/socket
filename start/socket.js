const Server = use('Server');
const io = use('socket.io')(Server.getInstance());
const CS = use('App/Controllers/Http/ChatController');

io.on('connection', function(socket) {
    CS.goMessage(socket, io);
});