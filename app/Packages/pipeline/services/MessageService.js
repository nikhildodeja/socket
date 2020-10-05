const Chat = use('App/Models/Chat')
const _ = require('lodash')
const RoomsUser = use('App/Models/RoomsUser')
const ObjectID = require('mongodb').ObjectID
const Promise = require('bluebird');
const RedisStuff = use('RedisStuff');
const MessageJob = use('App/Jobs/MessageProcess');
const Bull = use('Rocketseat/Bull')


// const ObjectId = require('mongo').ObjectID;
class MessageService {
    constructor (pipeline, data) {
        this.pipeline = pipeline;
        this.data = data;
    }

    async process () {
        // console.log(this.data);
        const chat = await this.saveMessage();
        const message = this.makeConfirmUUIDMessage(chat);
        // reached here
        this.pipeline.produce(message);
        const users = await this.findSenderForRoom(chat.roomId);
        const sockets = await this.findSockets(users);
        let jobData = {
            // pipeline: this.pipeline,
            other: this.data,
            chat,
            sockets
        }
        // jobData = JSON.stringify(jobData);
        Bull.add(MessageJob.key, jobData);
    }

    async saveMessage () {
        const chat = new Chat();
        chat.uuid = this.data.uuid;
        chat.type = this.data.subtype;
        chat.msg = this.data.data.msg || '';
        chat.url = this.data.data.url || '';
        chat.sender = `${this.pipeline.userId}`;
        chat.roomId = this.data.roomId;
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

    async findSenderForRoom(roomId) {
        const roomUsers = await RoomsUser.aggregate([
            {
                $match: {
                    'room': ObjectID(roomId)
                }
            },
            {
                
                $lookup: {
                    'from': 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: "users"
                }
            },
            {
                $unwind: "$users"
            },
            {
                $project: {
                    _id: 0,
                    room: 1,
                    user: 1,
                    'userName': "$users.name",
                    
                }
            }
        ]);
        return roomUsers.map((value) => {            
            const { userName , user } = value; 
            return {userName, user};
        });
    }

    async findSockets (list) {
        let sameUser;
        let otherUser = []
        _.each(list, (value) => {            
            if (value.userName === this.pipeline.user)
            {
                sameUser = value;                
            } else {
                otherUser.push(value);
            }            
        });        
        let socket = await RedisStuff.getuserRecord(sameUser.userName);
        sameUser = JSON.parse(socket);        
        let receivers = [];
        let noSocket = [];
        await Promise.each(otherUser, async (value) => {            
            const b  = await RedisStuff.getuserRecord(value.userName);
            if (b != null) {
                receivers.push(JSON.parse(b));
            } else { 
                noSocket.push(value);
            }            
        });
        return { sameUser, receivers, noSocket };
    }
}

module.exports = MessageService;