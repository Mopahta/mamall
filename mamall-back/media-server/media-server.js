process.env.DEBUG = "mediasoup*";

const mediasoup = require("mediasoup");
const { v4: uuidv4 } = require('uuid');

let worker;
let webRtcServer;
let routers = [];


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

async function createRoom(room_id) {
    if (worker == null) {
        console.error("No worker created.");
        return;
    }

    let router = await worker.createRouter({
        mediaCodecs:
        [
            {
                kind        : "audio",
                mimeType    : "audio/opus",
                clockRate   : 48000,
                channels    : 2
            },
            {
			    kind       : 'audio',
			    mimeType   : 'audio/multiopus',
			    clockRate  : 48000,
			    channels   : 4,
			    // Quad channel.
			    parameters :
			    {
				    'channel_mapping' : '0,1,2,3',
				    'num_streams'     : 2,
				    'coupled_streams' : 2
			    }
		    },
            {
			    kind                 : 'audio',
			    mimeType             : 'audio/PCMU',
			    clockRate            : 8000,
            },
            {
			    kind         : 'audio',
			    mimeType     : 'audio/ISAC',
			    clockRate    : 16000,
		    },
        ],
    })

    routers.push({
        room_id: room_id,
        router: router,
        transports: []
    });

    return router;
}

async function getRoomRouterCapabilities(room_id) {
    let roomRouter = routers.find(x => x.room_id == room_id);
    return roomRouter.router.rtpCapabilities;
}

async function joinRoom(room_id) {
    let roomRouter = routers.find(x => x.room_id == room_id);

    if (roomRouter == null) {
        await createRoom(room_id);
    }

    let webRtcTransport = await roomRouter.createWebRtcTransport({
        webRtcServer: webRtcServer,
        enableUdp    : true,
        enableTcp    : true,
        preferUdp    : true
    })


    let routerIndex = routers.findIndex(x => x.room_id == room_id);
    routers[routerIndex].transports.push(webRtcTransport);

    return {
        id: uuidv4(),
        iceParameters: webRtcTransport.iceParameters,
        iceCandidates: webRtcTransport.iceCandidates,
        dtlsParameters: webRtcTransport.dtlsParameters,
        sctpParameters: webRtcTransport.sctpParameters
    }
}

module.exports = {
    init: init,
    stop: stop,
    createRoom: createRoom,
    joinRoom: joinRoom,
    getRtpCapabilities: getRoomRouterCapabilities
}