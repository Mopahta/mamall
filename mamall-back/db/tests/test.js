const pg = require('pg');
const config = require('../config/config');
const db = require('../db');

(async () => {
    let a  = db.connect();
    console.log(a);
    let res = await db.getAllUsers();
    console.log(res);
    res = await db.getUserContacts(1);
    console.log(res);
    db.disconnect();
})();
