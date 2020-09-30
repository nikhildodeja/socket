class ChatController {
    static goMessage(socket,io) {
        const Pipeline = use('Pipeline');
        Pipeline.setSocketIo(socket, io, socket.id);                
        socket.on('deviceId', async function(message) {
            message.socketId = socket.id;
            message.type = 'deviceId';
            Pipeline.setDeviceId(message.deviceId);
            Pipeline.setUser(message.user);      
            const messageString = message;
            Pipeline.produce(messageString);
        });

        socket.on('pull', function(message) {
            message = message;
            Pipeline.produce(message);
        });
        
        socket.on('message', function(message) {
            let data = { room: message.room, type: 'message', subtype: message.type, uuid: message.uuid, data: message.data};
            Pipeline.produce(data);
        });

        setTimeout(function() {
            // io.to(socket.id).emit('connect', JSON.stringify({ message: 'from chat message' }));
            console.log('connections')
            socket.emit('connectS', {connect: true})
        }, 200);
        socket.on('disconnect', function() {
            socket.removeAllListeners();
            console.log('user disconnected');
        });
    }

    sendToSingle (io, socketId) {

    }
}

module.exports = ChatController;
