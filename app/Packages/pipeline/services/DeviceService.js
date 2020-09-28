const RedisStuff = require("../src/redis");

const userDeviceSocket = use('App/Models/UsersDeviceSocket');
const User = use('App/Models/User');

const redisStuff = use('RedisStuff');
class DeviceService {
    constructor(pipeline, data) {
        this.pipeline = pipeline;
        this.data = data;
    }

    async process () {
        await this.setUserId(this.data.user);
        await this.findDeviceToken();
        this.pipeline.produce(this.makeMessage());   
        await redisStuff.setUserDeviceToken(this.data);
    }

    async setUserId (uniqueUser) {
        const user = await User.where({name: uniqueUser}).first();
        this.userId = user._id;
        this.pipeline.userId = user._id;
    }

    async findDeviceToken () {
        const device = await userDeviceSocket
            .where({
                $and: [
                    {user: this.data.user},
                    {deviceId: this.data.deviceId}
                ]
            })
            .first();
        if (device) {
            this.setDeviceSocket(device)    
        } else {
            this.setNewDeviceSocketId();
        }
    }

    setDeviceSocket (device) {
        this.type = 'remain';
        device.socketId = this.data.socketId;
        this.pipeline.user = device.user        
        device.save();
    }


    setNewDeviceSocketId () {
        this.type = 'new';
        const record = new userDeviceSocket({
            user: this.data.user,
            userId: this.userId,
            deviceId: this.data.deviceId,
            socketId: this.data.socketId,
            isOnline: true
        });        
        this.pipeline.user = this.data.user;
        record.save();
    } 

    makeMessage () {        
        const message = {
            type: 'send',
            message: this.type,
            emit: 'fetchData'    
        };        
        return message;
    }

}



module.exports = DeviceService;