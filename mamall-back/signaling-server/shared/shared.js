var Shared = module.exports = {

    addUser: function (connected, usrInfo) {
        connected.push(usrInfo);
        return;
    },

    findUserByConnection: function (connected, connection) {
        return connected.find(x => x.connection === connection);
    },

    deleteUserByConnection: function (connected, connection) {
        return connected.filter(x => x.connection !== connection);
    },

    updateBeatTime: function (connected, data) {
        let userIndex = connected.findIndex(x => x.user_id === data.user_id);
        connected[userIndex].lastHeartBeat = data.payload.time;
    },

    deleteOldConnections: function (connected) {
        let dateNow = Date.now();
        return connected.filter(user => (dateNow - user.lastHeartBeat) < 2 * 60 * 1000);
    }

};