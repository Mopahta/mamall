// signaling server config

module.exports = {

    apiPort: process.env.APIPORT || 8080,
    jwtSecret: process.env.JWTSECRET || 'JF@f#8**JKl;*(JKFCjkn%w*ui&3$%2nx934hJjhwe',
    corsOrigin: process.env.CORSORIGIN || 'http://localhost:3000',
    
}