// postgres database config

module.exports = {

    pghost: process.env.PGHOST || "localhost",
    pguser: process.env.POSTGRES_USER || "root",
    pgdatabase: process.env.POSTGRES_DB || "mamall",
    pgpassword: process.env.POSTGRES_PASSWORD || "root",
    pgport: process.env.POSTGRES_PORT || 5432,
    pgschema: process.env.POSTGRES_SCHEMA || "mamall"
    
}
