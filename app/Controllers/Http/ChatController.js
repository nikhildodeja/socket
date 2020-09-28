// 'use strict'
// const HighLevelProducer = kafka.HighLevelProducer;
// const client = new kafka.KafkaClient();
// const producer = new HighLevelProducer(client);
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
        
                

        // setTimeout(function() {
        //     io.to(socket.id).emit('connect', { message: 'from chat message' });            
        // }, 2000);
        // socket.on('disconnect', function(){
        //     console.log('user disconnected');
        // });
    }

    sendToSingle (io, socketId) {

    }
}

module.exports = ChatController;
