const pg = require('pg');
const config = require('./config/config');
const users = require('./user/db-users');

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

        users.setPool(pool)

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

    module.exports.addUser = users.addUser

    module.exports.addContact = users.addContact

    module.exports.setUserOnlineStatus = users.setUserOnlineStatus

}());