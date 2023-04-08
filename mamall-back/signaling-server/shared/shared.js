module.exports = {
    connectedUsers: [],
    getUsers: function () {
        return this.connectedUsers;
    },
    addUser: function (usrInfo) {
        this.connectedUsers.push(usrInfo);
        return;
    },
    findUserByConnection: function (connection) {
        return this.connectedUsers.find(x => x.connection === connection);
    },
    deleteUserByConnection: function (connection) {
        this.connectedUsers = this.connectedUsers.filter(x => x.connection !== connection);
        return;
    },
    updateBeatTime: function (data) {
        let userIndex = this.connectedUsers.findIndex(x => x.user_id === data.user_id);
        this.connectedUsers[userIndex].lastHeartBeat = data.payload.time;
    },
    deleteOldConnections: function () {
        let dateNow = Date.now();
        this.connectedUsers = this.connectedUsers.filter(user => (dateNow - user.lastHeartBeat) > 2 * 60 * 1000);
    }

};