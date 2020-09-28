'use strict'

const Model = use('Model')

class UsersDeviceSocket extends Model {
    static get collection() {
        return 'usersDeviceSockets';
    }
}

module.exports = UsersDeviceSocket
