// signaling server config

module.exports = {

    wsport: process.env.WSPORT || 7001,
    origins: ["http://localhost:3000", "https://mamont.sytes.net", "http://192.168.1.104:3000"],
    
}