const pg = require('pg');
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
        let query = `SELECT user_id, username, email, online_status_id, icon_file_id 
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
            text: `SELECT user_id, username, email, date_registered, online_status_id, icon_file_id 
                    FROM ${config.pgschema}.users WHERE id = $1`,
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
                    WHERE id = $1`,
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

    module.exports.getUserContacts = async function(id) {
        
        if (!pool) {
            console.error("Pool not initialized in db-users.")
            return null
        }

        let contacts = [];
        let query =  {
            name: 'get-user-contacts',
            text: `SELECT user_id, contact_nickname, contact_since, username, icon_file_id
                    FROM 
                    (SELECT contact_id, contact_nickname, contact_since
                        FROM 
                        ${config.pgschema}.users AS u INNER JOIN ${config.pgschema}.contacts AS co 
                        ON u.user_id = co.user_id
                        WHERE u.user_id = $1) AS cont 
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

}());