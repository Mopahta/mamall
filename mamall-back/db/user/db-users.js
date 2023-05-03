const config = require('../config/config');

(function() {
    let pool;

    module.exports.setPool = function(dbPool) {
        pool = dbPool 
    }

    module.exports.getAllUsers = async function() {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return []
        }

        let users = [];
        let query = `SELECT user_id, username, email, online_status_id, icon_file_id, user_role_id
                    FROM ${config.pgschema}.users`;
        
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

    module.exports.getUserInfoById = async function(id) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let user;
        let query =  {
            name: 'get-user-info-by-id',
            text: `SELECT user_id, username, email, date_registered, online_status_id, icon_file_id, user_role_id
                    FROM ${config.pgschema}.users WHERE user_id = $1`,
            values: [id]
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

    module.exports.getUserInfoByUsername = async function(username) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let user;
        let query =  {
            name: 'get-user-info-by-username',
            text: `SELECT user_id, username, email, password, date_registered, icon_file_id, user_role_id
                    FROM ${config.pgschema}.users WHERE username = $1`,
            values: [username]
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

    module.exports.getUserRefreshTokenById = async function(id) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let user;
        let query =  {
            name: 'get-user-refresh-token-by-id',
            text: `SELECT user_id, username, refresh_token 
                    FROM ${config.pgschema}.users WHERE user_id = $1`,
            values: [id]
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

    module.exports.getUserOnlineStatus = async function(id) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let user;
        let query =  {
            name: 'get-user-online-status',
            text: `SELECT users.user_id, statuses.online_status_id, statuses.description
                    FROM ${config.pgschema}.users AS users 
                    INNER JOIN 
                    ${config.pgschema}.online_statuses AS statuses
                    ON users.online_status_id = statuses.online_status_id
                    WHERE user_id = $1`,
            values: [id]
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

    module.exports.setUserOnlineStatus = async function(id, status_id) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let user;
        let query =  {
            name: 'set-user-online-status',
            text: `UPDATE ${config.pgschema}.users
                    SET online_status_id = $1
                    WHERE user_id = $2;`,
            values: [status_id, id]
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

    module.exports.getUserContacts = async function(id) {
        
        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let contacts = [];
        let query =  {
            name: 'get-user-contacts',
            text: `SELECT user_id, contact_nickname, room_id, contact_since, username, icon_file_id
                    FROM 
                    (SELECT contact_id, room_id, contact_nickname, contact_since
                        FROM 
                        ${config.pgschema}.users AS u INNER JOIN ${config.pgschema}.contacts AS co 
                        ON u.user_id = co.user_id
                        WHERE u.user_id = $1 AND co.pending_invite = 0) AS cont 
                    INNER JOIN 
                    ${config.pgschema}.users 
                    ON cont.contact_id = users.user_id;`,
            values: [id]
        }
        
        let res;
        try {
            res = await pool.query(query);

            contacts = res.rows
        }
        catch (err) {
            console.error(err.stack);
        }

        return contacts;
    }

    module.exports.getUserActiveIconPath = async function(id) {
        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }


        let activeIcon;
        let query =  {
            name: 'get-user-active-icon-path',
            text: `SELECT file_url, file_path
                    FROM 
                    (SELECT icon_file_id 
                    FROM ${config.pgschema}.users
                    WHERE user_id = $1) AS ui
                    INNER JOIN 
                    ${config.pgschema}.files
                    ON ui.file_id = files.file_id;`,
            values: [id]
        }
        
        try {
            let res = await pool.query(query);

            if (res.rows >= 1) {
                activeIcon = res.rows[0];
            }
        }
        catch (err) {
            console.error(err.stack);
        }

        return activeIcon;
    }

    module.exports.getUserPrivacySets = async function(id) {
        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let privacySets;
        let query =  {
            name: 'get-user-privacy-sets',
            text: `SELECT *
                    FROM ${config.pgschema}.user_privacy_sets AS sets
                    WHERE sets.user_id = $1`,
            values: [id]
        }
        
        try {
            let res = await pool.query(query);

            if (res.rows >= 1) {
                privacySets = res.rows[0];
            }
        }
        catch (err) {
            console.error(err.stack);
        }

        return privacySets;
    }

    module.exports.createUser = async function(userInfo) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let query =  {
            name: 'create-user',
            text: `INSERT INTO 
                    ${config.pgschema}.users 
                    (username, password, email) 
                    VALUES 
                    ($1, $2, $3);`,
            values: [userInfo.username, userInfo.password, 
                userInfo.email]
        }
        
        try {
            let res = await pool.query(query);
        }
        catch (err) {
            console.error(err);
            return err.code;
        }

        return 0;
    }

    module.exports.updateUserIcon = async function(userId, fileId) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let query =  {
            name: 'update-user-icon',
            text: `UPDATE ${config.pgschema}.users 
                    SET icon_file_id = $1
                    WHERE user_id = $2;`,
            values: [fileId, userId]
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

    module.exports.addContact = async function(contact) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        if (contact.user_id === contact.contact_id) {
            console.error("Contact id is the same as user id.")
            return false;
        }

        let query =  {
            name: 'add-contact',
            text: `INSERT INTO 
                    ${config.pgschema}.contacts
                    (user_id, contact_id, room_id, contact_nickname, pending_invite)
                    VALUES
                    ($1, $2, $3, $4, $5);`,
            values: [
                contact.user_id, contact.contact_id, contact.room_id,
                contact.contact_nickname, contact.pending_invite
            ]
        }

        try {
            let res = await pool.query(query);
        }
        catch (err) {
            return err.code;
        }
        
        return 0;

    }

    module.exports.updateContactRoom = async function(contact) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let query =  {
            name: 'update-contact-room',
            text: `UPDATE ${config.pgschema}.contacts 
                    SET room_id = $1
                    WHERE user_id = $2 AND contact_id = $3;`,
            values: [contact.room_id, contact.user_id, contact.contact_id]
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

    module.exports.getPendingContacts = async function(userId) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let contacts = []

        let query =  {
            name: 'get-pending-contacts',
            text: `SELECT users.user_id, contact_nickname, contact_since, username, icon_file_id
                    FROM 
                    (SELECT co.user_id, contact_nickname, contact_since
                        FROM 
                        ${config.pgschema}.users AS u INNER JOIN ${config.pgschema}.contacts AS co 
                        ON u.user_id = co.user_id
                        WHERE co.contact_id = $1 AND co.pending_invite = 1) AS cont 
                    INNER JOIN 
                    ${config.pgschema}.users 
                    ON cont.user_id = users.user_id;`,
            values: [userId]
        }

        try {
            let res = await pool.query(query);
            contacts = res.rows;
        }
        catch (err) {
            console.error(err.stack);
        }
        
        return contacts;

    }

    module.exports.approvePendingContact = async function(userId, contactId) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let query =  {
            name: 'approve-pending-contact',
            text: `UPDATE ${config.pgschema}.contacts 
                    SET pending_invite = 0
                    WHERE user_id = $1 AND contact_id = $2;`,
            values: [userId, contactId]
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


    module.exports.getContactInfo = async function(userId, contactId) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let contact;

        let query =  {
            name: 'get-contact-info',
            text: `SELECT user_id, contact_id, room_id, pending_invite, contact_nickname, contact_since
                    FROM 
                    ${config.pgschema}.contacts
                    WHERE user_id = $1 AND contact_id = $2;`,
            values: [userId, contactId]
        }

        try {
            let res = await pool.query(query);
            contact = res.rows[0];
        }
        catch (err) {
            console.error(err.stack);
        }
        
        return contact;

    }

    module.exports.deleteContact = async function(userId, contactId) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let query =  {
            name: 'delete-contact',
            text: `DELETE FROM ${config.pgschema}.contacts 
                    WHERE user_id = $1 AND contact_id = $2;`,
            values: [userId, contactId]
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

    module.exports.updateUserRefreshToken = async function(userId, refresh_token) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let query =  {
            name: 'update-user-refresh-token',
            text: `UPDATE ${config.pgschema}.users 
                    SET refresh_token = $1
                    WHERE user_id = $2;`,
            values: [refresh_token, userId]
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

    module.exports.updateUserRole = async function(userInfo) {

    }

    module.exports.getUsersRoomInfo = async function(roomId, userIdArr) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let users;
        let query =  {
            name: 'get-users-room-info',
            text: `SELECT rous.user_id, username, icon_file_id, user_room_nickname, rous.user_role_id, description
                    FROM
                        (SELECT user_id, user_room_nickname, user_role_id, description
                        FROM ${config.pgschema}.room_user 
                        INNER JOIN 
                        ${config.pgschema}.user_roles
                        ON user_role_id = role_id
                        WHERE room_id = $1 AND user_id = ANY($2::bigint[])) AS rous
                    INNER JOIN
                    ${config.pgschema}.users
                    ON rous.user_id = users.user_id;`,
            values: [roomId, userIdArr]
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

    module.exports.getUserRoomInfo = async function(roomId, userId) {

        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let user;
        let query =  {
            name: 'get-user-room-info',
            text: `SELECT rous.user_id, username, icon_file_id, user_room_nickname, rous.user_role_id, description
                    FROM
                        (SELECT user_id, user_room_nickname, user_role_id, description
                        FROM ${config.pgschema}.room_user 
                        INNER JOIN 
                        ${config.pgschema}.user_roles
                        ON user_role_id = role_id
                        WHERE room_id = $1 AND user_id = $2) AS rous
                    INNER JOIN
                    ${config.pgschema}.users
                    ON rous.user_id = users.user_id;`,
            values: [roomId, userId]
        }
        
        let res;
        try {
            res = await pool.query(query);
                
            if (res.length > 0) {
                user = res.rows[0];
            }
        }
        catch (err) {
            console.error(err.stack);
        }

        return user;
    }
}());