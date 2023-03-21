// postgres database config

module.exports = {

    pghost: process.env.PGHOST || "localhost",
    pguser: process.env.PGUSER || "root",
    pgdatabase: process.env.PGDATABASE || "mamall",
    pgpassword: process.env.PGPASSWORD || "root",
    pgport: process.env.PGPORT || 5432,
    pgschema: process.env.PGSCHEMA || "mamall"
    
}