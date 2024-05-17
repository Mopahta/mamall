// signaling server config

module.exports = {

    apiPort: process.env.APIPORT || 8080,
    corsOrigin: process.env.CORSORIGIN || 'http://localhost:3000',
    
}