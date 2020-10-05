const DeviceService = require('../services/DeviceService');
const PullService = require('../services/PullService');
const MessageService = require('../services/MessageService');
class Pipeline {

    constructor (kafka) {
        this.setKafka(kafka);
        this.consume();
    }

    setSocketIo (socket, io, socketId) {
        this.socket = socket;
        this.io = io;
        this.socketId = socketId;
    }

    setDeviceId (deviceId) {
        this.deviceId = deviceId;
    }

    setUser (user) {
        this.user = user;
    }

    setKafka (Kafka) {
        this.Kafka = Kafka;
        this.HighLevelProducer = this.Kafka.HighLevelProducer;        
        this.client = new this.Kafka.KafkaClient();
        this.producer = new this.HighLevelProducer(this.client);
        this.HighLevelConsumer = this.Kafka.HighLevelConsumer;
        this.consumer = new this.Kafka.Consumer(
            this.client,
            [ 
                { topic: 'chatmessages' }
            ],
            {
                groupId: 'groupId1',
                autoCommit: true,
                autoCommitIntervalMs: 5000
            }
        );
    }

    produce (message) {
        const kafkaMessage = {
            topic: 'chatmessages',
            messages: JSON.stringify(message)
        };        
        this.producer.send([kafkaMessage], function (err, data) {
            if(err) {
                console.log('Error sending data ' + err);
            }            
        });
    }

    consume () {
        const that = this;
        this.consumer.on('message', async function(kafkaMessage) {            
            const message = JSON.parse(kafkaMessage.value);            
            const type = message.type;                    
            switch (type) {
                case 'deviceId':
                    const deviceSer = new DeviceService(that, message);
                    await deviceSer.process();
                    break;                
                case 'send':                    
                    that.send(message, message.message, message.emit);
                    break;
                case 'emit':                              
                    that.emit(message.socketIds, message.message, message.emit);
                    break;                
                case 'pull':
                    const PullSer = new PullService(that, message);
                    await PullSer.process();                    
                    break;
                case 'message': 
                    const MessageSer = new MessageService (that, message);
                    await MessageSer.process();
                    break;
            }
        });
    }

    send (type, message, emit) {
        this.io.to(this.socketId).emit(emit, message);
    }
    
    emit (sockets, data, emit) {
        let dt = JSON.stringify(data);        
        for(let x in sockets) {
            this.io.to(sockets[x]).emit(emit, {message: dt});
        }
    }
}

module.exports = Pipeline;