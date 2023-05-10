// front config

module.exports = {

    host: process.env.HTTPHOST || "http://localhost:8080/api/v1",
    wsHost: process.env.WSHOST || "ws://localhost:7001",
    validatePath: process.env.VALIDATEPATH || "/validate",
    refreshPath: process.env.REFRESHPATH || "/refresh"
    
}