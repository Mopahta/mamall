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

    webRtcServer = await worker.createWebRtcServer({
        listenInfos :
        [
            {
                protocol : 'udp',
                ip       : process.env.MEDIASOUP_LISTEN_IP || '192.168.1.104',
                announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP,
                port     : 11111
            },
            {
                protocol : 'tcp',
                ip       : process.env.MEDIASOUP_LISTEN_IP || '192.168.1.104',
                announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP,
                port     : 11111
            }
        ]
    })

    checkRouterTransportAvailability();
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

    let roomRouter = routers.find(x => x.room_id == room_id);

    if (roomRouter != null) {
        return roomRouter;
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

    roomRouter = {
        room_id: room_id,
        router: router,
        transports: []
    }

    routers.push(roomRouter);

    return roomRouter;
}

async function getRoomRouterCapabilities(room_id) {
    let roomRouter = routers.find(x => x.room_id == room_id);
    return roomRouter.router.rtpCapabilities;
}

async function createMediaTransport(room_id) {
    let roomRouter = routers.find(x => x.room_id == room_id);

    if (roomRouter == null) {
        roomRouter = await createRoom(room_id);
    }

    let webRtcTransport = await roomRouter.router.createWebRtcTransport({
        webRtcServer: webRtcServer,
        enableUdp    : true,
        enableTcp    : true,
        preferUdp    : true,
        appData      : { transportId: uuidv4() }
    })


    let routerIndex = routers.findIndex(x => x.room_id == room_id);
    routers[routerIndex].transports.push(
        { 
            transportId: webRtcTransport.appData.transportId,
            webRtcTransport: webRtcTransport
        });

    return {
        id: webRtcTransport.appData.transportId,
        iceParameters: webRtcTransport.iceParameters,
        iceCandidates: webRtcTransport.iceCandidates,
        dtlsParameters: webRtcTransport.dtlsParameters,
        sctpParameters: webRtcTransport.sctpParameters
    }
}

async function connectTransport(room_id, transportId, dtlsParameters) {
    let roomRouter = routers.find(x => x.room_id == room_id);
    if (roomRouter != null) {
        let routerTransport = roomRouter.transports.find(x => x.transportId == transportId);
        console.log(routerTransport);

        await routerTransport.webRtcTransport.connect({ dtlsParameters });
    }
}

async function produceTransport(room_id, transportId, kind, rtpParameters) {
    let roomRouter = routers.find(x => x.room_id == room_id);

    if (roomRouter != null) {
        let routerTransport = roomRouter.transports.find(x => x.transportId == transportId);

        const producer = await routerTransport.webRtcTransport.produce({ kind, rtpParameters });
    }

}

function checkRouterTransportAvailability() {
    routers = routers.filter(router => !router.router.closed);
    routers.forEach(router => {
        router.transports = router.transports.filter(transport => !transport.webRtcTransport.closed)
    })
    setTimeout(checkRouterTransportAvailability, 600 * 1000);

    console.log(`${new Date()} Routers amount: ${routers.length}`);
}

module.exports = {
    init: init,
    stop: stop,
    routers: routers,
    getRtpCapabilities: getRoomRouterCapabilities,
    createRoom: createRoom,
    createMediaTransport: createMediaTransport,
    connectTransport: connectTransport,
    produceTransport: produceTransport
}