// front config

module.exports = {
    host: process.env.HTTPHOST || "http://127.0.0.1:8080/api/v1",
    wsHost: process.env.WSHOST || "ws://127.0.0.1:7001/",
    validatePath: process.env.VALIDATEPATH || "/validate",
    refreshPath: process.env.REFRESHPATH || "/refresh",
    yWebrtcSignalingHost: process.env.YWEBRTCHOST || "ws://localhost:4444"
    
}
