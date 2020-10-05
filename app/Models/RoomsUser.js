'use strict'

const Model = use('Model')

class RoomUser extends Model {
    static get objectIDs() {
        return ['_id', 'room', 'user'];
    }
    static get collection() {
        return 'roomUsers';
    }
}

module.exports = RoomUser
