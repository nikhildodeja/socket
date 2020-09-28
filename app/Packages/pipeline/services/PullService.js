const Room = use('App/Models/Room')
// const ObjectId = require('mongo').ObjectID;
class PullService {
    constructor (pipeline, data) {
        this.pipeline = pipeline;
        this.data = data;        
    }

    async process () {
        const rooms = await this.getRoom();
        const message = {
            type: 'emit',
            emit: 'room',
            message: rooms,
            socketIds: [
                this.pipeline.socketId
            ],
        }        
        this.pipeline.produce(message);
    }


    async getRoom () {
        const rooms = await Room.aggregate([
            {
                $lookup: {
                    from: "roomUsers",
                    localField: "_id",
                    foreignField: "room",
                    as: "group"
                }
            },
            {
                $unwind: "$group",
            },
            {
                $unwind: "$group.user",
            },
            {
                $match: {"group.user":  this.pipeline.userId}
            },
            {
                $project: {
                    'roomId': "$group.room",
                    name: 1,
                    _id: 0,
                }
            },
        ]);
        return rooms;        
    }

    makeData () {

    }

}

module.exports = PullService;