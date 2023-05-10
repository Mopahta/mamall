// media server config

module.exports = {

    listenIp: process.env.MEDIASOUP_LISTEN_IP || '192.168.1.101',
    announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP,
    webrtcPort: process.env.MEDIASOUP_PORT || 11111,

}