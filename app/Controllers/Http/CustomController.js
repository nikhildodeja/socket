'use strict'

class CustomController {
    static goMessage(socket,io){                
        socket.on('customMessage', function(data) {
            console.log('custom Message', socket.id, data);                
        });
    }  
}

module.exports = CustomController
