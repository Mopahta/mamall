// front config

module.exports = {

    host: process.env.HTTPHOST || "https://mamont.sytes.net/api/v1",
    wsHost: process.env.WSHOST || "wss://mamont.sytes.net:7001/",
    validatePath: process.env.VALIDATEPATH || "/validate",
    refreshPath: process.env.REFRESHPATH || "/refresh",
    yWebrtcSignalingHost: process.env.YWEBRTCHOST || "ws://localhost:4444"
    
}
