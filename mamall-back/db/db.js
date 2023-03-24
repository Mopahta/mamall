const pg = require('pg');
const config = require('./config/config');
const users = require('./user/db-users');
const rooms = require('./room/db-rooms')

(function() {
    let db;
    let pool;

    module.exports.connect = function() {
        pool = new pg.Pool({

            host: config.pghost,
            user: config.pguser,
            database: config.pgdatabase,
            password: config.pgpassword,
            port: config.pgport,
            max: 20,
            idleTimeoutMillis: 35000

        });

        users.setPool(pool);
        rooms.setPool(pool);

        pool.on('connect', (client) => {
            console.log("New client connected to database.");
        });

        pool.on('error', (error, client) => {
            console.error(error);
        });

        pool.on('remove', (client) => {
            console.log("Client was removed from pool.");
        });

        console.log('Successfully created database Pool.')
        
        return true;
    }

    module.exports.disconnect = function() {
        (async () => {
            await pool.end()
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
    }

    // User-related functions

    module.exports.getAllUsers = users.getAllUsers 

    module.exports.getUserInfoById = users.getUserInfoById 

    module.exports.getUserOnlineStatus = users.getUserOnlineStatus

    module.exports.getUserContacts = users.getUserContacts

    module.exports.getUserActiveIcon = users.getUserActiveIconPath

    module.exports.getUserPrivacySets = users.getUserPrivacySets

    module.exports.updateUserIcon = users.updateUserIcon

    module.exports.createUser = users.createUser

    module.exports.addContact = users.addContact

    module.exports.setUserOnlineStatus = users.setUserOnlineStatus


    // Room-related functions

    module.exports.getAllRooms = rooms.getAllRooms

    module.exports.getAllRoomsWithMode = rooms.getAllRoomsWithMode

    module.exports.getRoomInfoById = rooms.getRoomInfoById

    module.exports.getRoomUsers = rooms.getRoomUsers

    module.exports.setRoomMode = rooms.setRoomMode

    module.exports.getRoomModes = rooms.getRoomModes

    module.exports.getUserRoles = rooms.getUserRoles

    module.exports.getRoleValue = rooms.getRoleValue

    module.exports.addUserToRoom = rooms.addUserToRoom

    module.exports.deleteUserFromRoom = rooms.deleteUserFromRoom

    module.exports.updateUserRoomInfo = rooms.updateUserRoomInfo

    module.exports.createRoom = rooms.createRoom

    module.exports.getUserRooms = rooms.getUserRooms
}());