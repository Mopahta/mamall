const pg = require('pg');
const config = require('./config/config');
const users = require('./user/db-users');
const rooms = require('./room/db-rooms');

module.exports = {
    pool: null,

    connect: function() {
        if (this.pool) {
            return;
        }
        this.pool = new pg.Pool({

            host: config.pghost,
            user: config.pguser,
            database: config.pgdatabase,
            password: config.pgpassword,
            port: config.pgport,
            max: 20,
            idleTimeoutMillis: 60000

        });

        users.setPool(this.pool);
        rooms.setPool(this.pool);

        this.pool.on('connect', (client) => {
            console.log("New client connected to database.");
        });

        this.pool.on('error', (error, client) => {
            console.error(error);
        });

        this.pool.on('remove', (client) => {
            console.log("Client was removed from pool.");
        });

        console.log('Successfully created database pool.')
        
        return true;
    },

    disconnect: function() {
        (async () => {
            await this.pool.end()
                .then(() => { 
                    console.log('The database connection is closed.');
                    return true;
                })
                .catch((err) => { 
                    console.error(err);
                    return false;
                })  
        })();
        
        return true;
    },

    // User-related functions

    getAllUsers: users.getAllUsers,

    getUserInfoById: users.getUserInfoById,

    getUserInfoByUsername: users.getUserInfoByUsername,

    getUserOnlineStatus: users.getUserOnlineStatus,

    getUserContacts: users.getUserContacts,

    getPendingContacts: users.getPendingContacts,

    approvePendingContact: users.approvePendingContact,

    getUserActiveIcon: users.getUserActiveIconPath,

    getUserPrivacySets: users.getUserPrivacySets,

    updateUserIcon: users.updateUserIcon,

    createUser: users.createUser,

    addContact: users.addContact,

    getContactInfo: users.getContactInfo,

    deleteContact: users.deleteContact,

    updateContactRoom: users.updateContactRoom,

    updateUserRefreshToken: users.updateUserRefreshToken,

    getUserRefreshTokenById: users.getUserRefreshTokenById,

    // not implemented
    updateUserRole: users.updateUserRole,

    // online_statuses:
    //      1 - offline
    //      2 - online
    //      3 - away
    setUserOnlineStatus: users.setUserOnlineStatus,

    // @params:
    //  room id, array of user ids in this room 
    getUsersRoomInfo: users.getUsersRoomInfo,

    // Room-related functions

    getAllRooms: rooms.getAllRooms,

    getAllRoomsWithMode: rooms.getAllRoomsWithMode,

    getRoomInfoById: rooms.getRoomInfoById,

    getRoomUsers: rooms.getRoomUsers,

    setRoomMode: rooms.setRoomMode,

    getRoomModes: rooms.getRoomModes,

    getUserRoles: rooms.getUserRoles,

    getRoleValue: rooms.getRoleValue,

    addUserToRoom: rooms.addUserToRoom,

    deleteUserFromRoom: rooms.deleteUserFromRoom,
    
    deleteRoom: rooms.deleteRoom,

    updateUserRoomInfo: rooms.updateUserRoomInfo,

    updateUserRoomRole: rooms.updateUserRoomRole,

    updateUserRoomNickname: rooms.updateUserRoomNickname,

    createRoom: rooms.createRoom,

    getUserRooms: rooms.getUserRooms,

};