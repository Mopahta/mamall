process.env.DEBUG = "mediasoup*";

const mediasoup = require("mediasoup");

let worker;
let webRtcServer;


async function init() {
    worker = await mediasoup.createWorker({
        logLevel: "debug",
    });

    webRtcServer = worker.createWebRtcServer({
        listenInfos :
        [
            {
                protocol : 'udp',
                ip       : '0.0.0.0',
                announcedIp: '127.0.1.1',
                port     : 11111
            },
            {
                protocol : 'tcp',
                ip       : '0.0.0.0',
                announcedIp: '127.0.1.1',
                port     : 11111
            }
        ]
    })
}

async function stop() {
    if (worker != null) {
        worker.close();
    }
}

async function createRoom() {
    if (worker == null) {
        console.error("No worker created.");
        return;
    }

    worker.create
}

module.exports = {
    init: init,
    stop: stop
}