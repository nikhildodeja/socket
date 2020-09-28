'use strict'

const Model = use('Model')

class RoomUser extends Model {
    static get collection() {
        return 'roomUsers';
    }
}

module.exports = Room
