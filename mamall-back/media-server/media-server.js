process.env.DEBUG = "mediasoup:ERROR*";

const mediasoup = require("mediasoup");
const { v4: uuidv4 } = require('uuid');
const { supportedRtpCapabilities } = require('./rtp-supported');
const config = require('./config/config');

let worker;
let webRtcServer;
/* 
[
    roomRouter: {
        room_id,
        router,
        transports: [],
        producers: Map(userId, producer),
        consumers: Map()
    }
    ...
]
*/
let broadcasters = [];


async function init() {
    worker = await mediasoup.createWorker({
        logLevel: "debug",
    });

    webRtcServer = await worker.createWebRtcServer({
        listenInfos :
        [
            {
                protocol : 'udp',
                ip       : config.listenIp,
                announcedIp: config.announcedIp,
                port     : config.webrtcPort
            },
            {
                protocol : 'tcp',
                ip       : config.listenIp,
                announcedIp: config.announcedIp,
                port     : config.webrtcPort
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

    let roomRouter = broadcasters.find(x => x.room_id == room_id);

    if (roomRouter != null) {
        return roomRouter;
    }

    let router = await worker.createRouter({
        mediaCodecs: supportedRtpCapabilities.codecs
    })

    roomRouter = {
        room_id: room_id,
        router: router,
        transports: [],
        producers: new Map(),
        consumers: new Map()
    }

    broadcasters.push(roomRouter);

    return roomRouter;
}

async function getRoomRouterCapabilities(room_id) {
    let roomRouter = broadcasters.find(x => x.room_id == room_id);
    return roomRouter.router.rtpCapabilities;
}

async function createMediaTransport(room_id, user_id) {
    let roomRouter = broadcasters.find(x => x.room_id == room_id);

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

    let routerIndex = broadcasters.findIndex(x => x.room_id == room_id);
    broadcasters[routerIndex].transports.push(
        { 
            transportId: webRtcTransport.appData.transportId,
            userId: user_id,
            webRtcTransport: webRtcTransport,
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
    let roomRouter = broadcasters.find(x => x.room_id == room_id);
    if (roomRouter != null) {
        let routerTransport = roomRouter.transports.find(x => x.transportId == transportId);

        await routerTransport.webRtcTransport.connect({ dtlsParameters });
    }
}

async function createTransportProducer(room_id, transportId, userId, kind, rtpParameters) {
    let roomRouter = broadcasters.find(x => x.room_id == room_id);

    if (roomRouter != null) {
        let routerTransport = roomRouter.transports.find(x => x.transportId == transportId);

        let producerId = "" + room_id + userId + 1;
        
        let producer = roomRouter.producers.get(userId);
        
        if (producer != null) {
            producer.close();
        }
        
        console.log("creating transport producer", producerId);
        producer = await routerTransport.webRtcTransport.produce({ id: producerId, kind, rtpParameters });
        roomRouter.producers.set(userId, producer);

        return producerId;
    }

    return;
}

function getRoomActiveUsers(room_id) {
    let roomRouter = broadcasters.find(x => x.room_id == room_id);

    if (roomRouter != null) {
        return Array.from(roomRouter.producers.keys());
    }
    return;
}

function getUserRoomProducer(room_id, user_id) {
    let roomRouter = broadcasters.find(x => x.room_id == room_id);

    if (roomRouter != null) {
        return roomRouter.producers.get(user_id);
    }

    return;
}

function checkRouterTransportAvailability() {
    broadcasters = broadcasters.filter(router => !router.router.closed);
    broadcasters.forEach(router => {
        router.transports = router.transports.filter(transport => !transport.webRtcTransport.closed)
    })
    setTimeout(checkRouterTransportAvailability, 600 * 1000);

    console.log(`${new Date()} Routers amount: ${broadcasters.length}`);
}

// у каждого юзера на на бэке будет 
// один продусер и консумеров столько же, сколько и участников комнаты - 1
// сделать получение юзеров комнаты
async function createTransportConsumer(room_id, user_id, new_user_id, transportId, rtpCapabilities) {
    let roomRouter = broadcasters.find(x => x.room_id == room_id);

    if (roomRouter != null) {
        let producerId = "" + room_id + new_user_id + 1;
        let consumerId = "" + room_id + user_id + new_user_id + 0;
        if (roomRouter.router.canConsume({ producerId: producerId, rtpCapabilities }))
        {
            let routerTransport = roomRouter.transports.find(x => x.transportId == transportId);
            const consumer = await routerTransport.webRtcTransport.consume({ producerId: producerId, rtpCapabilities, paused: true });
            roomRouter.consumers.set(consumer.id, consumer);

            return {
                id: consumer.id,
                producerId: consumer.producerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters
            }
        }
    }
}

function resumeConsumer(room_id, consumer_id) {
    let roomRouter = broadcasters.find(x => x.room_id == room_id);

    if (roomRouter != null) {
        roomRouter.consumers.get(consumer_id).resume();
    }
}

function deleteUserTransports(user_id, room_id) {
    console.log("clearing after", user_id, room_id);

    if (room_id != null) {
        let broadcaster = broadcasters.find(x => x.room_id === room_id);
        for (let i = 0; i < broadcaster.transports.length; i++) {
            if (broadcaster.transports[i].userId !== user_id) {
                broadcaster.transports[i].webRtcTransport.close();
            }
        }
        if (broadcaster != null) {
            broadcaster.producers.delete(user_id);
        }
    }
    else {
        broadcasters.forEach(broadcaster => {
            for (let i = 0; i < broadcaster.transports.length; i++) {
                if (broadcaster.transports[i].userId === user_id.user_id) {
                    broadcaster.transports[i].webRtcTransport.close();
                }
            }
            broadcaster.producers.delete(user_id)
        })
    }

}

function findCurrentUserRoomId(user_id) {
    console.log("current user roomid find", user_id);
    for (let i = 0; i < broadcasters.length; i++) {
    console.log(broadcasters[i].producers);
        if (broadcasters[i].producers.has(user_id)) {
            return broadcasters[i].room_id;
        }
    }
}

function closeRoomRouter(room_id) {
    let broadcaster = broadcasters.find(x => x.room_id === room_id);
    broadcaster.router.close();

    broadcasters = broadcasters.filter(br => br.room_id !== room_id);
}

module.exports = {
    init: init,
    stop: stop,
    broadcasters: broadcasters,
    getRtpCapabilities: getRoomRouterCapabilities,
    createRoom: createRoom,
    createMediaTransport: createMediaTransport,
    connectTransport: connectTransport,
    produceTransport: createTransportProducer,
    getRoomActiveUsers: getRoomActiveUsers,
    getUserRoomProducer: getUserRoomProducer,
    createTransportConsumer: createTransportConsumer,
    resumeConsumer: resumeConsumer,
    deleteUserTransports: deleteUserTransports,
    findCurrentUserRoomId: findCurrentUserRoomId,
    closeRoom: closeRoomRouter,
}