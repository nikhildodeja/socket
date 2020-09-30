const Chat = use('App/Models/Chat')
// const ObjectId = require('mongo').ObjectID;
class MessageService {
    constructor (pipeline, data) {
        this.pipeline = pipeline;
        this.data = data;        
    }

    async process () {
        const chat = await this.saveMessage();
        const message = this.makeConfirmUUIDMessage(chat);
        // reached here
        this.pipeline.produce(message);
        this.findSenderForRoom(chat.room);
    }

    async saveMessage () {
        const chat = new Chat();
        chat.uuid = this.data.uuid;
        chat.type = this.data.subtype;
        chat.msg = this.data.data.msg || '';
        chat.url = this.data.data.url || '';
        chat.sender = `${this.pipeline.userId}`;
        chat.room = this.data.room;
        chat.timestamp = new Date();
        await chat.save();
        return chat.toJSON();
    }

    makeConfirmUUIDMessage (chat)  {
        const message = {
            message: {
                uuid: chat.uuid, 
                confirm: true,  
                room: chat.room
            },
            emit: 'uuidConfirm',
            type: 'send'
        }
        return message;
    }

    findSenderForRoom(room) {
        // console.log(room);
    }
}

module.exports = MessageService;