const Redis = use('Redis');


class RedisStuff {
    constructor () {
        this.user = {};
    }

    async setUserDeviceToken (data) {
        const {type, record} = await this.getHashData('userDevice', data.user);
        if (type === 'add') {
            await this.addDevice(data)
        } else {
            await this.updateDevice(record, data);            
        }
    }

    async getHashData (key, user) {
        const record = await Redis.hmget(key, user);
        let type;
        if (record[0]) {
            type = 'set';
        } else {
            type = 'add';
        }        
        return { type, record: JSON.parse(record[0]) };
    }

    async setHashData (key, user, data) {
        const record = await Redis.hmset(key, user, data)
    }

    async addDevice (data) {
        const user = {};
        user[data.user] = {};
        user[data.user][data.deviceId] = data.socketId;
        await this.setHashData('userDevice', data.user, JSON.stringify(user));        
    }

    async updateDevice (record, data) {
        record[data.user][data.deviceId] = data.socketId;        
        this.setHashData('userDevice', data.user, JSON.stringify(record));        
    }

    async getUserData (user) {
        let sockets = await this.getHashData('userDevice', user);
        sockets = sockets.record[user]
        let ret = []
        for(let x in sockets) {
            ret.push(sockets[x]);
        }
        return ret;
    }
}


module.exports = RedisStuff;