const _ = require('lodash');


class MessageProcess {
    static get key () {
        return "Message-Processing-Queue";
    }

    async handle (job) {
        const Pipeline = use('Pipeline');        
        const { data } = job;
        const { sockets, chat, other } = data;
        const { sameUser, receivers, noSocket } = sockets;
        let sSocket = [];
        let ssValue = _.values(sameUser[Pipeline.user]);        
        let message = {
            type: 'emit',
            emit: 'push',
            message: { data: other, chat },
            socketIds: ssValue
        }

        Pipeline.produce(message);
        ssValue = [];

        for (let x in receivers) {            
            for (let y in receivers[x])
            {
                ssValue.push(_.values(receivers[x][y])[0]);                
                
            }
        }        
        message = {
            type: 'emit',
            emit: 'message',
            message: { data: other, chat },
            socketIds: ssValue
        }

        Pipeline.produce(message);
    }
}

module.exports = MessageProcess;