const config = require('../config/config');
(function() {
    let pool;

    module.exports.setPool = function(dbPool) {
        pool = dbPool 
    }

    module.exports.getAllRooms = async function() {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return []
        }

        let rooms = [];
        let query = `SELECT room_id, name, room_mode_id 
                    FROM ${config.pgschema}.rooms;`;
        
        let res;
        try {
            res = await pool.query(query);
            rooms = res.rows;
        }
        catch (err) {
            console.error(err.stack);
        }

        return rooms;
    }

    module.exports.getAllRoomsWithMode = async function() {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return []
        }

        let rooms = [];
        let query = `SELECT room_id, name, room_mode_id, description
                    FROM 
                    ${config.pgschema}.rooms AS room
                    INNER JOIN 
                    ${config.pgschema}.room_modes AS room_mode
                    ON room.room_mode_id = room_mode.mode_id;`;
        
        let res;
        try {
            res = await pool.query(query);
            rooms = res.rows;
        }
        catch (err) {
            console.error(err.stack);
        }

        return rooms;
    }

    module.exports.getRoomInfoById = async function(roomId) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let user;
        let query =  {
            name: 'get-room-info-by-id',
            text: `SELECT room_id, name, room_mode_id, description
                    FROM 
                    ${config.pgschema}.rooms AS room
                    INNER JOIN 
                    ${config.pgschema}.room_modes AS room_mode
                    ON room.room_mode_id = room_mode.mode_id 
                    WHERE room_id = $1;`,
            values: [roomId]
        }
        
        let res;
        try {
            res = await pool.query(query);

            if (res.rows.length >= 1) {
                user = res.rows[0];
            }
        }
        catch (err) {
            console.error(err.stack);
        }

        return user;
    }

    module.exports.getRoomUsers = async function(room_id) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let users;
        let query =  {
            name: 'get-room-users',
            text: `SELECT room_id, room_user.user_id, user_room_nickname, room_user.user_role_id, username
                    FROM
                        (SELECT 
                            room_id, user_id, user_room_nickname, user_role_id
                            FROM 
                            ${config.pgschema}.room_user 
                            WHERE room_id = $1) AS room_user
                        INNER JOIN 
                        ${config.pgschema}.users AS users
                        ON room_user.user_id = users.user_id
                        INNER JOIN 
                        ${config.pgschema}.user_roles AS roles
                        ON room_user.user_role_id = roles.role_id;`,
            values: [room_id]
        }
        
        let res;
        try {
            res = await pool.query(query);

            users = res.rows;
        }
        catch (err) {
            console.error(err.stack);
        }

        return users;
    }

    module.exports.setRoomMode = async function(room_id, mode_id) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let user;
        let query =  {
            name: 'set-room-mode',
            text: `UPDATE ${config.pgschema}.room_modes
                    SET room_mode_id = $1
                    WHERE room_id = $2;`,
            values: [mode_id, room_id]
        }
        
        let res;
        try {
            res = await pool.query(query);

            if (res.rows.length >= 1) {
                user = res.rows[0];
            }
        }
        catch (err) {
            console.error(err.stack);
        }

        return user;
    }

    module.exports.getRoomModes = async function() {
        
        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let room_modes = [];
        let query =  {
            text: `SELECT mode_id, description
                    FROM 
                    ${config.pgschema}.room_modes`,
        }
        
        let res;
        try {
            res = await pool.query(query);

            room_modes = res.rows
        }
        catch (err) {
            console.error(err.stack);
        }

        return room_modes;
    }

    module.exports.getUserRoles = async function() {
    
        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let user_roles = [];
        let query =  {
            text: `SELECT role_id, description
                    FROM 
                    ${config.pgschema}.user_roles`,
        }
    
        let res;
        try {
            res = await pool.query(query);

            user_roles = res.rows
        }
        catch (err) {
            console.error(err.stack);
        }

        return user_roles;
    }

    module.exports.getRoleValue = async function(role_id) {
    
        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let user_roles;
        let query =  {
            name: 'get-role-value',
            text: `SELECT role_id, role_value
                    FROM 
                    ${config.pgschema}.user_roles
                    WHERE role_id = $1;`,
            values: [role_id]
        }
    
        let res;
        try {
            res = await pool.query(query);

            if (res.rows.length >= 1) {
                user_roles = res.rows[0]
            }
        }
        catch (err) {
            console.error(err.stack);
        }

        return user_roles;
    }

    module.exports.addUserToRoom = async function(room_user) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let query =  {
            name: 'add-user-to-room',
            text: `INSERT INTO 
                    ${config.pgschema}.room_user 
                    (room_id, user_id, user_room_nickname, user_role_id) 
                    VALUES 
                    ($1, $2, $3, $4);`,
            values: [room_user.room_id, room_user.user_id, 
                room_user.user_room_nickname, room_user.user_role_id]
        }
        
        try {
            let res = await pool.query(query);
        }
        catch (err) {
            console.error(err.stack);
            return err.code;
        }

        return true;

    }

    module.exports.deleteUserFromRoom = async function(room_id, user_id) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let query =  {
            name: 'delete-user-from-room',
            text: `DELETE FROM  
                    ${config.pgschema}.room_user 
                    *
                    WHERE room_id = $1 AND user_id = $2;`,
            values: [room_id, user_id]
        }
        
        try {
            let res = await pool.query(query);
        }
        catch (err) {
            console.error(err.stack);
            return false;
        }

        return true;

    }

    module.exports.deleteRoom = async function(room_id) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let query =  {
            name: 'delete-room',
            text: `DELETE FROM  
                    ${config.pgschema}.rooms
                    *
                    WHERE room_id = $1;`,
            values: [room_id]
        }
        
        try {
            let res = await pool.query(query);
        }
        catch (err) {
            console.error(err.stack);
            return false;
        }

        return true;

    }

    module.exports.updateUserRoomInfo = async function(room_user) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let query =  {
            name: 'update-user-room-info',
            text: `UPDATE ${config.pgschema}.room_user 
                    SET (user_room_nickname, user_role_id) = ($1, $2)
                    WHERE room_id = $3 AND user_id = $4;`,
            values: [room_user.user_room_nickname, room_user.user_role_id,
                room_user.room_id, room_user.user_id]
        }

        try {
            let res = await pool.query(query);
        }
        catch (err) {
            console.error(err.stack);
            return false;
        }
        
        return true;

    }

    module.exports.updateUserRoomNickname = async function(room_user) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let query =  {
            name: 'update-user-room-nickname',
            text: `UPDATE ${config.pgschema}.room_user 
                    SET user_room_nickname = $1
                    WHERE room_id = $2 AND user_id = $3;`,
            values: [room_user.user_room_nickname,
                room_user.room_id, room_user.user_id]
        }

        try {
            let res = await pool.query(query);
        }
        catch (err) {
            console.error(err.stack);
            return false;
        }
        
        return true;

    }

    module.exports.updateUserRoomRole = async function(room_user) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let query =  {
            name: 'update-user-room-role',
            text: `UPDATE ${config.pgschema}.room_user 
                    SET user_role_id = $1
                    WHERE room_id = $2 AND user_id = $3;`,
            values: [room_user.user_role_id,
                room_user.room_id, room_user.user_id]
        }

        try {
            let res = await pool.query(query);
        }
        catch (err) {
            console.error(err.stack);
            return false;
        }
        
        return true;

    }
    
    module.exports.createRoom = async function(roomInfo) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let query =  {
            name: 'create-room',
            text: `INSERT INTO 
                    ${config.pgschema}.rooms 
                    (name, room_mode_id) 
                    VALUES 
                    ($1, $2)
                    RETURNING room_id;`,
            values: [roomInfo.name, roomInfo.room_mode_id]
        }
        
        try {
            let res = await pool.query(query);
            return res.rows[0];
        }
        catch (err) {
            console.error(err.stack);
            return 0;
        }

    }

    module.exports.getUserRooms = async function(user_id) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let users;
        let query =  {
            name: 'get-user-rooms',
            text: `SELECT room_id, room_user.user_id, user_room_nickname, room_user.user_role_id, username
                    FROM
                        (SELECT 
                            room_id, user_id, user_room_nickname, user_role_id
                            FROM 
                            ${config.pgschema}.room_user 
                            WHERE user_id = $1) AS room_user
                        INNER JOIN 
                        ${config.pgschema}.users AS users
                        ON room_user.user_id = users.user_id
                        INNER JOIN 
                        ${config.pgschema}.user_roles AS roles
                        ON room_user.user_role_id = roles.role_id;`,
            values: [user_id]
        }
        
        let res;
        try {
            res = await pool.query(query);

            users = res.rows;
        }
        catch (err) {
            console.error(err.stack);
        }

        return users;
    }

    module.exports.getUserRoomsInfo = async function(user_id) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let users;
        let query =  {
            name: 'get-user-rooms-info',
            text: `SELECT rooms.room_id, rooms.name, room_mode_id, description
                    FROM
                        (SELECT 
                            room_id, user_id, user_room_nickname, user_role_id
                            FROM 
                            ${config.pgschema}.room_user 
                            WHERE user_id = $1) AS room_user
                        INNER JOIN 
                        ${config.pgschema}.rooms AS rooms
                        ON room_user.room_id = rooms.room_id
                        INNER JOIN 
                        ${config.pgschema}.room_modes AS room_mode
                        ON rooms.room_mode_id = room_mode.mode_id`,
            values: [user_id]
        }
        
        let res;
        try {
            res = await pool.query(query);

            users = res.rows;
        }
        catch (err) {
            console.error(err.stack);
        }

        return users;
    }

    module.exports.getUserPublicRoomsInfo = async function(user_id) {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let users;
        let query =  {
            name: 'get-user-rooms-info',
            text: `SELECT rooms.room_id, rooms.name, room_mode_id, description
                    FROM
                        (SELECT 
                            room_id, user_id, user_room_nickname, user_role_id
                            FROM 
                            ${config.pgschema}.room_user 
                            WHERE user_id = $1) AS room_user
                        INNER JOIN 
                        ${config.pgschema}.rooms AS rooms
                        ON room_user.room_id = rooms.room_id
                        INNER JOIN 
                        ${config.pgschema}.room_modes AS room_mode
                        ON rooms.room_mode_id = room_mode.mode_id
                        WHERE rooms.room_mode_id <> 1`,
            values: [user_id]
        }
        
        let res;
        try {
            res = await pool.query(query);

            users = res.rows;
        }
        catch (err) {
            console.error(err.stack);
        }

        return users;
    }

    module.exports.getPublicRoomsInfo = async function() {

        if (!pool) {
            console.error("Pool not initialized in db-rooms.")
            return null
        }

        let users;
        let query =  {
            name: 'get-user-rooms-info',
            text: `SELECT rooms.room_id, rooms.name, room_mode_id, description
                    FROM
                        ${config.pgschema}.rooms AS rooms
                        INNER JOIN 
                        ${config.pgschema}.room_modes AS room_mode
                        ON rooms.room_mode_id = room_mode.mode_id
                        WHERE rooms.room_mode_id <> 1`,
            values: []
        }

        let res;
        try {
            res = await pool.query(query);

            users = res.rows;
        }
        catch (err) {
            console.error(err.stack);
        }

        return users;
    }

}());