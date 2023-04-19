const shared = require('../shared/shared');

(function() {

    module.exports.callUser = function(data, connected) {
        console.log(data);

        let res = {
            type: 2,
            status: 'failed',
            message: 'User is not available.'
        }

        let user = shared.findUserById(connected, data.payload.contact_id);

        if (user != null) {
            res.status = 'ok';
            res.message = 'User called.';
            let message = {
                type: 1,
                user_id: data.user_id,
                room_id: data.payload.room_id
            }

            user.connection.sendUTF(JSON.stringify(message));
        }

        return res;
    }

    module.exports.joinRoom = function(connected, data) {

    }

    module.exports.callRoom = function(connected, data) {

    }

}());