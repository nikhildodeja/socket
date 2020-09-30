'use strict'

const Model = use('Model')

class Chat extends Model {
    static get objectIDs() {
        return ['_id', 'sender'];
    }

    static get dates () {
        return ['timestamp'];
    }
}

module.exports = Chat
